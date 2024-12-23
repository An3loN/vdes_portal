import pathlib
import httpx
import json
from typing import Optional
from fastapi import Cookie, FastAPI, File, Form, Response, UploadFile
import hashlib
from pysteamsignin.steamsignin import SteamSignIn

from pydantic import TypeAdapter

from app.config import settings
from app.redis_interface.races_namespace import RacesNameSpace
from app.models import CarClass, PublicRaceData, RaceData, RaceDataOverwrite, RaceRegistration, SteamUserData, User, UserAuth, WeatherEnum

from fastapi import FastAPI, Request, HTTPException
from starlette.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware

import cryptocode
import re

from app.redis_interface.users_namespace import UsersNameSpace
from app.entry_list import EntryList
from app.race_results.models import Results, ResultsInput

REFRESH_STEAM_DATA_SEDONDS = 3600 * 24
STEAM_LOGIN_COOKIE_AGE = 31536000

STEAM_OPENID_URL = "https://steamcommunity.com/openid"
STEAM_USER_INFO_URL = f'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={settings.STEAM_WEB_API_KEY}&steamids='
RACE_IMAGES_PATH = '/media/race_images/'

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=settings.STEAM_WEB_API_KEY)

races_namespace = RacesNameSpace(settings.REDIS_URL, 'races')
users_namespace = UsersNameSpace(settings.REDIS_URL, 'users')

latin_regexp = re.compile("^[a-zA-Z]+$")

# Main api requests

# Login

@app.get('/api/auth/steam/')
async def steam_login(initial_url: str = '/'):
    steamLogin = SteamSignIn()
    return json.dumps({'redirect_url':steamLogin.ConstructURL(settings.HOST_URL + '/api/auth/steam/processlogin/?initial_url=' + initial_url)})

@app.get('/api/auth/steam/processlogin/')
async def process(request: Request):
    steamLogin = SteamSignIn()
    steam_id = steamLogin.ValidateResults(request.query_params)

    user_info = await get_user_info(steam_id)

    redirect_to = request.query_params['initial_url'] if await is_user_registered(steam_id, decrypt=False) else '/profile'
    await users_namespace.save_user(User(steamid=steam_id, steam_name=user_info.personaname))
    response = RedirectResponse(redirect_to)
    response.set_cookie(key='login', value=cryptocode.encrypt(steam_id, settings.CRYPTO_PASS), max_age=STEAM_LOGIN_COOKIE_AGE)
    response.set_cookie(key='refresh', max_age=REFRESH_STEAM_DATA_SEDONDS)
    return response

@app.get('/api/user_info/{user_id}')
async def get_user_info_public(user_id: str):
    return (await get_user_info(user_id)).model_dump_json()

@app.post("/api/user")
async def save_user_data(request: Request, login: str | None = Cookie(None)):
    data = await request.json()
    first_name = data.get('firstName')
    last_name = data.get('lastName')

    if not first_name or not last_name:
        raise HTTPException(status_code=400, detail="Имя и Фамилия обязательны.")
    
    if not latin_regexp.match(first_name) or not latin_regexp.match(last_name):
        raise HTTPException(status_code=400, detail="Имя и Фамилия должны быть на латинице.")
    
    await authorized_assert(login)
    steam_id = cryptocode.decrypt(login, settings.CRYPTO_PASS)
    user = await users_namespace.get_user(steam_id)
    user.name = first_name
    user.surname = last_name
    await users_namespace.save_user(user)
    return {"message": "Данные успешно сохранены!"}

