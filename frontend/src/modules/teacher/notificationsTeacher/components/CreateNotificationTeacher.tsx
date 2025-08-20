import { IoArrowBackCircleSharp } from "react-icons/io5";
import "../styles/CreateNotificationTeacher.css";
import useFormNotificationTeacher from "../hooks/useFormNotificationsTeacher";

type CreateNotificationTeacherProps ={
  onToggleForm: () => void; // Función que no recibe params y no retorna nada

}
export default function CreateNotificationTeacher({ onToggleForm }:CreateNotificationTeacherProps) {
  // Para refrescar el listado al crear

  const {
    title,
    setTitle,
    message,
    setMessage,
    handleSubmitNotification,
    errors,
    isSubmitting,
  } = useFormNotificationTeacher();


  return (
    <div className="container-create-notification">
        <form
        className="container-form-create-notification"
        onSubmit={(e) => handleSubmitNotification(e)}
        >
        {/* Btn de volver atrás */}
        <button
            type="button"
            className="btn-back-create-notification"
            onClick={onToggleForm}
            title="Volver"
        >
            <IoArrowBackCircleSharp />
        </button>

        <h2 className="title-create-notification">Crear notificación</h2>

        {/* Campo: Título */}
        <div className="container-label-input-n">
            <input
            type="text"
            id="title"
            value={title}
            className={title ? "has-content" : ""}
            onChange={(e) => setTitle(e.target.value)}
            />
            <label htmlFor="title">Título</label>
            {errors.title && <span className="error">{errors.title}</span>}
        </div>

        {/* Campo: Mensaje */}
        <div className="container-label-input-n">
            <textarea
            id="message"
            value={message}
            className={message ? "has-content" : ""}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            />
            <label htmlFor="message">Mensaje</label>
            {errors.message && <span className="error">{errors.message}</span>}
        </div>

        <input
            className="btn-create-notification"
            type="submit"
            value={isSubmitting ? "Enviando..." : "Enviar notificación"}
            disabled={isSubmitting}
        />
        </form>

    </div>
  );
}
