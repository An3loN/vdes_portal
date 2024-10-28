from typing import Optional
from pydantic import BaseModel, Field, computed_field

from app.race_results.models import Results

class RaceRegistration(BaseModel):
    steamid: str
    car_class: str
    car: str
    race_number: int

class RaceData(BaseModel):
    id: str
    title: str
    description: str
    date: str
    image_url: str
    race_finished: bool = Field(default=False)
    car_classes: dict[str, 'CarClass']
    registrations: dict[str, 'RaceRegistration'] = Field(default_factory=lambda: {})
    results: Optional[Results] = Field(default=None)

    @computed_field
    def classes_registrations_count(self) -> dict[str, int]:
        result = {car_class.class_name:0 for car_class in self.car_classes.values()}
        for registration in self.registrations.values():
            result[registration.car_class] += 1
        return result

class RaceDataOverwrite(BaseModel):
    id: str
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    image_url: Optional[str] = None
    race_finished: Optional[bool] = None
    car_classes: Optional[dict[str, 'CarClass']] = None
    registrations: Optional[dict[str, 'RaceRegistration']] = None
    results: Optional[Results] = None

class SteamUserData(BaseModel):
    steamid: str
    communityvisibilitystate: int
    profilestate: int
    personaname: str
    commentpermission: int
    profileurl: str
    avatar: str
    avatarmedium: str
    avatarfull: str
    avatarhash: str
    lastlogoff: int
    personastate: int
    primaryclanid: str
    timecreated: int
    personastateflags: int

class User(BaseModel):
    steamid: str
    steam_name: str
    name: Optional[str] = Field(default=None)
    surname: Optional[str] = Field(default=None)

    def is_registered(self) -> bool:
        return self.name != None and self.surname != None

class UserAuth(BaseModel):
    is_authorized: bool
    is_registered: Optional[bool] = None
    name: Optional[str] = None
    surname: Optional[str] = None
    steam_name: Optional[str] = None
    steamid: Optional[str] = None

class CarClass(BaseModel):
    class_name: str
    capacity: int
    cars: list[str]

