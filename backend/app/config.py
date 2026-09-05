from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    search_api_key: str = ""
    search_api_base_url: str = ""
    serpapi_api_key: str = ""
    google_vision_api_key: str = ""
    rpc_url: str = ""
    chain_id: int = 11155111
    contract_address: str = ""
    deployer_private_key: str = ""
    database_url: str = "sqlite:///./test.db"
    cors_origins: str = "http://localhost:3000"
    max_upload_mb: int = 5
    app_version: str = "1.0.0"
    environment: str = "development"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
