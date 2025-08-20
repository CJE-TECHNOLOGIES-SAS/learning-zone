"use client";

import {
  Plus,
  Trash2
} from "lucide-react";

import {
  Button,
  Input,
  Card,
  CardContent,
  Textarea,
  Label,
  Alert,
  AlertDescription,
} from "../../../shared/Components/ui/index";



import { useEffect } from "react";
import { authStorage } from "../../../shared/Utils/authStorage";
import { useFormCreateLessons } from "../hooks/useFormCreateLessons";
import "../styles/LessonCreator.css"; // 🔹 tu nuevo CSS adaptado

export default function LessonCreate() {
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
  } = useFormCreateLessons();

  useEffect(() => {
    const data = authStorage.getFormLessonInfo();
    if (data) {
      setFormDataLesson(data);
    }
  }, [setFormDataLesson]);

  return (
    <div className="container-form-lesson-teacher">
      <div className="envoltura-form-lesson">
        <div className="header-form-lesson-teacher">
          <h1 className="title-create-lesson">Crear Lección</h1>
          <p className="paragraph-create-lesson">
            Completa la información de la nueva lección y su evaluación.
          </p>
        </div>

        {submitSuccess && (
          <Alert>
            <AlertDescription>¡Lección creada exitosamente!</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="form-lesson-teacher">
          <Card>
            <CardContent>
              {/* Nombre */}
              <div className="container-label-input-create-lesson">
                <Label>Nombre de la Lección *</Label>
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
              <div className="container-label-input-create-lesson">
                <Label>Texto Complementario</Label>
                <Textarea
                  value={formDataLesson.lesson.content.text}
                  onChange={handleChange("lesson.content.text")}
                />
              </div>

              {/* Tipo de Contenido */}
              <div className="container-label-input-create-lesson">
                <Label>Tipo de Contenido *</Label>
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
              <div className="container-label-input-create-lesson">
                <Label>Contenido *</Label>
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
              <div className="container-label-input-create-lesson">
                <Label>Pregunta *</Label>
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
              {/* Tipo de Pregunta */}
              <div className="container-label-input-create-lesson">
                <Label>Tipo de Pregunta *</Label>
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
                    <Label>Opciones</Label>
                    <Button type="button" onClick={addOption}>
                      <Plus /> Agregar
                    </Button>
                  </div>

                  {formDataLesson.evaluation.options?.map((opt, idx) => (
                    <div key={idx} className="option-item">
                      <Input
                        value={opt}
                        onChange={(e) => updateOption(idx, e.target.value)}
                      />
                      <Button type="button" onClick={() => removeOption(idx)}>
                        <Trash2 />
                      </Button>
                    </div>
                  ))}

                  {errors.evaluation?.options && (
                    <p className="text-error-lesson">
                      {errors.evaluation.options}
                    </p>
                  )}

                <div className="container-label-input-create-lesson">
                  <Label>Respuesta Correcta *</Label>
                  <select
                    value={formDataLesson.evaluation.correct_answer}
                    onChange={(e) => handleChange("evaluation.correct_answer")(e)}
                    className="select-native"
                  >
                    <option value="">Selecciona la respuesta correcta</option>
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

          <div className="btn-send-form-lesson">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Lección"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
