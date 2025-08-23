# backend/config.py
"""
Este módulo define la configuración central de la aplicación utilizando la biblioteca pydantic-settings para gestionar variables de
entorno de forma segura y estructurada.
"""

# Modulos externos
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):  # clase de configuracion heredando BaseSettings
    # Esto le dice a Pydantic que busque el archivo .env
    """
    Este modulo contiene la conexion al archivo .env para traer la url de la conexion a la base de datos
    """
    model_config = SettingsConfigDict(  # aca se configura como base settings cargara los valores
        env_file=".env",  # le indica a pydantic que busque un archivo .env en el directorio actual
        env_file_encoding="utf-8",  # codificacion del archivo .env
        extra="ignore",  # Ignora variables en .env que no estén definidas aquí, solo trae lo necesario
    )

    # URL de la base de datos
    database_url: str = Field(
        ..., env="DATABASE_URL"
    )  # 'env' especifica el nombre de la variable de entorno
    # el ... especifica que el campo es obligatorio
    # env el env sera el la variable de entorno que estara en el .env

    # SendGrid
    email_from: str = Field(..., env="EMAIL_FROM")
    email_from_suggestion: str = Field(..., env="EMAIL_FROM_SUGGESTION")
    sendgrid_api_key: str = Field(..., env="SENDGRID_API_KEY")
    sendgrid_template_register_id: str = Field(..., env="SENDGRID_TEMPLATE_REGISTER_ID")
    sendgrid_template_password_id: str = Field(..., env="SENDGRID_TEMPLATE_PASSWORD_ID")
    sendgrid_template_notification_id: str = Field(
        ..., env="SENDGRID_TEMPLATE_NOTIFICATION_ID"
    )
    sendgrid_template_suggestion_id: str = Field(
        ..., env="SENDGRID_TEMPLATE_SUGGESTION_ID"
    )

    # Token
    token_key: str = Field(..., env="TOKEN_KEY")  # variable añadida para el token key
    token_algorithm: str = Field(default="HS256", env="TOKEN_ALGORITHM")

    # Gemini
    gemini_api_key: str = Field(..., env="GEMINI_API_KEY")

    # Cloudinary
    cloud_name: str = Field(..., env="CLOUD_NAME")
    cloudinary_api_key: str = Field(..., env="CLOUDINARY_API_KEY")
    cloudinary_api_secret: str = Field(..., env="CLOUDINARY_API_SECRET")
    cloud_secure: bool = Field(default=True, env="CLOUD_SECURE")

    # Teacher - Admin
    admin_name: str = Field(..., env="ADMIN_NAME")
    admin_email: str = Field(..., env="ADMIN_EMAIL")
    admin_password: str = Field(..., env="ADMIN_PASSWORD")


# Instancia de la configuración que se usará en toda la aplicación
settings = Settings()
