import toast from 'react-hot-toast';
import axios from '../../../../../api/axiosInstance';
import { authStorage } from '../../../../../shared/Utils/authStorage';

const VITE_TEACHER_ENDPOINT = import.meta.env.VITE_TEACHER_ENDPOINT;

/* type GetSingleStudentAPIResponse = {
  status: number;
  message: string;
  student: TStudentsRegisters[number];
}; */

export default async function GetSingleStudentAPI(
  n_identification: number
)/* : Promise<GetSingleStudentAPIResponse['student']> */ {
  try {
    const infoStudents = authStorage.getInfoStudentsRegister()
    const raw = authStorage.getFilterCourse();
    const courseFilter =
      raw == null ? null : Number(raw);



    let ruta: string;
    if (courseFilter == null || !Number.isFinite(courseFilter)) {
      // SIN filtro
      ruta = `${VITE_TEACHER_ENDPOINT}/students/identification/by-number/${n_identification}`;
    } else {
        infoStudents.map((infStudent)=>{
        if(infStudent.number_identification === n_identification){
          if(infStudent.status !== true){
            toast.error('Este estudiante no se encuentra activo')
            return
          }

        }
      })
      // CON filtro
      ruta = `${VITE_TEACHER_ENDPOINT}/students/identification/by-number/${n_identification}?id_course=${courseFilter}`;
    }
    const response = await axios.get(ruta);
    if (response.status !== 200) {
      throw new Error(
        `HTTP ${response.status}: ${response.data?.message || "Error desconocido"}`
      );
    }
    return response.data;
  } catch (error) {
    console.error("Error en GetSingleStudentAPI:", error);
    throw error;
  }
}
