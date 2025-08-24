# teacher/repository.py

"""Repositorio con todos los procesos"""

# Modulos externos
from typing import Optional
from fastapi import HTTPException
from sqlalchemy import delete, select, update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import json

from models.notification_model import Notification
from models.student_model import Student
from models.identification_model import Identification

from .utils import save_and_upload_file

# Modulos internos
from models.evaluation_model import Evaluation, QuestionType
from models.course_model import Course
from models.lesson_model import Lesson
from teacher.model import Teacher
from teacher.utils import delete_file_from_cloudinary
from teacher.utils import update_file_on_cloudinary
from models.content_model import Content, TypeContent


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TeacherRepo:
    def __init__(self, db: AsyncSession):
        self.db = db

    # --- Metodos de autenticación ---
    async def add_identification(self, n_identification: int):
        # verifica si el estudiante existe

        stmt = select(Identification).where(
            Identification.n_identification == n_identification
        )
        result = await self.db.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=400, detail="La identificación ya está registrada."
            )

        new_ident = Identification(n_identification=n_identification)
        self.db.add(new_ident)
        await self.db.commit()
        await self.db.refresh(new_ident)
        logger.info(f"Estudiante con ID {n_identification} autenticado exitosamente.")
        return new_ident

    # --- Métodos de Cursos ---

    async def create_course(self, course: dict) -> Course:
        """
        Crea un nuevo curso en la base de datos.
        :param course: Objeto Course con los detalles del curso.
        :return: El curso creado.
        """
        try:
            logger.info(f"Creando curso con los datos: {course}")
            new_course = Course(**course)
            self.db.add(new_course)

            stmt = await self.db.execute(
                select(Student).options(selectinload(Student.courses))
            )
            students = stmt.scalars().all()
            for student in students:
                student.courses.append(new_course)
                logger.info(
                    f"Estudiante con ID {student.id} agregado al curso con ID: {new_course.id}"
                )

            await self.db.commit()
            await self.db.refresh(new_course)
            logger.info(f"Curso creado exitosamente con ID: {new_course.id}")
            return new_course.id
        except Exception as e:
            logger.error(f"Error al crear curso: {e}", exc_info=True)
            raise

    async def get_course_by_id(self, course_id: int) -> Course:
        """
        Obtiene un curso por su ID.
        :param course_id: ID del curso.
        :return: Objeto Course.
        """
        try:
            logger.info(f"Obteniendo curso con ID: {course_id}")
            result = await self.db.execute(select(Course).where(Course.id == course_id))
            course = result.scalar_one_or_none()
            if course:
                logger.info(f"Curso encontrado: {course.name}")
            else:
                logger.warning(f"Curso con ID {course_id} no encontrado.")
            return course
        except Exception as e:
            logger.error(f"Error al obtener curso: {e}", exc_info=True)
            raise

    async def update_course(self, course_id: int, course_data: dict) -> Course:
        """
        Actualiza un curso existente.
        :param course_id: ID del curso a actualizar.
        :param course_data: Datos actualizados del curso.
        :return: El curso actualizado.
        """
        stmt = select(Course).where(Course.id == course_id)
        result = await self.db.execute(stmt)
        course = result.scalar_one_or_none()

        if not course:
            logger.error(f"Curso con ID {course_id} no encontrado.")
            raise ValueError("Curso no encontrado")

        for key, value in course_data.items():
            logger.info(f"Actualizando {key} a {value} para el curso ID {course_id}")
            setattr(course, key, value)

        await self.db.commit()
        await self.db.refresh(course)
        logger.info(f"Curso ID {course_id} actualizado exitosamente.")
        return course

    async def delete_course(self, course_id: int) -> None:
        """
        Elimina un curso por su ID.
        :param course_id: ID del curso a eliminar.
        """
        stmt = select(Course).where(Course.id == course_id)
        result = await self.db.execute(stmt)
        course = result.scalar_one_or_none()

        if not course:
            logger.error(f"Curso con ID {course_id} no encontrado.")
            raise ValueError("Curso no encontrado")

        await delete_file_from_cloudinary(course.name)
        await self.db.delete(course)
        await self.db.commit()
        logger.info(f"Curso ID {course_id} eliminado exitosamente.")

    async def publish_course(self, course_id: int) -> Course:
        """
        Publica o despublica un curso por su ID.
        :param course_id: ID del curso a publicar.
        :return: El curso publicado.
        """
        course = await self.get_course_by_id(course_id)
        if not course:
            logger.error(f"Curso con ID {course_id} no encontrado.")
            raise ValueError("Curso no encontrado")

        if course.is_published is False:
            course.is_published = True
        elif course.is_published is True:
            course.is_published = False

        await self.db.commit()
        await self.db.refresh(course)
        logger.info(f"Curso ID {course_id} publicado/despublicado exitosamente.")
        return course

    async def filter_courses_by_category(self, category: str):
        """
        Filtra los cursos por categoría.
        :param category: Categoría por la que filtrar.
        :return: Lista de cursos filtrados.
        """
        stmt = select(Course).where(Course.category == category)
        result = await self.db.execute(stmt)
        courses = result.scalars().all()
        logger.info(f"Se encontraron {len(courses)} cursos en la categoría {category}.")
        return courses

    # --- Métodos de Profesores ---
    async def get_teacher_by_id(self, teacher_id: int):
        """
        Obtiene un profesor por su ID.
        :param teacher_id: ID del profesor.
        :return: Objeto Teacher.
        """
        logger.info(f"Obteniendo profesor con ID {teacher_id}")
        stmt = (
            select(Teacher)
            .options(selectinload(Teacher.courses))
            .where(Teacher.id == teacher_id)
        )
        result = await self.db.execute(stmt)
        if not result:
            logger.error(f"Profesor con ID {teacher_id} no encontrado.")
            return None
        logger.info(f"Profesor con ID {teacher_id} obtenido exitosamente.")
        return result.scalar_one_or_none()

    # --- Métodos de Lecciones ---

    async def create_lesson_with_content(
        self, name: str, id_course: int, content_data: dict
    ):
        """
        Crea una nueva lección en la base de datos.
        :param lesson: Objeto Lesson con los detalles de la lección.
        :return: None
        """
        new_lesson = Lesson(name=name, id_course=id_course)
        self.db.add(new_lesson)
        await self.db.flush()  # Permite obtener el ID antes de commit

        if content_data.get("content"):
            content_url = await save_and_upload_file(
                content_data["content"], public_id=new_lesson.id
            )
        else:
            content_url = None

        new_content = Content(
            lesson_id=new_lesson.id,
            content_type=TypeContent(content_data["content_type"]),
            content=content_url,
            text=content_data["text"],
        )
        self.db.add(new_content)

        await self.db.commit()
        await self.db.refresh(new_lesson)
        return new_lesson

    async def get_lesson_by_id(self, lesson_id: int) -> Lesson:
        """
        Obtiene una lección por su ID.
        :param lesson_id: ID de la lección a obtener.
        :return: Objeto Lesson.
        """
        logger.info(f"Obteniendo lección con ID {lesson_id}")

        stmt = (
            select(Lesson)
            .where(Lesson.id == lesson_id)
            .options(selectinload(Lesson.content))  # precarga el contenido asociado
        )
        result = await self.db.execute(stmt)

        if not result:
            logger.error(f"Lección con ID {lesson_id} no encontrada.")
            return None
        logger.info(f"Lección con ID {lesson_id} obtenida exitosamente.")
        return result.scalar_one_or_none()

    async def update_lesson(
        self, lesson_id: int, lesson_data: dict, content_data: dict
    ) -> Lesson:
        """
        Actualiza una lección existente.
        :param lesson_id: ID de la lección a actualizar.
        :param lesson_data: Datos actualizados de la lección.
        :return: La lección actualizada.
        """
        stmt = (
            select(Lesson)
            .where(Lesson.id == lesson_id)
            .options(selectinload(Lesson.content))
        )
        result = await self.db.execute(stmt)
        lesson = result.scalar_one_or_none()

        if not lesson:
            logger.error(f"Lección con ID {lesson_id} no encontrada.")
            raise HTTPException(status_code=404, detail="Lección no encontrada")

        if lesson_data:
            for key, value in lesson_data.items():
                logger.info(
                    f"Actualizando {key} a {value} para la lección ID {lesson_id}"
                )
                setattr(lesson, key, value)

        content = lesson.content
        if content is None:
            raise HTTPException(
                status_code=404, detail="La lección no tiene contenido para actualizar."
            )

        if "content_type" in content_data:
            content.content_type = content_data["content_type"]

        if "text" in content_data:
            content.text = content_data["text"]
            content.content = content_data["text"]

        if "file" in content_data:
            url = await update_file_on_cloudinary(
                content_data["file"], public_id=lesson_id
            )
            content.content = url

        await self.db.commit()
        await self.db.refresh(lesson)
        logger.info(f"Lección ID {lesson_id} actualizada exitosamente.")
        return lesson

    async def delete_lesson(self, lesson_id: int) -> None:
        """
        Elimina una lección por su ID.
        :param lesson_id: ID de la lección a eliminar.
        """
        stmt = select(Lesson).where(Lesson.id == lesson_id)
        result = await self.db.execute(stmt)
        lesson = result.scalar_one_or_none()

        if not lesson:
            logger.error(f"Lección con ID {lesson_id} no encontrada.")
            raise ValueError("Lección no encontrada")
        if lesson.content:
            try:
                if lesson.content.content_type in {"image", "video"}:
                    await delete_file_from_cloudinary(lesson.content.content)
            except Exception:
                pass
            await self.db.delete(lesson.content)
        await self.db.delete(lesson)
        await self.db.commit()
        logger.info(f"Lección ID {lesson_id} eliminada exitosamente.")

    # --- Métodos de Evaluaciones ---

    async def get_lessons_by_course(self, course_id: int) -> list[Lesson]:
        """
        Obtiene todas las lecciones de un curso por su ID.
        :param course_id: ID del curso.
        :return: Lista de lecciones.
        """
        logger.info(f"Obteniendo lecciones para el curso con ID {course_id}")
        stmt = (
            select(Lesson)
            .where(Lesson.id_course == course_id)
            .options(selectinload(Lesson.content))  # precarga el contenido asociado
        )
        result = await self.db.execute(stmt)
        lessons = result.scalars().all()

        if not lessons:
            logger.warning(f"No se encontraron lecciones para el curso ID {course_id}.")
        else:
            logger.info(
                f"Se encontraron {len(lessons)} lecciones para el curso ID {course_id}."
            )
        return lessons

    # --- Métodos de Evaluaciones ---

    async def create_evaluation_for_lesson(self, evaluation_data: dict):
        """
        Crea una evaluación asociada a una lección.
        """
        options = evaluation_data.get("options")
        if options:
            evaluation_data["options"] = json.dumps(options)

        new_eval = Evaluation(**evaluation_data)
        self.db.add(new_eval)
        await self.db.commit()
        await self.db.refresh(new_eval)
        return new_eval

    async def get_evaluation_by_lesson_id(self, lesson_id: int) -> Optional[Evaluation]:
        """
        Obtiene una evaluación por el ID de la lección.
        :param lesson_id: ID de la lección.
        :return: Objeto Evaluation.
        """
        stmt = select(Evaluation).where(Evaluation.lesson_id == lesson_id)
        result = await self.db.execute(stmt)
        evaluation = result.scalar_one_or_none()
        if not evaluation:
            logger.error(f"Evaluación para lección ID {lesson_id} no encontrada.")
            return None
        logger.info(f"Evaluación para lección ID {lesson_id} obtenida exitosamente.")
        return evaluation

    async def update_evaluation(self, evaluation_id: int, evaluation_data: dict):
        """
        Actualiza una evaluación existente.
        :param evaluation_id: ID de la evaluación a actualizar.
        :param evaluation_data: Datos actualizados de la evaluación.
        :return: La evaluación actualizada.
        """
        stmt = select(Evaluation).where(Evaluation.id == evaluation_id)
        result = await self.db.execute(stmt)
        evaluation = result.scalar_one_or_none()

        if not evaluation:
            logger.error(f"Evaluación con ID {evaluation_id} no encontrada.")
            raise ValueError("Evaluación no encontrada")

        if (
            evaluation.options
            and evaluation_data["question_type"] == QuestionType.OPEN_QUESTION
        ):
            logger.warning(
                "La evaluación es de tipo pregunta abierta, se eliminarán las opciones y la respuesta correcta."
            )
            evaluation_data["options"] = None
            evaluation_data["correct_answer"] = None
        for key, value in evaluation_data.items():
            logger.info(
                f"Actualizando {key} a {value} para la evaluación ID {evaluation_id}"
            )
            setattr(evaluation, key, value)

        await self.db.commit()
        await self.db.refresh(evaluation)
        logger.info(f"Evaluación ID {evaluation_id} actualizada exitosamente.")
        return evaluation

    # --- Metodos de Notificaciones ---
    async def get_notifications_by_teacher_id(self, teacher_id: int):
        """
        Obtiene las notificaciones asociadas a un profesor.
        :param teacher_id: ID del profesor.
        :return: Lista de notificaciones.
        """
        stmt = (
            select(Teacher)
            .where(Teacher.id == teacher_id)
            .options(selectinload(Teacher.notifications))
        )
        result = await self.db.execute(stmt)
        teacher = result.scalar_one_or_none()

        if not teacher:
            logger.error(f"Profesor con ID {teacher_id} no encontrado.")
            return []

        notifications = teacher.notifications or []
        logger.info(
            f"Se encontraron {len(notifications)} notificaciones para el profesor ID {teacher_id}."
        )
        return notifications

    async def delete_teacher_notification(
        self, id_notification: int, teacher_id: int
    ) -> bool:
        result = await self.db.execute(
            select(Notification)
            .where(Notification.id == id_notification)
            .options(selectinload(Notification.students))
        )
        notification = result.scalar_one_or_none()

        if not notification or notification.teacher_id != teacher_id:
            return False
        notification.students.clear()  # Elimina la relación con los estudiantes
        await self.db.delete(notification)
        await self.db.commit()
        return True

    async def delete_all_teacher_notifications(self, teacher_id: int) -> int:
        result = await self.db.execute(
            select(Notification)
            .where(Notification.teacher_id == teacher_id)
            .options(selectinload(Notification.students))
        )
        notifications = result.scalars().all()
        count = len(notifications)
        for notification in notifications:
            notification.students.clear()  # Elimina la relación con los estudiantes
            await self.db.delete(notification)
        await self.db.commit()
        return count

    # --- Metodos de identificaciones ---
    async def register_identification(self, id_number: str) -> dict:
        """
        Registra la identificación de un estudiante, manejando duplicados correctamente.
        :param id_number: Número de identificación a registrar
        :return: Diccionario con resultado de la operación
        """
        try:
            # Verificar si ya existe
            existing = await self.db.execute(
                select(Identification).where(
                    Identification.n_identification == id_number
                )
            )

            if existing.scalar_one_or_none():
                logger.info(f"Número de identificación ya existe: {id_number}")
                return {"success": False, "reason": "duplicate", "id_number": id_number}

            # Crear nueva identificación
            identification = Identification(n_identification=id_number)
            self.db.add(identification)
            await self.db.commit()
            await self.db.refresh(identification)

            logger.info(f"Identificación registrada exitosamente: {id_number}")
            return {"success": True, "reason": "created", "id_number": id_number}

        except Exception as e:
            logger.error(f"Error al registrar identificación {id_number}: {e}")
            await self.db.rollback()
            return {
                "success": False,
                "reason": "error",
                "id_number": id_number,
                "error": str(e),
            }

    async def get_identification_by_id(self, id: int) -> Optional[Identification]:
        """
        Obtiene un numero de identificación en especifico.
        """
        stmt = (
            select(Identification)
            .options(selectinload(Identification.student))
            .where(Identification.id == id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_identification_by_number(
        self, identification_number: int
    ) -> Optional[Identification]:
        """
        Obtiene un numero de identificación en especifico por su número.
        """
        stmt = (
            select(Identification)
            .options(
                selectinload(Identification.student)
            )  # <--- Le dices que cargue la relación 'student'
            .where(Identification.n_identification == identification_number)
        )

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_identifications(self) -> list[Identification]:
        """Obtiene todos los números de identificación."""
        stmt = select(Identification).options(selectinload(Identification.student))
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def delete_all_identifications(self) -> None:
        """
        Elimina todos los números de identificación.
        """
        stmt = delete(Identification)
        await self.db.execute(stmt)
        await self.db.commit()

    async def delete_identification_by_id(self, id: int) -> None:
        """
        Elimina un número de identificación por su ID.
        """
        stmt = delete(Identification).where(Identification.id == id)
        await self.db.execute(stmt)
        await self.db.commit()

    async def update_identification_by_id(self, id: int, new_id_number: str) -> None:
        """
        Actualiza un número de identificación por su ID.
        """
        stmt = (
            update(Identification)
            .where(Identification.id == id)
            .values(n_identification=new_id_number)
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def get_status_student(self, identification: int) -> Optional[bool]:
        """
        Obtiene el estado de un estudiante en base su numero de identificación.
        """
        stmt = select(Student).where(Student.identification_number == identification)
        result = await self.db.execute(stmt)
        student = result.scalar_one_or_none()
        return student.is_verified if student else None

    async def get_published_courses(self, teacher_id: int) -> list[Course]:
        """
        Obtiene todos los cursos publicados de un profesor.
        """
        stmt = select(Course).where(
            Course.teacher_id == teacher_id,
            Course.is_published,  # Si el id del teacher coincide y si el Course.is_published esta en True, es decir publicado
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_students_by_course(self, course_id: int) -> list[Student]:
        """
        Obtiene todos los estudiantes inscritos en un curso específico.
        :param course_id: ID del curso.
        :return: Lista de estudiantes.
        """
        stmt = (
            select(Course)
            .where(Course.id == course_id)
            .options(selectinload(Course.students))
        )
        result = await self.db.execute(stmt)
        course = result.scalar_one_or_none()
        if not course:
            logger.warning(f"Curso con ID {course_id} no encontrado o sin estudiantes.")
            return []
        return course.students

    # async def get_all_students_data(self) -> list[dict]:
    #     identifications = await self.repo.get_identifications()
    #     students_data = []
    #     for identification in identifications:
    #         # Aquí aseguras traer el estudiante relacionado y los campos necesarios.
    #         student = identification.student
    #         students_data.append({
    #             "id": identification.id,
    #             "number_identification": identification.n_identification,
    #             "name": student.names if student else None,
    #             "course": "Todos",
    #             "score": await self.student_answer_repo.get_total_score_for_student(student.id) if student else None,
    #             "status": await self.get_status_student(identification.n_identification)
    #         })
    #     return students_data
