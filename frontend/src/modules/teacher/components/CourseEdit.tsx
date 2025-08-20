/* Componente que renderiza el formulario para editar el curso */
// -----------------------------------------
// Vista: Actualizar un curso existente
// -----------------------------------------
// --------- ICONOS ---------
import { BookOpen } from "lucide-react"; // Icono visual para la tarjeta de "datos del curso"

// --------- COMPONENTES UI ---------
// Importamos todos los componentes reutilizables del sistema de diseño personalizado
import {
  Button,            // Botón para enviar formulario
  Input,             // Campo de entrada de texto
  Card,              // Contenedor visual tipo tarjeta
  CardContent,       // Contenido interno de la tarjeta
  CardHeader,        // Encabezado de la tarjeta
  CardTitle,         // Título visual de la tarjeta
  Textarea,          // Área de texto para descripciones largas
  Label,             // Etiqueta asociada a campos de entrada
  Alert,             // Componente visual para mostrar éxito/error
  AlertDescription   // Descripción dentro de la alerta
} from "../../../shared/Components/ui/index"; // Ruta abreviada para usar alias de import
import { COURSE_CATEGORY_LABELS } from "../../../shared/constant/CategoriesCourses";
import { useFormUpdateCourse } from "../hooks/Courses/useFormUpdateCourse";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useNavigationHandler } from "../../../hooks/useNavigationHandler";
import '../styles/CourseEdit.css'
// --------- LÓGICA ---------

// --------- COMPONENTE PRINCIPAL ---------
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
  console.log(formData)
  const handleBtnNavigate = useNavigationHandler();



  return (
    <div className="container-form-course-teacher">
      <div className="envoltura-form-teacher">
        <div className="header-form-course-teacher">
          <h1 className="title-update-course">Actualizar Curso</h1>
          <p className="paragraph-update-course">
            Edita la información del curso.
          </p>
        </div>

        {submitSuccess && (
          <Alert>
            <AlertDescription>
              ¡Curso actualizado exitosamente!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="form-course-teacher">
          {/* Botón de regreso */}
            <button
              className="btn-back-edit-course"
              style={{
                color: formData.paletteColors.accent,
              }}
              onClick={() => handleBtnNavigate('/back')}
            >
              <IoArrowBackCircleSharp />
            </button>
          <Card>
            <CardHeader>
              <CardTitle>
                <BookOpen /> Datos del Curso
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div>
                <Label>Nombre del Curso *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name && "input-course-error"}
                />
                {errors.name && (
                  <p className="text-error-course">{errors.name}</p>
                )}
              </div>

              <div>
                <Label>Descripción *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={errors.description && "input-course-error"}
                />
                {errors.description && (
                  <p className="text-error-course">{errors.description}</p>
                )}
              </div>

              <div>
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


              <div>
                <Label>Paleta de Colores</Label>
                <div>
                  <p>Nombre: {formData.palette}</p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <span
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: formData.paletteColors.brand,
                      }}
                    ></span>
                    <span
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: formData.paletteColors.surface,
                      }}
                    ></span>
                    <span
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: formData.paletteColors.text,
                      }}
                    ></span>
                    <span
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: formData.paletteColors.accent,
                      }}
                    ></span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Actualizar Imagen (opcional)</Label>
                <img style={{ width: "100px", height: "100px" }} src={`${formData.image}`} alt="" />
                <Input
                  type="file"
                  onChange={(e) =>
                    handleImageChange(e.target.files?.[0] ?? null)
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="btn-send-form-teacher">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Actualizando..." : "Actualizar Curso"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
