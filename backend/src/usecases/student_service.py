# usecases/student_service.py
"""
Este módulo encapsula la lógica de negocio asociada a la gestión de estudiantes y sus operaciones relacionadas.
"""

# Modulos externos
from typing import Optional
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from models.student_model import Student

# Modulos internos
from routes.utils import generate_profile_prefix
from src.domain.repositories.student_repository import StudentRepositoryInterface
from schemas.student_schemas import StudentRegister, StudentResponse, UpdateProfile
from repository.utils import hash_password

from services.utils.email_sender import (
    send_verification_email,
    send_password_reset_email,
)
from services.utils.email_validator import EmailValidator
from services.utils.token_generator import generate_verification_token


class StudentService:
    def __init__(self, repository: StudentRepositoryInterface):
        self.repository = repository

    async def register_student(
        self, student_schemas: StudentRegister
    ) -> Optional[Student]:
        """Permite registrar un nuevo usuario.

        Args:
            student_schemas (StudentRegister): Esquema que contiene toda la información del estudiante

        Returns:
            Optional[Student]: Estudiante creado, o None si ocurre un error.
        """
        is_valid, msg = EmailValidator.validate_email(student_schemas.email)
        if not is_valid:
            raise HTTPException(status_code=400, detail=msg)
        token = generate_verification_token()
        new_student = await self.repository.register_student(
            student_schema=student_schemas, email_token=token
        )

        if new_student:
            send_verification_email(
                student_name=new_student.names,
                to_email=student_schemas.email,
                verification_link=f"http://localhost:5173/confirmEmailRegister?token={token}",
            )
        return new_student

    async def verify_email(self, token: str, id_student: int | None = None) -> dict:
        """
        Verifica el correo del estudiante usando un token único.

        Args:
            token (str): Token enviado por correo.

        Returns:
            dict: Mensaje de éxito o error.
        """
        verified = await self.repository.verify_email_token(
            id_student=id_student or 0,
            token=token,
        )
        if not verified:
            raise HTTPException(status_code=400, detail="Token inválido o expirado")

        return {"message": "Correo verificado con éxito"}

    async def get_student_by_id(self, id: int) -> Optional[Student]:
        """Obtiene un estudiante en base a su id.

        Args:
            id (int): Identificador unico del estudiante.

        Returns:
            Optional[Student]: Objeto de tipo estudiante o None en caso de que ocurra un error.
        """
        student = await self.repository.get_student_by_id(id)
        if student is not None:
            return student

    async def valid_student(self, email: str, password: str) -> Optional[Student]:
        """
        ## Validar correo del estudiante

        Valida que el correo del estudiante se encuentre en la base de datos.

        ### Parámentros:
        - `email(str)`: Correo del estudiante con el que sera validado.

        ### Retornos:
        - `Optional[Student]`: Objeto de tipo estudiante, en caso de error None
        """
        student = await self.repository.valid_student(
            user_email=email, user_password=password
        )
        return student

    async def recovery_password(self, email: str) -> Optional[Student]:
        """
        ## Recuperar contraseña

        Permite recuperar la contraseña de un estudiante enviando un token de recuperación por correo.

        ### Parámetros:

        - `email (str)`: Correo del estudiante que desea recuperar su contraseña.

        ### Retorna:

        - `Optional[Student]`: Objeto del estudiante actualizado si el correo existe, `None` si no se encontró.
        """

        # Hora actual
        now = datetime.now()

        # Hora límite 30 minutos después
        expire_password_token = now + timedelta(minutes=30)

        # Token para validar la contraseña
        password_token = generate_verification_token()

        # Validar correo y actualizar datos del estudiante
        student = await self.repository.recovery_password(
            email=email,
            password_token=password_token,
            expire_password_token=expire_password_token,
        )

        # En caso de que el usuario no sea None lo retornamos
        if student is not None:
            send_password_reset_email(
                to_email=student.email,
                student_name=student.names,
                reset_link=f"http://localhost:5173/confirmEmailRequest?token={password_token}",
            )
            return student

    async def reset_student_password(self, token: str, new_password: str) -> dict:
        """
        Permite a un estudiante restablecer su contraseña usando un token de recuperación.
        """
        obtain_data_student = await self.repository.verify_token_recovery_password(
            token
        )
        if obtain_data_student is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido o expirado",
            )

        # Hashear la nueva contraseña
        hashed_new_password = hash_password(new_password).decode("utf-8")

        # Actualizar la contraseña del estudiante e invalidar el token en la base de datos
        # llamar al metodo uptate_password_and_invalidate_token del repositorio
        updated_student = await self.repository.uptate_password_and_invalidate_token(
            student_id=obtain_data_student.id, hashed_password=hashed_new_password
        )

        if updated_student is None:
            # en caso de que ocurra un error inesperado en la base de datos
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo restablecer la contraseña. Intente de nuevo.",
            )

        return {"message": "Contraseña restablecida exitosamente."}

    async def validate_password_token(self, password_token: str) -> Optional[Student]:
        """
        ## Validar token de contraseña
        Permite validar si el token de recuperación de contraseña es valido

        ### Parámentros:
            password_token (str): Token que valida si el estudiante puede pasar a recuperar la contraseña.

        Returns:
            Optional[Student]: Objeto de tipo estudiante o None en caso de error.
        """
        student = await self.repository.verify_token_recovery_password(
            token=password_token
        )
        print(student)
        return student

    async def delete_notifications(self, id_student: int, id_notification: int = None):
        return await self.repository.delete_notifications(
            id_student=id_student, id_notification=id_notification
        )

    async def update_names_lastnames(
        self, student_id: int, update_data: UpdateProfile
    ) -> StudentResponse:
        """
        Permite a los estudiantes actualizar sus nombres y apellidos en el perfil.
        """
        student_to_update = await self.repository.get_student_by_id(student_id)

        if not student_to_update:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estudiante no entontrado.",
            )

        updated_student = await self.repository.update_student_profile(
            student_to_update, update_data
        )

        return StudentResponse.model_validate(updated_student)

    async def get_students(self):
        students = await self.repository.get_students()

        list_students = []

        for student in students:
            list_students.append(
                {
                    "id": student.id,
                    "num_identification": student.identification_number,
                    "name": student.names,
                    "last_name": student.last_names,
                    "email": student.email,
                    "prefix_profile": generate_profile_prefix(
                        name=student.names, last_name=student.last_names
                    ),
                }
            )

        return list_students
