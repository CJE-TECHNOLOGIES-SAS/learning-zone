/* Tipado del manageStudents */
// types/ManageStudents.ts

/* ==== STUDENT - Response del backend ==== */
export type TStudentRegisterResponse = {
  id:number
  number_identification: number;
  status: boolean | null;
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
};
