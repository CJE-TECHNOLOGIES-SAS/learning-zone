# 🎓 Implementación Rol de Maestro - Learning Zone

## 📋 Índice
1. [Análisis del Proyecto Actual](#análisis-del-proyecto-actual)
2. [Cambios en Base de Datos](#cambios-en-base-de-datos)
3. [Nuevos Servicios Backend](#nuevos-servicios-backend)
4. [Sistema de Autenticación](#sistema-de-autenticación)
5. [Frontend - Nuevos Módulos](#frontend---nuevos-módulos)
6. [Funcionalidades Específicas](#funcionalidades-específicas)
7. [Seguridad y Permisos](#seguridad-y-permisos)
8. [Plan de Implementación](#plan-de-implementación)

---

## 🔍 Análisis del Proyecto Actual

### Estructura Existente
- **Backend**: FastAPI con SQLAlchemy
- **Frontend**: React + TypeScript
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT (solo estudiantes)
- **Módulos**: Cursos, Lecciones, Evaluaciones, Comentarios, Notificaciones

### Limitaciones Actuales
- ❌ Solo rol de estudiante
- ❌ No hay gestión de maestros
- ❌ Cursos predefinidos (no editables)
- ❌ Sin sistema de permisos
- ❌ Sin analytics para maestros

---

## 🗄️ Cambios en Base de Datos

### 1. Nuevo Modelo: `teacher_model.py`

```python
# backend/models/teacher_model.py
from typing import List
from datetime import datetime
from database.config_db import Base
from sqlalchemy import Boolean, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Teacher(Base):
    __tablename__ = "teachers"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    identification_number: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    names: Mapped[str] = mapped_column(String(50), nullable=False)
    last_names: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    specialization: Mapped[str] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Tokens de autenticación
    email_token: Mapped[str] = mapped_column(String(255), nullable=True, unique=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    password_token: Mapped[str] = mapped_column(String(250), unique=True, nullable=True)
    expire_password_token: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Relaciones
    courses_created: Mapped[List["Course"]] = relationship(back_populates="teacher")
    notifications_created: Mapped[List["Notification"]] = relationship(back_populates="teacher")
```

### 2. Modificar Modelo Existente: `course_model.py`

```python
# backend/models/course_model.py
class Course(Base):
    __tablename__ = "courses"
    
    # Campos existentes...
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50))
    description: Mapped[str] = mapped_column(String(100))
    
    # NUEVO: Campo para maestro creador
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones existentes...
    comments: Mapped[List["Comment"]] = relationship(back_populates="course")
    students: Mapped[List["Student"]] = relationship(secondary="course_students", back_populates="courses")
    lessons: Mapped[List["Lesson"]] = relationship(back_populates="course")
    
    # NUEVA: Relación con maestro
    teacher: Mapped["Teacher"] = relationship(back_populates="courses_created")
```

### 3. Modificar Modelo Existente: `notification_model.py`

```python
# backend/models/notification_model.py
class Notification(Base):
    __tablename__ = "notifications"
    
    # Campos existentes...
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # NUEVO: Campo para maestro creador
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"), nullable=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relaciones existentes...
    students: Mapped[List["Student"]] = relationship(secondary=student_notification, back_populates="notifications")
    
    # NUEVA: Relación con maestro
    teacher: Mapped["Teacher"] = relationship(back_populates="notifications_created")
    course: Mapped["Course"] = relationship(back_populates="notifications")
```

---

## 🔧 Nuevos Servicios Backend

### 1. `teacher_services.py`

```python
# backend/services/teacher_services.py
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from models.teacher_model import Teacher
from models.course_model import Course
from models.lesson_model import Lesson
from models.evaluation_model import Evaluation
from models.notification_model import Notification
from schemas.teacher_schemas import TeacherCreate, TeacherUpdate, TeacherResponse
from schemas.course_schemas import CourseCreate, CourseUpdate
from schemas.lesson_schemas import LessonCreate
from schemas.evaluation_schemas import EvaluationCreate
from schemas.notification_schemas import NotificationCreate
from utils.password_utils import hash_password, verify_password
from utils.email_utils import send_verification_email

class TeacherService:
    def __init__(self, repository):
        self.repository = repository
    
    async def create_teacher(self, teacher_data: TeacherCreate) -> Teacher:
        """Crear un nuevo maestro"""
        hashed_password = hash_password(teacher_data.password)
        teacher = Teacher(
            identification_number=teacher_data.identification_number,
            names=teacher_data.names,
            last_names=teacher_data.last_names,
            email=teacher_data.email,
            password=hashed_password,
            specialization=teacher_data.specialization
        )
        return await self.repository.create(teacher)
    
    async def get_teacher_by_id(self, teacher_id: int) -> Optional[Teacher]:
        """Obtener maestro por ID"""
        return await self.repository.get_by_id(Teacher, teacher_id)
    
    async def get_teacher_by_email(self, email: str) -> Optional[Teacher]:
        """Obtener maestro por email"""
        return await self.repository.get_by_field(Teacher, "email", email)
    
    async def update_teacher(self, teacher_id: int, teacher_data: TeacherUpdate) -> Teacher:
        """Actualizar datos del maestro"""
        update_data = teacher_data.dict(exclude_unset=True)
        if "password" in update_data:
            update_data["password"] = hash_password(update_data["password"])
        return await self.repository.update(Teacher, teacher_id, update_data)
    
    async def delete_teacher(self, teacher_id: int) -> bool:
        """Eliminar maestro (soft delete)"""
        return await self.repository.update(Teacher, teacher_id, {"is_active": False})
    
    async def get_teacher_courses(self, teacher_id: int) -> List[Course]:
        """Obtener cursos creados por el maestro"""
        return await self.repository.get_teacher_courses(teacher_id)
    
    async def create_course(self, teacher_id: int, course_data: CourseCreate) -> Course:
        """Crear un nuevo curso"""
        course = Course(
            name=course_data.name,
            description=course_data.description,
            teacher_id=teacher_id
        )
        return await self.repository.create(course)
    
    async def create_lesson(self, teacher_id: int, lesson_data: LessonCreate) -> Lesson:
        """Crear una nueva lección"""
        # Verificar que el curso pertenece al maestro
        course = await self.repository.get_by_id(Course, lesson_data.course_id)
        if not course or course.teacher_id != teacher_id:
            raise ValueError("No tienes permisos para crear lecciones en este curso")
        
        lesson = Lesson(
            name=lesson_data.name,
            description=lesson_data.description,
            course_id=lesson_data.course_id
        )
        return await self.repository.create(lesson)
    
    async def create_evaluation(self, teacher_id: int, evaluation_data: EvaluationCreate) -> Evaluation:
        """Crear una nueva evaluación"""
        lesson = await self.repository.get_by_id(Lesson, evaluation_data.lesson_id)
        course = await self.repository.get_by_id(Course, lesson.course_id)
        
        if not course or course.teacher_id != teacher_id:
            raise ValueError("No tienes permisos para crear evaluaciones en esta lección")
        
        evaluation = Evaluation(
            title=evaluation_data.title,
            description=evaluation_data.description,
            lesson_id=evaluation_data.lesson_id,
            questions=evaluation_data.questions
        )
        return await self.repository.create(evaluation)
    
    async def create_notification(self, teacher_id: int, notification_data: NotificationCreate) -> Notification:
        """Crear una nueva notificación"""
        notification = Notification(
            title=notification_data.title,
            message=notification_data.message,
            type=notification_data.type,
            teacher_id=teacher_id,
            course_id=notification_data.course_id
        )
        return await self.repository.create(notification)
```

### 2. `course_management_service.py`

```python
# backend/services/course_management_service.py
class CourseManagementService:
    def __init__(self, repository):
        self.repository = repository
    
    async def create_course_with_content(self, teacher_id: int, course_data: CourseCreateWithContent) -> Course:
        """Crear curso con contenido inicial"""
        course = await self.teacher_service.create_course(teacher_id, course_data.course)
        
        # Crear lecciones si se proporcionan
        if course_data.lessons:
            for lesson_data in course_data.lessons:
                lesson_data.course_id = course.id
                await self.teacher_service.create_lesson(teacher_id, lesson_data)
        
        return course
    
    async def update_course_content(self, teacher_id: int, course_id: int, content_data: ContentUpdate) -> Course:
        """Actualizar contenido del curso"""
        course = await self.repository.get_by_id(Course, course_id)
        if not course or course.teacher_id != teacher_id:
            raise ValueError("No tienes permisos para editar este curso")
        
        return await self.repository.update(Course, course_id, content_data.dict())
    
    async def publish_course(self, teacher_id: int, course_id: int) -> Course:
        """Publicar curso para estudiantes"""
        course = await self.repository.get_by_id(Course, course_id)
        if not course or course.teacher_id != teacher_id:
            raise ValueError("No tienes permisos para publicar este curso")
        
        return await self.repository.update(Course, course_id, {"is_published": True})
    
    async def archive_course(self, teacher_id: int, course_id: int) -> Course:
        """Archivar curso"""
        course = await self.repository.get_by_id(Course, course_id)
        if not course or course.teacher_id != teacher_id:
            raise ValueError("No tienes permisos para archivar este curso")
        
        return await self.repository.update(Course, course_id, {"is_published": False})
```

---

## 🔐 Sistema de Autenticación

### 1. Modificar `auth_dependencies.py`

```python
# backend/dependencies/auth_dependencies.py
from typing import Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from database.config_db import get_session
from models.student_model import Student
from models.teacher_model import Teacher
from utils.jwt_utils import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    session: AsyncSession = Depends(get_session),
    token: str = Depends(oauth2_scheme)
) -> Union[Student, Teacher]:
    """Obtener usuario actual (estudiante o maestro)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_token(token)
        user_id: int = payload.get("user_id")
        user_type: str = payload.get("user_type")
        
        if user_id is None or user_type is None:
            raise credentials_exception
            
    except Exception:
        raise credentials_exception
    
    if user_type == "student":
        user = await session.get(Student, user_id)
    elif user_type == "teacher":
        user = await session.get(Teacher, user_id)
    else:
        raise credentials_exception
    
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_teacher(
    current_user: Union[Student, Teacher] = Depends(get_current_user)
) -> Teacher:
    """Obtener maestro actual"""
    if not isinstance(current_user, Teacher):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol de maestro."
        )
    return current_user

async def get_current_student(
    current_user: Union[Student, Teacher] = Depends(get_current_user)
) -> Student:
    """Obtener estudiante actual"""
    if not isinstance(current_user, Student):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol de estudiante."
        )
    return current_user

def require_teacher_role(
    current_user: Union[Student, Teacher] = Depends(get_current_user)
) -> Teacher:
    """Middleware para requerir rol de maestro"""
    if not isinstance(current_user, Teacher):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado. Se requiere rol de maestro."
        )
    return current_user
```

### 2. Nuevo Middleware de Autorización

```python
# backend/middleware/auth_middleware.py
from typing import List
from fastapi import Request, HTTPException
from models.teacher_model import Teacher
from models.course_model import Course
from models.lesson_model import Lesson
from models.evaluation_model import Evaluation

class RoleMiddleware:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles
    
    async def __call__(self, request: Request, call_next):
        # Verificar rol del usuario
        user = request.state.user
        if not user or user.__class__.__name__.lower() not in self.allowed_roles:
            raise HTTPException(status_code=403, detail="Acceso denegado")
        
        response = await call_next(request)
        return response

class SecurityMiddleware:
    @staticmethod
    async def verify_course_ownership(teacher_id: int, course_id: int, session) -> bool:
        """Verificar que el curso pertenece al maestro"""
        course = await session.get(Course, course_id)
        return course and course.teacher_id == teacher_id
    
    @staticmethod
    async def verify_lesson_ownership(teacher_id: int, lesson_id: int, session) -> bool:
        """Verificar que la lección pertenece al maestro"""
        lesson = await session.get(Lesson, lesson_id)
        if not lesson:
            return False
        
        course = await session.get(Course, lesson.course_id)
        return course and course.teacher_id == teacher_id
    
    @staticmethod
    async def verify_evaluation_ownership(teacher_id: int, evaluation_id: int, session) -> bool:
        """Verificar que la evaluación pertenece al maestro"""
        evaluation = await session.get(Evaluation, evaluation_id)
        if not evaluation:
            return False
        
        lesson = await session.get(Lesson, evaluation.lesson_id)
        if not lesson:
            return False
        
        course = await session.get(Course, lesson.course_id)
        return course and course.teacher_id == teacher_id
```

---

## 🎨 Frontend - Nuevos Módulos

### 1. Estructura de Carpetas

```
frontend/src/modules/teacher/
├── Components/
│   ├── TeacherDashboard.tsx
│   ├── CourseCreator.tsx
│   ├── LessonCreator.tsx
│   ├── EvaluationCreator.tsx
│   ├── NotificationCreator.tsx
│   ├── CourseManager.tsx
│   ├── StudentProgress.tsx
│   └── Analytics.tsx
├── pages/
│   ├── TeacherHome.tsx
│   ├── CourseManagement.tsx
│   ├── StudentProgress.tsx
│   ├── Analytics.tsx
│   └── NotificationCenter.tsx
├── services/
│   ├── TeacherAuth.server.ts
│   ├── CourseManagement.server.ts
│   ├── LessonManagement.server.ts
│   ├── EvaluationManagement.server.ts
│   └── NotificationManagement.server.ts
├── hooks/
│   ├── useTeacherAuth.ts
│   ├── useCourseManagement.ts
│   └── useAnalytics.ts
├── styles/
│   ├── TeacherDashboard.css
│   ├── CourseCreator.css
│   ├── CourseManager.css
│   └── Analytics.css
└── types/
    └── Teacher.d.ts
```

### 2. Modificar Tipos: `User.d.ts`

```typescript
// frontend/src/modules/types/User.d.ts
export type TTeacher = {
  id: number;
  numIdentification: number;
  name: string;
  lastNames: string;
  email: string;
  specialization: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TUser = TStudent | TTeacher;

export type UserRole = 'student' | 'teacher';

export type TUserContext = {
  user: TUser | null;
  role: UserRole | null;
  token: string | null;
  isLoggedIn: boolean;
  logout: () => void;
  isReady: boolean;
  setUser: React.Dispatch<React.SetStateAction<TUser | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setRole: React.Dispatch<React.SetStateAction<UserRole | null>>;
  notifications: TNotifications;
  setNotifications: React.Dispatch<React.SetStateAction<TNotifications>>;
  numberNotifications: number;
};

// Tipos específicos para maestros
export type TCourseCreate = {
  name: string;
  description: string;
  lessons?: TLessonCreate[];
};

export type TLessonCreate = {
  name: string;
  description: string;
  courseId: number;
  content?: string;
  order: number;
};

export type TEvaluationCreate = {
  title: string;
  description: string;
  lessonId: number;
  questions: TQuestion[];
};

export type TNotificationCreate = {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  courseId?: number;
  studentIds?: number[];
};
```

### 3. Servicio de Autenticación de Maestros

```typescript
// frontend/src/modules/teacher/services/TeacherAuth.server.ts
import { axiosInstance } from '../../../api/axiosInstance';
import type { TTeacher, TUserProfileToken } from '../../types/User';

export class TeacherAuthService {
  static async login(email: string, password: string): Promise<TUserProfileToken> {
    const response = await axiosInstance.post('/api/v1/teachers/login', {
      email,
      password
    });
    return response.data;
  }

  static async register(teacherData: Omit<TTeacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<TTeacher> {
    const response = await axiosInstance.post('/api/v1/teachers/register', teacherData);
    return response.data;
  }

  static async getProfile(token: string): Promise<TTeacher> {
    const response = await axiosInstance.get('/api/v1/teachers/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  static async updateProfile(token: string, teacherData: Partial<TTeacher>): Promise<TTeacher> {
    const response = await axiosInstance.put('/api/v1/teachers/profile', teacherData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  static async changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
    await axiosInstance.put('/api/v1/teachers/change-password', {
      currentPassword,
      newPassword
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
```

### 4. Servicio de Gestión de Cursos

```typescript
// frontend/src/modules/teacher/services/CourseManagement.server.ts
import { axiosInstance } from '../../../api/axiosInstance';
import type { TCourseCreate, TCourse } from '../../types/User';

export class CourseManagementService {
  static async getTeacherCourses(token: string): Promise<TCourse[]> {
    const response = await axiosInstance.get('/api/v1/teachers/courses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  static async createCourse(token: string, courseData: TCourseCreate): Promise<TCourse> {
    const response = await axiosInstance.post('/api/v1/teachers/courses', courseData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  static async updateCourse(token: string, courseId: number, courseData: Partial<TCourseCreate>): Promise<TCourse> {
    const response = await axiosInstance.put(`/api/v1/teachers/courses/${courseId}`, courseData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  static async deleteCourse(token: string, courseId: number): Promise<void> {
    await axiosInstance.delete(`/api/v1/teachers/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  static async publishCourse(token: string, courseId: number): Promise<TCourse> {
    const response = await axiosInstance.post(`/api/v1/teachers/courses/${courseId}/publish`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  static async archiveCourse(token: string, courseId: number): Promise<TCourse> {
    const response = await axiosInstance.post(`/api/v1/teachers/courses/${courseId}/archive`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
}
```

---

## 🚀 Funcionalidades Específicas

### 1. Dashboard del Maestro

```typescript
// frontend/src/modules/teacher/Components/TeacherDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useTeacherAuth } from '../hooks/useTeacherAuth';
import { CourseManagementService } from '../services/CourseManagement.service';
import type { TCourse } from '../../types/User';
import './styles/TeacherDashboard.css';

export const TeacherDashboard: React.FC = () => {
  const { token, user } = useTeacherAuth();
  const [courses, setCourses] = useState<TCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadCourses();
    }
  }, [token]);

  const loadCourses = async () => {
    try {
      const teacherCourses = await CourseManagementService.getTeacherCourses(token!);
      setCourses(teacherCourses);
    } catch (error) {
      console.error('Error cargando cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <h1>Dashboard del Maestro</h1>
        <p>Bienvenido, {user?.name} {user?.lastNames}</p>
      </header>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total de Cursos</h3>
          <p className="stat-number">{courses.length}</p>
        </div>
        <div className="stat-card">
          <h3>Cursos Publicados</h3>
          <p className="stat-number">{courses.filter(c => c.isPublished).length}</p>
        </div>
        <div className="stat-card">
          <h3>Total de Estudiantes</h3>
          <p className="stat-number">{courses.reduce((acc, course) => acc + course.students?.length || 0, 0)}</p>
        </div>
      </div>

      <section className="recent-courses">
        <h2>Cursos Recientes</h2>
        {loading ? (
          <p>Cargando cursos...</p>
        ) : (
          <div className="courses-grid">
            {courses.slice(0, 6).map(course => (
              <div key={course.id} className="course-card">
                <h3>{course.name}</h3>
                <p>{course.description}</p>
                <div className="course-stats">
                  <span>{course.lessons?.length || 0} lecciones</span>
                  <span>{course.students?.length || 0} estudiantes</span>
                </div>
                <div className="course-actions">
                  <button className="btn-edit">Editar</button>
                  <button className="btn-view">Ver</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
```

### 2. Creador de Cursos

```typescript
// frontend/src/modules/teacher/Components/CourseCreator.tsx
import React, { useState } from 'react';
import { useTeacherAuth } from '../hooks/useTeacherAuth';
import { CourseManagementService } from '../services/CourseManagement.service';
import type { TCourseCreate } from '../../types/User';
import './styles/CourseCreator.css';

export const CourseCreator: React.FC = () => {
  const { token } = useTeacherAuth();
  const [courseData, setCourseData] = useState<TCourseCreate>({
    name: '',
    description: '',
    lessons: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      await CourseManagementService.createCourse(token, courseData);
      // Redirigir o mostrar mensaje de éxito
    } catch (error) {
      console.error('Error creando curso:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="course-creator">
      <h2>Crear Nuevo Curso</h2>
      
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label htmlFor="name">Nombre del Curso</label>
          <input
            type="text"
            id="name"
            value={courseData.name}
            onChange={(e) => setCourseData({...courseData, name: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            value={courseData.description}
            onChange={(e) => setCourseData({...courseData, description: e.target.value})}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creando...' : 'Crear Curso'}
          </button>
          <button type="button" className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
```

---

## 🔒 Seguridad y Permisos

### 1. Roles y Permisos

```python
# backend/core/permissions.py
from enum import Enum
from typing import List

class UserRole(str, Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"

class Permissions(str, Enum):
    # Permisos de estudiante
    READ_COURSES = "read_courses"
    TAKE_EVALUATIONS = "take_evaluations"
    VIEW_PROGRESS = "view_progress"
    CREATE_COMMENTS = "create_comments"
    
    # Permisos de maestro
    CREATE_COURSES = "create_courses"
    EDIT_COURSES = "edit_courses"
    DELETE_COURSES = "delete_courses"
    PUBLISH_COURSES = "publish_courses"
    CREATE_LESSONS = "create_lessons"
    EDIT_LESSONS = "edit_lessons"
    DELETE_LESSONS = "delete_lessons"
    CREATE_EVALUATIONS = "create_evaluations"
    GRADE_EVALUATIONS = "grade_evaluations"
    CREATE_NOTIFICATIONS = "create_notifications"
    VIEW_STUDENT_PROGRESS = "view_student_progress"
    MANAGE_STUDENTS = "manage_students"
    VIEW_ANALYTICS = "view_analytics"

class PermissionManager:
    ROLE_PERMISSIONS = {
        UserRole.STUDENT: [
            Permissions.READ_COURSES,
            Permissions.TAKE_EVALUATIONS,
            Permissions.VIEW_PROGRESS,
            Permissions.CREATE_COMMENTS
        ],
        UserRole.TEACHER: [
            Permissions.CREATE_COURSES,
            Permissions.EDIT_COURSES,
            Permissions.DELETE_COURSES,
            Permissions.PUBLISH_COURSES,
            Permissions.CREATE_LESSONS,
            Permissions.EDIT_LESSONS,
            Permissions.DELETE_LESSONS,
            Permissions.CREATE_EVALUATIONS,
            Permissions.GRADE_EVALUATIONS,
            Permissions.CREATE_NOTIFICATIONS,
            Permissions.VIEW_STUDENT_PROGRESS,
            Permissions.MANAGE_STUDENTS,
            Permissions.VIEW_ANALYTICS
        ]
    }
    
    @classmethod
    def has_permission(cls, user_role: UserRole, permission: Permissions) -> bool:
        """Verificar si un rol tiene un permiso específico"""
        return permission in cls.ROLE_PERMISSIONS.get(user_role, [])
    
    @classmethod
    def get_user_permissions(cls, user_role: UserRole) -> List[Permissions]:
        """Obtener todos los permisos de un rol"""
        return cls.ROLE_PERMISSIONS.get(user_role, [])
```

### 2. Middleware de Seguridad

```python
# backend/middleware/security_middleware.py
from functools import wraps
from fastapi import HTTPException, Depends
from typing import Callable
from core.permissions import Permissions, PermissionManager, UserRole

def require_permission(permission: Permissions):
    """Decorador para requerir un permiso específico"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Obtener usuario actual
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Usuario no autenticado")
            
            # Determinar rol del usuario
            user_role = UserRole.TEACHER if hasattr(current_user, 'specialization') else UserRole.STUDENT
            
            # Verificar permiso
            if not PermissionManager.has_permission(user_role, permission):
                raise HTTPException(
                    status_code=403, 
                    detail=f"No tienes permisos para realizar esta acción: {permission}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_teacher_ownership(resource_type: str):
    """Decorador para verificar propiedad de recursos"""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            resource_id = kwargs.get(f'{resource_type}_id')
            
            if not current_user or not hasattr(current_user, 'specialization'):
                raise HTTPException(status_code=403, detail="Se requiere rol de maestro")
            
            # Verificar propiedad del recurso
            if not await SecurityMiddleware.verify_resource_ownership(
                current_user.id, resource_id, resource_type, kwargs.get('session')
            ):
                raise HTTPException(
                    status_code=403, 
                    detail=f"No tienes permisos para acceder a este {resource_type}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

---

## 📋 Plan de Implementación

### FASE 1: Base de Datos y Autenticación (Semana 1-2)
- [ ] Crear modelo `Teacher`
- [ ] Modificar modelos existentes (`Course`, `Notification`)
- [ ] Implementar autenticación dual (estudiante/maestro)
- [ ] Crear migraciones de base de datos
- [ ] Implementar servicios básicos de maestro

### FASE 2: Backend Core (Semana 3-4)
- [ ] Crear rutas de maestro (`teacher_routes.py`)
- [ ] Implementar gestión de cursos
- [ ] Crear sistema de permisos
- [ ] Implementar middleware de seguridad
- [ ] Crear servicios de gestión de contenido

### FASE 3: Frontend Maestro (Semana 5-6)
- [ ] Crear módulo `teacher/` en frontend
- [ ] Implementar dashboard del maestro
- [ ] Crear interfaces de gestión de cursos
- [ ] Implementar creador de lecciones
- [ ] Crear sistema de notificaciones

### FASE 4: Funcionalidades Avanzadas (Semana 7-8)
- [ ] Implementar analytics y reportes
- [ ] Crear gestión de estudiantes
- [ ] Implementar evaluaciones automáticas
- [ ] Crear sistema de contenido multimedia
- [ ] Implementar notificaciones programadas

### FASE 5: Testing y Optimización (Semana 9-10)
- [ ] Crear tests unitarios
- [ ] Implementar tests de integración
- [ ] Optimizar rendimiento
- [ ] Documentar APIs
- [ ] Preparar despliegue

---

## 🎯 Próximos Pasos

1. **Empezar con FASE 1**: Crear el modelo `Teacher` y modificar la autenticación
2. **Definir prioridades**: ¿Qué funcionalidad es más crítica para tu proyecto?
3. **Planificar recursos**: ¿Necesitas ayuda con alguna fase específica?
4. **Establecer métricas**: ¿Cómo medirás el éxito de la implementación?

¿Te gustaría que empiece implementando alguna fase específica o prefieres que profundice en algún aspecto particular? 