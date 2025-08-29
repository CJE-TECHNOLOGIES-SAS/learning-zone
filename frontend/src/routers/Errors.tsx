import { Route } from "react-router-dom";
import InvalidPermission from "../pages/error/InvalidPermission";
import UnauthorizedAccess from "../pages/error/UnauthorizedAccess";
import ServerError from "../pages/error/ServerError";
import WebsiteMaintenance from "../pages/error/WebsiteMaintenance";
import NotFound from "../pages/error/NotFound";

const errorsRouters = [
  <Route key="401" path="/401" element={<InvalidPermission />} />,
  <Route key="403" path="/403" element={<UnauthorizedAccess />} />,
  <Route key="500" path="/500" element={<ServerError />} />,
  <Route key="503" path="/503" element={<WebsiteMaintenance />} />,
  <Route key="404" path="*" element={<NotFound />} /> // 404 catch-all
];

export default errorsRouters;
