# student_routes.py

"""
Este modulo contiene todas las rutas propias del estudiante.
"""

from core.security import encode_access_token, get_current_student
from dependencies.student_dependencie import get_student_services

# Modulos externos
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.responses import JSONResponse

# Modulos internos
from models.student_model import Student
from schemas.student_schemas import (
    StudentLogin,
    StudentRegister,
    StudentResponse,
    UpdateProfile,
)
from src.usecases.student_service import StudentService
from .utils import generate_profile_prefix

router = APIRouter(prefix="/api/v1/student", tags=["Students"])


@router.post("/", response_model=StudentResponse)
async def create_student(
    student_data: StudentRegister,
    services: StudentService = Depends(get_student_services),
):
    """## Registrar un nuevo estudiante

    Registra un estudiante en el sistema a partir de los datos proporcionados.
    La información recibida se valida usando el esquema `StudentRegister`.
    Si el proceso es exitoso, se crea el estudiante y se retorna su correo electrónico.

    ### Parámetros:
    - `student_data (StudentRegister)`: Datos del estudiante, validados automáticamente mediante Pydantic.
    - `services (StudentService)`: Servicio de negocio encargado de gestionar el registro de estudiantes (inyectado con Depends).

    ### Respuesta:
    - `201 Created`: Diccionario con el campo `'email'` del estudiante recién creado.
    - `500 Internal Server Error`: Si ocurre un fallo inesperado durante el registro.

    ### Nota:
    Aunque se especifica `response_model=StudentResponse`, la función devuelve manualmente una respuesta personalizada (`JSONResponse`) con solo el correo del estudiante.
    """

    student = await services.register_student(student_data)
    if not student:
        raise HTTPException(status_code=500, detail="Error al registrar el usuario")
    return JSONResponse(
        content={"email": student.email, "id": student.id}, status_code=201
    )


@router.get("/verify_email")
async def verify_email_token(
    email_token: str,
    id_student: int,
    service: StudentService = Depends(get_student_services),
):
    """
    ## Verificación de correo electrónico de un estudiante.

    Esta ruta valida el correo electrónico de un usuario usando un token de verificación.
    Si el token es válido y el usuario existe, se genera un token de acceso (JWT).

    ### Parámetros:
    - `email_token(str)`: Token enviado al correo del usuario para validación.
    - `id_student(int)`: ID del usuario en la base de datos.

    ### Respuesta:
    - `200 OK` con un token de acceso y los datos básicos del estudiante si todo es válido.
    - Otro código de estado si ocurre algún fallo en la verificación o búsqueda del usuario.
    """
    token_valid = await service.verify_email(id_student=id_student, token=email_token)
    if token_valid:
        student = await service.get_student_by_id(id_student)
        if student:
            student_pyload = {"sub": str(student.id)}
            token = encode_access_token(student_pyload)
            return JSONResponse(
                content={
                    "access_token": token,
                    "token_type": "bearer",
                    "is_active": student.is_verified,
                },
                status_code=200,
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ha ocurrido un error en el servidor.",
        )


@router.get("/")
async def get_student(student: Student = Depends(get_current_student)):
    """
    ## Obtener estudiante

    Ruta que permite obtener los datos del estudiante por medio de su token.

    ### Parámetros:
    - `student(Student)`: Objeto de tipo estudiante obtenido al validar el `token`
    """
    try:
        return JSONResponse(
            content={
                "user_data": {
                    "id": student.id,
                    "identification_number": student.identification_number,
                    "names": student.names,
                    "last_names": student.last_names,
                    "email": student.email,
                },
                "prefix_profile": generate_profile_prefix(
                    name=student.names, last_name=student.last_names
                ),
            }
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error inesperado en el servidor :(",
        )


@router.post("/login")
async def login_student(
    student_login: StudentLogin,
    services: StudentService = Depends(get_student_services),
):
    """
    ## Iniciar Sesión de Estudiante

    Permite a un estudiante autenticarse en el sistema utilizando su correo electrónico y contraseña.
    Si las credenciales son válidas, se genera y retorna un token de acceso JWT.

    ### Parámetros:
    - `student_login (schemas.student_schemas.StudentLogin)`: Objeto que contiene las credenciales del estudiante (`email` y `password`) para el inicio de sesión.
    - `services (services.student_services.StudentService)`: Instancia del servicio de estudiantes inyectada para manejar la lógica de negocio.

    ### Respuestas:
    - **`200 OK`**: `application/json` - Inicio de sesión exitoso.
        Retorna un objeto JSON con el token de acceso JWT y su tipo.
        ```json
        {
          "access_token": "eyJ...",
          "token_type": "bearer",
          "message": "Inicio de sesión exitoso"
        }
        ```
    - **`401 Unauthorized`**: `application/json` - Credenciales inválidas.
        Se lanza si el correo electrónico o la contraseña proporcionados son incorrectos.
        ```json
        {
          "detail": "Correo o contraseña incorrectos"
        }
        ```
    - **`500 Internal Server Error`**: `application/json` - Errores internos del servidor.
        Puede ocurrir en dos escenarios:
        1.  **Error al generar el token:** Si el servidor no puede crear el token JWT por alguna razón interna.
            ```json
            {
              "detail": "Error al generar el token"
            }
            ```
        2.  **Error desconocido:** Cualquier otra excepción inesperada durante el proceso de login.
            ```json
            {
              "detail": "Error desconocido"
            }
            ```
    """
    try:
        student = await services.valid_student(
            password=student_login.password, email=student_login.email
        )
        if student is not None:
            to_encode = {"sub": str(student.id)}
            access_token = encode_access_token(payload=to_encode)
            if not access_token:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error al generar el token",
                )
        if student is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Correo o contraseña incorrectos",
            )
        return JSONResponse(
            content={
                "access_token": access_token,
                "token_type": "bearer",
                "message": "Inicio de sesión exitoso",
            },
            status_code=status.HTTP_200_OK,
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error desconosido",
        )


