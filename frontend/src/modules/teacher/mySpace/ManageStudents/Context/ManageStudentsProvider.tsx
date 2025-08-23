// src/modules/teacher/mySpace/context/ManageStudentsProvider.tsx
import React, { useEffect, useState } from "react";

import { authStorage } from "../../../../../shared/Utils/authStorage";
import toast from "react-hot-toast";

// Servicios
import GetInfoRegisterStudentsAPI from "../services/GetInfoRegisterStudents.server";
import GetSingleStudentAPI from "../services/GetSingleRegisterStudentAPI.server";
import RegisterStudentAPI from "../services/RegisterStudent.server";
import RegisterStudentsAPI from "../services/RegisterStudentsByFile.server";
import UpdateStudentIdentificationAPI from "../services/UpdateIdentificationStudent.server";
import DeleteIdentificationNumberAPI from "../services/DeleteStudentRegister.server";
import type { TCoursesFilter, TStudentRegisterResponse, TStudentsRegisters } from "../ManageStudents";
import { ManageStudentsContext } from "./ManageStudentsContex";
import type { TCourse } from "../../../../courses/types/CourseStudent";
import GetInfoRegisterStudentsByCourseAPI from "../services/GetInfoRegisterStudentsByCourse.server";
import GetCoursesFilterAPI from "../services/GetCoursesFilter.server";

type Props = {
  children: React.ReactNode;
};

