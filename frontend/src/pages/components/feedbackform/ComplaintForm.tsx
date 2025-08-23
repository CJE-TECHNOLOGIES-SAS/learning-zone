import { useState } from "react";
import "../feedbackform/styles/Complain.css";
import { useUser } from "../../../modules/auth/Hooks/useAuth";

interface UserData {
  sender: string,
  email_sender: string,
  subject:string,
  content_message: string
}
interface ComplaintFormProps {
  onSuccess: () => void;
}

const VITE_API_URL = import.meta.env.VITE_API_URL;

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSuccess }) => {
  const {user} = useUser()
  const [userData, setUserData] = useState<UserData | null>({
    subject: '',
    content_message:'',
    email_sender:user!.email,
    sender:user!.name

  });

  const [loading, setLoading] = useState(false);

/*   useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/user/me");
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error al traer datos del usuario:", error);
      }
    };

    fetchUserData();
  }, []); */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('dato listos para enviar', userData)

    try {
      const response = await fetch(`${VITE_API_URL}/suggestions/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Error al enviar la queja");
      }
      onSuccess(); // avisamos al padre que fue exitoso
    } catch (error) {
      console.error("Error al enviar queja:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="complaint-form">
      <h2>Completar con tus datos</h2>

      <label htmlFor="subject">Asunto</label>
      <input
        type="text"
        id="subject"
        value={userData?.subject || ""}
        onChange={(e)=>setUserData((prev)=>({
          ...prev!,
          subject: e.target.value

        }) )}
      />

{/*       <label htmlFor="correo">Correo electrónico:</label>
      <input
        type="email"
        id="correo"
        value={userData?.email || ""}
        readOnly
        placeholder="Cargando correo..."
      /> */}

      <label htmlFor="comment ">Comentario:</label>
      <textarea
        id="comment"
        rows={5}
        value={userData?.content_message}
        onChange={(e) => setUserData((prev)=>({
          ...prev!,
          content_message:e.target.value
        }))}
        placeholder="Escribe tu queja, sugerencia u observación"
      />

      <button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
};

export default ComplaintForm;
