import CoverPage from "./coverPageStudent"; 
import IntroSection from "../sectiones/introSection";
import AccessSection from "../sectiones/accesSection";
import ReadProgress from "../sectiones/readProgress";
import PresentEvaluation from "../sectiones/presentEvaluation";
import ReadCourse from "../sectiones/readCourse";
import SendSuggestion from "../sectiones/sendSuggestion";
import FaqSectionStudent from "../sectiones/faqSectionStudent";
import SupportSectionStudent from "../sectiones/supportSectionStudent";
import NavigationSection from "../sectiones/navegationSection";
import Comments from "../sectiones/comments"; // <-- corregido a mayúscula

const pages = [
  { component: <CoverPage /> },
  { component: <IntroSection /> },
  { component: <AccessSection /> },
  { component: <NavigationSection /> },
  { component: <ReadProgress /> },
  { component: <PresentEvaluation /> },
  { component: <ReadCourse /> },
  { component: <Comments /> }, // <-- corregido
  { component: <SendSuggestion /> },
  { component: <FaqSectionStudent /> },
  { component: <SupportSectionStudent /> },
];

export default pages;