@app.post("/api/race/register")
async def register_racer(request: Request, login: str | None = Cookie(None)):
    data = await request.json()
    race_id = data.get('raceId')
    selected_car = data.get('selectedCar')
    race_number = data.get('raceNum')
    car_class_name = data.get('carClass')

    await authorized_assert(login)
    steamid = cryptocode.decrypt(login, settings.CRYPTO_PASS)
    user = await users_namespace.get_user(steamid)
    race = await races_namespace.get_race(race_id)
    car_class = race.car_classes[car_class_name]

    if not user.name or not user.surname:
        raise HTTPException(status_code=400, detail="Не указаны имя и фамилия")

    # Если уже зарегестрирован, то можно поменять регистрацию
    active_registration = race.registrations.get(steamid, None)
    # Здесь логика для проверки, занят ли номер и есть ли место в классе
    if not active_registration and race_number in [registration.race_number for registration in race.registrations.values()]:
        raise HTTPException(status_code=400, detail="Номер уже занят")
    is_changing_in_same_class = active_registration is RaceRegistration and active_registration.car_class == car_class
    if not is_changing_in_same_class and race.classes_registrations_count[car_class.class_name] >= car_class.capacity:
        raise HTTPException(status_code=400, detail="Мест в классе больше нет")

    
    race.registrations[steamid] = RaceRegistration(
        steamid=steamid,
        car_class=car_class.class_name,
        car=selected_car,
        race_number=race_number,
        )
    
    await races_namespace.save_race(race)
    
    return {"message": "Регистрация успешна"}

@app.delete("/api/race/delete_registration/{race_id}")
async def delete_user_registration(race_id: str, login: str | None = Cookie(None)):
    await authorized_assert(login)
    if not races_namespace.has_race(race_id):
        raise HTTPException(status_code=404, detail="Гонка не найдена")
    steamid = cryptocode.decrypt(login, settings.CRYPTO_PASS)
    race = await races_namespace.get_race(race_id)

    if not steamid in race.registrations.keys():
        raise HTTPException(status_code=404, detail="Регистрация не найдена")

    race.registrations.pop(steamid)

    await races_namespace.edit_race(RaceDataOverwrite(
        id=race.id,
        registrations=race.registrations,
    ))
        
    return {"message": "Регистрация удалена"}

async def _fix_names(race: RaceData):
    for registration in race.registrations.values():
        if registration.car == 'Mercedes-AMG GT3 2020':
            registration.car = 'Mercedes AMG GT3 2020'
    await races_namespace.save_race(race)

@app.get("/api/race/fix/{race_id}")
async def get_race(race_id: str, login: str | None = Cookie(None)):
    race = await races_namespace.get_race(race_id)
    await _fix_names(race)
    return Response('Success')

@app.get("/api/race/get/{race_id}")
async def get_race(race_id: str, login: str | None = Cookie(None)):
    race = await races_namespace.get_race(race_id)
    public_race = await PublicRaceData.from_race_data(race, users_namespace.get_user)
    return public_race.model_dump_json()

@app.get("/api/race/get_list")
async def get_race_list():
    races = await races_namespace.get_races()
    public_races_data = [await PublicRaceData.from_race_data(race_data, users_namespace.get_user) for race_data in races]
    print(public_races_data)
    ta = TypeAdapter(list[PublicRaceData])
    return ta.dump_json(public_races_data)

# Admin requests

@app.get("/api/admin/race/get_list")
async def get_admin_race_list(login: str | None = Cookie(None)):
    admin_assert(login)
    races = await races_namespace.get_races()
    ta = TypeAdapter(list[RaceData])
    return ta.dump_json(races)

@app.post("/api/admin/race/create")
async def create_race(
    title: str = Form(...),
    weather: WeatherEnum = Form(...),
    track_temperature: int = Form(...),
    air_temperature: int = Form(...),
    description: str = Form(...),
    dateTime: str = Form(...),
    image: UploadFile = File(None),
    class_file: UploadFile = File(None),
    login: str | None = Cookie(None),
):
    admin_assert(login)
    race_id = hashlib.md5(bytes(title + dateTime, encoding='utf-8')).hexdigest()
    
    ta = TypeAdapter(dict[str, CarClass])
    try:
        car_classes = ta.validate_json(class_file.file.read())
    except Exception as e:
        print(e)
        raise HTTPException(status_code=422, detail="Хуёвый файл")
    
    image_content = await image.read()
    filename = race_id + image.filename[image.filename.rfind('.'):]
    open(RACE_IMAGES_PATH + filename, 'wb').write(image_content)
    await races_namespace.save_race(RaceData(
        id=race_id,
        title=title,
        weather=weather,
        track_temperature=track_temperature,
        air_temperature=air_temperature,
        description=description,
        date=dateTime,
        image_url=RACE_IMAGES_PATH + filename,
        car_classes=car_classes,
    ))

    return {
        "id": race_id,
    }

