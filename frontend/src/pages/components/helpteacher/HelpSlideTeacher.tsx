import '../help/styles/Help.css';
import HelpButtons from './HelpButtonsTeacher';
import Home from '../../../modules/teacher/pages/TeacherHome';
import image1 from '../../assets/Help/logotipopro.png';
import image2 from '../../assets/Help/miespacio.png'
import image3 from '../../assets/Help/crearcurso.png';
import image4 from '../../assets/Help/perfil.png';
import image5 from '../../assets/Help/ayudass.png';
import image6 from '../../assets/Help/footer.png';
import image7 from '../../assets/Help/coursesss.png';

type HelpSlideProps = {
    index: number;// Paso actual en la guía
    setIndex: (i: number) => void; // Función para cambiar el paso
    onSkip: () => void; // Función para saltar toda la guía
};

export default function HelpSlide({ index, setIndex, onSkip }: HelpSlideProps) {
    const helpSteps = [
        {
            text: "LOGO REPRESENTATIVO.",
            image: image1,
        },
        {
            text: "BOTON PARA ACCEDER A MI ESPACIO",
            image: image2,
        },
        {
            text: "BOTONES DE CREAR CURSO Y FILTRADO DE LECCIONES",
            image: image3,
        },
        {
            text: "PERFIL: EDICIÓN DE INFORMACIÓN.",
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
            text: "CURSOS DISPONIBLES DONDE PUEDES INGRESAR Y EDITAR LECCIONES.",
            image: image7,
        },

    ];
      // Obtiene el paso actual según el índice recibido por props.
    const currentStep = helpSteps[index];
      // Renderizado del componente
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
                 {/* Aquí se renderiza la página Home como fondo */}
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
                        {/* Botones de navegación de la ayuda */}
                        <HelpButtons
                            isLast={index === helpSteps.length - 1} // Indica si este es el último paso.
                            onNext={() => setIndex(index + 1)}    // Avanza al siguiente paso.
                            onSkip={onSkip}    // Ejecuta la acción de saltar la guía.
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
