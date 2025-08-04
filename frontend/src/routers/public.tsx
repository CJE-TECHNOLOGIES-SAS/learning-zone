// Componente que contiene solo las rutas publicas

import { Routes, Route } from "react-router-dom";
import PublicLayout from "../shared/Layouts/PublicLayout";
import LandingPage from "../pages/LandingPage";
import LoginAndRegister from "../modules/auth/pages/LoginAndRegister";
import { sharedRoutes} from "./SharedRouters";
import ConfirmEmailRegister from "../modules/auth/pages/ConfirmEmailRegister";
import ConfirmEmailRequest from "../modules/auth/pages/ConfirmEmailRequest";
import RecoverPassword from "../modules/auth/pages/RecoverPassword";
import RoleRedirect from "./RoleRedirect";


export default function RoutersPublic() {
  return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route path="/landing" element={<LandingPage/>}/>
                <Route path="/register" element={<LoginAndRegister opcAuth={false} />}/>
                <Route path="/confirmEmailRegister" element={<ConfirmEmailRegister/>}/>{/* ################## tener en cuenta para backend */}

                <Route path="/emailNewPassword" element={<RecoverPassword viewFormNewPassword={false}/>}/>
                <Route path="/newPassword" element={<RecoverPassword viewFormNewPassword={true}/>}/>
                <Route path="/confirmEmailRequest" element={<ConfirmEmailRequest/>}/>
                <Route path="/login" element={<LoginAndRegister opcAuth ={true}/>}/>
                <Route path="/redirect" element={<RoleRedirect />} />
                {sharedRoutes}


            </Route>
        </Routes>
  )
}
