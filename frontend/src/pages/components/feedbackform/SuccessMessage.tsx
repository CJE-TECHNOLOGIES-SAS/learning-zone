import "./styles/Complain.css";
import './styles/SuccesMessage.css'
import { useNavigationHandler } from "../../../hooks/useNavigationHandler";
import { TbXboxX } from 'react-icons/tb';

interface Props {
  onReset: () => void;
}

const SuccessMessage: React.FC<Props> = ({ onReset }) => {
    const handleBtnNavigate = useNavigationHandler()

  return (
    <div className="success-message-sugerence">
      <button className="btn-back-message-sugerence" onClick={()=>handleBtnNavigate('/back')}>{<TbXboxX/>}</button>

      <h2>¡Gracias por tu mensaje!</h2>
      <p>Tu queja ha sido registrada correctamente.</p>
      <button onClick={onReset} className="btn-send-other-sugerence">Enviar otra</button>
    </div>
  );
};

export default SuccessMessage;