export const ManageStudentsProvider = ({ children }: Props) => {
  // Estado principal con el listado de números de identificación registrados
  const [infoRegisterStudents, setInfoRegisterStudents] = useState<TStudentsRegisters>([]);
  const [coursesFilter, setCoursesFilter] = useState<TCoursesFilter | null>(null)

  // Carga inicial siempre desde backend para datos frescos
  useEffect(() => {
    (async () => {
      try {
        // Siempre obtener datos frescos del backend al entrar a la página
        const data = await GetInfoRegisterStudentsAPI();
        console.log("Datos frescos del backend:", data);
        setInfoRegisterStudents(data);
        authStorage.setInfoStudentsRegister(data);

        /*Obtener los cursos para poder mostrar el filtrado por cursos*/
        const coursesFilter = await GetCoursesFilterAPI()
        setCoursesFilter(coursesFilter)
        authStorage.removeFilterCourse()
      } catch (e) {
        console.error("Error cargando info de registros:", e);
        // Si falla el backend, intentar cargar desde storage como fallback
        const storedStudents = authStorage.getInfoStudentsRegister();
        const storedCoursesFilter = authStorage.getCoursesFilter();
        if (storedStudents && storedStudents.length > 0  ) {
          setInfoRegisterStudents(storedStudents);
        }
        if(storedCoursesFilter && storedCoursesFilter.length > 0){
          setCoursesFilter(storedCoursesFilter);
        }

        else {
          toast.error("No se pudo cargar la información de estudiantes");
        }
      }
    })();
  }, []);

  const refreshInfoStudentRegister = async () => {
    try {
      authStorage.removeInfoStudentsRegister();
      const data = await GetInfoRegisterStudentsAPI();
      authStorage.setInfoStudentsRegister(data);
      setInfoRegisterStudents(data);
    } catch (e) {
      console.error("Error refrescando info:", e);
      toast.error("No se pudo refrescar la información");
    }
  };

  // Cargar todos (manual)
  const loadInfoStudentsRegister = async () => {
    try {
      const data = await GetInfoRegisterStudentsAPI();
      setInfoRegisterStudents(data);
      authStorage.setInfoStudentsRegister(data);
      toast.success("Datos cargados");
    } catch (e) {
      console.error("Error cargando datos:", e);
      toast.error("No se pudo cargar la información");
    }
  };

  // Cargar uno (lo antepone al listado)
  const loadInfoStudentRegister = async (id: TStudentRegisterResponse["id"]) => {
    try {
      const item = await GetSingleStudentAPI(id);
      console.log('El que me trae el backend',item)
      item.color =true
      // Filtrar duplicados antes de agregar el nuevo item
      setInfoRegisterStudents((prev) => {
        const filteredPrev = prev.filter(student => student.number_identification !== item.number_identification);
        console.log('ni se sabe',filteredPrev)
        return [item, ...filteredPrev];
      });

      // También actualizar el storage sin duplicados
      const currentStudents = infoRegisterStudents.filter(student => student.number_identification !== item.number_identification);
      authStorage.setInfoStudentsRegister([item, ...currentStudents]);
      toast.success("Estudiante cargado");
    } catch (e) {
      console.error("Error cargando estudiante:", e);
      toast.error("Ups! Parece que ese id no existe o no se encuentra Registrado");
    }
  };
  /*Cargar estudiantes por filtrado en un curso en especifico*/
  const loadInfoStudentRegisterByCourse = async(idCourse:TCourse['id'])=>{
      try {
      const id_course = idCourse
      const students = await GetInfoRegisterStudentsByCourseAPI(id_course);
      if(students.length === 0){
        toast.success('No hay estudiantes registrados aun')
        return
      }
      authStorage.setFilterCourse(idCourse)
      // Filtrar duplicados antes de agregar el nuevo item
      setInfoRegisterStudents(students);
      // También actualizar el storage sin duplicados
      /* authStorage.setInfoStudentsRegister(students); */
      toast.success("Estudiante cargado");
    } catch (e) {
      console.error("Error cargando estudiante:", e);
      toast.error("Ups! Parece que ese id no se encuentra Registrado");
    }

  }

  // Registrar uno
  const registerStudent = async (n_identification: TStudentRegisterResponse["number_identification"]) => {
    try {
      const res = await RegisterStudentAPI(n_identification);
      if(res){
        await refreshInfoStudentRegister();
      }
    } catch (e) {
      console.error("Error registrando estudiante:", e);
      toast.error("No se pudo registrar el estudiante");
    }
  };

  // Registrar por archivo
  const registerStudentsFile = async (file: File) => {
    try {
      const res = await RegisterStudentsAPI(file);
      // Compatibilidad: si retorna status (200) o solo message
      if ((typeof res === "number" && res === 200) || typeof res === "string" || typeof res === "object") {
        toast.success("Identificaciones Registrados Exitosamente");
        await refreshInfoStudentRegister();
        return;
      }
      await refreshInfoStudentRegister();
    } catch (e) {
      console.error("Error registrando por archivo:", e);
      toast.error("No se pudo registrar por archivo");
    }
  };

  // Actualizar número de identificación
  const updateStudentRegister = async (
    id: number,
    new_number_identification: TStudentRegisterResponse["number_identification"]
  ) => {
    try {
      const res = await UpdateStudentIdentificationAPI(id, new_number_identification);
      // Ese servicio suele devolver message; si fuera status, también refrescamos
      if (typeof res === "string" || (typeof res === "number" && res === 200)) {
        await refreshInfoStudentRegister();
        return;
      }
      await refreshInfoStudentRegister();
    } catch (e) {
      console.error("Error actualizando identificación:", e);
      toast.error("No se pudo actualizar la identificación");
    }
  };

  // Eliminar uno (aquí interpretamos `id` como el número de identificación a eliminar)
  const deleteSingleStudentRegister = async (id: number) => {
    try {
      const res = await DeleteIdentificationNumberAPI(id);
      if (res?.status === 200 || typeof res?.message === "string") {
        toast.success("Identificación eliminada");
        await refreshInfoStudentRegister();
        return;
      }
      await refreshInfoStudentRegister();
    } catch (e) {
      console.error("Error eliminando identificación:", e);
      toast.error("No se pudo eliminar la identificación");
    }
  };

  // Eliminar todos
  const deleteAllStudentRegister = async () => {
    try {
      const res = await DeleteIdentificationNumberAPI();
      if (res?.status === 200 || typeof res?.message === "string") {
        await refreshInfoStudentRegister();
        toast.success("Identificaciones eliminadas");
        return;
      }
      await refreshInfoStudentRegister();
    } catch (e) {
      console.error("Error eliminando identificaciones:", e);
      toast.error("No se pudieron eliminar las identificaciones");
    }
  };

  /* Variables con la cantidad de estudiantes segun su estado */
  const totalStudents = infoRegisterStudents.length
  let studentsNotRegisters =0;
  let studentsRegisters =0;
  let studentsActives =0;


  if(infoRegisterStudents.length !== 0){
    infoRegisterStudents.map((infoRegisterStudent)=>{
      if(infoRegisterStudent.status  === null){
        studentsNotRegisters +=1
      }
      else if(infoRegisterStudent.status === false){
        studentsRegisters +=1
      }
      else{
        studentsActives +=1
      }
    })

  }

  return (
    <ManageStudentsContext.Provider
      value={{
        infoRegisterStudents,
        refreshInfoStudentRegister,
        loadInfoStudentsRegister,
        loadInfoStudentRegister,
        registerStudent,
        registerStudentsFile,
        updateStudentRegister,
        deleteSingleStudentRegister,
        deleteAllStudentRegister,
        totalStudents,
        studentsNotRegisters,
        studentsRegisters,
        studentsActives,
        loadInfoStudentRegisterByCourse,
        coursesFilter
      }}
    >
      {children}
    </ManageStudentsContext.Provider>
  );
};
