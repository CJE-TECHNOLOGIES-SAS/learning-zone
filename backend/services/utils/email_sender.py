# services/utils/email_sender.py
"""
Este módulo permite enviar correos de confirmación y de restablecimiento
de contraseña al estudiante utilizando SendGrid.
"""

from datetime import datetime, timedelta

# Módulos internos
from config import settings

# Módulos externos
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Constantes
SENDGRID_API_KEY = settings.sendgrid_api_key
EMAIL_FROM = settings.email_from
EMAIL_FROM_SUGGESTION = settings.email_from_suggestion
TEMPLATE_ID_REGISTER = settings.sendgrid_template_register_id
TEMPLATE_ID_PASSWORD = settings.sendgrid_template_password_id
TEMPLATE_ID_NOTIFICATION = settings.sendgrid_template_notification_id
TEMPLATE_ID_SUGGESTION = settings.sendgrid_template_suggestion_id


def send_verification_email(
    to_email: str, verification_link: str, student_name: str = "Estudiante"
) -> None:
    """
    Envía un correo de verificación al estudiante para confirmar su cuenta.

    Esta función construye un mensaje usando la plantilla de registro
    de SendGrid, inyecta los datos dinámicos necesarios y lo envía.

    Parámetros:
    ----------
    to_email : str
        Dirección de correo electrónico del destinatario.
    verification_link : str
        URL que el estudiante debe visitar para verificar su cuenta.
    student_name : str, opcional
        Nombre del estudiante que aparecerá en el correo (por defecto "Estudiante").

    Retorna:
    -------
    None

    Excepciones:
    -----------
    Exception
        Se captura cualquier excepción que ocurra al enviar el correo
        e imprime un mensaje de error.
    """
    try:
        message = Mail(from_email=EMAIL_FROM, to_emails=to_email)
        date_now = datetime.now()
        year = date_now.year
        message.template_id = TEMPLATE_ID_REGISTER

        message.dynamic_template_data = {
            "student_name": student_name,
            "verification_link": verification_link,
            "current_year": year,
        }

        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)

        print(f"📨 Email enviado a {to_email} (Status: {response.status_code})")

    except Exception as e:
        print(f"❌ Error al enviar correo: {e}")


def send_password_reset_email(
    to_email: str,
    reset_link: str,
    student_name: str = "Estudiante",
    expire_token: int = 30,
) -> None:
    """
    Envía un correo al estudiante con el enlace para restablecer su contraseña.

    Utiliza una plantilla de SendGrid para enviar el link y muestra
    en el correo la hora de expiración amigable.

    Parámetros:
    ----------
    to_email : str
        Dirección de correo electrónico del destinatario.
    reset_link : str
        URL que el estudiante debe visitar para restablecer la contraseña.
    student_name : str, opcional
        Nombre del estudiante que aparecerá en el correo (por defecto "Estudiante").
    expire_token : int, opcional
        Minutos hasta que el enlace expire (por defecto 30).

    Retorna:
    -------
    None

    Excepciones:
    -----------
    Exception
        Se captura cualquier excepción que ocurra al enviar el correo
        e imprime un mensaje de error.
    """
    try:
        now = datetime.now()
        expiration_dt = now + timedelta(minutes=expire_token)
        expiration_time = expiration_dt.strftime("%H:%M %p")
        current_year = now.year

        message = Mail(
            from_email=EMAIL_FROM, to_emails=to_email, subject="Recuperar Contraseña"
        )
        message.template_id = TEMPLATE_ID_PASSWORD

        message.dynamic_template_data = {
            "student_name": student_name,
            "reset_link": reset_link,
            "current_year": current_year,
            "expiracion_hora_amigable": expiration_time,
            "expiracion_tiempo_minutos": expire_token,
        }

        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)

        print(
            f"📨 Email de recuperación enviado a {to_email} (Status: {response.status_code})"
        )

    except Exception as e:
        print(f"❌ Error al enviar correo de recuperación: {e}")


def send_notification_email(
    to_email: str,
    student_name: str,
    notification_title: str,
    notification_message: str,
):
    """
    Envía un correo al estudiante con una nueva notificación.

    Parámetros:
    - to_email (str): Correo del destinatario.
    - student_name (str): Nombre del estudiante.
    - notification_title (str): Título de la notificación.
    - notification_message (str): Contenido de la notificación.
    """
    try:
        message = Mail(
            from_email=EMAIL_FROM,
            to_emails=to_email,
            subject=f"Nueva Notificación: {notification_title}",
        )
        date_now = datetime.now()
        year = date_now.year

        message.template_id = (
            TEMPLATE_ID_NOTIFICATION  # <-- ¡Usamos la nueva plantilla!
        )

        message.dynamic_template_data = {
            "student_name": student_name,
            "notification_title": notification_title,
            "notification_message": notification_message,
            "current_year": year,
        }

        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)

        print(
            f"📨 Email de notificación enviado a {to_email} (Status: {response.status_code})"
        )

    except Exception as e:
        print(f"❌ Error al enviar correo de notificación: {e}")


def send_suggestion_email(
    sender: str,
    email_sender: str,
    content_message: str,
    subject: str,
    to_email: str = "cjetechnologies.tech@gmail.com",
):
    """
    Envía un correo de sugerencia usando la plantilla personalizada de SendGrid.

    Parámetros:
    - to_email (str): Correo del destinatario.
    - sender (str): Nombre o identificador del remitente de la sugerencia.
    - type_suggestion (str): Tipo o título de la sugerencia.
    - content_message (str): Contenido del mensaje de la sugerencia.
    """
    try:

        message = Mail(
            from_email=EMAIL_FROM_SUGGESTION, to_emails=to_email, subject=subject
        )
        message.template_id = TEMPLATE_ID_SUGGESTION
        message.dynamic_template_data = {
            "sender": sender,
            "email_sender": email_sender,
            "content_message": content_message,
            "subject": subject,
        }
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(
            f"📨 Email de sugerencia enviado a {to_email} (Status: {response.status_code})"
        )
    except Exception as e:
        # Si el error tiene un atributo 'body', imprímelo (SendGrid lo tiene)
        if hasattr(e, "body"):
            print(f"❌ Error al enviar correo de sugerencia (body): {e.body}")
        print(f"❌ Error al enviar correo de sugerencia: {e}")
