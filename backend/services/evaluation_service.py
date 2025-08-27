# services/ evaluation_service.py

import logging
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
import google.generativeai as genai


# Modulos internos
from models.progress_model import StateProgress
from repository.evaluation_repository import EvaluationRepository
from repository.lesson_repository import LessonRepository  # Validar curso y lección
from repository.student_answer_repository import StudentAnswerRepository
from schemas.evaluation_schemas import (
    EvaluationResponse,
    StudentAnswerRequest,
    APIEvaluationScoreResponse,
    ScoreResponseDetails,
)  # Importar los esquemas de respuesta
from models.evaluation_model import QuestionType
from models.student_answer_model import StudentAnswer
from repository.course_repository import CourseRepository

logger = logging.getLogger(__name__)

global_gemini_model: Optional[genai.GenerativeModel] = None


class EvaluationService:
    def __init__(
        self,
        evaluation_repo: EvaluationRepository,
        lesson_repo: LessonRepository,
        student_answer_repo: StudentAnswerRepository,
        db_session: AsyncSession,
        gemini_model_instance: Optional[genai.GenerativeModel],
    ) -> None:
        self.evaluation_repo = evaluation_repo
        self.lesson_repo = lesson_repo
        self.student_answer_repo = student_answer_repo
        self.db = db_session  # Asignar sesión para hacer commits
        self.gemini_model = gemini_model_instance
        self.course_repo = CourseRepository(db_session)

    async def get_lesson_evaluation(
        self, course_id: int, lesson_id: int, student_id: int
    ) -> EvaluationResponse:
        """
        Obtiene la evaluación de una lección específica dentro de un curso dado.
        Realiza validaciones de existencia de curso y lección, y su asociación.
        """

        logger.info(
            f"Estudiante {student_id} solicitando evaluación para curso {course_id}, lección {lesson_id}"
        )

        # Validar si el curso existe
        course_exists = await self.lesson_repo.get_course_by_id(course_id)
        if not course_exists:
            logger.warning(
                f"Intento de obtener evaluación para curso inexistente: {course_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Curso no encontrado."
            )

        # Validar si la lección existe y pertenece al curso
        lesson = await self.lesson_repo.get_lesson_by_id_and_course_id(
            lesson_id, course_id
        )
        if not lesson:
            logger.warning(
                f"Lección {lesson_id} no encontrada o no pertenece al curso {course_id}."
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lección no encontrada en este curso.",
            )

        # Obtener la evaluación de la lección
        evaluation_obj = await self.evaluation_repo.get_evaluation_by_lesson_id(
            lesson_id
        )

        if not evaluation_obj:
            logger.warning(f"No se encontró evaluación para la lección {lesson_id}.")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evaluación no encontrada para esta lección.",
            )

        # Transformar el objeto del modelo a un esquema Pydantic para la respuesta
        # Adaptar la respuesta según el tipo de pregunta (si tiene opciones o no)
        options_list = None
        if evaluation_obj.question_type == QuestionType.MULTIPLE_CHOICE:
            try:
                options_list = (
                    json.loads(evaluation_obj.options) if evaluation_obj.options else []
                )
            except json.JSONDecodeError:
                logger.error(
                    f"Error al decodificar opciones JSON para la evaluación {evaluation_obj.id}: {evaluation_obj.options}"
                )
                options_list = []

        return EvaluationResponse(
            id_evaluation=evaluation_obj.id,
            question=evaluation_obj.question,
            question_type=evaluation_obj.question_type,
            options=options_list,  # Pasar la lista de opciones
        )

    async def evaluate_student_answer(
        self,
        course_id: int,
        lesson_id: int,
        evaluation_id: int,
        student_id: int,
        answer_data: StudentAnswerRequest,
    ) -> APIEvaluationScoreResponse:
        """
        Valida la respuesta del estudiante para una evaluación,
        actualiza el progreso y el score.
        """
        try:
            # 1. Validar curso, lección y existencia de la evaluación
            course_exists = await self.lesson_repo.get_course_by_id(course_id)
            if not course_exists:
                logger.warning(
                    f"Intengo de validar respuesta para curso inexistente {course_id}"
                )
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Curso no encontrado."
                )

            lesson = await self.lesson_repo.get_lesson_by_id_and_course_id(
                lesson_id, course_id
            )
            if not lesson:
                logger.warning(
                    f"Lección {lesson_id} no encontrada o no pertenece al curso {course_id}."
                )
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Lección no encontrada en este curso.",
                )

            evaluation_obj = await self.evaluation_repo.get_evaluation_by_lesson_id(
                lesson_id
            )
            if not evaluation_obj or evaluation_obj.id != evaluation_id:
                logger.warning(
                    f"Evaluación {evaluation_id} no encontrada para la lección {lesson_id}."
                )
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Evaluación no encontrada para esta lección.",
                )

            # Asegurarse de que el question_type enviado coincida con el almacenado
            if answer_data.question_type != evaluation_obj.question_type:
                logger.warning(
                    f"Tipo de pregunta inconsistente: esperado {evaluation_obj.question_type}, recibido {answer_data.question_type}"
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tipo de pregunta inconsistente con la evaluación.",
                )

            score_obtained = 0.0
            is_pass = False

            if answer_data.question_type == QuestionType.MULTIPLE_CHOICE:
                if (
                    evaluation_obj.correct_answer
                    and answer_data.response == evaluation_obj.correct_answer
                ):
                    score_obtained = 100.0
                    is_pass = True

            elif answer_data.question_type == QuestionType.OPEN_QUESTION:
                if not self.gemini_model:
                    logger.error(
                        "Modelo Gemini no está configurado para evaluar preguntas abiertas."
                    )
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Servicio de IA no disponible para evaluar preguntas abiertas",
                    )
                gpt_evaluation_result = await self._evaluate_with_gemini(
                    question=evaluation_obj.question,
                    student_answer=answer_data.response,
                )
                score_obtained = gpt_evaluation_result["porcentaje_correcto"]
                logger.info(f"Puntaje obtenido (pregunta abierta): {score_obtained}")
                is_pass = gpt_evaluation_result["aprobado"]

            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Tipo de pregunta no soportado.",
                )

            if not is_pass:
                # No se hace commit aquí porque no se ha cambiado el estado de nada aún.
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "status": status.HTTP_400_BAD_REQUEST,
                        "message": "Respuesta incorrecta. Por favor, inténtalo de nuevo.",
                    },
                )

            # Si es correcta, guardar la respuesta del estudiante
            existing_student_answer = (
                await self.student_answer_repo.get_student_answer_for_evaluation(
                    student_id=student_id, evaluation_id=evaluation_id
                )
            )

            old_global_score = (
                await self.student_answer_repo.get_total_score_for_student(student_id)
            )

            if existing_student_answer and existing_student_answer.score is not None:
                old_eval_score = existing_student_answer.score
            else:
                old_eval_score = 0.0

            incremento = 0.0
            update_answer = False

            if existing_student_answer:
                if answer_data.question_type == QuestionType.OPEN_QUESTION:
                    if score_obtained > old_eval_score:
                        incremento = score_obtained - old_eval_score
                        update_answer = True
                    else:
                        incremento = 0.0
                elif answer_data.question_type == QuestionType.MULTIPLE_CHOICE:
                    if old_eval_score < 100.0 and score_obtained == 100.0:
                        incremento = 100.0 - old_eval_score
                        update_answer = True
                    else:
                        incremento = 0.0

                if update_answer:
                    existing_student_answer.student_response = answer_data.response
                    existing_student_answer.score = score_obtained
                    existing_student_answer.answered_at = datetime.now(timezone.utc)
                    await self.db.flush()  # Solo flush, no commit aquí
                    logger.info(
                        f"Respuesta de evaluación {evaluation_id} actualizada para estudiante {student_id}."
                    )
                else:
                    incremento = 0.0
                    logger.info(
                        f"Respuesta de evaluación {evaluation_id} no actualizada para estudiante {student_id} (score no mejorado o ya era 100)."
                    )
            else:
                incremento = score_obtained
                new_student_answer_obj = StudentAnswer(
                    student_id=student_id,
                    evaluation_id=evaluation_id,
                    student_response=answer_data.response,
                    score=score_obtained,
                    answered_at=datetime.now(timezone.utc),
                )
                await self.student_answer_repo.create_student_answer(
                    new_student_answer_obj
                )
                logger.info(
                    f"Nueva respuesta de evaluación {evaluation_id} creada para estudiante {student_id}."
                )

            new_global_score = old_global_score + incremento

            lessons_in_course = await self.lesson_repo.get_lessons_by_course_id_ordered(
                course_id
            )
            current_lesson_index = -1
            for index, lesson_item in enumerate(lessons_in_course):
                if lesson_item.id == lesson_id:
                    current_lesson_index = index
                    break

            if current_lesson_index != -1:
                await self.lesson_repo.update_progress_status_for_student_lesson(
                    student_id, lesson_id, StateProgress.COMPLETE.value
                )

                is_last_lesson = (current_lesson_index + 1) == len(lessons_in_course)

                if not is_last_lesson:
                    next_lesson = lessons_in_course[current_lesson_index + 1]
                    progress_of_next_lesson = (
                        await self.lesson_repo.get_progress_status_for_student_lesson(
                            student_id, next_lesson.id
                        )
                    )

                    if (
                        progress_of_next_lesson is None
                        or progress_of_next_lesson == StateProgress.BLOCKED
                    ):
                        # Si la siguiente lección está bloqueada o no tiene progreso, pásala a 'in_progress'
                        await self.lesson_repo.update_progress_status_for_student_lesson(
                            student_id, next_lesson.id, StateProgress.IN_PROGRESS.value
                        )
                    elif progress_of_next_lesson == StateProgress.COMPLETE:
                        # Si ya está completa, no la toques
                        logger.info(
                            f"La lección {next_lesson.id} YA está completada para el estudiante {student_id}. No se actualiza."
                        )
                    else:
                        # En cualquier otro caso (ya en progreso, etc), tampoco la toques
                        logger.info(
                            f"La lección {next_lesson.id} tiene estado '{progress_of_next_lesson}' no (completed, blocked). No se modifica."
                        )
                else:
                    logger.info(
                        f"Estudiante {student_id} completó la última lección del curso {course_id}. Marcando curso como COMPLETED."
                    )
                    await self.course_repo.mark_course_as_completed_for_student(
                        student_id, course_id
                    )

            # ---- ÚNICO COMMIT AQUÍ (al final, para todo el proceso) ----
            await self.db.commit()

            return APIEvaluationScoreResponse(
                status=status.HTTP_200_OK,
                message="Evaluación pasada con éxito",
                score=ScoreResponseDetails(
                    old_score=round(old_global_score, 2),
                    new_score=round(new_global_score, 2),
                    date=datetime.now().strftime("%H:%M:%S"),
                ),
            )
        except Exception:
            await self.db.rollback()
            logger.error(
                "Error inesperado durante la evaluación, se realizó rollback.",
                exc_info=True,
            )
            raise

    async def _evaluate_with_gemini(
        self, question: str, student_answer: str
    ) -> Dict[str, Any]:
        """
        Evalúa una respuesta abierta usando el modelo Gemini.
        No se le pasa la respuesta correcta.
        """
        if not self.gemini_model:
            logger.error("Modelo Gemini no disponible para la evaluación.")
            raise RuntimeError("Modelo Gemini no inicializado.")
        try:
            prompt = f"""
                Eres un evaluador experimentado en el campo de la informática.
                Tu tarea es evaluar la respuesta de un estudiante a una pregunta dada.

                Pregunta: "{question}"
                Respuesta del estudiante: "{student_answer}"

                Evalúa la respuesta del estudiante en una escala del 0 al 100, donde 100 significa una respuesta excelente y completamente correcta,
                y 0 significa que la respuesta es completamente incorrecta o irrelevante.

                Considera la precisión, la completitud y la relevancia de la respuesta del estudiante con respecto a la pregunta.

                Devuelve SOLO un número entero entre 0 y 100. No incluyas ningún otro texto, explicaciones, prefijos o sufijos.
                Ejemplo de salida: 85
                """
            response = await self.gemini_model.generate_content_async(
                prompt
            )  # Usar _async si es un generador asíncrono

            porcentaje_texto = (response.text or "").strip()

            # Extraer solo el número
            try:
                # Usar regex para ser más robustos en la extracción del número
                import re

                match = re.search(
                    r"\b(\d{1,3})\b", porcentaje_texto
                )  # Busca 1 a 3 dígitos como palabra completa
                if match:
                    porcentaje = int(match.group(1))
                    porcentaje = max(
                        0, min(100, porcentaje)
                    )  # Asegurarse de que esté entre 0 y 100
                else:
                    porcentaje = 0  # Si no encuentra un número válido, asumir 0
                    logger.warning(
                        f"Gemini no devolvió un número válido: '{porcentaje_texto}' para pregunta: '{question}'"
                    )
            except ValueError:
                porcentaje = 0
                logger.warning(
                    f"ValueError al convertir a int: '{porcentaje_texto}' para pregunta: '{question}'"
                )

            aprobado = porcentaje >= 65  # Umbral de aprobación (ajustable)

            return {
                "porcentaje_correcto": float(
                    porcentaje
                ),  # Devolver como float para compatibilidad con el tipo de score
                "aprobado": aprobado,
            }

        except genai.types.BlockedPromptException as e:
            logger.error(f"El prompt fue bloqueado por seguridad: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La solicitud de evaluación fue bloqueada por el modelo de IA.",
            )
        except Exception as e:
            logger.error(
                f"Error al comunicarse con Gemini para la evaluación: {e}",
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al procesar la evaluación con IA.",
            )
