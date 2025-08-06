
export type TCourse ={
    id:int,
    name:string,
    description:string
    status: 'in_progress' | 'completed' 

}
export type TCourses = TCourse[];

/* Modelo de progreso de cada curso */

export type TProgressCourse  = {
    id_course: TCourse['id'],
    name_course:TCourse['name'],
    completed_lessons:number,
    all_lessons:number,
    status:TCourse['status']
};
export type TProgressCourses = TProgressCourse[]


/* Certifications */

export type TCertificatesStudent ={
    id: number,
    certificate_name: string,
    download_url: string,
}

// Modelo base de una lección
export interface TLesson {
    id: number;
    name: string;
    progressState: 'blocked' | 'in_progress' | 'complete';
    idCourse:TCourse['id']
}

export type TLessons = TLesson[];

export type TContent ={
    id:number,
    title: TLesson['name']
    contentType:'text'| 'image' | 'video' ,
    content:string,
    text: string
}
export type TEvaluation ={
    id:number,
    question:string,
    questionType:"open_question" | "multiple_choice",
    options?:string[] /* Es opcional */
}

export type TScore={
    oldScore: number,
    newScore:number,
    date:string


}
interface TCourseContextType {
    courses:TCourses;
    lessons: TLessons;
    setLessons: React.Dispatch<React.SetStateAction<TLessons>>
    progress: number; // porcentaje
    content:TContent | null;
    currentLesson: TLesson | null;
    evaluation:TEvaluation | null,
    loadLessonsCourse:(idCourse: TCourse["id"]) => Promise<void>,
    loadLessonContent:(idCourse: TCourse["id"], lesson: TLesson) => Promise<void>,
    loadLessonEvaluation: (idCourse: TCourse["id"], idLesson: TLesson['id']) => Promise<void>,
    progressLessons: TProgressCourses,
    loadProgressLessons: () => Promise<void>,
    renderContent:(idCourse: TCourse["id"], lesson: TLesson)=> Promise<void>,
    renderEvaluation:(idCourse: TCourse["id"], idLesson: TLesson['id'])=> Promise<void>

}



