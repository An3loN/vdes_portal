from typing import Any
from app.redis_interface.redis_namespace import AsyncRedisNameSpace
from app.models import RaceData, RaceDataOverwrite, User

class UsersNameSpace(AsyncRedisNameSpace):
    def __init__(self, url: str, namespace: str):
        super().__init__(url, namespace)
    
    async def get_user(self, user_id) -> User:
        race_dict: dict[str, Any] = await self.hgetall(user_id)
        return User(**race_dict)

    async def get_users(self) -> list[User]:
        all_races:list[dict[str, Any]] = await self.all_hgetall()
        return [User(**entry) for entry in all_races]
    
    async def save_user(self, user: User) -> None:
        for field, value in user.model_dump(exclude_none=True).items():
            await self.hset(user.steamid, field, value)
    
    async def has_user(self, userid: str) -> bool:
        return bytes(self.make_key(userid), encoding='utf-8') in await self.all_keys()