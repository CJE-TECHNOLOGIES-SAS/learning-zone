"use client";

import { Plus, Trash2 } from "lucide-react";

import {
  Input,
  Card,
  CardContent,
  Textarea,
  Alert,
  AlertDescription,
} from "../../../shared/Components/ui/index";

import { useEffect } from "react";
import { authStorage } from "../../../shared/Utils/authStorage";
import { useFormUpdateLessons } from "../hooks/useFormUpdateLesson";
import "../styles/LessonEdit.css";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigationHandler } from "../../../hooks/useNavigationHandler";

export default function LessonEditor() {
  const {
    formDataLesson,
    setFormDataLesson,
    errors,
    submitSuccess,
    isSubmitting,
    handleSubmit,
    addOption,
    removeOption,
    updateOption,
    handleQuestionTypeChange,
    handleContentTypeChange,
    handleChange,
  } = useFormUpdateLessons();

  useEffect(() => {
    const data = authStorage.getFormLessonInfo();
    if (data) {
      setFormDataLesson(data);
    }
  }, [setFormDataLesson]);

  const handleBtnNavigate = useNavigationHandler();

  return (
    <div className="container-form-lesson-teacher">
      <div className="envoltura-form-lesson">
        <div className="header-form-lesson-teacher">
          <h1 className="title-update-lesson">Editar Lección</h1>
          <p className="paragraph-update-lesson">
            Actualiza la información de la lección y su evaluación.
          </p>
        </div>

        {submitSuccess && (
          <Alert>
            <AlertDescription>
              ¡Lección actualizada exitosamente!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="form-lesson-teacher">
          {/* Botón de regreso */}
          <button
            type="button"
            className="btn-back-update-lesson"
            style={{ color: "black" }}
            onClick={() => handleBtnNavigate("/back")}
          >
            <IoArrowBackCircleSharp />
          </button>

          <Card>
            <CardContent>
              {/* Nombre */}
              <div className="container-label-input-update-lesson">
                <label>Nombre de la Lección *</label>
                <Input
                  value={formDataLesson.lesson.name}
                  onChange={handleChange("lesson.name")}
                  className={errors.lesson?.name ? "input-lesson-error" : ""}
                />
                {errors.lesson?.name && (
                  <p className="text-error-lesson">{errors.lesson.name}</p>
                )}
              </div>

              {/* Texto */}
              <div className="container-label-input-update-lesson">
                <label>Texto Complementario</label>
                <Textarea
                  value={formDataLesson.lesson.content.text}
                  onChange={handleChange("lesson.content.text")}
                />
              </div>

              {/* Tipo de Contenido (select nativo) */}
              <div className="container-label-input-update-lesson">
                <label>Tipo de Contenido *</label>
                <select
                  value={formDataLesson.lesson.content.content_type}
                  onChange={(e) =>
                    handleContentTypeChange(e.target.value as any)
                  }
                  className="select-native"
                >
                  <option value="video">Video</option>
                  <option value="image">Imagen</option>
                </select>
              </div>

              {/* Archivo */}
              <div className="container-label-input-update-lesson">
                <label>Contenido *</label>
                <Input
                  type="file"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormDataLesson((prev) => ({
                      ...prev,
                      lesson: {
                        ...prev.lesson,
                        content: {
                          ...prev.lesson.content,
                          file: e.target.files?.[0] ?? null,
                        },
                      },
                    }))
                  }
                  className={
                    errors.lesson?.content?.file ? "input-lesson-error" : ""
                  }
                />
                {errors.lesson?.content?.file && (
                  <p className="text-error-lesson">
                    {errors.lesson.content.file}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Evaluación */}
          <Card>
            <CardContent>
              <div className="container-label-input-update-lesson">
                <label>Pregunta *</label>
                <Textarea
                  value={formDataLesson.evaluation.question}
                  onChange={handleChange("evaluation.question")}
                  className={
                    errors.evaluation?.question ? "input-lesson-error" : ""
                  }
                />
                {errors.evaluation?.question && (
                  <p className="text-error-lesson">
                    {errors.evaluation.question}
                  </p>
                )}
              </div>

              {/* Tipo de Pregunta (select nativo) */}
              <div className="container-label-input-update-lesson">
                <label>Tipo de Pregunta *</label>
                <select
                  value={formDataLesson.evaluation.question_type}
                  onChange={(e) =>
                    handleQuestionTypeChange(e.target.value as any)
                  }
                  className="select-native"
                >
                  <option value="open_question">Abierta</option>
                  <option value="multiple_choice">Cerrada</option>
                </select>
              </div>

              {/* Opciones para Multiple Choice */}
              {formDataLesson.evaluation.question_type ===
                "multiple_choice" && (
                <div className="options-section">
                  <div className="options-header">
                    <label>Opciones</label>
                    <button type="button" onClick={addOption} className="btn-add-option">
                      <Plus />
                    </button>
                  </div>

                  {formDataLesson.evaluation.options?.map((opt, idx) => (
                    <div key={idx} className="option-item">
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                      />
                      <button type="button" onClick={() => removeOption(idx)} className="btn-remove-option">
                        <Trash2 />
                      </button>
                    </div>
                  ))}

                  {errors.evaluation?.options && (
                    <p className="text-error-lesson">
                      {errors.evaluation.options}
                    </p>
                  )}

                  <div className="container-label-input-update-lesson">
                    <label>Respuesta Correcta *</label>
                    <select
                      value={formDataLesson.evaluation.correct_answer}
                      onChange={(e) =>
                        handleChange("evaluation.correct_answer")(e as any)
                      }
                      className="select-native"
                    >
                      <option value="">
                        Selecciona la respuesta correcta
                      </option>
                      {formDataLesson.evaluation.options?.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    {errors.evaluation?.correctAnswer && (
                      <p className="text-error-lesson">
                        {errors.evaluation.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

            <button type="submit" disabled={isSubmitting} className="btn-send-form-lesson">
              {isSubmitting ? "Actualizando..." : "Actualizar Lección"}
            </button>
        </form>
      </div>
    </div>
  );
}
