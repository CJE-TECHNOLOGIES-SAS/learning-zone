import '../sectiones/styles/accesSection.css'
import image from '../../../../assets/learningZone/loguin.png'

const accessSection = () => (
    <div className="acces-section-container">
        <section>
            <h2 className="acces-section-title"> Acceso a la plataforma</h2>
            <ul className="acces-section-list">
                <li>Dirígete al sitio web oficial de Learning Zone.</li>
                <li>Haz clic en “Iniciar sesión” o “Registrarse”.</li>
                <li>Si no tienes cuenta ingresa tu documento de identidad en el formulario</li>
                <li>Completa el formulario de registro con tu nombre, apellido, correo electrónico y contraseña.</li>
                <li>Seguidamente te llegará un mensaje con un botón de confirmación al correo para validar tu usuario que te va a redirigir al home principal</li>
                <li>Si ya tienes cuenta, simplemente inicia sesión con tus datos.</li>
            </ul>
            <img src={image} alt="Logo de Learning Zone" className="accesplatform-section" />

            <p className="page-number">2</p>


        </section>
    </div>
);

export default accessSection;