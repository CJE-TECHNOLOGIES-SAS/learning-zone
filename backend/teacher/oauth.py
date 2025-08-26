"""
Gestiona la autenticación y autorización de los profesores
"""

# core/security.py

# Módulos externos
from datetime import datetime, timedelta, timezone

from config import settings  # módulo de donde se conecta al archivo .env

# Módulos internos
from teacher.dependencies import get_teacher_services
from fastapi import Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordBearer
from jose import jwt
from .service import TeacherServices

# Generación y manipulación del token

oauth2_scheme_register = OAuth2PasswordBearer(tokenUrl="api/v1/teacher/verify_email")


def encode_access_token(payload: dict, exp_time: int = 604800) -> str:
    """
    Codifica un token de acceso para profesor.

    Args:
        payload(dict): Diccionario con la data que será codificada
        exp_time(int): Tiempo de expiración del token en segundos, por defecto 3600

    Returns:
        token(str): El token encriptado con la información del profesor
    """
    to_encode = payload.copy()
    issued_at = datetime.now(timezone.utc)
    to_encode["iat"] = int(issued_at.timestamp())
    expiration_time = issued_at + timedelta(seconds=exp_time)
    to_encode["exp"] = int(expiration_time.timestamp())
    token = jwt.encode(to_encode, settings.token_key, settings.token_algorithm)
    return token


async def get_current_teacher(
    token: str = Depends(oauth2_scheme_register),
    services: TeacherServices = Depends(get_teacher_services),
):
    """
    ## Obtener Profesor

    Permite obtener un profesor a través de un access token.

    ### Parámetros:
    `token(str)`: Token que contiene el id del profesor codificado.
    `services(TeacherService)`: Servicio con funcionalidades del profesor.

    ### Retorna:
    `teacher`: Objeto de tipo profesor.

    ### Excepciones:
        `status(404)`: Si no se encuentra el profesor.
        `status(401)`: Si el token es inválido o el profesor no está autorizado.
    """
    try:
        payload = jwt.decode(
            token=token, key=settings.token_key, algorithms=[settings.token_algorithm]
        )
        teacher_id = payload.get("sub")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o profesor no autorizado",
        )

    if teacher_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o profesor no autorizado",
        )

    id_to_valid = int(teacher_id)
    teacher = await services.get_teacher_by_id(teacher_id=id_to_valid)

    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Profesor no encontrado"
        )

    return teacher
