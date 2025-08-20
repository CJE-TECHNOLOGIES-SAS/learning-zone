// src/modules/teacher/mySpace/pages/MySpace.tsx
/* Componente principal donde estará todo:
 * - SideBar
 * - Pages de acuerdo a la opción seleccionada
 */
import ContentMySpace from '../components/ContentMySpace';
import SideBarMySpace from '../components/sideBarMySpace';
import { MySpaceProvider } from '../context/MySpaceProvider';
import '../styles/MySpace.css';

export default function MySpace() {
  return (
    <MySpaceProvider>
      <div className="container-myspace-teacher">
        <SideBarMySpace />
        <ContentMySpace />
      </div>
    </MySpaceProvider>
  );
}
