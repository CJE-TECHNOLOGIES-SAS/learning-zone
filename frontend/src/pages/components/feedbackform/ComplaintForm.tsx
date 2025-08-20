import { useState } from "react";

interface ComplaintFormProps {
  onSuccess: () => void;
}

const ComplaintForm = ({ onSuccess }: ComplaintFormProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    comentario: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="complaint-form">
      <h2>Completar con tus datos</h2>

      <label htmlFor="nombre">Nombre completo:</label>
      <input
        type="text"
        id="nombre"
        name="nombre"
        value={formData.nombre}
        onChange={handleChange}
        placeholder="Escribe tu nombre"
        required
      />

      <label htmlFor="correo">Correo electrónico:</label>
      <input
        type="email"
        id="correo"
        name="correo"
        value={formData.correo}
        onChange={handleChange}
        placeholder="Escribe tu correo"
        required
      />

      <label htmlFor="comentario">Comentario:</label>
      <textarea
        id="comentario"
        name="comentario"
        rows={5}
        value={formData.comentario}
        onChange={handleChange}
        placeholder="Escribe tu queja, sugerencia u observación"
        required
      />

      <button type="submit">Enviar</button>
    </form>
  );
};

export default ComplaintForm;
