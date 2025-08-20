// modules/teacher/notifications/hooks/useNotificationsTeacher.ts
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authStorage } from "../../../../shared/Utils/authStorage";
import type { TNotificationsTeacher } from "../../../notifications/types/Notifications";
import { GetTeacherNotificationsAPI } from "../services/GetNotificationsTeacher.server";
import DeleteNotificationTeacherAPI from "../services/DeleteNotificationsTeacher.server";

export default function useNotificationsTeacher() {
  const [notificationsTeacher, setNotificationsTeacher] = useState<TNotificationsTeacher>(
    () => authStorage.getNotificationsTeacher()
  );
  const [loading, setLoading] = useState(false);

  const refreshNotificationsTeacher = async () => {
    setLoading(true);
    try {
      const data = await GetTeacherNotificationsAPI();
      console.log(data)
      setNotificationsTeacher(data);
      authStorage.setNotificationsTeacher(data); // quítalo si no quieres cache local
    } catch {
      toast.error("Ups parece que no hay notificaciones creadas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNotificationsTeacher(); // carga 1 sola vez
  }, []);

  const deleteItemNotificationTeacher = async (idNotification: number) => {
    setLoading(true);
    try {
      const resp = await DeleteNotificationTeacherAPI(idNotification);
      if (resp.status === 200) {
        const newNotificationsTeacher = notificationsTeacher.filter(
          notiTeacher => notiTeacher.id !== idNotification
        );
        setNotificationsTeacher(newNotificationsTeacher)

        toast.success("Notificación eliminada.");
        await refreshNotificationsTeacher();
      } else {
        toast.error(resp.message || "No se pudo eliminar la notificación.");
      }
    } catch {
      toast.error("Error eliminando la notificación.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAllNotificationsTeacher = async () => {
    setLoading(true);
    try {
      const resp = await DeleteNotificationTeacherAPI(); // sin id => borra todas
      if (resp.status === 200) {
        await refreshNotificationsTeacher();
        toast.success("Todas las notificaciones han sido eliminadas.");
      } else {
        toast.error(resp.message || "No se pudieron eliminar todas las notificaciones.");
      }
    } catch {
      toast.error("Error eliminando todas las notificaciones.");
    } finally {
      setLoading(false);
    }
  };

  return {
    notificationsTeacher,
    loading,
    refreshNotificationsTeacher,
    deleteItemNotificationTeacher,
    deleteAllNotificationsTeacher,
  };
}
