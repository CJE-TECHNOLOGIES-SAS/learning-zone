import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useManageStudents } from '../hook/useManageStudents';
import '../styles/ManageSearchTable.css'
import { FcFilledFilter } from "react-icons/fc";
import OpcsFilter from './OpcsFilter';
import { authStorage } from '../../../../../shared/Utils/authStorage';
import { ExportAndDownloadStudentsExcel } from '../services/GenerateExportExcel.server';
import toast from 'react-hot-toast';
import { windowModalDelete } from '../../../../../shared/animations/WindowModalDelete';
export default function ManageSearchTable() {
  const [searchValue, setSearchValue] = useState('');
  const {deleteAllStudentRegister, loadInfoStudentRegister} = useManageStudents()
  const [btnFilter, setBtnFilter] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.length === 10) {
      loadInfoStudentRegister(Number(searchValue))
    } else {
      console.warn('El número debe tener exactamente 10 dígitos.');
    }
  };

  const handleClearAll =async () => {
         const result = await windowModalDelete({title:'¿Eliminación Total?', text:'Esta acción no se puede deshacer'})
         if (!result) {
           return;
         }
        try {

          await deleteAllStudentRegister()

          // Recargar lecciones del curso
          toast.success("Estudiantes eliminados correctamente");
        } catch (error) {
          console.error("Error al eliminar Estudiante :", error);
          toast.error("Error al eliminar la Estudiante");
        }
  };
  const exportToExcel = async () => {
    const courseFilterId = authStorage.getFilterCourse(); // obtiene id de curso
    try {
      await ExportAndDownloadStudentsExcel(courseFilterId ?? undefined); // dispara la descarga
    } catch (e) {
      console.error(e);
              // alert('Error al descargar Excel');
    }
  };

  const handleActionBtnFilter = (): void => {
      setBtnFilter((prev) => !prev);
  };

  return (
    <div className="container-control-table">
      {btnFilter && <OpcsFilter onToggleOpcFilter={handleActionBtnFilter}/>}
      <form onSubmit={handleSubmit} className="form-search-table">
        <div className="container-label-input-search">
          <input
            id="searchStudent"
            type="text"
            placeholder="Ingrese identificación"
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // Solo números
              if (value.length <= 10) setSearchValue(value);
            }}
            required
          />
        </div>

        <button type="submit" className="btn-search">
          <Search size={16} /> Buscar
        </button>

      </form>
      <div className='container-opc-fil-delete'>
          <button
            type="button"
            className="btn-delete-all"
            onClick={handleClearAll}>
            <Trash2 size={16} /> Eliminar todo
          </button>
          <button className='btn-filter' onClick={()=>setBtnFilter(!btnFilter)}>{<FcFilledFilter/>}</button>
          <button className='btn-export' onClick={exportToExcel}>Exportar</button>

      </div>

    </div>
  );
}
