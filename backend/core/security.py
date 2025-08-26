# core/security.py

# Modulos externos
from datetime import (
    datetime,
    timedelta,
    timezone,
)  # Para manejar fechas (creacion y expiración de tokens)

from config import (
    settings,
)  # modulo de donde se conecta al archivo .env, apra cargar las variables de entorno como la token_key y algoritmo

# Modulos internos
from dependencies.student_dependencie import (
    get_student_services,
)  # Importa la funcion que obtiene los servicios del estudiante
from fastapi import Depends, HTTPException, status
from fastapi.security.oauth2 import (
    OAuth2PasswordBearer,
)  # Extrae el token del header Authorization
from jose import (
    jwt,
)  # Importa la librería para generar y verificar tokens JWT, Para codificar/decodificar tokens JWT
from services.student_services import (
    StudentService,
)  # El servicio que encapsula la logica para obtener datos del estudiante

# Generación y manipulación del token

# Extrae el token de cada request cuando este header este presente
oauth2_scheme_register = OAuth2PasswordBearer(
    tokenUrl="api/v1/student/verify_email"
)  # Ruta para obtener el token de acceso, se usa para extraer el token del header Authorization,


def encode_access_token(
    payload: dict, exp_time: int = 604800, is_teacher: bool = False
) -> str:
    """
    Codifica un token de acceso.

    Args:
        payload(dict): Diccionario con la data que sera codificada
        exp_time(int): Tiempo de expiración del token expresado en segundos, por defecto 3600

    Returns:
        token(str): El token ya encriptado con la información del estudiante

    """
    # Copia de payload para no modificar el original
    to_encode = payload.copy()

    # Tiempo de emisión
    issued_at = datetime.now(timezone.utc)
    to_encode["iat"] = int(
        issued_at.timestamp()
    )  # Tiempo de emisión en formato timestamp. Cuando fue emitido

    # Tiempo de expiración
    expiration_time = issued_at + timedelta(seconds=exp_time)
    to_encode["exp"] = int(
        expiration_time.timestamp()
    )  # Tiempo de expiración en formato timestamp. Cuando expira el token

    # Agrega el rol del usuario al token
    if is_teacher:
        to_encode["role"] = "teacher"
    else:
        to_encode["role"] = "student"

    # Configuración del token, se pasan todos los datos necesarios para la creación del token
    token = jwt.encode(to_encode, settings.token_key, settings.token_algorithm)
    return token


async def get_current_role(
    token: str = Depends(
        oauth2_scheme_register
    ),  # hace que FastAPI extraiga el token del header Authorization, de la token del request
):
    """
    ## Obtener Rol

    Extrae el rol del usuario a partir del token de acceso.

    ### Parámetros:
    `token(str)`: Token que contiene la información codificada.

    ### Retorna:
    `role(str)`: Rol del usuario extraído del token.

    ### Excepciones:
        `status(401)`: En caso de que el token sea inválido o no contenga el rol.
    """
    try:
        payload = jwt.decode(
            token=token, key=settings.token_key, algorithms=[settings.token_algorithm]
        )
        role = payload.get("role")
        if role is None:  # Si no se encuentra el rol en el token, arroja una excepción
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o rol no encontrado",
            )
        return role  # retorna el rol del usuario extraído del token
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o rol no encontrado",
        )


async def get_current_student(
    token: str = Depends(
        oauth2_scheme_register
    ),  # hace que FastAPI extraiga el token del header Authorization, de la token del request
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
    student_id = pyload.get("sub")  # Extrae el id del estudiante del token

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