@app.post("/api/admin/race/edit")
async def edit_race(
    race_id: str = Form(...),
    title: str = Form(...),
    weather: WeatherEnum = Form(...),
    track_temperature: int = Form(...),
    air_temperature: int = Form(...),
    description: str = Form(...),
    dateTime: str = Form(...),
    image: Optional[UploadFile] = File(None),
    race_finished: str = Form(...),
    class_file: UploadFile = File(None),
    results_json: Optional[UploadFile] = File(None),
    login: str | None = Cookie(None),
):
    admin_assert(login)
    race_data_overwrite=RaceDataOverwrite(
        id=race_id,
        title=title,
        weather=weather,
        track_temperature=track_temperature,
        air_temperature=air_temperature,
        description=description,
        date=dateTime,
        race_finished=race_finished,
    )
    if image:
        delete_images_for_race(race_id)
        image_content = await image.read()
        filename = race_id + image.filename[image.filename.rfind('.'):]
        open(RACE_IMAGES_PATH + filename, 'wb').write(image_content)

        race_data_overwrite.image_url = RACE_IMAGES_PATH + filename

    if class_file:
        ta = TypeAdapter(dict[str, CarClass])
        try:
            car_classes = ta.validate_json(class_file.file.read())
            race_data_overwrite.car_classes = car_classes
        except Exception as e:
            print(e)
            raise HTTPException(status_code=422, detail="Хуёвый файл")
    
    if results_json:
        data = await results_json.read()
        try:
            results_input = ResultsInput.model_validate_json(data)
        except Exception as e:
            try:
                results_input = ResultsInput.model_validate_json(data.decode(encoding='utf-16'))
            except Exception as e:
                raise e
        race_data_overwrite.results = Results.from_result_input(results_input)
    
    await races_namespace.edit_race(race_data_overwrite)

    return {
        "id": race_id,
    }

@app.delete("/api/race/{race_id}/delete_registration/{user_id}")
async def delete_user_registration(race_id: str, user_id: str, login: str | None = Cookie(None)):
    admin_assert(login)
    race = await races_namespace.get_race(race_id)

    if not user_id in race.registrations.keys():
        raise HTTPException(status_code=404, detail="Регистрация не найдена")

    race.registrations.pop(user_id)

    await races_namespace.edit_race(RaceDataOverwrite(
        id=race.id,
        registrations=race.registrations,
    ))
        
    return {"message": "Регистрация удалена"}

@app.post("/api/admin/race/delete")
async def delete_race(
    request: Request,
    login: str | None = Cookie(None),
):
    admin_assert(login)
    data = await request.json()
    race_id = data.get('raceId')
    if not race_id:
        raise HTTPException(400, detail='Гонка не найдена')
    delete_images_for_race(race_id)
    await races_namespace.delete_race(race_id)

    return {"message": "Гонка успешно удалена"}

@app.get("/api/admin/race/get/{race_id}")
async def get_race(race_id: str, login: str | None = Cookie(None)):
    admin_assert(login)
    return (await races_namespace.get_race(race_id=race_id)).model_dump_json()

@app.get("/api/is_admin")
def is_user_admin_api(login: str | None = Cookie(None), decrypt = True):
    if not login or _is_undefined(login):
        return {'is_admin': False}
    steamid = cryptocode.decrypt(login, settings.CRYPTO_PASS) if decrypt else login
    return {'is_admin': is_user_admin(steamid)}

@app.get("/api/is_authorized")
async def is_user_authorized(login: str | None = Cookie(None), decrypt = True):
    if not login or _is_undefined(login):
        return {'is_authorized': False}
    steamid = cryptocode.decrypt(login, settings.CRYPTO_PASS) if decrypt else login
    return {'is_authorized': await users_namespace.has_user(steamid)}

