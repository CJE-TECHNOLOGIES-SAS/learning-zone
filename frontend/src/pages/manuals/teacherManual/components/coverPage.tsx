import '../components/styles/coverPage.css';
import image from '../../../../assets/learningZone/logotipopro.png';

const CoverPage = () => {
  return (
    <div className="cover-page">
      <img src={image} alt="Logo de Learning Zone" className="cover-logo" />
      <h1 className="cover-page-title">Manual de Usuario</h1>
      <p className="paragraph-cover-page">
        Bienvenido a la guía del docente y administrador. Usa los botones de teclado para avanzar o presiona sobre el manual.
      </p>
    </div>
  );
};

export default CoverPage;

