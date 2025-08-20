import '../styles/HeaderCourse.css';
import { BsChatLeftTextFill } from "react-icons/bs";

import GetAllStudentsCommentsAPI from '../services/GetAllStudentsComments.server';
import { authStorage } from '../../../shared/Utils/authStorage';
import type { TStudentAllComents } from '../comments/types';
import { useNavigate } from 'react-router-dom';
import { useStudentCourseContext } from '../hooks/useCourse';
import type { TCourse, TCourseStudent } from '../types/CourseStudent';

interface THeaderCourseProps {
  title: string;
  idCourse: TCourse['id'],
  palette: TCourseStudent['palette'];
}

export default function HeaderCourse({ title, idCourse, palette }: THeaderCourseProps) {
  const { progress } = useStudentCourseContext();
  const navigate = useNavigate();

  const handleComment = async () => {
    const students = await GetAllStudentsCommentsAPI();
    const studentStorage: TStudentAllComents[] = students.map(student => ({
      id: student.id,
      numIdentification: student.num_identification,
      name: student.name,
      lastNames: student.last_names,
      email: student.email,
      prefixProfile: student.prefix_profile,
      stateConnect: false,
    }));
    authStorage.setAllStudents(studentStorage);
    if (idCourse) navigate(`/student/comments/${idCourse}`);
    else alert('No se encontró el curso correspondiente.');
  };

  return (
    <div className="header-course"
    style={{boxShadow: `0 0 10px ${palette.accent}`}}>
      <button
        className="btn-chat-course"
        onClick={handleComment}
        style={{ color: palette.accent }}
      >
        <BsChatLeftTextFill style={{ background: 'none' }} />
      </button>

      <h2
        className="title-course"
        style={{ color: palette.text }}
      >
        Curso de {title}
      </h2>

      <div className="container-progress">
        <p
          className="progress-course-number"
          style={{ color: palette.text }}
        >
          {progress}
        </p>

        <span
          className="progress-bar-bg"
          style={{ borderBottomColor: palette.surface}}
        />

        <span
          className="progress-bar-fill"
          style={{
            width: `${progress}%`,
            borderBottomColor: palette.brand
          }}
        />
      </div>
    </div>
  );
}
