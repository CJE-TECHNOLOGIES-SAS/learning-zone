import '../sectiones/styles/sendSuggestion.css'
import image from '../../../../assets/learningZone/sugerencias.png'
export const sendSuggestion =()=>{
    return (
        <div>
            <h2 className="suggestion-title">Enviar quejas o sugerencias</h2>
            <ul className="suggestion-list">
                <li>Accede a “Quejas y sugerencias”.</li>
                <li>Llena el formulario con tu comentario.</li>
                <li>La plataforma lo enviará al equipo administrativo.</li>
            </ul>
            <img src={image} alt="suggestion" className="suggestion-photo" />

            <p className="page-number">7</p>

        </div>
    )
}

export default sendSuggestion;