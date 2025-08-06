export type TComment = {
  id: number;
  nameStudent: string;
  text: string;
  timestamp: string;
  parentId: number | null;
  courseId: number;
  studentId: number;
}

// Comentario que se envía al servidor, incluye el token pero no requiere el ID todavía
export type TCommentSend = Omit<TComment, 'id' | 'studentId' | 'nameStudent' | 'timestamp'> & {
  token: string;
};
export type TCommentDelete ={
  idComment:TComment['id'],
  token:string
  idCourse:TComment['courseId']
}
export type TUpdateComment ={
  idComment:TComment['id'],
  token:string,
  text:TComment['text']
  idCourse:TComment['courseId']
}
export type TUpdateDelete ={
  idComment:TComment['id'],
  token:string
  text:TComment['text']
}


export type TIStudentsConnect ={
    id:number
}

