// src/modules/teacher/mySpace/manageStudents/components/RegisterStudent.tsx
import { useState } from 'react';
import '../styles/RegisterStudent.css';
import { useManageStudents } from '../hook/useManageStudents';

export default function RegisterStudent() {
    const [numberId, setNumberId] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
     const {registerStudent}  = useManageStudents()


    const MAX_LEN = 10;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, MAX_LEN);
        setNumberId(value);
        if (error) setError(null);
    };

  const validate = (value: string) => {
    if (!value) return 'El número de identificación es obligatorio.';
    if (value.length !== MAX_LEN) return `Debe tener exactamente ${MAX_LEN} dígitos.`;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validate(numberId);
    if (validationError) {
      setError(validationError);
      return;
    }
    await registerStudent(Number(numberId));
    setNumberId('');
    }
  return (
    <form
      className="dmin-register-student-form"
      onSubmit={handleSubmit}
    >
      <h2 className="admin-register-title">Registrar estudiante</h2>

      <div className="admin-register-input-container">
        <input
          type="text"
          id="number_identification"
          inputMode="numeric"
          value={numberId}
          onChange={handleChange}
          className={`admin-register-input ${numberId ? 'has-content' : ''}`}
          placeholder=" "
          maxLength={MAX_LEN}
        />
        <label
          htmlFor="number_identification"
          className="admin-register-label"
        >
          N° de identificación
        </label>
        {error && <span className="error admin-register-error">{error}</span>}
      </div>

      <input
        className="btn-register-admin-submit"
        type="submit"
        value={loading ? 'Registrando...' : 'Registrar'}
        disabled={loading}
      />
    </form>
  );
}
