/* Tipado del manageStudents */
// types/ManageStudents.ts

import type { TCourse } from "../../../courses/types/CourseStudent";

/* Types course */
export type TCourseFilter ={
  id:TCourse['id'],
  name:TCourse['name'],
  image:TCourse['image']
}
export type TCoursesFilter = TCourseFilter[]
/* ==== STUDENT - Response del backend ==== */
export type TStudentRegisterResponse = {
  id:number
  number_identification: number;
  status: boolean | null;
  name:string,
/*   email:string, */
  score:number,
  course: string,
  color?:boolean
};


/* ==== STUDENT - Envío al backend ==== */
export type TStudentRegisterSend = {
  number_identification: number;
  status: boolean | null;
};

/* ==== Colección de estudiantes ==== */
export type TStudentsRegisters = TStudentRegisterResponse[];

export type ManageStudentsContextType = {
  infoRegisterStudents: TStudentsRegisters;
  refreshInfoStudentRegister: () => Promise<void>;
  loadInfoStudentsRegister: () => Promise<void>;
  loadInfoStudentRegister: (id: TStudentRegisterResponse["id"]) => Promise<void>;

  registerStudent: (n_identification: TStudentRegisterResponse["number_identification"]) => Promise<void>;
  registerStudentsFile: (file: File) => Promise<void>;

  updateStudentRegister: (id: number, new_number_identification: TStudentRegisterResponse["number_identification"]) => Promise<void>;

  deleteSingleStudentRegister: (id: number) => Promise<void>;
  deleteAllStudentRegister: () => Promise<void>;
  totalStudents:number;
  studentsNotRegisters:number;
  studentsRegisters:number;
  studentsActives:number;
  loadInfoStudentRegisterByCourse: (idCourse: number) => Promise<void>;
  coursesFilter: TCoursesFilter | null
};
