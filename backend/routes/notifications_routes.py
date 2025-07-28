# routes/notification_routes.py
"""
Este módulo contiene las rutas relacionadas con las notificaciones del estudiante.
Incluye funcionalidades para obtener y eliminar notificaciones individuales o todas a la vez.
"""

# Módulos internos
from repository.notification_repository import NotificationRepository
from schemas.notification_schemas import NotificationCreate
from services.notification_services import NotificationService
from core.security import get_current_student
from models.student_model import Student
from src.usecases.student_service import StudentService
from dependencies.student_dependencie import get_student_services

# Módulos externos
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

# Importa tu configuración de base de datos para la dependencia de sesión
from database.config_db import get_session


# Creación del router con prefijo y tag correspondiente
router = APIRouter(prefix="/api/v1/student/notifications", tags=["Notifications"])


# --- Dependencia para obtener el servicio de notificaciones ---
async def get_notification_services(
    db: AsyncSession = Depends(get_session),
) -> NotificationService:
    """Proporciona una instancia de NotificationService."""
    # El NotificationService ahora solo necesita el NotificationRepository
    notification_repo = NotificationRepository(db)
    return NotificationService(notification_repo)


@router.get("/")
async def get_notifications(
    student: Student = Depends(get_current_student),
    services: StudentService = Depends(get_student_services),
):
    """
    ## Obtener notificaciones del estudiante

    Esta ruta devuelve todas las notificaciones asociadas al estudiante autenticado.

    ### Parámetros:
    - `student (Student)`: Estudiante autenticado, obtenido automáticamente a partir del token JWT mediante la dependencia `get_current_student`.

    ### Respuesta:
    - **`200 OK`**: Lista de notificaciones del estudiante.
        ```json
        [
          {
            "id": 1,
            "title": "Nueva tarea",
            "message": "Tienes una nueva tarea pendiente"
            "date": "2025-07-10 06:30 PM"
          },
          ...
        ]
        ```

    ### Seguridad:
    - Requiere autenticación mediante token.
    """
    data_student = await services.get_student_by_id(student.id)
    notifications = data_student.notifications
    # return notifications
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "date": n.date.strftime("%Y-%m-%d %I:%M %p") if n.date else None,
        }
        for n in notifications
    ]


@router.delete("/")
async def delete_notifications(
    student: Student = Depends(get_current_student),
    id_notification: int = None,
    services: StudentService = Depends(get_student_services),
):
    """
    ## Eliminar notificaciones del estudiante

    Permite eliminar una notificación específica o todas las notificaciones del estudiante autenticado.

    ### Parámetros:
    - `student (Student)`: Estudiante autenticado, inyectado por FastAPI.
    - `id_notification (int | opcional)`: ID de la notificación a eliminar.
      - Si se proporciona, se elimina solo esa notificación.
      - Si no se proporciona, se eliminarán **todas** las notificaciones del estudiante.
    - `services (StudentService)`: Servicio de lógica de negocio para estudiantes, inyectado por la dependencia `get_student_services`.

    ### Respuestas:
    - **`204 No Content`**: Eliminación exitosa.
    - **`404 Not Found`**: Si la notificación con el ID no existe o no pertenece al estudiante.
    - **`500 Internal Server Error`**: Si ocurre un error inesperado en el proceso.

    ### Seguridad:
    - Requiere autenticación mediante token JWT.

    ### Nota:
    La lógica de eliminación está delegada al método `delete_notifications` del servicio, que debe manejar las validaciones correspondientes.
    """
    student = await services.delete_notifications(
        id_student=student.id, id_notification=id_notification
    )
    if student:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Se han eliminado las notificaciones correctamente"},
        )
    elif student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se ha podido encontrar la notificación o el estudiante",
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ha ocurrido un error en el servidor",
        )


@router.post("/")
async def create_notifications(
    notification_data: NotificationCreate,
    services: NotificationService = Depends(get_notification_services),
) -> JSONResponse:
    # Aquí deberías añadir una dependencia de seguridad para administradores, ej:
    # current_admin: AdminUser = Depends(get_current_admin_user)
    """
    ## Crear y distribuir nueva  otificación a todos los estudiantes

    Permite crear una nueva notificación y la asocia directamente a todos los estudiantes
    registrados en la plataforma.

    ### Parámetros:
    - **notification_data** (`NotificationCreate`): Objeto Pydantic con el título y mensaje de la notificación.

    ### Respuesta:
    - **200 OK**: Notificación creada y distribuida exitosamente a todos los estudiantes.
        ```json
        {
          "message": "Notificación creada y distribuida a todos los estudiantes.",
          "notification_id": 123
        }
        ```
    - **500 Internal Server Error**: Si ocurre un error inesperado al crear o distribuir la notificación.

    ### Seguridad:
    - **IMPORTANTE**: Esta ruta debería estar protegida para que solo administradores o usuarios autorizados puedan usarla.
      Añade una dependencia de autenticación/autorización aquí (ej. `Depends(get_current_admin_user)`).
    """
    response = await services.create_and_distribuite_notification_to_all(
        notification_data
    )
    return JSONResponse(content=response, status_code=status.HTTP_200_OK)
