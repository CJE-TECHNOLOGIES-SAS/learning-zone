import uuid
import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

# Importa lo que sea necesario desde tu app
from src.usecases.student_service import StudentService
from schemas.student_schemas import StudentRegister
from models.student_model import Student
from services.utils.email_sender import send_verification_email
from services.utils.email_validator import EmailValidator
from services.utils.token_generator import generate_verification_token
from services.identification_services import IdentificationService
from schemas.validation_schemas import RegistrationResponse

# --------------------- MOCKS Y FIXTURES ---------------------


@pytest.fixture
def fake_student_register():
    return StudentRegister(
        names="Juan Pérez",
        last_names="Gómez",
        email="juan@example.com",
        password="supersegura123",
        identification_number="123456789",
        identification_id=1,
    )


@pytest.fixture
def fake_student():
    return Student(
        id=1, names="Juan Pérez", email="juan@example.com", password="hashed_password"
    )


@pytest.fixture
def mocked_repository():
    return AsyncMock()


# --------------------- TESTS: EMAIL SENDER ---------------------


def test_send_verification_email_success():
    to_email = "student@example.com"
    verification_link = "http://example.com/verify"
    student_name = "John Doe"
    mock_response = Mock(status_code=202)

    with patch("services.utils.email_sender.settings") as mock_settings:
        mock_settings.sendgrid_api_key = "fake-api-key"
        mock_settings.sendgrid_template_id = "fake-template-id"

        with patch(
            "services.utils.email_sender.SendGridAPIClient"
        ) as mock_client, patch("services.utils.email_sender.Mail") as mock_mail:

            mock_instance = mock_client.return_value
            mock_instance.send.return_value = mock_response

            mock_mail_instance = Mock()
            mock_mail_instance.dynamic_template_data = {
                "student_name": student_name,
                "verification_link": verification_link,
                "current_year": 2025,
            }
            mock_mail.return_value = mock_mail_instance

            with patch("builtins.print") as mock_print:
                send_verification_email(to_email, verification_link, student_name)

                mock_mail.assert_called_once()
                mock_instance.send.assert_called_once()
                assert (
                    mock_mail.return_value.dynamic_template_data["student_name"]
                    == student_name
                )
                mock_print.assert_called_with(
                    f"📨 Email enviado a {to_email} (Status: 202)"
                )


def test_send_verification_email_exception():
    with patch("services.utils.email_sender.settings") as mock_settings:
        mock_settings.sendgrid_api_key = "fake-api-key"
        mock_settings.sendgrid_template_id = "fake-template-id"

        with patch("services.utils.email_sender.SendGridAPIClient") as mock_client:
            mock_client.side_effect = Exception("API Key inválida")

            with patch("builtins.print") as mock_print:
                send_verification_email("student@example.com", "link", "John")
                mock_print.assert_called_with(
                    "❌ Error al enviar correo: API Key inválida"
                )


def test_send_verification_email_invalid_email():
    with patch("services.utils.email_sender.settings") as mock_settings:
        mock_settings.sendgrid_api_key = "fake-api-key"
        mock_settings.sendgrid_template_id = "fake-template-id"

        with patch(
            "services.utils.email_sender.SendGridAPIClient"
        ) as mock_client, patch("services.utils.email_sender.Mail") as _:

            mock_instance = mock_client.return_value
            mock_instance.send.side_effect = Exception("HTTP Error 400: Bad Request")

            with patch("builtins.print") as mock_print:
                send_verification_email("", "link", "John")
                mock_print.assert_called_with(
                    "❌ Error al enviar correo: HTTP Error 400: Bad Request"
                )


# --------------------- TESTS: EMAIL VALIDATOR ---------------------


def test_is_valid_format_valid_emails():
    valid_emails = ["user@example.com", "user.name@subdomain.co.uk"]
    for email in valid_emails:
        assert EmailValidator.is_valid_format(email) is True


def test_is_valid_format_invalid_emails():
    invalid_emails = ["user@.com", "user@com", "@domain.com", "user#domain.com", ""]
    for email in invalid_emails:
        assert EmailValidator.is_valid_format(email) is False


def test_has_mx_record_with_valid_domain():
    email = "user@example.com"
    _ = "example.com"
    mock_resolve = Mock()
    mock_resolve.__iter__ = Mock(return_value=iter([Mock()]))

    with patch(
        "services.utils.email_validator.dns.resolver.resolve",
        return_value=mock_resolve,
    ):
        assert EmailValidator.has_mx_record(email) is True


def test_has_mx_record_with_invalid_domain():
    with patch(
        "services.utils.email_validator.dns.resolver.resolve",
        side_effect=Exception(),
    ):
        assert EmailValidator.has_mx_record("user@fake.com") is False


def test_validate_email_valid_case():
    email = "user@example.com"
    _ = "example.com"
    mock_resolve = Mock()
    mock_resolve.__iter__ = Mock(return_value=iter([Mock()]))

    with patch(
        "services.utils.email_validator.dns.resolver.resolve",
        return_value=mock_resolve,
    ):
        is_valid, message = EmailValidator.validate_email(email)
        assert is_valid
        assert message == "Correo válido"


