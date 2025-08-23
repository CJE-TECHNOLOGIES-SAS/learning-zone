/* Componente general que contendrá o usará los componentes para la gestión de estudiantes */
import  { useState } from 'react'
import TableOfStudents from './TableOfStudents'
import { useManageStudents } from '../hook/useManageStudents';
import OpcRegisterStudent from './OpcRegisterStudent';
import ManageSearchTable from './ManageSearchTable';
import '../styles/PanelManageeStudent.css'
import BtnArrowInfinite from '../../../../../shared/animations/ButtonArrowInfinitive';
export default function PanelManageStudent() {
    const {totalStudents, studentsNotRegisters,studentsRegisters,studentsActives, infoRegisterStudents } = useManageStudents();
    const [opcRegisterStudent,setOpcRegisterStudent] = useState(false)
    const handleActionOpcRegister = (): void => {
      setOpcRegisterStudent((prev) => !prev);
  };


  return (
      <div className='container-manage-students-teacher'>
        {opcRegisterStudent && <OpcRegisterStudent  onToggleOpcRegisterStudent={handleActionOpcRegister}/> }
        <div className='container-header-register-students'>
          <div className='container-numbers-students'>
            {/* Totalidad de estudiantes */}
            <div className='container-numbers total-students'>
              <h2 className='title-container-numbers-students'>Total</h2>
              <span className='number-students'>{totalStudents}</span>
              </div>
            {/* Numero de estudiantes No registrados */}
            <div className='container-numbers not-register-students'>
               <h2 className='title-container-numbers-students'>No registrados</h2>
              <span className='number-students'>{studentsNotRegisters}</span>
            </div>
            {/* Nunero de estudiantes registrados pero no activos */}
            <div className='container-numbers register-students'>
              <h2 className='title-container-numbers-students'>Registrados</h2>
              <span className='number-students'>{studentsRegisters}</span>
            </div>
            {/* Numero de estudiantes activos */}
            <div className='container-numbers active-students'>
              <h2 className='title-container-numbers-students'>Activos</h2>
              <span className='number-students'>{studentsActives}</span>

            </div>
          </div>
          {/* Btn de registrar */}
          <button className='btn-register-student' onClick={()=>setOpcRegisterStudent(!opcRegisterStudent)}>Agregar</button>
        </div>

                <div
                  className="btn-arrow-infinite-container"
                  style={{
                    position: "absolute",
                    top:  "90%" ,
                    left: "60%",
                  }}
                >
                  <BtnArrowInfinite color={'#333'} />
                </div>
        <div className='container-table-students'>
          {infoRegisterStudents.length >0 ?
            <>
              {/* Componente con barra de buscar y su btn
              y eliminar todo
              */}
              <ManageSearchTable/>
              {/* Tabla con todos los estudiantes */}
              <TableOfStudents />

            </>:
            <h2 className='title-no-content-table'>Aun no hay estudiantes registrados</h2>
          }
        </div>
      </div>
  )
}
