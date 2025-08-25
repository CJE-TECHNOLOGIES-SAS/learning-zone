# database/config_db.py
# conexion a la base de datos

# database.py
"""Configuración de la conexion con la base de datos"""

# Módulo interno: Importamos nuestra instancia de configuración
from config import (
    settings,
)  # de config importamos settings para usar las variables de entorno

# Modulos esternos
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# Definimos la URL de conexión
# Ahora la obtenemos de nuestra instancia de configuración
DATABASE_URL = settings.database_url


# Creamos el motor de conexión asíncrono, esto nos conecta directamente con la base de datos. (gestiona la conexion a la base de datos)
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Para mostrar en consola las consultas SQL ejecutadas
)

# Creamos la fábrica de sesiones asíncronas
async_session = async_sessionmaker(
    engine,
    expire_on_commit=False,  # Evita que se borre la cache del objeto luego de un commit, es util para trabajar con datos que no cambian frecuentemente, o usar el objeto despues de guardar sin tener que volver a cargarlo de la base de datos
)


# Base declarativa para los modelos
# Base de todos los modelos ORM (Student, Identification, etc.).
class Base(
    DeclarativeBase
):  # Todos los modelos heredaran de Base para que SQLAlchemy los reconozca y sepa que son parte de tu esquema
    pass


# Dependencia para obtener una sesión en cada operación
# Función especial que da una nueva sesión por request, con yield.
async def get_session():  # crea una sesión de base de datos asíncrona que se usara en cada request
    """
    Proporciona una sesión de base de datos asíncrona en cada request.
    Se usa con Depends en FastAPI.
    """
    async with async_session() as session:
        yield session


# settings.database_url      # <- viene del .env
#         │
#         ▼
# create_async_engine(...)   # <- crea el motor
#         │
#         ▼
# async_sessionmaker(...)    # <- crea fábrica de sesiones
#         │
#         ▼
# get_session()              # <- entrega una sesión por cada request
