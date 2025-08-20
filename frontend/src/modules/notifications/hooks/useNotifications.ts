import { useCallback,  useEffect, useState  } from "react"
import { authStorage } from "../../../shared/Utils/authStorage"
import { useUser } from "../../auth/Hooks/useAuth"
import DeleteNotificationsAPI from "../services/DeleteNotifications.server"
import GetNotificationsAPI from "../services/GetNotifications.server"
import toast from 'react-hot-toast';

/* Logica de las notificaciones */
export default function useNotifications(pollingInterval=4000 ) {
    const {setNotifications } = useUser()
    const [loadingNot, setLoadingNot] = useState(false)

    const refreshNotifications = useCallback(async () => {
        const updated = await GetNotificationsAPI();
        setNotifications(updated);
        authStorage.setNotificationsStudent(updated);
    }, [setNotifications]); // Solo cambia si cambia `setNotifications`

    // Activar polling (peticion automatica) automático con useEffect
    const token = authStorage.getToken();
    useEffect(() => {
    const role = authStorage.getRole();

    if (token && role === "student") {
        refreshNotifications(); // Solo si es estudiante
        const timer = setInterval(refreshNotifications, pollingInterval);
        return () => clearInterval(timer);
    }
    }, []);

    const deleteItemNotification= async(idItemNotification:number)=>{
        try{
            setLoadingNot(true);
            const response = await DeleteNotificationsAPI(idItemNotification)
            /* Si la eliminacion fue exitosa solicitar de nuevo las notificaciones */
            if(response.status === 200){
                await refreshNotifications()
                await new Promise((resolve) => setTimeout(resolve, 500));

            }
            else{
                toast.error(response.message || '¡Uy! No se pudo eliminar la notificación.');
            }

        }catch{
            toast.error('¡Algo salió mal eliminando la notificación!');
        }
        finally{
            setLoadingNot(false)
        }
    }
    const deleteAllNotification= async()=>{
        try{
            setLoadingNot(true);
            await new Promise((resolve) => setTimeout(resolve, 500));

            const response = await DeleteNotificationsAPI()
            /* Si la eliminacion fue exitosa solicitar de nuevo las notificaciones */
            if(response.status === 200){
                await refreshNotifications()
            }
            else{
                toast.error(response.message || 'No se pudieron eliminar todas las notificaciones.');
            }

        }catch{
            toast.error('¡Algo salió mal eliminando todas las notificaciones!');
        }finally{
            setLoadingNot(false)

        }
    }


  return {
    deleteItemNotification,
    deleteAllNotification,
    loadingNot


  }
}
