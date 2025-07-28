from abc import ABC, abstractmethod
from typing import Optional, List
from models.student_model import Student
from schemas.student_schemas import StudentRegister, UpdateProfile


class StudentRepositoryInterface(ABC):
    """Interface for student repository operations."""

    @abstractmethod
    async def register_student(
        self, email_token: str, student_schema: StudentRegister
    ) -> Optional[Student]:
        raise NotImplementedError

    @abstractmethod
    async def verify_email_token(self, id_student: int, token: str) -> bool:
        raise NotImplementedError

    @abstractmethod
    async def get_student_by_id(self, id: int) -> Optional[Student]:
        raise NotImplementedError

    @abstractmethod
    async def valid_student(self, email: str, password: str) -> Optional[Student]:
        raise NotImplementedError

    @abstractmethod
    async def recovery_password(
        self, email: str, password_token: str, expire_password_token
    ) -> Optional[Student]:
        raise NotImplementedError

    @abstractmethod
    async def verify_token_recovery_password(self, token: str) -> Optional[Student]:
        raise NotImplementedError

    @abstractmethod
    async def uptate_password_and_invalidate_token(
        self, student_id: int, hashed_password: str
    ) -> Optional[Student]:
        raise NotImplementedError

    @abstractmethod
    async def delete_notifications(
        self, id_student: int, id_notification: int | None = None
    ):
        raise NotImplementedError

    @abstractmethod
    async def update_student_profile(
        self, student: Student, update_data: UpdateProfile
    ) -> Student:
        raise NotImplementedError

    @abstractmethod
    async def get_students(self) -> List[Student]:
        raise NotImplementedError
