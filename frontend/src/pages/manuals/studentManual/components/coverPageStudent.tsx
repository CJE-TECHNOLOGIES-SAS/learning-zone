import '../components/styles/coverPageStudent.css';
import image from '../../../../assets/learningZone/logotipopro.png';

const CoverPage = () => {
  return (
    <div className="cover-page">
      <div className="logo"> 
      <img src={image} alt="Logo de Learning Zone" className="cover-logo" />
      <h1 className="cover-page-title">Manual de Usuario</h1>
      <p className="paragraph-cover-page">
        Bienvenido a la guía de estudiante. Usa los botones de teclado para avanzar o presiona sobre el manual.
      </p>
      </div>
    </div>
  );
};

export default CoverPage;

