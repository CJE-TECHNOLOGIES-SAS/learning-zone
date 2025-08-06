# repository/comment_repository.py

"""Este módulo contiene los procedimientos de base de datos relacionados con comentarios."""

from sqlalchemy import select
from sqlalchemy.orm import selectinload
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from schemas.comment_schemas import CommentCreate
from models.comment_model import Comment

logger = logging.getLogger(__name__)  # Objeto para tirar logs


class CommentRepo:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_comment(
        self, id_student: int, comment_data: CommentCreate
    ) -> Comment:
        """
        Crea un nuevo comentario en la base de datos.

        Args:
            comment_data (CommentCreate): Esquema con los datos del comentario.

        Returns:
            Comment: Comentario guardado en la base de datos.
        """
        try:
            dict_comment_data = comment_data.model_dump()

            new_comment = Comment(student_id=id_student, **dict_comment_data)

            self.db.add(new_comment)
            await self.db.commit()
            await self.db.refresh(new_comment)

            return new_comment
        except Exception as e:
            logger.error(f"[ERROR]: Ha ocurrido un error interno: {e}", exc_info=True)
            await self.db.rollback()
            raise

    async def get_comments_by_course_id(self, id_course: int) -> list[Comment]:
        """
        Retorna una sequencia de comentarios de un curso en especifico.
        """
        result = await self.db.execute(
            select(Comment)
            .options(selectinload(Comment.student))
            .where(Comment.course_id == id_course)
        )
        comments = result.scalars().all()

        return comments

    async def update_comment(
        self, id_comment: int, id_student: int, new_text: str
    ) -> Optional[Comment]:
        """Actualiza un comentario"""
        try:
            query = await self.db.execute(
                select(Comment)
                .where(Comment.id == id_comment, Comment.student_id == id_student)
                .options(selectinload(Comment.student))
            )

            comment = query.scalar_one_or_none()

            if comment:

                comment.text = new_text

                await self.db.commit()
                await self.db.refresh(comment)
                return comment

            logger.warning(
                f"[WARNING]: Comentario {id_comment} o Estudiante {id_student} invalido."
            )
            await self.db.rollback()
            return None

        except Exception as e:
            logger.error(
                f"[ERROR] No se pudo actualizar el comentario: {e}", exc_info=True
            )
            await self.db.rollback()
            return None

    async def delete_comment(self, id_comment: int, id_student: int):
        """Permite eliminar un comentario dado su ID y el del estudiante que lo escribio"""
        try:
            query = await self.db.execute(
                select(Comment)
                .where(Comment.id == id_comment, Comment.student_id == id_student)
                .options(selectinload(Comment.student))
            )
            comment = query.scalar_one_or_none()

            if comment:
                comment_deleted = comment
                comment_deleted.text = "🚫 Comentario eliminado."

                await self.db.delete(comment)
                await self.db.commit()

                return comment_deleted

            logger.warning(
                f"[WARNING]: Comentario {id_comment} o Estudiante {id_student} invalido."
            )
            await self.db.rollback()
            return None
        except Exception:
            logger.error("[ERROR]: No se pudo eliminar el comenario")
            await self.db.rollback()
