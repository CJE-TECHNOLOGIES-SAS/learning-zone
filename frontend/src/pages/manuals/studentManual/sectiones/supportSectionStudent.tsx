import '../sectiones/styles/supportSectionStudent.css'
import image from '../../../../assets/cjeTect/myteam.jpg'
export const supportSectionStudent =()=>{
    return(
        <div>
            <h2 className="support-section-title">Soporte técnico</h2>
            <p className="email"><strong>Correo:</strong> <a href="mailto:cjetechnologies.tech@gmail.com">cjetechnologies.tech@gmail.com</a></p>
            <p className="support-hour"><strong>Horario de atención:</strong> Lunes a viernes, 8:00 a.m. - 4:00 p.m.</p>
            <br></br>
            <img src={image} alt="myteam" className="myteam-photo" />
            
            <p className="page-number">9</p>


        </div>
        
    )
}

export default supportSectionStudent;