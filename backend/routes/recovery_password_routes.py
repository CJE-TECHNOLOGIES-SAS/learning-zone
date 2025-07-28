# router.recovery_password_router.py

"""
Este módulo contiene las rutas relacionadas con la recuperación y restablecimiento de contraseñas de estudiantes.

Incluye:
- Solicitud de restablecimiento de contraseña (envío de enlace al correo si el correo es válido).
- Confirmación del restablecimiento (establecer nueva contraseña con un token).
- Validación del token de recuperación de contraseña.

Estas rutas están pensadas para ser utilizadas sin que el usuario esté autenticado, y están protegidas con respuestas genéricas
para evitar revelar si un correo está registrado o no, siguiendo buenas prácticas de seguridad.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.responses import JSONResponse
from services.utils.email_validator import EmailValidator
from schemas.student_schemas import Email, ResetPassword
from src.usecases.student_service import StudentService
from dependencies.student_dependencie import get_student_services

router = APIRouter(prefix="/api/v1/student/password", tags=["Password"])


@router.post("/forgot")
async def forgot_password(
    email_student: Email,
    services: StudentService = Depends(get_student_services),
) -> JSONResponse:
    """
    ## Recuperar contraseña (solicitud de restablecimiento)

    Esta ruta permite iniciar el proceso de recuperación de contraseña para un estudiante,
    validando su correo electrónico. Si el correo es válido y pertenece a un usuario registrado,
    se enviará un enlace de restablecimiento a dicho correo.

    ⚠️ Por razones de seguridad, la respuesta es genérica, sin confirmar si el correo está registrado o no.

    ### Parámetros:
    - **email_student** (`str`): Correo electrónico del estudiante que solicita la recuperación de contraseña.
    - **services** (`StudentService`): Servicio de lógica de negocio para la gestión del estudiante (inyectado con `Depends`).

    ### Respuesta:
    - **200 OK**:
        ```json
        {
          "message": "Si tu correo esta registrado, recibiras un enlace para restablecer tu contraseña"
        }
        ```
        Independientemente de si el correo está registrado, la respuesta es siempre la misma para proteger la privacidad del usuario.

    - **400 Bad Request**:
        Si el correo no cumple con el formato adecuado.
        ```json
        {
          "detail": "Correo electrónico inválido"
        }
        ```

    - **500 Internal Server Error**: Si ocurre un error inesperado en el proceso de recuperación.

    ### Nota:
    Esta ruta **no envía directamente** el enlace de restablecimiento, sino que delega esta tarea al servicio `recovery_password`.
    """
    is_valid, msg = EmailValidator.validate_email(email_student.email)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    student = await services.recovery_password(email=email_student.email)

    if student:
        return JSONResponse(
            status_code=200,
            content={
                "message": "Si tu correo esta registrado, recibiras un enlace para restablecer tu contraseña",
                "email": email_student.email,
            },
        )


@router.put("/reset")  # se usa post para acciones que modifican datos
async def reset_password_confirm(
    data: ResetPassword,
    services: StudentService = Depends(get_student_services),
) -> JSONResponse:
    """
    ## Restablecer Contraseña (Confirmación)

    Esta ruta permite a un estudiante establecer una nueva contraseña utilizando un token
    de recuperación previamente enviado a su correo electrónico.

    ### Parámetros:
    - **data** (`ResetPassword`): Objeto Pydantic que contiene el token de recuperación
      y la nueva contraseña.
    - **services** (`StudentService`): Servicio de lógica de negocio para la gestión del estudiante (inyectado con `Depends`).

    ### Respuesta:
    - **200 OK**: Contraseña restablecida exitosamente.
        ```json
        {
          "message": "Contraseña restablecida exitosamente."
        }
        ```
    - **400 Bad Request**: Token inválido, expirado o nueva contraseña no cumple los requisitos.
        ```json
        {
          "detail": "Token inválido o expirado."
        }
        ```
    - **500 Internal Server Error**: Si ocurre un error inesperado al actualizar la contraseña.
    """
    response = await services.reset_student_password(data.token, data.new_password)

    # si el servicio no lanzo una excepcion, significa que fue exitoso
    return JSONResponse(
        content=response, status_code=status.HTTP_200_OK
    )  # retorna el dict con el mensaje de exito en restablecer la contraseña y un 200


@router.get("/validate-token-password")
async def validate_token_password(
    token: str = Header(), services: StudentService = Depends(get_student_services)
):
    """
    ## Validar token de recuperación de contraseña.

    ### Paramentros:
        `token (str)`: Token de inicio de session
        `services (StudentService, optional)`: Servicio con las operaciones del estudiante. Defaults to Depends(get_student_services).

    Raises:
        HTTPException: Codigo de estado en caso no validar el token

    Returns:
        JSONResponse: Mensaje de exito en caso de que el token sea valido
    """
    student = await services.validate_password_token(password_token=token)
    if student is not None:
        return {"password_token": student.password_token}
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El token enviado no ha sido encontrado",
        )
