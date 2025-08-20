import CoverPage from "./coverPage"; 
import IntroSection from "../sections/introSection";
import AccessSection from "../sections/accessSection";
import { StudentProgress } from "../sections/progress";
import { EvaluationsManagement } from "../sections/evaluationsManagement";
import { CoursesManagement } from "../sections/coursesManagement";
import { ComplaintsSection } from "../sections/complaintsSection";
import FaqSection from "../sections/faqSection";
import SupportSection from "../sections/supportSection";
import NavigationSection from "../sections/navigationSection";
import Lessons from "../sections/lessons";

const pages = [
  { component: <CoverPage /> },
  { component: <IntroSection /> },
  { component: <AccessSection /> },
  { component: <NavigationSection /> },
  { component: <StudentProgress /> },
  { component: <EvaluationsManagement /> },
  { component: <Lessons /> },
  { component: <CoursesManagement /> },
  { component: <ComplaintsSection /> },
  { component: <FaqSection /> },
  { component: <SupportSection /> },
];

export default pages;
