import img1 from '../../../assets/juanTamayo/institucion1.jpg'
import img2 from '../../../assets/juanTamayo/institucion2.jpg';
import img3 from '../../../assets/juanTamayo/institucion3.jpg';
import img4 from '../../../assets/juanTamayo/institucion4.jpg';
import logo from '../../../assets/juanTamayo/icon-institucion.png'
import { FaWhatsapp } from "react-icons/fa";
import { CiFacebook } from "react-icons/ci";
import { FaInstagram } from "react-icons/fa";
import Boton from '../institution/Boton'
import '../../about/styles/Institution.css'
import { IoArrowBackCircleSharp } from 'react-icons/io5';
import { useNavigationHandler } from '../../../hooks/useNavigationHandler';


type SlideProps = {
  index: number;
  setIndex: (newIndex: number) => void; 
};

export default function InstitutionSlide({ index, setIndex }: SlideProps) {
  const handleBtnNavigate =useNavigationHandler()

  const staticBackgroundImages = [img2, img3, img1, img4]; 

  const content = [
    {
      title: (
        <>
          Institución Educativa <br />
          Rural Juan Tamayo
        </>
      ),

      images: [img1, img2, img3, img4], 
    },
    {
      title: "",
      text: "Lormnis maxime nam amet qui odit sint adipisci consequuntur dolorum quo, sunt soluta excepturi doloribus deleniti, natus distinctio!",
      images: [img2, img4, img1, img3],
    },

    {
      title: "Redes Sociales",
      text: (
        <>
        <br></br>
          <div className="social-links">
            <ul className="redes">
            <li><CiFacebook className="red-social-facebook" /> Facebook</li>
            <li><FaWhatsapp className="red-social-whatssap"/> WhatsApp</li>
            <li><FaInstagram className="red-social-instagram"/> Instagram</li>
            </ul>
          </div>
          <br></br>
          <ul className="numero">
          <li>+57 3105245784</li>
          <li>+57 3105245784</li>
          </ul>
        </>
      ),
      images: [img4, img3, img2, img1],
    },
  ];

  const { title, text } = content[index]; 

  return (
    <div className="slide">
      <button className="btn-back-confirm" onClick={()=>handleBtnNavigate('/back')}>{<IoArrowBackCircleSharp/>}</button>

        
      <div className="slide-images">
        
        {staticBackgroundImages.map((img, i) => ( 
          <img key={i} src={img} alt={`Imagen ${i + 1}`} className="slide-img" />
        ))}
      </div>
      <div className="slide-overlay">
        <img src={logo} alt="Logo Institución" className="logo-institucion" />
        <h2 className="slide-title">{title}</h2>
        <p className="slide-text">{text}</p>

        <div className="dots">
          {[0, 1, 2].map((i) => ( 
            <Boton
              key={i}
              isActive={index === i}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}