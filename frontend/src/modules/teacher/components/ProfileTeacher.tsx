import { useUser } from "../../auth/Hooks/useAuth";
import '../styles/ProfileTeacher.css'
const ProfileTeacher= () => {
  const { user}= useUser()

  return (
    <div className="container-profile-teacher">
        <h2 className="title-container-profile-teacher">Datos</h2>
        <div className="container-inputs-t">
            <div className="container-label-input-t">
                <label htmlFor="name">Nombre</label>
                <input
                type="text"
                id="name"
                value={user?.name}
                className={user?.name ? "has-content" : ""}
                readOnly
                />
            </div>

            <div className="container-label-input-t">
                <label htmlFor="email">Correo electrónico</label>
                <input
                type="email"
                id="email"
                value={user?.email}
                className={user?.email ? "has-content" : ""}
                readOnly
                />
            </div>
        </div>
        <p className="note-info">Solo lectura. Para cambios, contacte a dirección, coordinación o soporte.</p>

    </div>
  );
};

export default ProfileTeacher;
