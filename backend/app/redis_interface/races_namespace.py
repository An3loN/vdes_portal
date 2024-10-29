from typing import Any
from app.redis_interface.redis_namespace import AsyncRedisNameSpace
from app.models import RaceData, RaceDataOverwrite

class RacesNameSpace(AsyncRedisNameSpace):
    def __init__(self, url: str, namespace: str):
        super().__init__(url, namespace, db=0)
    
    async def get_race(self, race_id) -> RaceData:
        race_dict: dict[str, Any] = await self.hgetall(race_id)
        return RaceData(**race_dict)

    async def get_races(self) -> list[RaceData]:
        all_races:list[dict[str, Any]] = await self.all_hgetall()
        return [RaceData(**entry) for entry in all_races]
    
    async def save_race(self, race_data: RaceData):
        for field, value in race_data.model_dump().items():
            await self.hset(race_data.id, field, value)

    async def edit_race(self, race_data_overwrite: RaceDataOverwrite):
        for field, value in race_data_overwrite.model_dump(exclude_none=True).items():
            await self.hset(race_data_overwrite.id, field, value)
    
    async def delete_race(self, race_id: str):
        await self.delete(race_id)

    async def has_race(self, race_id: str):
        return bytes(self.make_key(race_id), encoding='utf-8') in await self.all_keys()