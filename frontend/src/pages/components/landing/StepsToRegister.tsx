import { useEffect } from 'react';
import Magnet from '../../../shared/animations/AnimationMagnet'
import Stepper, { Step } from '../../../shared/animations/AnimationStepper';
import './styles/StepsToRegister.css'
import '../../../../node_modules/aos/dist/aos.css'
import AOS from 'aos';


export default function StepsToRegister() {

    useEffect(() => {
      AOS.init({
        duration: 1000,
        once: false, // solo una vez
      });

      setTimeout(() => {
        AOS.refresh(); // recalcula los elementos visibles
      }, 100);
    }, []);
  return (
    <div data-aos="fade-down" className='section-steps-register'>
        <section className='title-section-steps'>
            <h2>¿ Aun no tienes Cuenta?</h2>
            <p className='paragrap-steps-title'>Y estas en el grado 11°</p>
        </section>
            <Stepper  data-aos="zoom-out-up"
            initialStep={1}
            onStepChange={(step) => {
                console.log(step);
            }}
            onFinalStepCompleted={() => console.log("All steps completed!")}
            backButtonText="Atras"
            nextButtonText="Siguiente"
            >
                <Step>
                    <Magnet padding={50} disabled={false} magnetStrength={50}>
                            <h3 className='description-step'>Paso 1: Ingresa tu documento de identidad en el formulario de registro. Luego, completa los siguientes datos personales: nombre, apellido, correo electrónico y contraseña.
                              Este paso crea tu perfil dentro del aplicativo.</h3>
                    </Magnet>
                </Step>
                <Step>
                    <Magnet padding={50} disabled={false} magnetStrength={50}>
                            <h3 className='description-step'> Paso 2:
                              Recibirás un mensaje en tu correo electrónico con un enlace de verificación. Haz clic en el enlace para confirmar tu cuenta y habilitar el acceso.</h3>
                    </Magnet>
                </Step>
                <Step>
                    <Magnet padding={50} disabled={false} magnetStrength={50}>
                            <h3 className='description-step'>Paso 3:
                              Una vez confirmada tu cuenta, serás redirigido automáticamente al inicio del aplicativo. Desde allí podrás comenzar tus cursos y explorar todos los contenidos disponibles.</h3>
                    </Magnet>
                </Step>

            </Stepper>














    </div>
  )
}
