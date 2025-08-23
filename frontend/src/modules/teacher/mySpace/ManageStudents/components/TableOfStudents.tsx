// src/modules/teacher/mySpace/manageStudents/components/TableOfStudents.tsx

import { useState } from "react";
import { useManageStudents } from "../hook/useManageStudents";
import "../styles/TableOfStudents.css";
import toast from 'react-hot-toast';
import type { TStudentRegisterResponse } from "../ManageStudents";

/* Componente que tendrá la tabla con la información (id, estado, crud) */
export default function TableOfStudents() {
  const {infoRegisterStudents, deleteSingleStudentRegister, updateStudentRegister} = useManageStudents()
  const [infoRegisterEdit, setInfoRegisterEdit] = useState<{id: number, currentId: TStudentRegisterResponse['number_identification']} | null>(null)
  const [newNumberId, setNewNumberId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getStatusClass = (status: boolean | null) => {
    if (status === null) return 'status-no-registrado';
    if (status === false) return 'status-registrado';
    return 'status-activo';
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return 'No Registrado';
    if (status === false) return 'Registrado';
    return 'Activo';
  };

  const MAX_LEN = 10;

  const handleEditClick = (student: TStudentRegisterResponse) => {
    setInfoRegisterEdit({ id: student.id, currentId: student.number_identification });
    setNewNumberId(student.number_identification.toString());
    setError(null);
  };

  const handleCancelEdit = () => {
    setInfoRegisterEdit(null);
    setNewNumberId('');
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, MAX_LEN);
    setNewNumberId(value);
    if (error) setError(null);
  };

  const validate = (value: string) => {
    if (!value) return 'El número de identificación es obligatorio.';
    if (value.length !== MAX_LEN) return `Debe tener exactamente ${MAX_LEN} dígitos.`;
    return null;
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!infoRegisterEdit) return;

    const validationError = validate(newNumberId);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (Number(newNumberId) === infoRegisterEdit.currentId) {
      toast.error('El nuevo número debe ser diferente al actual.');
      return;
    }
    await updateStudentRegister(infoRegisterEdit.id, Number(newNumberId))
    setInfoRegisterEdit(null)
    setNewNumberId('')
  };

  return (
    <div className="container-table-students-registers">
      {infoRegisterEdit && (
        <div className="edit-overlay">
          <form className="edit-form" onSubmit={handleUpdateSubmit}>
            <h3 className="edit-title">Editar Identificación</h3>
            <p className="edit-current">Actual: {infoRegisterEdit.currentId}</p>

            <div className="edit-input-container">
              <input
                type="text"
                inputMode="numeric"
                value={newNumberId}
                onChange={handleInputChange}
                className={`edit-input ${newNumberId ? 'has-content' : ''}`}
                placeholder=" "
                maxLength={MAX_LEN}
                autoFocus
              />
              <label className="edit-label">Nuevo N° de identificación</label>
              {error && <span className="edit-error">{error}</span>}
            </div>

            <div className="edit-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancelEdit}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-update"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </form>
        </div>
      )}
      <table className="students-table">
        <thead>
          <tr>
            <th className="header-id">ID</th>
            <th className="header-identification">Identificación</th>
            <th className="header-name">Nombre</th>
            <th className="header-status">Estado</th>
            <th className="header-course">Curso</th>
            <th className="header-score">Puntuacion</th>
            <th className="header-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
            {infoRegisterStudents.map((infoRegisterStudent, index) => (
              <tr key={infoRegisterStudent.id || index}
              className={infoRegisterStudent.color === true ? 'tr-have-color' : ''}
               >
                <td className={infoRegisterStudent.color === true? 'tr-have-color': ''} >{infoRegisterStudent.id}</td>
                <td className={infoRegisterStudent.color === true? 'tr-have-color': ''} >{infoRegisterStudent.number_identification}</td>
                <td className={infoRegisterStudent.color === true? 'tr-have-color': ''} >{infoRegisterStudent.name === null? 'Null':infoRegisterStudent.name }</td>
                <td className={infoRegisterStudent.color === true? 'tr-have-color': ''} >
                  <span className={`status-cell ${getStatusClass(infoRegisterStudent.status)}`}>
                    {getStatusText(infoRegisterStudent.status)}
                  </span>
                </td>
                <td className={infoRegisterStudent.color === true? 'tr-have-color': ''} >{infoRegisterStudent.course}</td>
                <td className={infoRegisterStudent.color === true? 'tr-have-color': ''} >{infoRegisterStudent.score === null? 'Null':infoRegisterStudent.score }</td>

                <td>
                  <div className="container-opc-crud-student">
                    <button className="btn-crud btn-edit" onClick={() => handleEditClick(infoRegisterStudent)}>Editar</button>
                    <button className="btn-crud btn-delete" onClick={()=>deleteSingleStudentRegister(infoRegisterStudent.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