@app.get("/api/is_registered")
async def is_user_registered(login: str | None = Cookie(None), decrypt = True):
    if not login or _is_undefined(login):
        return {'is_registered': False}
    steam_id = cryptocode.decrypt(login, settings.CRYPTO_PASS) if decrypt else login
    if not await users_namespace.has_user(steam_id):
        return {'is_registered': False}
    user = await users_namespace.get_user(steam_id)
    return {'is_registered':  user.is_registered()}

@app.get("/api/user_auth")
async def get_user_auth(response: Response, login: str | None = Cookie(None), refresh: str | None = Cookie(None)):
    if not login or _is_undefined(login):
        return UserAuth(is_authorized=False).model_dump_json(exclude_none=True)
    steam_id = cryptocode.decrypt(login, settings.CRYPTO_PASS)
    if not await users_namespace.has_user(steam_id):
        return UserAuth(is_authorized=False).model_dump_json(exclude_none=True)
    # if not refresh:
    #     print('user refreshed')
    #     await refresh_user(steam_id)
    #     response.set_cookie('refresh', max_age=REFRESH_STEAM_DATA_SEDONDS)
    user = await users_namespace.get_user(steam_id)
    return UserAuth(
        is_authorized=True,
        is_registered=user.is_registered(),
        is_admin=is_user_admin(user.steamid),
        **user.model_dump(include={'name', 'surname', 'steam_name', 'steamid'})
        ).model_dump_json(exclude_none=True)

@app.post("/api/validate_class_json")
async def validate_class_json(class_json: UploadFile = File(...)):
    ta = TypeAdapter(dict[str, CarClass])
    try:
        ta.validate_json(class_json.file.read())
    except Exception as e:
        return json.dumps({'is_valid': False})
    return json.dumps({'is_valid': True})

@app.post("/api/admin/validate_results_file")
async def validate_results_json(results_json: UploadFile = File(...)):
    data = await results_json.read()
    try:
        ResultsInput.model_validate_json(data)
    except Exception as e:
        print(e)
        try:
            ResultsInput.model_validate_json(data.decode(encoding='utf-16'))
        except Exception as e:
            print(e)
            return json.dumps({'is_valid': False})
    return json.dumps({'is_valid': True})

@app.get("/api/admin/race/entry_list/{race_id}")
async def generate_entry_list(race_id: str, login: str | None = Cookie(None)):
    admin_assert(login)
    race = await races_namespace.get_race(race_id)
    return (await EntryList.generate(race, users_namespace.get_user)).model_dump_json(indent=2)

async def get_user_info(steam_id: str) -> SteamUserData:
    async with httpx.AsyncClient() as client:
        response = await client.get(STEAM_USER_INFO_URL + steam_id)
        all_users = response.json()
        user_info = SteamUserData(**all_users['response']['players'][0])
        return user_info
    
def delete_images_for_race(race_id: str):
    for p in pathlib.Path(RACE_IMAGES_PATH).glob(race_id + ".*"):
        p.unlink()

def is_user_admin(steam_id: str) -> bool:
    return steam_id in settings.ADMINS

def _is_undefined(string: str) -> bool:
    return string == 'undefined'

def admin_assert(login: str | None):
    if not login or _is_undefined(login):
        raise HTTPException(status_code=401, detail="Не авторизован")
    steamid = cryptocode.decrypt(login, settings.CRYPTO_PASS)
    if not is_user_admin(steamid):
        raise HTTPException(status_code=403, detail="Недостаточно прав")

async def authorized_assert(login: str | None):
    if not login or _is_undefined(login):
        raise HTTPException(status_code=401, detail="Не авторизован")
    steamid = cryptocode.decrypt(login, settings.CRYPTO_PASS)
    if not await users_namespace.has_user(steamid):
        raise HTTPException(status_code=400, detail="Ошибка авторизации")

#FIXME
async def refresh_user(steam_id: str):
    if not await users_namespace.has_user(steam_id):
        return
    user_info = await get_user_info(steam_id)
    user = await users_namespace.get_user(steam_id)
    user.steam_name = user_info.personaname
    await users_namespace.save_user(user)