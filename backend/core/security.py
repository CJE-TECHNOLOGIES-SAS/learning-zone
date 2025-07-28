# core/security.py

# Modulos externos
from datetime import datetime, timedelta, timezone

from config import settings  # modulo de donde se conecta al archivo .env

# Modulos internos
from dependencies.student_dependencie import get_student_services
from fastapi import Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordBearer
from jose import jwt
from src.usecases.student_service import StudentService

# Generación y manipulación del token

oauth2_scheme_register = OAuth2PasswordBearer(tokenUrl="api/v1/student/verify_email")


def encode_access_token(payload: dict, exp_time: int = 3600) -> str:
    """
    Codifica un token de acceso.

    Args:
        payload(dict): Diccionario con la data que sera codificada
        exp_time(int): Tiempo de expiración del token expresado en segundos, por defecto 3600

    Returns:
        token(str): El token ya encriptado con la información del estudiante

    """
    # Copia de pyload
    to_encode = payload.copy()

    # Tiempo de emisión
    issued_at = datetime.now(timezone.utc)
    to_encode["iat"] = int(issued_at.timestamp())

    # Tiempo de expiración
    expiration_time = issued_at + timedelta(seconds=exp_time)
    to_encode["exp"] = int(expiration_time.timestamp())

    # Configruacion del token
    token = jwt.encode(to_encode, settings.token_key, settings.token_algorithm)
    return token


async def get_current_student(
    token: str = Depends(oauth2_scheme_register),
    services: StudentService = Depends(get_student_services),
):
    """
    ## Obtener Estudiante

    Permite obtener un estudiante atravez de un access token.

    ### Parametros:
    `token(str)`: Token que contiene el id del estudiante codificado.
    `services(StudentServices)`: Servicio que contiene las diferentes funcionalidades del estudiante.

    ### Retorna:
    `student(Student`: Objeto de tipo estudiante.

    ### Excepciones:
        `status(404)`: En caso de no econtrar el estudiante.
        `status(401)`: En caso de que el token sea invalido o el estudiante no este autorizado.
    """
    # Desencripta el token y obtiene el id
    pyload = jwt.decode(
        token=token, key=settings.token_key, algorithms=[settings.token_algorithm]
    )
    student_id = pyload.get("sub")

    # Lanza excepción en caso de no obtener el id del estudiante
    if student_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o estudiante no autorizado",
        )

    # Ejecutamos en caso de obtener el id del estudiante
    elif student_id is not None:
        id_to_valid = int(student_id)  # Convertir el id del estudiante a entero

        # Obtener el estudiante de la base de datos
        student = await services.get_student_by_id(id=id_to_valid)

        # Arrojar excepción en caso de no encontrar el estudiante
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado"
            )

        # En caso de que todo este bien retornar el estudiante
        return student
