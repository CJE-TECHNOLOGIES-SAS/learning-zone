"use client";
import {
  Button,
  Input,
  Card,
  Textarea,
  Label,
  Alert,
  AlertDescription
} from "../../../shared/Components/ui/index";
import "../styles/CourseEdit.css"; // Nuevo CSS con "update" en los nombres de clase
import { COURSE_CATEGORY_LABELS } from "../../../shared/constant/CategoriesCourses";
import { useFormUpdateCourse } from "../hooks/Courses/useFormUpdateCourse";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigationHandler } from "../../../hooks/useNavigationHandler";
import Particles from "./particles/particles";

export default function CourseEdit() {
  const {
    formData,
    errors,
    submitSuccess,
    isSubmitting,
    handleInputChange,
    handleImageChange,
    handleSubmit
  } = useFormUpdateCourse();

  const handleBtnNavigate = useNavigationHandler();

  return (
    <div className="container-form-teacher-course">
      {/* Fondo de partículas como en create */}
      <Particles/>

      <div className="envoltura-form-teacher-course">

        <div className="header-form-teacher-course">
          <h1 className="title-update-course">Actualizar Curso</h1>
          <p className="paragraph-update-course">
            Edita la información del curso.
          </p>
        </div>

        {submitSuccess && (
          <Alert>
            <AlertDescription>¡Curso actualizado exitosamente!</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="form-teacher-course-update">

          {/* Botón de regreso */}
          <button
            type="button"
            className="btn-back-update-course"
            onClick={() => handleBtnNavigate('/back')}
          >
            <IoArrowBackCircleSharp />
          </button>

          <Card>
            {/* Nombre */}
            <div className="container-label-input-update-course">
              <Label>Nombre del Curso *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "input-course-error" : ""}
              />
              {errors.name && (
                <p className="text-error-course-update">{errors.name}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="container-label-input-update-course">
              <Label>Descripción *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className={errors.description ? "input-course-error" : ""}
              />
              {errors.description && (
                <p className="text-error-course-update">{errors.description}</p>
              )}
            </div>

            {/* Categoría (solo lectura) */}
            <div className="container-label-input-update-course">
              <Label>Categoría</Label>
              <Input
                value={COURSE_CATEGORY_LABELS[formData.category]?.label ?? '—'}
                readOnly
                style={{
                  color: COURSE_CATEGORY_LABELS[formData.category]?.color ?? '#000',
                  fontWeight: 'bold',
                  backgroundColor: '#f9f9f9',
                  cursor: 'not-allowed',
                }}
              />
            </div>

            {/* Paleta de colores (solo visualización) */}
            <div className="container-label-input-update-course">
              <Label>Paleta de Colores</Label>
              <div className="preview-palette-course-update">
                <span style={{ backgroundColor: formData.paletteColors.brand }}></span>
                <span style={{ backgroundColor: formData.paletteColors.surface }}></span>
                <span style={{ backgroundColor: formData.paletteColors.text }}></span>
                <span style={{ backgroundColor: formData.paletteColors.accent }}></span>
              </div>
            </div>

            {/* Imagen */}
            <div className="container-label-input-update-course">
              <Label>Actualizar Imagen (opcional)</Label>
              <Input
                type="file"
                onChange={(e) =>
                  handleImageChange(e.target.files?.[0] ?? null)
                }
              />
            </div>
          </Card>

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-send-form-course-teacher-update"
            >
              {isSubmitting ? "Actualizando..." : "Actualizar Curso"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