def test_validate_email_invalid_format():
    is_valid, message = EmailValidator.validate_email("user@.com")
    assert not is_valid
    assert message == "Formato de correo inválido"


def test_validate_email_invalid_domain():
    with patch(
        "services.utils.email_validator.dns.resolver.resolve",
        side_effect=Exception(),
    ):
        is_valid, message = EmailValidator.validate_email("user@noexiste.com")
        assert not is_valid
        assert message == "Dominio de correo inválido"


# --------------------- TESTS: TOKEN GENERATOR ---------------------


def test_generate_verification_token_returns_string():
    mock_uuid = Mock(return_value=uuid.UUID("550e8400-e29b-41d4-a716-446655440000"))
    with patch("services.utils.token_generator.uuid.uuid4", new=mock_uuid):
        token = generate_verification_token()
        assert isinstance(token, str)
        assert token == "550e8400-e29b-41d4-a716-446655440000"


def test_generate_verification_token_unique():
    mock_uuid1 = Mock(return_value=uuid.UUID("550e8400-e29b-41d4-a716-446655440000"))
    mock_uuid2 = Mock(return_value=uuid.UUID("550e8400-e29b-41d4-a716-446655440001"))
    with patch(
        "services.utils.token_generator.uuid.uuid4",
        side_effect=[mock_uuid1.return_value, mock_uuid2.return_value],
    ):
        token1 = generate_verification_token()
        token2 = generate_verification_token()
        assert token1 != token2


# --------------------- TESTS: IDENTIFICATION SERVICE ---------------------


@pytest.mark.asyncio
async def test_verify_code_valid():
    session = AsyncMock(spec=AsyncSession)
    code = 12345
    mock_identification = Mock(id=1)
    with patch(
        "services.identification_services.IdentificationRepository.get_by_code",
        return_value=mock_identification,
    ):
        result = await IdentificationService.verify_code(session, code)
        assert isinstance(result, RegistrationResponse)
        assert result.can_register is True
        assert result.status_code == 200
        assert result.identification_id == 1


@pytest.mark.asyncio
async def test_verify_code_invalid():
    session = AsyncMock(spec=AsyncSession)
    with patch(
        "services.identification_services.IdentificationRepository.get_by_code",
        return_value=None,
    ):
        result = await IdentificationService.verify_code(session, 99999)
        assert result.can_register is False
        assert result.status_code == 404
        assert result.identification_id is None


# --------------------- TESTS: STUDENT SERVICE ---------------------


@pytest.mark.asyncio
@patch("src.usecases.student_service.EmailValidator.validate_email")
@patch(
    "src.usecases.student_service.generate_verification_token",
    return_value="fake-token",
)
@patch("src.usecases.student_service.send_verification_email")
async def test_register_student_success(
    mock_send_email,
    mock_token,
    mock_validate_email,
    mocked_repository,
    fake_student_register,
    fake_student,
):
    mock_validate_email.return_value = (True, "Valid email")
    mocked_repository.register_student.return_value = fake_student
    service = StudentService(mocked_repository)

    result = await service.register_student(fake_student_register)

    assert result == fake_student


@pytest.mark.asyncio
@patch("src.usecases.student_service.EmailValidator.validate_email")
async def test_register_student_invalid_email(
    mock_validate_email, mocked_repository, fake_student_register
):
    mock_validate_email.return_value = (False, "Email no válido")
    service = StudentService(mocked_repository)

    with pytest.raises(HTTPException):
        await service.register_student(fake_student_register)


@pytest.mark.asyncio
async def test_verify_email_success(mocked_repository):
    mocked_repository.verify_email_token.return_value = True
    service = StudentService(mocked_repository)

    result = await service.verify_email("valid-token")
    assert result == {"message": "Correo verificado con éxito"}


@pytest.mark.asyncio
async def test_verify_email_invalid_token(mocked_repository):
    mocked_repository.verify_email_token.return_value = False
    service = StudentService(mocked_repository)

    with pytest.raises(HTTPException):
        await service.verify_email("invalid-token")


@pytest.mark.asyncio
async def test_get_student_by_id_found(mocked_repository, fake_student):
    mocked_repository.get_student_by_id.return_value = fake_student
    service = StudentService(mocked_repository)

    result = await service.get_student_by_id(1)
    assert result == fake_student


@pytest.mark.asyncio
async def test_get_student_by_id_not_found(mocked_repository):
    mocked_repository.get_student_by_id.return_value = None
    service = StudentService(mocked_repository)

    result = await service.get_student_by_id(999)
    assert result is None


@pytest.mark.asyncio
async def test_valid_student_success(mocked_repository, fake_student):
    mocked_repository.valid_student.return_value = fake_student
    service = StudentService(mocked_repository)

    result = await service.valid_student("juan@example.com", "supersegura123")
    assert result == fake_student


@pytest.mark.asyncio
async def test_valid_student_invalid(mocked_repository):
    mocked_repository.valid_student.return_value = None
    service = StudentService(mocked_repository)

    result = await service.valid_student("correo@inexistente.com", "password")
    assert result is None
