import AboutInstitucionAndCje from "./components/landing/AboutInstitucionAndCje";
import Carrusel from "./components/landing/Carrusel";
import Features from "./components/landing/Features";
import StepsToRegister from "./components/landing/StepsToRegister";
import "./styles/Landing.css";

export default function LandingPage() {

/*   const handleBtnNavigate = useNavigationHandler()
  const {isLoggedIn} = useUser()
 */
/*     useEffect(() => {
    if (isLoggedIn) {
      handleBtnNavigate('/home')
    }
  }, [handleBtnNavigate, isLoggedIn]); */

  return (
    <div className="container-landing">
      <Carrusel/>
      <Features />
      <StepsToRegister />
      <AboutInstitucionAndCje/>
    </div>
  )
}
