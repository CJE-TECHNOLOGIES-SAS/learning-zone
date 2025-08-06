import './styles/Help.css';
import HelpButtons from './HelpButtons';
import Home from '../../../modules/dashboard/pages/Home';
import image1 from '../../assets/Help/logotipopro.png';
import image2 from '../../assets/Help/cursoss.png';
import image3 from '../../assets/Help/Notificaciones.png';
import image4 from '../../assets/Help/perfil.png';
import image5 from '../../assets/Help/ayudass.png';
import image6 from '../../assets/Help/footer.png';
import image7 from '../../assets/Help/cursos2.png';

type HelpSlideProps = {
  index: number;
  setIndex: (i: number) => void;
  onSkip: () => void;
};

export default function HelpSlide({ index, setIndex, onSkip }: HelpSlideProps) {
  const helpSteps = [
    {
      text: "LOGO REPRESENTATIVO.",
      image: image1,
    },
    {
      text: "APARTADO DE CATEGORÍA EN DONDE ESTÁN LOS CURSOS...",
      image: image2,
    },
    {
      text: "APARTADO DE NOTIFICACIONES: INFORMACIÓN IMPORTANTE.",
      image: image3,
    },
    {
      text: "PERFIL: PROGRESO DEL USUARIO Y EDICIÓN DE INFORMACIÓN.",
      image: image4,
    },
    {
      text: "ÍCONO DE AYUDAS.",
      image: image5,
    },
    {
      text: "FOOTER.",
      image: image6,
    },
    {
      text: "WORD, EXCEL Y POWER POINT SON CURSOS Y ESTARÁN COMPUESTOS POR LECCIONES.",
      image: image7,
    },
  ];

  const currentStep = helpSteps[index];

  return (
    <div style={{ position: 'relative', width: '100%', height: '112vh' }}>
      {/* Fondo borroso */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: 0,
          overflow: 'hidden',
          filter: 'blur(1.5px)',
          pointerEvents: 'none',
        }}
      >
        <Home />
      </div>

      {/* Ayuda */}
      <div className="help-slide" >
        <div className="help-overlay">
          <div className="help-box">
            <p className="help-text">{currentStep.text}</p>

            {currentStep.image && (
              <img
                src={currentStep.image}
                alt="Imagen explicativa"
                className="help-image"

              />
            )}
            <br></br>
            
            <HelpButtons
              isLast={index === helpSteps.length - 1}
              onNext={() => setIndex(index + 1)}
              onSkip={onSkip}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
