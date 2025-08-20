/** Hook personalizado para actualizar lecciones y evaluaciones */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import type {
  TFormDataLesson,
  TEvaluationTeacherSend,
} from "../types/Teacher";

import UpdateLessonAPI from "../services/Lesson/UpdateLesson.server";
import UpdateEvaluationAPI from "../services/Evaluation/UpdateEvaluation.server";

/** Define los posibles errores del formulario */
type FormErrors = {
  lesson?: {
    name?: string;
    content?: {
      file?: string;
    };
  };
  evaluation?: {
    question?: string;
    options?: string;
    correctAnswer?: string;
  };
};

export function useFormUpdateLessons() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const idCourse = Number(courseId);
  const idLesson = Number(lessonId);
  const navigate = useNavigate();

  const [formDataLesson, setFormDataLesson] = useState<TFormDataLesson>({
    lesson: {
      idCourse,
      name: "",
      content: {
        content_type: "image", // solo image|video
        file: null,
        text: ""               // lo mantenemos, pero no se usará al enviar
      }
    },
    evaluation: {
      question_type: "open_question",
      question: "",
      options: [],
      correct_answer: ""
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const ERROR_MESSAGES = {
    required: (field: string) => `El campo ${field} es obligatorio.`,
    minOptions: "Debes ingresar al menos dos opciones.",
    emptyOption: "No se permiten opciones vacías.",
    invalidAnswer: "Debes seleccionar una respuesta válida."
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const { name } = formDataLesson.lesson;
    const { question_type, question, options, correct_answer } = formDataLesson.evaluation;

    if (!name.trim()) {
      newErrors.lesson = {
        ...newErrors.lesson,
        name: ERROR_MESSAGES.required("nombre de la lección")
      };
    }

    // Solo image|video: archivo obligatorio
/*     if (!content.file) {
      newErrors.lesson = {
        ...newErrors.lesson,
        content: { file: ERROR_MESSAGES.required("archivo multimedia") }
      };
    } */

    if (!question.trim()) {
      newErrors.evaluation = {
        ...newErrors.evaluation,
        question: ERROR_MESSAGES.required("pregunta")
      };
    }

    if (question_type === "multiple_choice") {
      if ((options?.length ?? 0) < 2) {
        newErrors.evaluation = {
          ...newErrors.evaluation,
          options: ERROR_MESSAGES.minOptions
        };
      }

      if (options!.some((opt) => !opt.trim())) {
        newErrors.evaluation = {
          ...newErrors.evaluation,
          options: ERROR_MESSAGES.emptyOption
        };
      }

      if (!correct_answer || !options!.includes(correct_answer)) {
        newErrors.evaluation = {
          ...newErrors.evaluation,
          correctAnswer: ERROR_MESSAGES.invalidAnswer
        };
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // 1) Actualizar lección (solo image|video). El servicio ya envía solo file según content_type.
      const lessonContent = formDataLesson.lesson;
      // Debug opcional:
      // console.log('Contenido de leccion', lessonContent);
      await UpdateLessonAPI({ idCourse, idLesson, lessonContent });

      // 2) Actualizar evaluación
      const { question_type, question, options, correct_answer } = formDataLesson.evaluation;
      const evaluation: TEvaluationTeacherSend = {
        question_type,
        question,
        options: options ?? [],
        ...(question_type === "multiple_choice" ? { correct_answer } : {})
      };

      await UpdateEvaluationAPI({ idCourse, idLesson, evaluation });

      // 3) UX
      toast.success("Lección y evaluación actualizadas con éxito");
      setSubmitSuccess(true);
      navigate(`/teacher/courses/${idCourse}`);
    } catch (err: any) {
      console.error('Update error:', err?.response?.status, err?.response?.data || err?.message);
      toast.error(err?.response?.data?.detail ?? err?.message ?? "Error al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOption = () => {
    setFormDataLesson((prev) => ({
      ...prev,
      evaluation: {
        ...prev.evaluation,
        options: [...(prev.evaluation.options ?? []), ""]
      }
    }));
  };

  const removeOption = (index: number) => {
    setFormDataLesson((prev) => {
      const opciones = [...(prev.evaluation.options ?? [])];
      const nuevasOpciones = opciones.filter((_, i) => i !== index);
      const esLaCorrecta = opciones[index] === prev.evaluation.correct_answer;

      return {
        ...prev,
        evaluation: {
          ...prev.evaluation,
          options: nuevasOpciones,
          correct_answer: esLaCorrecta ? "" : prev.evaluation.correct_answer
        }
      };
    });
  };

  const updateOption = (index: number, value: string) => {
    setFormDataLesson((prev) => {
      const nuevas = [...(prev.evaluation.options ?? [])];
      const anterior = nuevas[index];
      nuevas[index] = value;

      return {
        ...prev,
        evaluation: {
          ...prev.evaluation,
          options: nuevas,
          correct_answer:
            prev.evaluation.correct_answer === anterior ? value : prev.evaluation.correct_answer
        }
      };
    });
  };

  const handleQuestionTypeChange = (value: TFormDataLesson['evaluation']['question_type']) => {
    setFormDataLesson((prev) => ({
      ...prev,
      evaluation: {
        ...prev.evaluation,
        question_type: value,
        options: value === "multiple_choice" ? ["", ""] : [],
        correct_answer: ""
      }
    }));
  };
  const handleContentTypeChange = (
    value: "image" | "video" // 🔹 limitamos directamente el tipo
  ) => {
    setFormDataLesson((prev) => ({
      ...prev,
      lesson: {
        ...prev.lesson,
        content: {
          ...prev.lesson.content,
          content_type: value
        }
      }
    }));
  };


  const handleChange = (path: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    const updated = { ...formDataLesson };
    const keys = path.split(".");
    let current = updated as Record<string, any>;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setFormDataLesson(updated);
  };

  return {
    formDataLesson,
    setFormDataLesson,
    errors,
    isSubmitting,
    submitSuccess,
    handleSubmit,
    addOption,
    removeOption,
    updateOption,
    handleQuestionTypeChange,
    handleContentTypeChange,
    handleChange
  };
}
