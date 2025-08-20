
/** Importa hooks de React para manejar estado y parámetros de URL */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

/** Importa tipos específicos del dominio docente */
import type {
  TFormDataLesson,
  TEvaluationTeacherSend,
  TLessonContentResponse,
} from "../types/Teacher";

/** Servicios para crear lección y evaluación */
import CreateLessonAPI from "../services/Lesson/CreateLesson.server";
import { CreateEvaluacionAPI } from "../services/Evaluation/CreateEvaluation.server";
import toast from "react-hot-toast";
import { authStorage } from "../../../shared/Utils/authStorage";

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

/** Hook personalizado para manejar la creación de lecciones y evaluaciones */
export function useFormCreateLessons() {
  /** Obtiene el ID del curso desde los parámetros de la ruta */
  const { courseId } = useParams<{ courseId: string }>();
  const idCourse = Number(courseId)


  const navigate = useNavigate(); // dentro del hook

  /** Estado inicial del formulario, sin IDs ya que se generan en backend */
  const [formDataLesson, setFormDataLesson] = useState<{
    lesson: Omit<TFormDataLesson['lesson'], 'idCourse'>;
    evaluation: Omit<TFormDataLesson['evaluation'], 'idLesson' | 'idCourse'>;
  }>({
    lesson: {
      name: "",
      content: {
        content_type: "image",
        file: null,
        text: "",
      },
    },
    evaluation: {
      question_type: "open_question",
      question: "",
      options: [],
      correct_answer: "",
    },
  });

  /** Estado para manejar errores del formulario */
  const [errors, setErrors] = useState<FormErrors>({});
  /** Bandera para saber si se está enviando el formulario */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** Bandera para indicar éxito en el envío */
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /** Mensajes estándar de validación */
  const ERROR_MESSAGES = {
    required: (field: string) => `El campo ${field} es obligatorio.`,
    minOptions: "Debes ingresar al menos dos opciones.",
    emptyOption: "No se permiten opciones vacías.",
    invalidAnswer: "Debes seleccionar una respuesta válida.",
  };

  /** Valida todos los campos del formulario antes de enviar */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const { name, content } = formDataLesson.lesson;
    const { question_type, question, options, correct_answer } = formDataLesson.evaluation;


    /** Valida nombre de la lección */
    if (!name.trim()) {
      newErrors.lesson = {
        ...newErrors.lesson,
        name: ERROR_MESSAGES.required("nombre de la lección"),
      };
    }

    /** Valida archivo multimedia */
    if (!content.file) {
      newErrors.lesson = {
        ...newErrors.lesson,
        content: { file: ERROR_MESSAGES.required("archivo multimedia") },
      };
    }

    /** Valida pregunta */
    if (!question.trim()) {
      newErrors.evaluation = {
        ...newErrors.evaluation,
        question: ERROR_MESSAGES.required("pregunta"),
      };
    }

    /** Si es pregunta de selección múltiple, valida opciones */
    if ( question_type === "multiple_choice" && Array.isArray(options)) {
      if (options.length < 2) {
        newErrors.evaluation = {
          ...newErrors.evaluation,
          options: ERROR_MESSAGES.minOptions,
        };
      }

      if (options.some((opt) => !opt.trim())) {
        newErrors.evaluation = {
          ...newErrors.evaluation,
          options: ERROR_MESSAGES.emptyOption,
        };
      }

      if (!correct_answer || !options.includes(correct_answer)) {
        newErrors.evaluation = {
          ...newErrors.evaluation,
          correctAnswer: ERROR_MESSAGES.invalidAnswer,
        };
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /** Envía la lección y la evaluación al backend */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const { name, content } = formDataLesson.lesson;
      const lessonContent:TLessonContentResponse ={
        name:name,
        content:content

      }
      /** Crea la lección */
      const lessonCreated = await CreateLessonAPI({idCourse,lessonContent});

      /** Obtiene el ID de la lección recién creada */
      const idLesson = lessonCreated.id;
      /* aObtiene el nombre de la leccion recien creada, para mostrarla cuando se ejecute el servicio de la evaluacion */
      const nameLesson= lessonCreated.name;
      if (!idLesson) throw new Error("No se pudo obtener el ID de la lección");

      /** Prepara datos de evaluación */
      const { question_type, question, options, correct_answer } = formDataLesson.evaluation;

      const evaluation: TEvaluationTeacherSend = {
        question_type,
        question,
        options: options ?? [],
        ...(question_type === "multiple_choice" ? { correct_answer } : {}),
      };

      /** Crea la evaluación */
      const createEvaluation = await CreateEvaluacionAPI({idLesson, idCourse,evaluation});

      /** Marca éxito y resetea formulario */
      if (lessonCreated && createEvaluation) {
        toast.success("Lección" + nameLesson + "exitosamente");
        // Limpiar cache de lecciones para forzar recarga
        authStorage.clearLessonData();
        authStorage.removeFormLessonInfo();
        setSubmitSuccess(true);
        navigate(`/teacher/courses/${idCourse}`);
      }
      resetForm();
      /* Redirijir al curso  */
    } catch (err) {
      console.error("Error al guardar los datos", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Limpia el formulario luego de 3 segundos */
  const resetForm = () => {
    setTimeout(() => {
      setFormDataLesson({
        lesson: {
          name: "",
          content: { content_type: "image", file: null, text: "" },
        },
        evaluation: {
          question_type: "open_question",
          question: "",
          options: [],
          correct_answer: "",

        },
      });
      setSubmitSuccess(false);
    }, 3000);
  };

  /** Agrega una opción vacía */
  const addOption = () => {
    setFormDataLesson((prev) => ({
      ...prev,
      evaluation: {
        ...prev.evaluation,
        options: [...(prev.evaluation.options ?? []), ""],
      },
    }));
  };

  /** Elimina una opción y resetea respuesta si era la correcta */
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
          correctAnswer: esLaCorrecta ? "" : prev.evaluation.correct_answer,
        },
      };
    });
  };

  /** Actualiza el valor de una opción */
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
          correctAnswer:
            prev.evaluation.correct_answer === anterior ? value : prev.evaluation.correct_answer,
        },
      };
    });
  };

  /** Cambia el tipo de pregunta */
  const handleQuestionTypeChange = (
    value: TFormDataLesson["evaluation"]["question_type"]
  ) => {
    setFormDataLesson((prev) => ({
      ...prev,
      evaluation: {
        ...prev.evaluation,
        question_type: value, // ✅ Usar question_type en lugar de questionType
        options: value === "multiple_choice" ? ["", ""] : [],
        correct_answer: "", // ✅ Usar correct_answer en lugar de correctAnswer
      },
    }));
  };

  /** Cambia el tipo de contenido de la lección */
  const handleContentTypeChange = (
    value: TFormDataLesson["lesson"]["content"]["content_type"]
  ) => {
    setFormDataLesson((prev) => ({
      ...prev,
      lesson: {
        ...prev.lesson,
        content: {
          ...prev.lesson.content,
          content_type: value, // ✅ Usar content_type en lugar de contentType
        },
      },
    }));
  };
    /**
   * Esta función se usa para manejar cambios en los campos del formulario.
   * Por ejemplo: cuando el usuario escribe en el input del nombre de la lección.
   *
   * path = la ruta del campo (ej: "lesson.name" o "lesson.content.text")
   */
  const handleChange =
    (path: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value; // el valor que escribió el usuario

      // Creamos una copia del estado actual para modificarlo sin romper nada
      const updated = { ...formDataLesson };

      // Convertimos la ruta "lesson.name" en ["lesson", "name"]
      const keys = path.split(".");

      // Aquí vamos bajando por el objeto hasta llegar al campo que queremos cambiar
      let current = updated as Record<string, any>;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      // Finalmente, actualizamos el valor del campo
      current[keys[keys.length - 1]] = value;

      // Guardamos el nuevo estado en React
      setFormDataLesson(updated);
    };



  /** Retorna funciones y estados útiles */
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
    handleChange,
  };
}
