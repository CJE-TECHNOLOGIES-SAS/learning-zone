import { useState } from 'react';
import HelpSlide from './components/help/HelpSlide';
import './components/help/styles/Help.css';
import { useNavigate } from 'react-router-dom';

export default function Help() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate()

  const handleSkip = () => {
    // console.log('Finalizó o saltó la ayuda');
    navigate('/redirect');
  };

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
