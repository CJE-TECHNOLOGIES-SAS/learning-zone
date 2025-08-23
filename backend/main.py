# main.py

"""
Este módulo contiene toda la configuración inicial de FastAPI,
estructurada de manera eficiente para garantizar
una integración fluida y un arranque óptimo del sistema,
facilitando el desarrollo y la personalización de la aplicación.
"""

import logging
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager

from schemas.suggestion_schemas import SuggestionCreate
from services.utils.email_sender import send_suggestion_email
from core.security import get_current_role
from database.config_db import Base, engine, async_session  # Base de datos
import google.generativeai as genai
from dotenv import load_dotenv
from config import settings
import services.evaluation_service as eval_svc


# Modulos internos
from core.initial_lessons import create_initial_lessons

# Importa la nueva función de inicialización de evaluaciones
from core.initial_evaluations import create_initial_evaluations

from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware  # Importa CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


from routes.identification_routes import router as identification_router
from routes.student_routes import router as student_router
from routes.recovery_password_routes import router as recovery_password_router
from routes.notifications_routes import router as notification_router
from routes.lesson_routes import router as lesson_router
from routes.course_routes import router as course_router
from routes.comment_routes import router as comment_router
from routes.content_routes import router as content_router
from routes.evaluation_routes import router as evaluation_router
from teacher.routes import router as teacher_router

from core.initial_data import create_initial_courses
from core.initial_content import create_initial_contents

from super_admin import create_admin

logger = logging.getLogger(__name__)


bearer_scheme = HTTPBearer()

load_dotenv()
GEMINI_API_KEY = settings.gemini_api_key

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel("models/gemini-1.5-flash")
    logger.info("Modelo Gemini configurando y cargado.")
else:
    gemini_model = None
    logger.warning(
        "GEMINI_API_KEY no configurada. La evaluación de preguntas abiertas no funcionará."
    )

eval_svc.global_gemini_model = gemini_model


# --- Lifespan moderno (reemplaza on_event) ---
# Mapear la base de datos al iniciar la app
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Ejecutado al iniciar la app. Crea las tablas y cursos base.
    """
    # Crear tablas
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        print("✅ Tablas creadas")

    # Crear cursos, lecciones y contenidos
    async with async_session() as session:
        await create_admin()
        await create_initial_courses(session)
        print("✅ Cursos base creados")
        await create_initial_lessons(session)
        print("✅ Lecciones base creadas")
        await create_initial_contents(session)
        print("✅ Contenidos base tipo imagen creados")
        await create_initial_evaluations(session)
        print("✅ Evaluaciones base creadas")

    print("✅ Base de datos inicializada correctamente")
    yield
    print("🛑 Servidor detenido")


# Crear la app
app = FastAPI(
    title="Learning Zone API",
    description="Learning Zone API es una API REST potente y completa que proporciona todas las funcionalidades esenciales para el óptimo funcionamiento del proyecto. Permite gestionar operaciones de manera eficiente, garantizando una integración fluida y un rendimiento confiable en cada etapa del proceso.",
    version="1.0",
    lifespan=lifespan,  # ✅ Aquí enlazamos la función
    contact={
        "Authors": [
            "Edier Andrés Guerra Vargas",
            "Camilo Andres Ospina Villa",
            "Junior Herrera Agudelo",
            "Charif Tatiana Giraldo",
        ]
    },
)

# --- CONFIGURACIÓN CORS ---
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Lista de orígenes permitidos
    allow_credentials=True,  # Permitir cookies y credenciales
    allow_methods=["*"],  # Permitir todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permitir todos los encabezados
)
# --- FIN CONFIGURACIÓN CORS ---

# Carga de archivos estaticos y plantillas
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# Ruta principal del backend
@app.get("/", response_class=HTMLResponse, tags=["Root"])
async def root(request: Request):
    """
    Esta ruta devuelve una página HTML de bienvenida a la documentación del backend,
    diseñada de forma clara y accesible para guiar a los usuarios en la exploración
    de las funcionalidades y recursos del sistema.
    """
    # Retorna el archivo index.html, pasando el objeto request obligatorio
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/api/v1/role", dependencies=[Depends(bearer_scheme)])
async def valid_user_role(role: str = Depends(get_current_role)):
    """Valida el rol de un usuario en base a un token JWT."""
    return {"role": role}


# -- Sugerencias
@app.post("/suggestions/send", tags=["Suggestions"])
async def send_suggestion(suggestion: SuggestionCreate):
    """
    Envía una sugerencia por correo usando la plantilla de SendGrid.
    """
    send_suggestion_email(
        sender=suggestion.sender,
        email_sender=suggestion.email_sender,
        content_message=suggestion.content_message,
        to_email=suggestion.to_email,
        subject=suggestion.subject,
    )
    return {"message": "Sugerencia enviada correctamente"}


# --- Routers ----
app.include_router(identification_router)
app.include_router(student_router)
app.include_router(recovery_password_router)
app.include_router(notification_router)
app.include_router(lesson_router)
app.include_router(course_router)
app.include_router(comment_router)
app.include_router(content_router)
app.include_router(evaluation_router)
app.include_router(teacher_router)
