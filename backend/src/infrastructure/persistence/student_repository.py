# student_repository.py

"""
Este modulo contiene todas las operaciones que se le pueden atribuir a un estudiante en la base de datos.
"""

import logging
from typing import Optional
from datetime import datetime

from models.course_model import Course
from models.student_model import Student

# Modulos internos
from schemas.student_schemas import StudentRegister
from schemas.student_schemas import UpdateProfile
from models.course_student_model import CourseStudentAssociation

# Modulos externos
from sqlalchemy import insert, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from repository.utils import hash_password, valid_password

logger = logging.getLogger(__name__)  # Objeto para tirar logs


from src.domain.repositories.student_repository import StudentRepositoryInterface


class StudentRepository(StudentRepositoryInterface):
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def register_student(
        self, email_token: str, student_schema: StudentRegister
    ) -> Optional[Student]:
        """Permite registrar un estudiante en la base de datos.

        Args:
            student_schema (StudentRegister): Esquema que contiene y valida los datos del usuario.

        Returns:
            Optional[Student]: Estudiante creado, o None si ocurre un error.
        """
        try:

            # Validar si se intenta registrar un nuevo estudiante con el mismo correo
            existing_student = await self.db.execute(
                select(Student).where(Student.email == student_schema.email)
            )
            if existing_student.scalar_one_or_none():
                logger.warning(
                    "Intento de registrar estudiante duplicado: %s",
                    student_schema.email,
                )
                return None

            # Copia de los datos del estudiante
            student_data = student_schema.model_dump()

            # Hashear la contraseña
            hashed_password = hash_password(student_data["password"]).decode("utf-8")

            # Elimina el password original para evitar el conflicto
            student_data.pop("password")

            # Objeto del nuevo estudiante
            new_student = Student(
                **student_data,
                password=hashed_password,
                email_token=email_token,
                is_verified=False
            )

            # Agregar el usuario a la base de datos
            self.db.add(new_student)  # Agregar el estudiante a la session
            await self.db.flush()  # Necesario para obtener el ID antes de relacionar (new_student ya tiene su ID aquí)

            # Obtener los cursos base existentes
            result = await self.db.execute(select(Course.id))
            base_course_ids = result.scalars().all()

            # Insertar directamente en la tabla de asociación
            if base_course_ids:
                association_records = [
                    {"student_id": new_student.id, "course_id": course_id}
                    for course_id in base_course_ids
                ]
                await self.db.execute(
                    insert(CourseStudentAssociation).values(association_records)
                )  # Insertando las asociaciones directamente

            # Asignar cursos al estudiante
            # new_student.course.extend(base_course_ids)

            await self.db.commit()  # Mandar los datos del usuario a la base de datos
            await self.db.refresh(
                new_student
            )  #  Sincronizar el objeto en memoria con los datos persistidos

            # Retornar el objeto del estudiante
            return new_student

        # Manejar excepciones y evitar que los datos lleguen a la base de datos cuando ocurra un error.
        except Exception as e:
            logger.error("Error al registrar el estudiante", exc_info=e)
            await self.db.rollback()
            return None

    async def verify_email_token(self, id_student: int, token: str) -> bool:
        """
        Verifica el token del correo y activa la cuenta del estudiante.

        Args:
            token (str): Token recibido por correo.

        Returns:
            bool: True si se verificó correctamente, False en caso contrario.
        """
        try:
            result = await self.db.execute(
                select(Student).where(Student.email_token == token)
            )
            student = result.scalar_one_or_none()

            if not student:
                logger.warning("⚠️Token de verificación inválido: %s⚠️", token)
                return False

            if id_student == student.id:
                student.is_verified = True
                student.email_token = None  # Evita que se reutilice el token

                await self.db.commit()
                return True
            elif id_student != student.id:
                logger.warning("⚠️Error al validar el id del estudiante⚠️")
                return False

        except Exception as e:
            logger.error("Error al verificar token de correo", exc_info=e)
            await self.db.rollback()
            return False

    async def get_student_by_id(self, id: int) -> Optional[Student]:
        """Obtiene los datos del estudiante de la base de datos en base a su id.

        Args:
            id (int): Identificador unico del estudiante

        Returns:
            Optional[Student]: Objeto de tipo usuario o None en caso de error.
        """
        stmt = (
            select(Student)
            .options(selectinload(Student.notifications), selectinload(Student.courses))
            .where(Student.id == id)
        )
        result = await self.db.execute(stmt)
        student = result.scalar_one_or_none()
        return student

    async def valid_student(
        self, user_email: str, user_password: str
    ) -> Optional[Student]:
        """
        ## Validar correo del estudiante

        Busca un estudiante en la base de datos por medio de su correo y valida su contraseña.

        ### Parámentros:
        - `email(str)`: Correo del estudiante con el que sera validado.
        - `password(str)`: Contraseña ingresada por el estudiante.

        ### Retornos:
        - `Optional[Student]`: Objeto de tipo estudiante, en caso de error None
        """
        try:
            # Buscar el estudiane por medio de su correo
            result = await self.db.execute(
                select(Student).where(Student.email == user_email)
            )
            student = result.scalar_one_or_none()

            # Lanzar error y retornar None en caso de no encontrar el estudiante por medio del correo
            if not student:
                logger.warning("⚠️ Correo de estudiante no encontrado: %s", user_email)
                return None

            # Validar la contraseña
            validate_password = valid_password(
                password=user_password, hash_password=student.password
            )

            if validate_password is False:
                logger.warning("⚠️ La contraseña ingresada no coincide ⚠️")
                return None
            elif student.is_verified is False:
                logger.warning("⚠️ La cuenta del usuario no se encuentra activa ⚠️")
                return None
            elif validate_password:
                logger.info("✅Se ha validado correcatemente al usuario✅")
                return student

        except Exception as e:
            logger.error("⛔ Error al validar el correo del estudiante ⛔ ", exc_info=e)
            return None

    async def recovery_password(
        self, email: str, password_token: str, expire_password_token: datetime
    ) -> Optional[Student]:
        """
        ## Recuperar contraseña

        Este metodo permite actualizar los atributos del estudiante agregando el password_token y el expire_password_token.

        ### Parámentros:

        - `email(str)`: Correo del estudiante que desea recuperar su contraseña.
        - `password_token(str)`: Token que le permitira al usuario cambiar su contraseña.
        - `expire_password_token(str)`: Tiempo en el que expira el token para cambiar contraseña.

        ### Returnos:

        - `Optional[Student]`: Objeto de tipo estudiante o None en caso de error.
        """
        try:
            # Obtener estudiante por medio del correo
            query = await self.db.execute(select(Student).where(Student.email == email))
            student = query.scalar_one_or_none()

            # Ejecutar en caso de que el correo del estudiante sea valido
            if student:
                # Acutalizar los datos del estudiante con el token de recuperación de contraseña y su tiempo de expiración
                student.password_token = password_token
                student.expire_password_token = expire_password_token
                await self.db.commit()
                await self.db.refresh(student)
                return student
            # Ejecutar en caso de que el correo no sea valido
            elif student is None:
                logger.warning("⚠️ Error al validar al usuario ⚠️")
                return None
        # Exepción en caso de que halla un error
        except Exception as e:
            logger.error("⛔ Error al intentar recuperar la contraseña ⛔ ", exc_info=e)
            return None

    async def verify_token_recovery_password(self, token: str) -> Optional[Student]:
        """
        Verifica el token de recuperacion de contraseña en la base
        de datos y comprueba su expiración.

        Args:
            token (str): Token de recuperacion recibido.

        Returns:
            Optional[Student]: El objeto Student si el token es válido y no ha expirado,
            o None en caso contrario.
        """
        try:
            result = await self.db.execute(
                select(Student).where(
                    Student.password_token == token
                )  # Buscar coincidencia con el token
            )
            student = result.scalar_one_or_none()

            if not student:  # verificar si el estudiante fue encontrado con el token
                logger.warning("Token de verificación inválido: %s", token)
                return None  # retorna none si el token ingresado no coincide con la base de datos

            now = datetime.now()  # toma la fecha y hora actual

            if (
                student.expire_password_token is None
                or now > student.expire_password_token
            ):
                logger.warning(
                    "Token de recuperacion expirado para el estudiante: %s",
                    student.email,
                )
                student.password_token = None
                student.expire_password_token = None
                await self.db.commit()
                return None  # El token esta expirado, no es valido

            return student

        except Exception as e:
            logger.error(
                "Error al verificar token de correo para reestrablecimiento", exc_info=e
            )
            await self.db.rollback()
            return None

    async def uptate_password_and_invalidate_token(
        self, student_id: int, hashed_password: str
    ) -> Optional[Student]:
        """
        Actualiza la contraseña de un estudiante y limpia su token de recuperación.
        """
        try:
            # Buscar al estudiante por su ID
            result = await self.db.execute(
                select(Student).where(Student.id == student_id)
            )

            student = result.scalar_one_or_none()

            if not student:
                logger.error(
                    "Estudiante no encontrado para actualizar contraseña (ID: %s)",
                    student_id,
                )
                return None

            # Actualizar la contraseña y limpiar los campos del token de recuperacion
            student.password = hashed_password
            student.password_token = None
            student.expire_password_token = None

            await self.db.commit()
            await self.db.refresh(
                student
            )  # recarga el objeto para reflejar los cambios

            logger.info(
                "Contraseña restablecida y token invalidado para el estudiante: %s",
                student.email,
            )
            return student

        except Exception as e:
            logger.error(
                "Error al actualizar contraseña y invalidar token para el estudiante (ID: %s)",
                student_id,
                exc_info=e,
            )
            await self.db.rollback()
            return None

    async def delete_notifications(self, id_student: int, id_notification: int = None):
        try:
            query = await self.db.execute(
                select(Student).where(Student.id == id_student)
            )
            student = query.scalar_one_or_none()
            if student:
                if id_notification is not None:
                    for notification in student.notifications:
                        if notification.id == id_notification:
                            student.notifications.remove(notification)
                elif id_notification is None:
                    student.notifications.clear()
                await self.db.commit()
                await self.db.refresh(student)
                return student
            if student is None:
                logger.info("⚠️ No se ha podido encontrar con el estudiante ⚠️")
                await self.db.rollback()
        except Exception as e:
            logger.error("⛔ Error al intentar registrar el estudiante ⛔", exc_info=e)
            await self.db.rollback()
            return None

    async def update_student_profile(
        self, student: Student, update_data: UpdateProfile
    ) -> Student:
        """
        Actualiza solo los nombres y apellidos del estudiante.
        """
        if update_data.names is not None:
            student.names = update_data.names
        if update_data.last_names is not None:
            student.last_names = update_data.last_names

        self.db.add(student)
        await self.db.commit()
        await self.db.refresh(
            student
        )  # Recarga el objeto para obtener los datos actualizados

        return student

    async def get_students(self):
        result = await self.db.execute(select(Student))

        students = result.scalars().all()

        return students
