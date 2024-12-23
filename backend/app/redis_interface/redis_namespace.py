import json
from typing import Any

from redis.asyncio import ConnectionPool, StrictRedis


class AsyncRedisNameSpace:
    def __init__(self, url: str, namespace: str, db: int) -> None:
        connection_pool = ConnectionPool.from_url(url)
        self._redis = StrictRedis(connection_pool=connection_pool, decode_responses=True, db=db)
        self.namespace = namespace

    async def get(self, key: str, as_bytes: bool = False) -> Any:
        response = await self._redis.get(self.make_key(key))
        if as_bytes:
            return response
        return self._decode_response(response)

    async def set(self, key: str, value: Any, expire: int = None):
        value = self._encode_redis_request(value)
        await self._redis.set(self.make_key(key), value, ex=expire)
    
    async def hget(self, key: str, field: str, as_bytes: bool = False) -> Any:
        response = await self._redis.hget(self.make_key(key), field)
        if as_bytes:
            return response
        return self._decode_response(response)
    
    async def hgetall(self, key: str) -> dict[str, Any]:
        response = await self._redis.hgetall(self.make_key(key))
        return {field.decode(): self._decode_response(value) for field, value in response.items()}

    async def hset(self, key: str, field: str, value: Any):
        value = self._encode_redis_request(value)
        await self._redis.hset(self.make_key(key), field, value)

    async def all_hgetall(self) -> list[dict[str, Any]]:
        # await self._redis.flushall()
        keys = await self._redis.keys(self.make_key('*'))
        fields_values = []
        for key in keys:
            if await self._redis.type(key) == b'hash':
                values_dict = await self._redis.hgetall(key)
                fields_values.append({field.decode(): self._decode_response(value) for field, value in values_dict.items()})
        return fields_values
    
    async def all_keys(self) -> list[str]:
        return await self._redis.keys('*')
    
    async def mget_by_pattern(self, pattern: str = '*'):
        keys = await self._redis.keys(self.make_key(pattern))
        return [self._decode_response(answer) for answer in await self._redis.mget(keys)]
    
    async def delete_by_pattern(self, pattern: str = '*'):
        keys = await self._redis.keys(self.make_key(pattern))
        return await self._redis.delete(*keys)

    async def delete(self, key: str) -> int:
        full_key = self.make_key(key)
        return await self._redis.delete(full_key)

    def make_key(self, key: str) -> str:
        return f'{self.namespace}:{key}'

    @staticmethod
    def _decode_response(data: bytes | None) -> dict | None:
        if not data:
            return data
        return json.loads(data)

    @staticmethod
    def _encode_redis_request(data: list[dict] | dict | None) -> list[str] | str:
        # if isinstance(data, list):
        #     return [json.dumps(data_unit, default=str) for data_unit in data]
        return json.dumps(data, default=str)
