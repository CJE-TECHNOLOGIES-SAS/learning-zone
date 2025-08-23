from pydantic import BaseModel, EmailStr, Field


class SuggestionCreate(BaseModel):
    sender: str = Field(..., description="Nombre o identificador del remitente")
    email_sender: str = Field(..., description="Correo electrónico del remitente")
    content_message: str = Field(..., description="Contenido de la sugerencia")
    subject: str = Field(..., description="Asunto de la sugerencia")
    to_email: EmailStr = Field(
        "cjetechnologies.tech@gmail.com",
        description="Correo destino (por defecto el de soporte)",
    )
