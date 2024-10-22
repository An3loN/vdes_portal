import logging
from datetime import timedelta, timezone

from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = ConfigDict(extra='ignore')

    DEBUG: bool = False
    SENTRY_DSN: str = ''
    TIMEZONE: timezone = timezone(offset=timedelta(hours=3), name='Europe/Moscow')

    REDIS_URL: str = 'redis://localhost:6379'
    ADMINS: list[str]
    CRYPTO_PASS: str
    STEAM_WEB_API_KEY: str
    


settings = Settings(_env_file='.env')