import iconLz from '../../assets/learningZone/icon-learning-zone.jpg'
import iconIER from '../../assets/juanTamayo/icon-institucion.png'
import { GiTeacher } from "react-icons/gi";
import { PiStudentBold } from "react-icons/pi";
// icons de react icons
import { FaTiktok } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FiGithub } from "react-icons/fi";
//Style
import './Styles/Footer.css'
import { useNavigationHandler } from '../../hooks/useNavigationHandler';
import MyMap from './MyMap';
import { useUser } from '../../modules/auth/Hooks/useAuth';
// navegacion
export default function Footer() {
  const handleBtnNavigate = useNavigationHandler()
  const {user} = useUser()


  return (
    <footer>
        <section className='contenedor-1'>
          <div className="container-nombre">
            <h2>Learning Zone</h2>
            <img src={iconLz} alt="" />
          </div>
          <div className="contendor-ubi">
            <MyMap/>
          </div>

        </section>
        <section className="contenedor-2">
            <div className="contenedor-terminos-condiciones">
              <p>Copyright © 2025 © Cje-Tecnology inc. Todos los derechos reservados</p>
              <div className="container-all-t-p">
                <p onClick={()=>handleBtnNavigate('/sitePolicies')}>Términos y condiciones   |   Políticas y Privacidad</p>
                {user?.email &&
                  <p onClick={()=>
                    handleBtnNavigate('/siteSugerences')}>
                    Inquietudes y Sugerencias
                  </p>
                }



              </div>
            </div>

            <div className="contenedor-institucion">
              <h3> <a href="https://www.facebook.com/photo/?fbid=122096209268225816&set=a.122096209292225816&__tn__=%3C" target='_blank'>I.E.R Juan Tamayo</a></h3>
              <img src={iconIER} alt="" />
            </div>
            <div className='contenedor-manuals'>
              <h2>Manuales</h2>
                <p className='paragraph-manual-student' onClick={()=>handleBtnNavigate('/manualStudent')}><PiStudentBold/></p>
                <p className='paragraph-manual-teacher' onClick={()=>handleBtnNavigate('/manualTeacher')}><GiTeacher/></p>
              </div>
            <div className="contenedor-redes">
              <ul>
                <a className="tikTok">{<FaTiktok className='icon' />}</a>
                <a className="facebook">{<FaFacebookF className='icon' />}</a>
                <a className="instagram">{<FaInstagram className='icon' />}</a>
                <a className="gitHub"  href='https://github.com/edierGuerra/learning-zone' target='_blank'>{<FiGithub className='icon'/>}</a>
              </ul>
            </div>
        </section>
    </footer>
  )
}
