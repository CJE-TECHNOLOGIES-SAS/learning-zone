import "./styles/RightPanel.css";

type RightPanelProps = {
  onClose?: () => void;
};

export default function RightPanel({ onClose }: RightPanelProps) {
  return (
    <div className="panel-content-right">
      {/* ❌ Botón de cierre */}
      {onClose && (
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      )}

      <h2 className="panel-title">Misión</h2>
      <p className="panel-description">
        Brindar acceso a herramientas educativas digitales de calidad para estudiantes de zona rural, fortaleciendo sus competencias 
        tecnológicas y promoviendo una educación inclusiva, económica y transformadora.
      </p>

      <h2 className="panel-title">Visión</h2>
      <p className="panel-description">
        Ser un aplicativo líder en educación digital rural, reconocida por mejorar las oportunidades 
        académicas y laborales de los jóvenes mediante el uso de tecnología innovadora y accesible.
      </p>


      <div className="panel-section">
        <h3>Habilidades:</h3>
        <ul className="panel-list">
          <li>Diseño UI/UX</li>
          <li>Gestión de proyectos</li>
          <li>Autenticación y control</li>
          <li>Accesibilidad web</li>
        </ul>
      </div>
    </div>
  );
}
