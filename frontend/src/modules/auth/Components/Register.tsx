// Componente que renderiza el register
import '../Styles/Register.css'
/* import { GrFormViewHide, GrView } from 'react-icons/gr'; */
import { CircleLoader } from 'react-spinners';
import useFormRegister from '../Hooks/useFormRegister';
import { useEffect } from 'react';


export default function Register() {

  const {
  nIdentification,
  setNIdentification,
  handleSubmitRegisterVerify,
  formVerify,
  name,
  setName,
  lastNames,
  setLastNames,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  handleSubmitRegister,
  loading,
  errors,
  viewSucessMessage,

} = useFormRegister()


useEffect(() => {
  if (viewSucessMessage) {
    const timeout = setTimeout(() => {
      window.location.href = '/confirmEmailRegister';
    }, 3000);

    return () => clearTimeout(timeout); // limpieza si desmonta antes
  }
}, [viewSucessMessage]);

  return (
    <>
      {formVerify ?
      <form onSubmit={(e)=>handleSubmitRegisterVerify(e)} className="form-register">
        <h2 className='title-register'>Sign Up</h2>

        <div className="container-label-input-r">
          <input
            type="text"
            id='nIdentification'
            className={nIdentification? 'has-content':''}
            onChange={(e)=>{setNIdentification(Number(e.target.value))}}/>
            <label htmlFor="nIdentification">N Identificacion</label>
        </div>
        <button
            className={`btn-verify-register`}
            type="submit"
            disabled={loading}>
            {loading ? 'Verificando…' :'Verificar'}
        </button>
        {loading && <CircleLoader color="#fff" loading={loading}/>}
      </form>
      :
      <>
        <div style={{ position: 'relative' }}>
          {/* form Register  */}
          <form onSubmit={(e)=>handleSubmitRegister(e)} className="form-register">
            <h2 className='title-register'>Sign Up</h2>
            <div className="container-label-input-r">
              <input
                type="text"
                id="name"
                value={name}
                className={name? 'has-content':''}
                onChange={(e)=>setName(e.target.value)}/>
              <label htmlFor="name">Name</label>
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="container-label-input-r">
              <input
                type="text"
                id="lastName"
                value={lastNames} // Controla el valor
                className={lastNames? 'has-content':''}
                onChange={(e)=>setLastNames(e.target.value)}/>
              <label htmlFor="lastName">LastName</label>
              {errors.lastNames && <span className="error">{errors.lastNames}</span>}
            </div>
            <div className="container-label-input-r">
              <input
                type="email"
                id="email"
                className={email ? 'has-content' : ''} // Añade clase si tiene contenido
                value={email} // Controla el valor
                onChange={(e) => setEmail(e.target.value)} />
              <label htmlFor="email">Email</label>
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="container-label-input-r">
              <input
                type={'password'}
                id='password'
                className={password? 'has-content':''}
                value={password} // Controla el valor
                onChange={(e) => setPassword(e.target.value)} />
              <label htmlFor="password">Password</label>
              {errors.password && <span className="error">{errors.password}</span>}
            </div>


            <div className="container-label-input-r">
              <input
                type={'password'}
                id='confirmpassword'
                className={confirmPassword? 'has-content':''}
                value={confirmPassword} // Controla el valor
                onChange={(e) => setConfirmPassword(e.target.value)}
                />
              <label htmlFor="confirmpassword">Confirm Password</label>
              {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              {/* <span className='icon-show' onClick={togglePasswordVisibility}>
                {showPassword ? <GrView /> : <GrFormViewHide />}
              </span> */}
            </div>
            <button
                className={`btn-verify-register`}
                type="submit"
                disabled={loading}>
                {loading ? 'Registrando...' :'Registrar'}
            </button>
            {loading && <CircleLoader color="#fff"  loading={loading}/>}
          </form>

        </div>


      </>
    }
    </>
  )
}
