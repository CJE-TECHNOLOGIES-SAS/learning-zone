import { useContext } from "react";
import { ManageStudentsContext } from "../Context/ManageStudentsContex";
import type { ManageStudentsContextType } from "../ManageStudents";


export const useManageStudents = (): ManageStudentsContextType => {
  const context = useContext(ManageStudentsContext);
  if (!context) {
    throw new Error("ManageStudents no está disponible");
  }
  return context;
};
