import { Outlet } from "react-router-dom";
import Header from "../Components/Header";
/* import SplashCursor from "../animations/SplashCursor"; */
import './styles/PrivateLayout.css'
import Footer from "../Components/Footer";
import useNotifications from "../../modules/notifications/hooks/useNotifications";

export default function AuthLayout() {
  useNotifications(); /* Uso del hook de notifications para que siempre se ejecute mientras este logueado */
  return (
    <div className="private-layout">
      <Header isPublic ={false}/>
       <Outlet/>

      <Footer/>

    </div>
  )
}
