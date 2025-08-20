// SharedRouters.tsx

import { Route } from "react-router-dom";
import InstitutionPage from "../pages/about/Institution";
import { AboutUs } from "../pages/about/TeamInfo";
import { SitePolicies } from "../pages/info/SitePolicies";
import ComplaintPage from "../pages/feedbackform/ComplaintPage";
import errorsRouters from "./Errors";
import ManualBookStudent from "../pages/manuals/studentManual/components/manualBookStudent";
import ManualBookTeacher from "../pages/manuals/teacherManual/components/manualBook";

export const sharedRoutes = [
  <Route key="aboutInstitution" path="/aboutInstitution" element={<InstitutionPage />} />,
  <Route key="aboutUs" path="/aboutUs" element={<AboutUs />} />,
  <Route key="sitePolicies" path="/sitePolicies" element={<SitePolicies />} />,
  <Route key="siteSugerences" path="/siteSugerences" element={<ComplaintPage />} />,
  <Route key="manualStudent" path="/manualStudent" element={<ManualBookStudent />} />,
  <Route key="manualTeacher" path="/manualTeacher" element={<ManualBookTeacher />} />,
  ...errorsRouters


];
