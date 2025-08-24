from io import BytesIO
import json
import logging
from fastapi import HTTPException, UploadFile
from typing import Optional

from openpyxl import Workbook

from models.evaluation_model import Evaluation, QuestionType
from models.lesson_model import Lesson
from .repository import TeacherRepo
from .utils import (
    read_student_identification,
    save_and_upload_file,
    update_file_on_cloudinary,
)
from models.course_model import Course
from models.identification_model import Identification
from repository.student_answer_repository import StudentAnswerRepository


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TeacherServices:
    def __init__(self, repo: TeacherRepo, student_answer_repo: StudentAnswerRepository):
        self.repo = repo
        self.student_answer_repo = student_answer_repo

    # --- Métodos de autenticación---
    async def add_identification(self, n_identification: int) -> int:
        """
        Crea un nuevo id del estudiante por medio de un profesor.
        """
        return await self.repo.add_identification(n_identification)

    # --- Métodos de Cursos ---
    async def create_course(self, course: dict) -> dict:
        """
        Crea un nuevo curso en la base de datos.
        :param course: Objeto Course con los detalles del curso.
        :return: El curso creado.
        """
        # Guardar imagen en cloudinary
        if "image" in course:
            course["image"] = await save_and_upload_file(
                course["image"], public_id=course["name"]
            )

        return await self.repo.create_course(course)

    async def get_course_by_id(self, course_id: int) -> Course:
        """
        Obtiene un curso por su ID.
        :param course_id: ID del curso.
        :return: Objeto Course.
        """
        return await self.repo.get_course_by_id(course_id)

    async def update_course(
        self, course_id: int, course_data: dict, public_id: str
    ) -> dict:
        """
        Actualiza un curso existente.
        :param course_id: ID del curso a actualizar.
        :param course_data: Datos actualizados del curso.
        :return: El curso actualizado.
        """
        if "image" in course_data:
            logger.info(f"Actualizando imagen del curso con ID {course_id}")
            logger.info(f"Datos del curso a actualizar: {course_data}")
            logger.info(f"Public ID para la imagen: {public_id}")
            course_data["image"] = await update_file_on_cloudinary(
                course_data["image"], public_id=public_id
            )
        courses = await self.repo.update_course(course_id, course_data)
        return courses.id

    async def delete_course(self, course_id: int) -> dict:
        """
        Elimina un curso por su ID.
        :param course_id: ID del curso a eliminar.
        :return: Mensaje de confirmación.
        """
        await self.repo.delete_course(course_id)
        return {"message": "Curso eliminado exitosamente."}

    async def publish_course(self, course_id: int) -> Course:
        """
        Publica un curso por su ID.
        :param course_id: ID del curso a publicar.
        :return: Curso publicado.
        """
        return await self.repo.publish_course(course_id=course_id)

    async def filter_courses_by_category(self, category: str) -> list[Course]:
        """
        Filtra los cursos por categoría.
        :param category: Categoría por la que filtrar.
        :return: Lista de cursos filtrados.
        """
        return await self.repo.filter_courses_by_category(category)

    # --- Métodos de Profesores ---
    async def get_teacher_by_id(self, teacher_id: int):
        """
        Obtiene un profesor por su ID.
        :param teacher_id: ID del profesor.
        :return: Objeto Teacher.
        """
        return await self.repo.get_teacher_by_id(teacher_id)

    ### --- Métodos de lecciones ---

    async def create_lesson(self, lesson: dict, content: dict) -> dict:
        """
        Crea una nueva lección en la base de datos.
        :param lesson: Objeto Lesson con los detalles de la lección.
        :return: La lección creada.
        """

        # Validacion opcional
        if content["content_type"] != "text" and not content["file"]:
            raise HTTPException(
                status_code=400, detail="Archivo requerido para contenido multimedia."
            )

        # if content.get("file"):
        #     content_url = await save_and_upload_file(content["file"])

        return await self.repo.create_lesson_with_content(
            name=lesson["name"],
            id_course=lesson["id_course"],
            content_data={
                "content_type": content["content_type"],
                "content": content.get("file"),  # Puede ser None si es texto
                "text": content["text"],
            },
        )

    async def get_lessons_by_course(self, course_id: int) -> list:
        """
        Obtiene todas las lecciones de un curso por su ID.
        :param course_id: ID del curso.
        :return: Lista de lecciones.
        """
        lessons = await self.repo.get_lessons_by_course(course_id)

        lesson_data = []
        for lesson in lessons:
            first_content = lesson.content

            # Creamos un dict manualmente que coincida con el esquema `LessonCResponse`
            lesson_data.append(
                {
                    "id": lesson.id,
                    "name": lesson.name,
                    "content": first_content,  # Puede ser None si no tiene contenido aún
                }
            )

        return lesson_data

    async def update_lesson(
        self, lesson_id: int, lesson_data: dict, content_data: dict
    ) -> Lesson:
        """
        Actualiza una lección existente.
        :param lesson_id: ID de la lección a actualizar.
        :param lesson_data: Datos actualizados de la lección.
        :return: La lección actualizada.
        """
        return await self.repo.update_lesson(lesson_id, lesson_data, content_data)

    async def delete_lesson(self, lesson_id: int) -> dict:
        """
        Elimina una lección por su ID.
        :param lesson_id: ID de la lección a eliminar.
        :return: Mensaje de confirmación.
        """
        await self.repo.delete_lesson(lesson_id)
        return {"message": "Lección eliminada exitosamente."}

    async def get_lesson_by_id(self, lesson_id: int):
        """
        Obtiene una lección por su ID.
        :param lesson_id: ID de la lección.
        :return: Objeto Lesson.
        """
        lesson = await self.repo.get_lesson_by_id(lesson_id)
        if not lesson:
            raise HTTPException(status_code=404, detail="Lección no encontrada")
        return lesson

    # --- Métodos de Evaluaciones ---

    async def create_evaluation(self, data: dict):
        """
        Crea una evaluación considerando el tipo de pregunta.
        Si es de opción múltiple, requiere opciones y respuesta correcta.
        Si es abierta, se ignoran las opciones y la respuesta correcta.
        """
        if data["question_type"] == "open_question":
            data["options"] = None
            data["correct_answer"] = None

        elif data["question_type"] == "multiple_choice":
            if not data.get("options") or not isinstance(data["options"], list):
                raise HTTPException(
                    status_code=400,
                    detail="Se requieren opciones válidas para preguntas de opción múltiple.",
                )
            if not data.get("correct_answer"):
                raise HTTPException(
                    status_code=400,
                    detail="Se requiere una respuesta correcta para preguntas de opción múltiple.",
                )

        return await self.repo.create_evaluation_for_lesson(data)

    async def get_evaluation_by_lesson_id(self, lesson_id: int) -> Evaluation:
        """
        Obtiene una evaluación por el ID de la lección.
        :param lesson_id: ID de la lección.
        :return: Objeto Evaluation.
        """
        evaluation = await self.repo.get_evaluation_by_lesson_id(lesson_id)
        if not evaluation:
            raise HTTPException(status_code=404, detail="Evaluación no encontrada")
        return evaluation

    async def update_evaluation(self, evaluation_id: int, data: dict):
        """
        Actualiza una evaluación considerando el tipo de pregunta y evitando errores
        al cambiar entre open_question y multiple_choice.
        """
        # Si pasa de OPEN_QUESTION a MULTIPLE_CHOICE
        if data.get("question_type") == QuestionType.MULTIPLE_CHOICE:
            # Validar opciones
            options = data.get("options")
            if not options or not isinstance(options, list) or len(options) < 2:
                raise HTTPException(
                    status_code=400,
                    detail="Debes enviar al menos dos opciones válidas como lista.",
                )
            if not data.get("correct_answer"):
                raise HTTPException(
                    status_code=400,
                    detail="La respuesta correcta es requerida para preguntas de opción múltiple.",
                )
            # Serializar a JSON para almacenar en DB
            data["options"] = json.dumps(options)

        # Si pasa de MULTIPLE_CHOICE a OPEN_QUESTION
        elif data.get("question_type") == QuestionType.OPEN_QUESTION:
            data["options"] = None
            data["correct_answer"] = None

        # Si no cambia el tipo pero envía lista, asegurar serialización
        elif isinstance(data.get("options"), list):
            data["options"] = json.dumps(data["options"])

        return await self.repo.update_evaluation(evaluation_id, data)

    # --- Métodos de Notificaciones ---
    async def get_notifications_by_teacher_id(self, teacher_id: int):
        """
        Obtiene las notificaciones asociadas a un profesor.
        :param teacher_id: ID del profesor.
        :return: Lista de notificaciones.
        """
        return await self.repo.get_notifications_by_teacher_id(teacher_id)

    async def delete_teacher_notification(
        self, id_notification: int, teacher_id: int
    ) -> bool:
        return await self.repo.delete_teacher_notification(id_notification, teacher_id)

    async def delete_all_teacher_notifications(self, teacher_id: int) -> int:
        return await self.repo.delete_all_teacher_notifications(teacher_id)

    # --- Métodos de Identificaciones ---
    async def register_identifications(self, file: UploadFile) -> dict:
        """
        Registra numeros de identificación en el sistema desde un archivo.
        :param file: Archivo con números de identificación
        :return: Diccionario con estadísticas del proceso
        """
        try:
            identification_numbers = await read_student_identification(file)

            results = {
                "processed": len(identification_numbers),
                "successful": 0,
                "duplicates": 0,
                "errors": 0,
                "details": [],
            }

            for id_number in identification_numbers:
                result = await self.repo.register_identification(id_number)

                if result["success"]:
                    results["successful"] += 1
                elif result["reason"] == "duplicate":
                    results["duplicates"] += 1
                else:
                    results["errors"] += 1

                results["details"].append(result)

            logger.info(
                f"Proceso completado: {results['successful']} registrados, "
                f"{results['duplicates']} duplicados, {results['errors']} errores"
            )

            return results

        except Exception as e:
            logger.error(f"Error en register_identifications: {e}")
            raise HTTPException(
                status_code=500, detail=f"Error procesando archivo: {str(e)}"
            )

    async def get_identification_by_id(self, id: int) -> Identification:
        """
        Obtiene la identificación de un estudiante por su ID.
        :param id: ID del estudiante.
        :return: Diccionario con la información de la identificación.
        """
        identification = await self.repo.get_identification_by_id(id)
        if not identification:
            raise HTTPException(status_code=404, detail="Identificación no encontrada.")
        return identification

    async def get_identification_by_number(
        self, identification_number: int, id_course: int = None
    ) -> dict:
        """
        Obtiene la identificación de un estudiante por su número de identificación.
        :param identification_number: Número de identificación del estudiante.
        :return: Diccionario con la información de la identificación y su estado.
        """
        identification = await self.repo.get_identification_by_number(
            identification_number
        )
        score = 0
        course_name = ""
        if id_course is None:
            score = await self.student_answer_repo.get_total_score_for_student(
                identification.student.id
            )
            course_name = "Todos"
        elif id_course is not None:
            score = (
                await self.student_answer_repo.get_total_score_for_student_in_course(
                    identification.student.id, id_course
                )
            )
            course = await self.repo.get_course_by_id(id_course)
            course_name = course.name if course else "Desconocido"

        if not identification:
            raise HTTPException(status_code=404, detail="Identificación no encontrada.")

        status = await self.repo.get_status_student(identification.n_identification)
        return {
            "id": identification.id,
            "number_identification": identification.n_identification,
            "status": status,
            "score": score,
            "name": identification.student.names if identification.student else None,
            "course": course_name,
        }

    async def get_all_identifications(self) -> list:
        """
        Obtiene todos los números de identificación.
        """
        all_identifications = []
        identifications = await self.repo.get_identifications()
        for identification in identifications:
            status = await self.repo.get_status_student(identification.n_identification)
            all_identifications.append(
                {
                    "id": identification.id,
                    "number_identification": identification.n_identification,
                    "status": status,
                    "score": (
                        await self.student_answer_repo.get_total_score_for_student(
                            identification.student.id
                        )
                        if identification.student
                        else None
                    ),
                    "name": (
                        identification.student.names if identification.student else None
                    ),
                    "course": "Todos",
                }
            )
        return all_identifications

    async def delete_identification_by_id(self, id: int) -> dict:
        """
        Elimina un numero de identificación en base a su ID.
        """
        return await self.repo.delete_identification_by_id(id)

    async def delete_all_identifications(self) -> dict:
        """
        Elimina todas las identificaciones de estudiantes.
        """
        return await self.repo.delete_all_identifications()

    async def update_identification_by_id(self, id: int, new_id_number: int) -> dict:
        """
        Actualiza un número de identificación en base a su ID.
        """
        return await self.repo.update_identification_by_id(id, new_id_number)

    async def get_status_student(self, id: int) -> Optional[bool]:
        """
        Obtiene el estado de un estudiante por su ID.
        """
        return await self.repo.get_status_student(id)

    async def get_published_courses(self, teacher_id: int) -> list:
        """
        Obtiene todos los cursos publicados de un profesor.
        """
        return await self.repo.get_published_courses(teacher_id)

    async def get_students_by_course(self, course_id: int) -> list:
        """
        Obtiene todos los estudiantes inscritos en un curso específico.
        :param course_id: ID del curso.
        :return: Lista de estudiantes.
        """
        students = await self.repo.get_students_by_course(course_id)
        course = await self.repo.get_course_by_id(course_id)
        return [
            {
                "id": student.id,
                "number_identification": student.identification_number,
                "name": student.names,
                "status": await self.get_status_student(student.identification_number),
                "score": await self.student_answer_repo.get_total_score_for_student(
                    student.id
                ),
                "course": course.name,
            }
            for student in students
        ]

    async def get_all_students_data(self) -> list[dict]:
        identifications = await self.repo.get_identifications()
        students_data = []
        for identification in identifications:
            student = identification.student
            students_data.append(
                {
                    "id": identification.id,
                    "number_identification": identification.n_identification,
                    "name": student.names if student else None,
                    "course": "Todos",
                    "score": (
                        await self.student_answer_repo.get_total_score_for_student(
                            student.id
                        )
                        if student
                        else None
                    ),
                    "status": await self.get_status_student(
                        identification.n_identification
                    ),
                }
            )
        return students_data

    async def export_students_to_excel(
        self, course_id: int = None
    ) -> BytesIO:  # BytesIO hace referencia a un flujo de bytes en memoria
        """
        Exporta la lista de estudiantes a un archivo Excel.
        Si no se pasa course_id, exporta todos los estudiantes de todos los cursos.
        """
        if course_id:
            students = await self.get_students_by_course(course_id)
        else:
            students = await self.get_all_students_data()
            # course = None
        wb = Workbook()  # Crear un nuevo libro de Excel
        ws = wb.active  # Obtener la hoja activa
        ws.title = "Estudiantes"  # Establecer el título de la hoja

        # Agregar encabezados
        headers = ["ID", "Identificación", "Nombre", "Curso", "Puntaje", "Estado"]
        ws.append(headers)  # Agregar encabezados a la hoja

        for student in students:
            status_str = "VERIFICADO" if student["status"] else "NO VERIFICADO"
            ws.append(
                [
                    student["id"],
                    student["number_identification"],
                    student["name"],
                    student["course"],
                    student["score"],
                    status_str,
                ]
            )

        bio = BytesIO()
        wb.save(bio)
        bio.seek(0)
        return bio
