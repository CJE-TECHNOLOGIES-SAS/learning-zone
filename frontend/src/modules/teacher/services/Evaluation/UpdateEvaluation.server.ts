// Servicio que actualiza una evaluación existente de una lección específica de un curso
import axios from '../../../../api/axiosInstance';
import type { TCourse } from '../../../courses/types/CourseStudent';
import type { TEvaluationTeacherSend, TLessonTeacherResponse } from '../../types/Teacher';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;

// Tipo para la respuesta esperada del backend
type TUpdateEvaluationAPIResponse = {
  status: number;
  message: string;
};

type TUpdateEvaluationAPIProps = {
  idCourse: TCourse['id'];
  idLesson: TLessonTeacherResponse['id'];
  evaluation: TEvaluationTeacherSend;
};

/**
 * Actualiza una evaluación existente asociada a una lección dentro de un curso.
 */
export default async function UpdateEvaluationAPI({
  idLesson,
  evaluation
}: TUpdateEvaluationAPIProps): Promise<TUpdateEvaluationAPIResponse> {
  try {
    const response = await axios.put(
      `${VITE_TEACHER_ENDPOINT}/evaluations/${idLesson}`,
      {
        question_type: evaluation.question_type,
        question: evaluation.question,
        options: evaluation.options ?? [],
        correct_answer: evaluation.correct_answer ?? ''
      }
    );

    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.data?.message || 'Error desconocido'}`);
    }

    return response.data as TUpdateEvaluationAPIResponse;
  } catch (error) {
    console.error('Error en UpdateEvaluation:', error);
    throw error;
  }
}
