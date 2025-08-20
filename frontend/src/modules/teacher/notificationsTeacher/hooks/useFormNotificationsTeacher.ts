import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { createNotificationAPI } from "../services/CreateNotificationTeacher.server";

type TNotificationForm = { title: string; message: string };
type FormErrors = Partial<Record<keyof TNotificationForm, string>>;


export default function useFormNotificationTeacher() {
  const [title, setTitle] = useState<TNotificationForm["title"]>("");
  const [message, setMessage] = useState<TNotificationForm["message"]>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);


  const ERROR_MESSAGES = {
    required: (f: string) => `El ${f} es obligatorio.`,
    minLength: (f: string, n: number) => `El ${f} debe tener al menos ${n} caracteres.`,
    maxLength: (f: string, n: number) => `El ${f} no debe superar ${n} caracteres.`,
  };

  const isRequired = (v: string) => v.trim().length > 0;
  const hasMin = (v: string, n: number) => v.trim().length >= n;
  const hasMax = (v: string, n: number) => v.trim().length <= n;

  const validateForm = (form: TNotificationForm): FormErrors => {
    const e: FormErrors = {};
    if (!isRequired(form.title)) e.title = ERROR_MESSAGES.required("título");
    else if (!hasMin(form.title, 3)) e.title = ERROR_MESSAGES.minLength("título", 3);
    else if (!hasMax(form.title, 80)) e.title = ERROR_MESSAGES.maxLength("título", 80);

    if (!isRequired(form.message)) e.message = ERROR_MESSAGES.required("mensaje");
    else if (!hasMin(form.message, 5)) e.message = ERROR_MESSAGES.minLength("mensaje", 5);
    else if (!hasMax(form.message, 500)) e.message = ERROR_MESSAGES.maxLength("mensaje", 500);

    return e;
  };

  const handleSubmitNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData: TNotificationForm = { title, message };
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Confirmación SweetAlert2
    const result = await Swal.fire({
      title: "¿Enviar notificación?",
      html: `
        <div style="text-align:left">
          <p><strong>Título:</strong> ${title}</p>
          <p style="white-space:pre-wrap"><strong>Mensaje:</strong><br/>${message}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, enviar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      focusCancel: true,
      background:'#c5d4de',
      backdrop:`rgba(0,0,0,0.4)`,
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const resp = await createNotificationAPI({ title, message });
      console.log(resp)
      if (resp.notification_id) {
        toast.success(resp.message ?? "Notificación enviada");
        setTitle("");
        setMessage("");
        return
    } else {
        toast.error(resp?.message ?? "No se pudo crear la notificación.");
    }

    } catch {
      toast.error("Error al crear la notificación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title, setTitle,
    message, setMessage,
    errors,
    isSubmitting,
    handleSubmitNotification,
  };
}
