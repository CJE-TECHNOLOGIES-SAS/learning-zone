import useFormUpdateStudent from '../hooks/useFormUpdateStudent'
import '../Styles/UpdateInformation.css'
export default function UpdateInformation() {
  const { numIdentification, email, newName, newLastNames, setNewName, setNewLastNames, handleSubmitUpdate, errors } = useFormUpdateStudent()
  return (
    <form className='form-update' onSubmit={(e) => handleSubmitUpdate(e)}>
      <h3 className="title-form-update">Actualizate Aqui!</h3>

      <div className="container-label-input-u">
        <label htmlFor="nIdentification">N identificación</label>
        <input
          type="text"
          id="nIdentification"
          value={numIdentification}
          className={numIdentification ? 'has-content' : ''}
          readOnly
        />
      </div>

      <div className="container-label-input-u">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          value={newName}
          className={newName ? 'has-content' : ''}
          onChange={(e) => setNewName(e.target.value)} />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div className="container-label-input-u">
        <label htmlFor="lastName">lastName</label>
        <input
          type="text"
          id="lastName"
          value={newLastNames}
          className={newLastNames ? 'has-content' : ''}
          onChange={(e) => setNewLastNames(e.target.value)} />
        {errors.lastNames && <span className="error">{errors.lastNames}</span>}
      </div>
      <div className="container-label-input-u">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          className={email ? 'has-content' : ''}
          readOnly
        />
      </div>
      <input className="btn-update" type="submit" value={'Update'} />

    </form>
  )
}
