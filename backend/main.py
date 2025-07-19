# main.py
"""
Este módulo contiene toda la configuración inicial de FastAPI,
estructurada de manera eficiente para garantizar
una integración fluida y un arranque óptimo del sistema,
facilitando el desarrollo y la personalización de la aplicación.
"""

from contextlib import asynccontextmanager  # reemplazo de on_event

# Modulos internos
from database.config_db import Base, engine  # Base de datos

# Modulos externos
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware  # Importa CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from routes.identification_routes import router as identification_router  # ruta modular
from routes.student_routes import router as student_router
from routes.recovery_password_routes import router as recovery_password_router
from routes.notifications_routes import router as notification_router
from routes.lesson_routes import router as lesson_router
from routes.course_routes import router as course_router
from routes.comment_routes import router as comment_router

from core.initial_data import create_initial_courses
from database.config_db import async_session
from core.initial_lessons import create_initial_lessons


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

    # Crear cursos, lecciones y evaluaciónes
    async with async_session() as session:
        await create_initial_courses(session)
        print("✅ Cursos base creados")
        await create_initial_lessons(session)
        print("✅ Lecciones base creadas")

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
            "Charift Tatiana Giraldo",
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


# --- Routers ----
app.include_router(identification_router)
app.include_router(student_router)
app.include_router(recovery_password_router)
app.include_router(notification_router)
app.include_router(lesson_router)
app.include_router(course_router)
app.include_router(comment_router)
