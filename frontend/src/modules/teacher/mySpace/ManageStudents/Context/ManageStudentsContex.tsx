import { createContext } from "react";
import type { ManageStudentsContextType } from "../ManageStudents";

export const ManageStudentsContext = createContext<ManageStudentsContextType>({} as ManageStudentsContextType);
