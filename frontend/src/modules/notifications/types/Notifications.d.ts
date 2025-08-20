/* Tipado de las notificaciones */

export type TNotification ={
    id:number
    title:string,
    message:string,
    date:string
    id_teacher:number
}
// Listados
export type TNotificationsStudent = TNotification[];
export type TNotificationsTeacher = TNotification[];
