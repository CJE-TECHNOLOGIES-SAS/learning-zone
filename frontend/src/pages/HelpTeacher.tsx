import { useState } from 'react';
import HelpSlide from './components/helpteacher/HelpSlideTeacher';
import './components/help/styles/Help.css';
import { useNavigate } from 'react-router-dom';

export default function HelpTeacher() {
    const [index, setIndex] = useState(0);
    const navigate = useNavigate()
      // Función que se ejecuta cuando el usuario salta o finaliza la ayuda.
    const handleSkip = () => {
        console.log('Finalizó o saltó la ayuda');
        // Redirige al usuario a la ruta "/redirect".
        navigate('/redirect');
    };
    // Renderizado del componente.
    return (
        <div
            className="help-container"
            style={{
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '100vh',
                position: 'relative'
            }}
        >
            <HelpSlide index={index} setIndex={setIndex} onSkip={handleSkip} />
        </div>
    );
}
