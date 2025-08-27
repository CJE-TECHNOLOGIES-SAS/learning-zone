import { useEffect } from 'react';
import { useNavigationHandler } from '../../../hooks/useNavigationHandler';
import { authStorage } from '../../../shared/Utils/authStorage';
import useRecoverPassword from '../Hooks/useRecoverPassword';
import '../Styles/RequestPassword.css'
import toast from 'react-hot-toast';
import { IoArrowBackCircleSharp } from 'react-icons/io5';

export default function Requestpasswords() {
  const {
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    errors,
    handleSubmitRequestPasswords,
    loading
  } = useRecoverPassword();

  const handleBtnNavigate = useNavigationHandler();
  const password_token = authStorage.getRequestEmailToken();

useEffect(() => {
    if (!password_token) {
      toast.error('¡Acceso denegado! Por favor solicita el enlace de recuperación.');
      handleBtnNavigate('/emailNewPassword');
    }
  }, [password_token, handleBtnNavigate]);

  return (
    <form className='form-password-request' onSubmit={handleSubmitRequestPasswords}>
    {/* Botón de regreso */}
    <button
      type="button"
      className="btn-back-password-request"
      onClick={() => handleBtnNavigate('/')}
    >
      <IoArrowBackCircleSharp />
    </button>

      <h2 className='title-request-password'>Ingresa tu nueva contraseña</h2>
      <div className="container-label-input-p">
        <input
          type="password"
          id="password"
          className={password ? 'has-content' : ''}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <div className="container-label-input-p">
        <input
          type="password"
          id="confirmpassword"
          className={confirmPassword ? 'has-content' : ''}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <label htmlFor="confirmpassword">Confirm Password</label>
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
      </div>

       <button
            className={`btn-confirm-request`}
            type="submit"
            disabled={loading}>
            {loading ? 'Verificando…' :'Verificar'}
          </button>
    </form>
  );
}
