from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    app_env: str = "development"
    secret_key: str

    # MySQL
    mysql_host: str = "db"
    mysql_port: int = 3306
    mysql_user: str
    mysql_password: str
    mysql_db: str
    mysql_root_password: str

    # Redis
    redis_url: str = "redis://redis:6379/0"

    # Room
    default_room_ttl_seconds: int = 3600
    max_active_rooms: int = 1000
    max_participants: int = 2
    max_packet_size_bytes: int = 4096
    max_packets_per_connection: int = 10_000

    # Invite
    default_invite_ttl_seconds: int = 900

    @property
    def database_url(self) -> str:
        return (
            f"mysql+aiomysql://{self.mysql_user}:{self.mysql_password}"
            f"@{self.mysql_host}:{self.mysql_port}/{self.mysql_db}"
        )

    @property
    def is_dev(self) -> bool:
        return self.app_env == "development"


settings = Settings()
