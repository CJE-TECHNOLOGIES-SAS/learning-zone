import '../sectiones/styles/comments.css'
import image from '../../../../assets/learningZone/comments.png'
export const comments =()=>{
    return (
        <div>
            <h2 className="comments-title">Comentarios</h2>
            <ul className="comments-list">
                <li>Accede a un curso.</li>
                <li>En la parte superior izquierda verás el icono para acceder al apartado de comentarios</li>
                <li>Alli podras ver que personas estan conectadas en el chat en tiempo real</li>
            </ul>
            <br></br>
            <br></br>
            <img src={image} alt="comments" className="comments-photo" />
            <p className="page-number">7</p>
        </div>
    )
}

export default comments;