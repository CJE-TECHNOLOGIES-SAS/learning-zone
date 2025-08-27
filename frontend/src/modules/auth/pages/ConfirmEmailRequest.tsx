// Page que se encargar de mostrar dicho mensaje el cual indique se esta esperando que se clickee en el link que se envio al correo
import '../Styles/ConfirmEmail.css'
import { useNavigationHandler } from '../../../hooks/useNavigationHandler'
import { useEffect, useMemo } from 'react'
import DecayCard from '../../../shared/animations/DecayCard'
import { IoArrowBackCircleSharp } from 'react-icons/io5'
import { authStorage } from '../../../shared/Utils/authStorage'
import useConfirmEmailRequest from '../Hooks/useConfirmEmailRequest'
// --- util para enmascarar el correo ---
function maskEmail(email: string, visibleTail: number = 3, keepPrefix: number = 6): string {
  if (!email || !email.includes('@')) return email || '';

  const [user, domain] = email.split('@');

  // prefijo visible (hasta keepPrefix, si el user es más corto se ajusta)
  const prefix = user.slice(0, keepPrefix);

  // cuántos caracteres ocultar en el medio
  const middleLen = Math.max(user.length - keepPrefix - visibleTail, 0);

  // parte final visible
  const tail = user.slice(-visibleTail);

  const maskedUser = `${prefix}${'*'.repeat(middleLen)}${tail}`;
  return `${maskedUser}@${domain}`;
}
export default function ConfirmEmailRequest() {

    const {message,success} = useConfirmEmailRequest()
    const handleBtnNavigate = useNavigationHandler()

    // traer email del localstorage
    const email = authStorage.getEmail()
      // memorizamos el email modificado para no recalcular cada render
    const emailModify = useMemo(() => maskEmail(email!, 3, 6), [email]);

    useEffect(()=>{
        if(success){
            // Almacenar en el localstorage
            const timeOuth = setTimeout(()=>{
                handleBtnNavigate('/newPassword'); // forzar el render


            },2000)

            return () => clearTimeout(timeOuth);
        }

    },[success, handleBtnNavigate])



  return (
    <div className='container-confirm-email'>
                <DecayCard  width={1000} height={600} image="">
                    <div className="container-information-confirm">
                        <button className="btn-back-confirm" onClick={()=>handleBtnNavigate('/back')}>{<IoArrowBackCircleSharp/>}</button>
                        <h2 className='title-container-confim-email'>Confirmacion De cuenta</h2>
                        <p className='paragraph-description-confirm'>Hemos enviado un mensaje a tu correo electrónico <span>{emailModify}</span>.
                        Por favor, dirígete a tu bandeja de entrada y haz clic en el enlace de confirmación para verificar tu cuenta.</p>
                        {success && <p className='success-message'>{message}</p>}

                        {!success &&  message && <p>{message}</p>} {/* Mostrar error generico */}
                    </div>
                </DecayCard>


    </div>
  )
}
