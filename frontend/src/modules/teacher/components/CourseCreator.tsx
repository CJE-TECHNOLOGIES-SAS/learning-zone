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
import "../styles/CourseCreator.css";
import { useFormCreateCourse } from "../hooks/Courses/useFormCreateCourse";
import { COURSE_CATEGORY_LABELS } from "../../../shared/constant/CategoriesCourses";
import { educationalPalettes, type TPaletteNames } from "../../../shared/theme/ColorPalettesCourses";
import { useState } from "react";
import Particles from "./particles/particles";

export default function CourseCreator() {
  const {
    formData,
    errors,
    submitSuccess,
    isSubmitting,
    handleInputChange,
    handleImageChange,
    handlePaletteChange,
    handleSubmit
  } = useFormCreateCourse();

  const [viewpalettes, setViewpalettes] = useState(false);

  return (
    <div className="container-form-course-teacher">
              {/* Fondo de partículas dentro del contenedor del formulario */}
              <Particles/>

      <div className="envoltura-form-teacher">

        <div className="header-form-course-teacher">
          <h1 className="title-create-course">Crear Curso</h1>
          <p className="paragraph-create-course">
            Completa la información del nuevo curso.
          </p>
        </div>

        {submitSuccess && (
          <Alert>
            <AlertDescription>¡Curso creado exitosamente!</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="form-course-teacher">
          <Card>
            {/* Nombre */}
            <div className="container-label-input-create-course">
              <Label>Nombre del Curso *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "input-course-error" : ""}
              />
              {errors.name && (
                <p className="text-error-course">{errors.name}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="container-label-input-create-course">
              <Label>Descripción *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className={errors.description ? "input-course-error" : ""}
              />
              {errors.description && (
                <p className="text-error-course">{errors.description}</p>
              )}
            </div>

            {/* Categoría */}
            <div className="container-label-input-create-course">
              <Label>Categoría *</Label>
            <select
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={errors.category ? "input-course-error" : ""}
              >
                {Object.entries(COURSE_CATEGORY_LABELS).map(([key, { label, color }]) => (
                  <option key={key} value={key} style={{ color }}>
                    {label}
                  </option>
                ))}
            </select>

              {errors.category && <p className="text-error-course">{errors.category}</p>}
            </div>

            {/* Paleta de colores */}
            <div className="container-label-input-create-course">
              <Label>Paleta de Colores *</Label>

              <div className="container-prev-btn-view">
                <button className="btn-view-palette" onClick={()=>setViewpalettes(!viewpalettes)}>Ver paletas</button>
                <div className="preview-palette-course">
                  <span style={{ backgroundColor: formData.paletteColors.brand }}></span>
                  <span style={{ backgroundColor: formData.paletteColors.surface }}></span>
                  <span style={{ backgroundColor: formData.paletteColors.text }}></span>
                  <span style={{ backgroundColor: formData.paletteColors.accent }}></span>
                </div>
              </div>
              {viewpalettes &&
              <div className="select-palette-options-course">
                {Object.entries(educationalPalettes).map(([name, colors]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handlePaletteChange(name as TPaletteNames)}
                    className={`palette-option-button ${
                      formData.palette === name ? "palette-selected" : ""
                    }`}
                  >
                    <span style={{ backgroundColor: colors.brand }}></span>
                    <span style={{ backgroundColor: colors.surface }}></span>
                    <span style={{ backgroundColor: colors.text }}></span>
                    <span style={{ backgroundColor: colors.accent }}></span>
                  </button>
                ))}
              </div>

              }
            </div>

            {/* Imagen */}
            <div className="container-label-input-create-course">
              <Label>Imagen del Curso *</Label>
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
              className="btn-send-form-course-teacher"
            >
              {isSubmitting ? "Creando..." : "Crear Curso"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
