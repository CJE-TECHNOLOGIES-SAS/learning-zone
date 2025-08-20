import { useNavigate } from "react-router-dom";

export type AppRoutes =
  | '/landing'
  | "/"
  | "/register"
  | "/login"
  | "/emailNewPassword"
  | "/newPassword"
  | "/home"
  | "/userPage"
  | "/back"
  | "/sitePolicies"
  | "/siteSugerences"
  | "/aboutUs"
  | "/aboutInstitution"
  | "/contentPage"
  | "/evaluationPage"
  | "/help"
  | "/manualStudent"
  | "/manualTeacher"
  ;

export const useNavigationHandler = () => {
  const navigate = useNavigate();

  const handleBtnNavigate = (route: AppRoutes | string ) => {
    if (route === "/back") {
      if (window.history.length > 2) {
        navigate(-1); // Ir una página atrás
      } else {
        navigate("/", { replace: true });
      }
    } else {
      navigate(route);
    }
  };

  return handleBtnNavigate;
};
