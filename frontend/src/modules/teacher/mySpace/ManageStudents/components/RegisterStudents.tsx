// src/modules/teacher/mySpace/ManageStudents/components/RegisterStudents.tsx
import { useState } from 'react';
import '../styles/RegisterStudents.css';
import { useManageStudents } from '../hook/useManageStudents';
type Props = {
  onToggleOpcRegisterStudent: () => void; // cierra el panel externo
};
export default function RegisterStudents({onToggleOpcRegisterStudent}:Props) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { registerStudentsFile } = useManageStudents();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
        if (error) setError(null);
    };

    const validateFile = (file: File | null) => {
        if (!file) return 'Debe seleccionar un archivo.';

        const allowedExtensions = ['.docx', '.xlsx', '.txt'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        if (!allowedExtensions.includes(fileExtension)) {
            return 'Solo se permiten archivos .docx, .xlsx o .txt';
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return 'El archivo no debe superar los 5MB';
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            return;
        }

        await registerStudentsFile(selectedFile!);
        onToggleOpcRegisterStudent()
    };

    return (
        <div className="register-students-container">
            <form
                className="admin-register-student-form"
                onSubmit={handleSubmit}
            >
                <h2 className="admin-register-title">Registrar estudiantes por archivo</h2>
                {/* File type options with hover images */}
                <div className="file-types-container">
                    <h3>Tipos de archivo soportados:</h3>
                    <div className="file-types-options">
                        <span
                            className="file-type-option docx-option"
                            title="Documento de Word"
                        >
                            .docx
                        </span>
                        <span
                            className="file-type-option xlsx-option"
                            title="Hoja de cálculo de Excel"
                        >
                            .xlsx
                        </span>
                        <span
                            className="file-type-option txt-option"
                            title="Archivo de texto plano"
                        >
                            .txt
                        </span>
                    </div>
                </div>

                <div className="admin-register-input-container">
                    <input
                        type="file"
                        id="file_upload"
                        accept=".docx,.xlsx,.txt"
                        onChange={handleFileChange}
                        className={`admin-register-input ${selectedFile ? 'has-content' : ''}`}
                        placeholder=" "
                    />

                    {selectedFile && (
                        <span className="selected-file-name">
                            {selectedFile.name}
                        </span>
                    )}
                    {error && <span className="error admin-register-error">{error}</span>}
                </div>


                <input
                    className="btn-register-admin-submit"
                    type="submit"
                    value={loading ? 'Procesando...' : 'Registrar estudiantes'}
                    disabled={loading || !selectedFile}
                />
            </form>
        </div>
    );
}
