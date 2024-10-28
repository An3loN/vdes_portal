from typing import Any, Callable, Coroutine, Self
from pydantic import BaseModel
from app.models import RaceData, RaceRegistration, User
from app.redis_interface.users_namespace import UsersNameSpace
from app.cars import car_ids

class Driver(BaseModel):
    driverCategory: int = 0
    firstName: str
    lastName: str
    playerID: str
    shortName: str
    nationality: int = 0

    @classmethod
    def generate(cls, user: User) -> Self:
        return Driver(
            firstName=user.name,
            lastName=user.surname,
            playerID='S' + user.steamid,
            shortName=((user.surname + user.name).upper() * 2)[:3]
        )

class Entry(BaseModel):
    raceNumber: int
    defaultGridPosition: int = -1
    ballastKg: int = 0
    restrictor: int = 0
    isServerAdmin: int = 0
    forcedCarModel: int
    overrideCarModelForCustomCar: int = 0
    overrideDriverInfo: int = 1
    customCar: str = ""
    drivers: list[Driver]

    @classmethod
    async def generate(self, registration: RaceRegistration, get_user: Callable[[str], Coroutine[Any, Any, User]]) -> Self:
        return Entry(
            raceNumber=registration.race_number,
            forcedCarModel=car_ids[registration.car],
            drivers=[Driver.generate(await get_user(registration.steamid))]
        )


class EntryList(BaseModel):
    entries: list[Entry]
    forceEntryList: int = 1

    @classmethod
    async def generate(self, race: RaceData, get_user: Callable[[str], Coroutine[Any, Any, User]]) -> Self:
        return EntryList(entries=[await Entry.generate(registration, get_user) for registration in race.registrations.values()])
