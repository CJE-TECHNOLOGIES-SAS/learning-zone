import Header from "../Components/Header";
import Footer from "../Components/Footer";
import './styles/PublicLayout.css'
/* import SplashCursor from "../animations/SplashCursor"; */
import { Outlet } from "react-router-dom";
import CardCookies from "../animations/CardCookies";
import { authStorage } from "../Utils/authStorage";


export default function PublicLayout() {
    const cookieConsentGiven = authStorage.getCookieConsentGiven();

  return (
    <div className="public-layout">
      <Header isPublic ={true}/>
      {cookieConsentGiven? <></>:<CardCookies/>}

        <Outlet/>

      <Footer/>

    </div>
  )
}
