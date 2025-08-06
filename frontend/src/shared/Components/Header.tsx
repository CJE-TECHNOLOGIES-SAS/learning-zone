import Navbar from "./Navbar";

import './styles/Header.css'
import { useNavigationHandler } from "../../hooks/useNavigationHandler";
import AuthNavbar from "./AuthNavbar";
// Componente que renderiza el header comun
type THeaderProps ={
  isPublic:boolean
}
export default function Header({isPublic}:THeaderProps) {
  const handleBtnNavigate = useNavigationHandler()
  return (
    <header className="header">
      <h1  onClick={()=>handleBtnNavigate('/')} className="name-app">Learning <span className="word-zone">Zone</span></h1>
      {/* Condicion si esta autenticado mostrar AuthNavbar o Navbar comun */}
      {isPublic?  <Navbar/>: <AuthNavbar/>}

    </header>
  )
}
