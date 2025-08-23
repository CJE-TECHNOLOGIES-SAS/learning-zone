import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useManageStudents } from '../hook/useManageStudents';
import '../styles/ManageSearchTable.css'
import { FcFilledFilter } from "react-icons/fc";
import OpcsFilter from './OpcsFilter';
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
    console.log('Eliminar todos los registros');
    alert('ten cuidado, incluir logica de estas seguro?')
    await deleteAllStudentRegister()
    // Aquí iría tu lógica para eliminar todos los registros
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
      </div>

    </div>
  );
}
