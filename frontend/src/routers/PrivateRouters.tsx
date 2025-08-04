// Componente que verifica si esta logueado, en caso de que lo este renderizar el componente, en caso contrario devolver al landing

import { Navigate, Outlet,  } from "react-router-dom"
import { useUser } from "../modules/auth/Hooks/useAuth"
export default function PrivateRouters() {
    // Variable del context que me dice si se encuentra logueado o no
    const {isLoggedIn} = useUser()
    // EN caso de que este logueado renderizar Outlet, en caso de que no renderizar a landing
    return isLoggedIn ? <Outlet/>: <Navigate to='/landing' replace />
}
