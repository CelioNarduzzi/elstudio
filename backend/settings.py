from pydantic import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/postgres"

settings = Settings()
