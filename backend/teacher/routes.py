"""
teacher/routes.py

Este modulo contiene todas la rutas con las diferentes operaciones que puede realizar el profesor
"""

from fastapi import APIRouter, Depends, Form, UploadFile, File, status, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Optional, List
from fastapi.security import HTTPBearer

from routes.notifications_routes import get_notification_services
from schemas.lesson_schemas import LessonPResponse
from schemas.notification_schemas import NotificationCreate, NotificationResponse
from teacher.schemas import (
    CourseResponse,
    LessonCResponse,
    EvaluationCreate,
    EvaluationUpdate,
    IdentificationCreate,
    IdentificationUpdate,
)
from services.notification_services import NotificationService
from teacher.model import Teacher
from .service import TeacherServices
from models.course_model import CourseCategoryEnum
from models.content_model import TypeContent
from .dependencies import get_teacher_services
import json
from .oauth import get_current_teacher
from .utils import generate_profile_prefix

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/teachers", tags=["Teacher"])

bearer_scheme = HTTPBearer()


# ---- Rutas de Cursos ----
@router.post(
    "/courses",
    description="Crea un nuevo curso.",
    dependencies=[Depends(bearer_scheme)],
)
async def create_course(
    name: str = Form(...),
    description: str = Form(...),
    category: CourseCategoryEnum = Form(...),
    name_palette: str = Form(...),
    palette: str = Form(...),
    image: UploadFile = File(...),
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """Crea un nuevo curso con los detalles proporcionados."""
    palette_dict = json.loads(palette)
    course_data = {
        "name": name,
        "description": description,
        "category": category,
        "name_palette": name_palette,
        "palette": palette_dict,
        "image": image,
        "teacher_id": teacher.id,
    }
    new_course = await teacher_services.create_course(course=course_data)
    return {"message": "Curso creado con exito.", "id_course": new_course}


@router.get(
    "/courses/published",
    description="obtiene los datos de todos los cursos que este publicados",
    dependencies=[Depends(bearer_scheme)],
    response_model=List[CourseResponse],
)
async def get_published_courses(
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """Obtiene todos los cursos publicados del profesor actual."""
    return await teacher_services.get_published_courses(teacher.id)


@router.get(
    "/courses/{course_id}",
    description="Obtiene un curso por su ID.",
    dependencies=[Depends(bearer_scheme)],
)
async def get_course(
    course_id: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """Obtiene un curso por su ID."""
    course = await teacher_services.get_course_by_id(course_id)
    if not course:
        return {"message": "Curso no encontrado."}
    return {"course": course}


@router.put(
    "/courses/{course_id}",
    description="Actualiza un curso existente.",
    dependencies=[Depends(bearer_scheme)],
    tags=["Courses"],
)
async def update_course(
    course_id: int,
    name: str = Form(None),
    description: str = Form(None),
    image: Optional[UploadFile] = File(None),
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """Actualiza un curso existente con los nuevos detalles proporcionados."""
    course_data = {
        "teacher_id": teacher.id,
    }
    if name == "":
        name = None
    if description == "":
        description = None
    if image == "":
        image = None
    course = await teacher_services.get_course_by_id(course_id)
    if not course:
        return {"message": "Curso no encontrado."}
    if name is not None:
        course_data["name"] = name
    if description is not None:
        course_data["description"] = description
    if image is not None:
        course_data["image"] = image

    updated_course = await teacher_services.update_course(
        course_id=course_id, course_data=course_data, public_id=course.name
    )
    return {"message": "Curso actualizado con exito.", "id_course": updated_course}


@router.delete(
    "/courses/{course_id}",
    description="Elimina un curso por su ID.",
    dependencies=[Depends(bearer_scheme)],
    tags=["Courses"],
)
async def delete_course(
    course_id: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
):
    """Elimina un curso por su ID."""
    return await teacher_services.delete_course(course_id)


@router.patch(
    "/courses/{course_id}", dependencies=[Depends(bearer_scheme)], tags=["Courses"]
)
async def publish_course(
    course_id: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """Publica un curso, haciendolo visible para los estudiantes."""
    return await teacher_services.publish_course(course_id=course_id)


@router.get("/courses/", dependencies=[Depends(bearer_scheme)], tags=["Courses"])
async def get_courses(teacher: Teacher = Depends(get_current_teacher)):
    """Obtiene todos los cursos del profesor actual."""
    return teacher.courses


@router.get(
    "/courses/category/{category}",
    dependencies=[Depends(bearer_scheme)],
    tags=["Courses"],
)
async def filter_courses_by_category(
    category: CourseCategoryEnum,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """Filtra los cursos por categoría."""
    return await teacher_services.filter_courses_by_category(category)


# ---- Rutas del profesor ----
@router.get("/", dependencies=[Depends(bearer_scheme)])
async def get_teacher_info(teacher: Teacher = Depends(get_current_teacher)):
    """Obtiene la información del profesor actual."""
    return {
        "id": teacher.id,
        "names": teacher.names,
        "email": teacher.email,
        "prefix_profile": generate_profile_prefix(
            name=teacher.names, last_name=teacher.email
        ),
    }


# ---- Rutas de lecciones ----
@router.post(
    "/courses/{course_id}/lessons",
    response_model=LessonPResponse,
    dependencies=[Depends(bearer_scheme)],
    tags=["Lessons"],
)
async def create_lesson_for_course(
    course_id: int,
    name: str = Form(...),
    content_type: TypeContent = Form(...),
    text: str = Form(...),
    file: UploadFile = File(None),
    teacher_services: TeacherServices = Depends(get_teacher_services),
):
    """
    Crea una nueva lección para un curso específico.
    """
    # Sube el archivo si no es texto
    new_lesson = await teacher_services.create_lesson(
        lesson={"name": name, "id_course": course_id},
        content={"content_type": content_type, "file": file, "text": text},
    )
    return new_lesson


@router.get(
    "/courses/{course_id}/lessons",
    description="Obtiene todas las lecciones de un curso por su ID.",
    response_model=List[LessonPResponse],
    dependencies=[Depends(bearer_scheme)],
    tags=["Lessons"],
)
async def get_lessons_by_course(
    course_id: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
):
    """
    Obtiene todas las lecciones de un curso por su ID.
    Solo accesible para el profesor que creó el curso.
    """
    lessons = await teacher_services.get_lessons_by_course(course_id)
    if not lessons:
        raise HTTPException(
            status_code=404, detail="No se encontraron lecciones para este curso."
        )
    return lessons


@router.get(
    "/courses/lesson/{lesson_id}",
    response_model=LessonCResponse,
    dependencies=[Depends(bearer_scheme)],
    tags=["Lessons"],
)
async def get_lesson(
    lesson_id: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
):
    """Obtiene una lección por su ID y devuelve su contenido (LessonCResponse)"""
    lesson = await teacher_services.get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada.")
    return {"id": lesson.id, "name": lesson.name, "content": lesson.content}


@router.put(
    "/courses/lesson/{lesson_id}",
    response_model=LessonCResponse,
    dependencies=[Depends(bearer_scheme)],
    tags=["Lessons"],
)
async def update_lesson(
    lesson_id: int,
    name: Optional[str] = Form(None),
    content_type: Optional[TypeContent] = Form(None),
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    teacher_services: TeacherServices = Depends(get_teacher_services),
):
    """
    Actualiza una lección existente. Permite modificar solo el nombre, el contenido o ambos.
    Si se proporciona un archivo, se subirá y actualizará el contenido.
    """
    lesson_data = {}
    content_data = {}

    if name is not None:
        lesson_data["name"] = name
    if content_type is not None:
        content_data["content_type"] = content_type
    if text is not None:
        content_data["text"] = text
    if file is not None:
        content_data["file"] = file

    if not lesson_data and not content_data:
        raise HTTPException(
            status_code=400,
            detail="Debes proporcionar al menos un campo para actualizar.",
        )
    update_lesson = await teacher_services.update_lesson(
        lesson_id, lesson_data, content_data
    )
    return update_lesson


@router.delete(
    "/courses/lesson/{lesson_id}",
    description="Elimina la leccion con su contenido y evaluación asociada.",
    dependencies=[Depends(bearer_scheme)],
    tags=["Lessons"],
)
async def delete_lesson(
    lesson_id: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
):
    """Elimina una lección por su ID."""
    lesson = await teacher_services.get_lesson_by_id(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lección no encontrada.")
    await teacher_services.delete_lesson(lesson_id)
    return JSONResponse(
        content={"message": "Lección eliminada con éxito."},
        status_code=status.HTTP_200_OK,
    )


# --- Rutas de evaluaciones ----
@router.post(
    "/courses/{course_id}/lessons/{lesson_id}/evaluations",
    dependencies=[Depends(bearer_scheme)],
)
async def create_evaluation_for_lesson(
    course_id: int,
    lesson_id: int,
    evaluation: EvaluationCreate,
    teacher_services: TeacherServices = Depends(get_teacher_services),
):
    """
    Crea una evaluación para una lección.
    Si es de tipo open_question, se ignoran opciones y correct_answer.
    """
    evaluation_data = evaluation.model_dump()
    evaluation_data["lesson_id"] = lesson_id

    await teacher_services.create_evaluation(evaluation_data)

    return {"message": "Evaluación creada con éxito"}


@router.get(
    "/courses/{id_course}/lessons/{id_lesson}/evaluation",
    dependencies=[Depends(bearer_scheme)],
    tags=["Evaluations"],
)
async def get_evaluation(
    id_lesson: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    id_course: Optional[int] = None,
):
    """Obtiene una evaluación por el ID de la lección."""
    return await teacher_services.get_evaluation_by_lesson_id(lesson_id=id_lesson)


@router.put(
    "/evaluations/{lesson_id}",
    dependencies=[Depends(bearer_scheme)],
    tags=["Evaluations"],
)
async def update_evaluation(
    lesson_id: int,
    evaluation: EvaluationUpdate,
    teacher_services: TeacherServices = Depends(get_teacher_services),
):
    """
    Actualiza una evaluación existente. Permite modificar solo la pregunta, solo las opciones,
    solo el correct_answer, o cualquier combinación de estos campos.
    """
    try:
        status: int = 000
        message: str = ""

        evaluation_data = evaluation.model_dump(exclude_unset=True)

        update_evaluation = await teacher_services.get_evaluation_by_lesson_id(
            lesson_id
        )

        if not update_evaluation:
            raise HTTPException(status_code=404, detail="Evaluación no encontrada.")

        updated_eval = await teacher_services.update_evaluation(
            update_evaluation.id, evaluation_data
        )

        if updated_eval:
            status = 200
            message = "Evaluación actualizada con éxito"
            logger.info(f"Evaluación actualizada: {updated_eval.id}")

        elif not updated_eval:
            status = 404
            message = "No se pudo actualizar la evaluación"
            logger.error(f"Error al actualizar evaluación: {update_evaluation.id}")

        else:
            status = 404
            message = "No se encontró la evaluación"
        return {"status": status, "message": message}
    except HTTPException as e:
        logger.error(f"HTTPException: {e.detail}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Rutas de notificaciones ---


@router.post("/notifications/", dependencies=[Depends(bearer_scheme)])
async def create_notifications(
    notification_data: NotificationCreate,
    services: NotificationService = Depends(get_notification_services),
    teacher: Teacher = Depends(get_current_teacher),
) -> JSONResponse:
    """
    ## Crear y distribuir nueva notificación a todos los estudiantes

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
        teacher_id=teacher.id, notification_data=notification_data
    )
    return JSONResponse(content=response, status_code=status.HTTP_200_OK)


@router.get(
    "/notifications/",
    dependencies=[Depends(bearer_scheme)],
    tags=["Notifications"],
    response_model=List[NotificationResponse],
)
async def get_notifications(
    services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """
    Obtiene todas las notificaciones para un profesor específico.
    """
    return await services.get_notifications_by_teacher_id(teacher.id)


@router.delete("/notifications/", dependencies=[Depends(bearer_scheme)])
async def delete_notification(
    id_notification: Optional[int] = None,
    services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """
    ## El profesor elimina notificaciones

    Un profesor puede eliminar una notificación específica o todas las notificaciones del estudiante autenticado.

    ### Parámetros:
    - `teacher (Teacher)`: Profesor autenticado, inyectado por FastAPI.
    - `id_notification (int | opcional)`: ID de la notificación a eliminar.
      - Si se proporciona, se elimina solo esa notificación.
      - Si no se proporciona, se eliminarán **todas** las notificaciones que tenga los estudiantes.
    - `services (NotificationService)`: Servicio de lógica de negocio para notificaciones, inyectado por la dependencia `get_notification_services`.

    ### Respuestas:
    - **`404 Not Found`**: Si la notificación con el ID no existe o no pertenece al estudiante.
    - **`500 Internal Server Error`**: Si ocurre un error inesperado en el proceso.

    ### Seguridad:
    - Requiere autenticación mediante token JWT.

    ### Nota:
    La lógica de eliminación está delegada al método `delete_notifications_teacher` del servicio, que debe manejar las validaciones correspondientes.
    """

    if id_notification:
        result = await services.delete_teacher_notification(id_notification, teacher.id)
        if result:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"message": "Se ha eliminado la notificación correctamente"},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se ha podido encontrar la notificación o no pertenece al profesor",
            )
    else:
        count = await services.delete_all_teacher_notifications(teacher.id)
        return JSONResponse(
            content={"message": f"{count} notificaciones eliminadas"},
            status_code=status.HTTP_200_OK,
        )


# --- Rutas de estudiantes ---
@router.post(
    "/students/identifications",
    dependencies=[Depends(bearer_scheme)],
    tags=["Students"],
)
async def register_student_identification(
    file: UploadFile = File(...),
    services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """
    Registra números de identificación de estudiantes desde un archivo.
    Acepta archivos de formato: .txt, .xlsx, .docx
    """
    # Validar tipo de archivo
    allowed_types = [
        "text/plain",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    allowed_extensions = [".txt", ".xlsx", ".docx"]
    file_extension = file.filename.lower().split(".")[-1] if file.filename else ""

    if (
        file.content_type not in allowed_types
        and f".{file_extension}" not in allowed_extensions
    ):
        raise HTTPException(
            status_code=400,
            detail="Formato de archivo no soportado. Solo se permiten archivos .txt, .xlsx, .docx",
        )

    try:
        result = await services.register_identifications(file)
        return {
            "message": f"Proceso completado. {result['processed']} números procesados, "
            f"{result['successful']} registrados exitosamente, "
            f"{result['duplicates']} duplicados omitidos, "
            f"{result['errors']} errores.",
            "details": result,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error interno del servidor: {str(e)}"
        )


@router.post(
    "/students/identification",
    status_code=status.HTTP_201_CREATED,
    description="Autentica a un estudiante y devuelve su información.",
    dependencies=[Depends(bearer_scheme)],
    tags=["Students"],
)
async def authenticate_student(
    data: IdentificationCreate,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """
    Autentica a un estudiante y devuelve un mensaje de éxito
    """
    new_ident = await teacher_services.add_identification(data.n_identification)
    return {
        "message": "Identificación registrada exitosamente",
        "id": new_ident.id,
        "n_identification": new_ident.n_identification,
    }


@router.get(
    "/students/identifications",
    dependencies=[Depends(bearer_scheme)],
    tags=["Students"],
)
async def get_identifications(
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """
    Obtiene todas las identificaciones de estudiantes.
    """
    return await teacher_services.get_all_identifications()


@router.get(
    "/students/identification/{id}",
    dependencies=[Depends(bearer_scheme)],
    tags=["Students"],
)
async def get_identification_by_id(
    id: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """
    Obtiene un numero de identificación en espesifico en base a su numero de id
    """
    identification = await teacher_services.get_identification_by_id(id)
    status = await teacher_services.get_status_student(identification.n_identification)
    return {
        "id": identification.id,
        "number_identification": identification.n_identification,
        "status": status,
    }


@router.get(
    "/students/identification/by-number/{identification_number}",
    dependencies=[Depends(bearer_scheme)],
    tags=["Students"],
)
async def get_identification_by_number(
    identification_number: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
    id_course: int = None,
):
    """
    Obtiene un numero de identificación y su estado en base a su número de identificación
    """
    result = await teacher_services.get_identification_by_number(
        identification_number, id_course
    )
    return result


@router.delete(
    "/students/identifications",
    dependencies=[Depends(bearer_scheme)],
    tags=["Students"],
)
async def delete_identifications(
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """
    Elimina todas las identificaciones de estudiantes.
    """
    await teacher_services.delete_all_identifications()
    return {
        "status": 200,
        "message": "Se han eliminado todos los numeros de identificación.",
    }


@router.delete(
    "/students/identification/{id}",
    dependencies=[Depends(bearer_scheme)],
    tags=["Students"],
)
async def delete_identification_by_id(
    id: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """
    Elimina una identificación de estudiante en específico.
    """
    await teacher_services.delete_identification_by_id(id)
    return {
        "status": 200,
        "message": "Número de identificación eliminado exitosamente.",
    }


@router.put(
    "/students/identification/{id}",
    dependencies=[Depends(bearer_scheme)],
    tags=["Students"],
)
async def update_identification_by_id(
    id: int,
    data: IdentificationUpdate,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """
    Actualiza una identificación de estudiante en específico.
    """
    await teacher_services.update_identification_by_id(
        id, data.new_number_identification
    )
    return {
        "status": 200,
        "message": "Numero de identificación actualizado correctamente.",
    }


@router.get(
    "/courses/{course_id}/students",
    description="Obtiene todos los estudiantes inscritos en un curso específico.",
    dependencies=[Depends(bearer_scheme)],
    tags=["Courses", "Students"],
)
async def get_students_by_course(
    course_id: int,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    """
    Devuelve la lista de estudiantes inscritos en el curso especificado.
    """
    students = await teacher_services.get_students_by_course(course_id)
    return {"students": students}


@router.get(
    "/students/export",
    dependencies=[Depends(bearer_scheme)],
    description="Descarga la lista de estudiantes en formato Excel (.xlsx)",
    tags=["Export"],
)
async def export_students_excel(
    course_id: int = None,
    teacher_services: TeacherServices = Depends(get_teacher_services),
    teacher: Teacher = Depends(get_current_teacher),
):
    excel_file = await teacher_services.export_students_to_excel(course_id)
    return StreamingResponse(
        excel_file,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",  # Tipo de contenido para archivos Excel
        headers={
            "Content-Disposition": 'attachment; filename="estudiantes.xlsx"'
        },  # Nombre del archivo al descargar
    )