@router.put("/update-profile", status_code=status.HTTP_200_OK)
async def update_student_profile(
    update_data: UpdateProfile = Body(...),
    student: int = Depends(get_current_student),
    student_service: StudentService = Depends(get_student_services),
) -> JSONResponse:
    """
    ## Actualizar Nombres y Apellidos del Perfil del Estudiante

    Permite al estudiante autenticado actualizar sus nombres y/o apellidos.
    Esta ruta requiere un token de acceso válido en el encabezado de autorización.
    Los campos `names` y `last_names` son opcionales en el cuerpo de la solicitud;
    solo los campos proporcionados se actualizarán.

    ### Parámetros:
    - `update_data (schemas.student_schemas.UpdateProfile)`: Objeto JSON con los datos a actualizar.
      Puede incluir:
        - `names (str, opcional)`: Los nuevos nombres del estudiante.
        - `last_names (str, opcional)`: Los nuevos apellidos del estudiante.
    - `student (models.student_model.Student)`: Objeto `Student` inyectado, obtenido a partir de la validación
      del token de acceso (`Authorization: Bearer <token>`). Este objeto ya representa al estudiante actual.
    - `student_service (services.student_services.StudentService)`: Servicio de negocio
      encargado de la lógica de actualización del perfil (inyectado con Depends).

    ### Encabezados Requeridos:
    - `Authorization: Bearer <access-token>`: Token JWT válido del estudiante autenticado.

    ### Cuerpo de la Solicitud (Ejemplo):
    ```json
    {
      "names": "Nuevo Nombre",
      "last_names": "Nuevo Apellido"
    }
    ```
    O bien, solo uno de los campos:
    ```json
    {
      "names": "Solo el Nombre Cambiado"
    }
    ```

    ### Respuestas:
    - **`200 OK`**: `application/json` - Actualización exitosa.
        Retorna un mensaje de confirmación. El frontend deberá realizar una
        llamada separada para obtener los datos actualizados del perfil.
        ```json
        {
          "message": "Perfil actualizado exitosamente."
        }
        ```
    - **`401 Unauthorized`**: `application/json` - Si el token de acceso es inválido o no se proporciona.
        ```json
        {
          "detail": "No autenticado"
        }
        ```
    - **`404 Not Found`**: `application/json` - Si el estudiante autenticado no se encuentra en la base de datos (caso inusual si el token es válido).
        ```json
        {
          "detail": "Student not found."
        }
        ```
    - **`500 Internal Server Error`**: `application/json` - Si ocurre un error inesperado en el servidor durante la actualización.
        ```json
        {
          "detail": "Ha ocurrido un error inesperado al momento de actualizar el perfil"
        }
        ```
    """
    try:
        # Pase el ID del estudiante al servicio
        await student_service.update_names_lastnames(student.id, update_data)

        # Devuelvo mensaje de exito
        return JSONResponse(
            content={"message": "Perfil actualizado exitosamente."},
            status_code=status.HTTP_200_OK,
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        # Log del error para depuración
        print(f"Error inesperado al actualizar perfil: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ha ocurrido un error inesperado al momento de actualizar el perfil",
        )


@router.get("/all")
async def get_students(
    student_service: StudentService = Depends(get_student_services),
    student: Student = Depends(get_current_student),
):
    return await student_service.get_students()
