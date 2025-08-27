// BlockedComment.tsx
// Componente que muestra cuando un comentario fue bloqueado por contenido inapropiado

import './styles/BlockedComment.css';

interface BlockedCommentProps {
  timestamp: string;
  userName: string;
}

export default function BlockedComment({ timestamp, userName }: BlockedCommentProps) {
  // Formatear la fecha del comentario bloqueado
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="blocked-comment">
      <div className="blocked-comment-header">
        <span className="blocked-user-name">{userName}</span>
        <span className="blocked-timestamp">{formatTimestamp(timestamp)}</span>
      </div>

      <div className="blocked-comment-content">
        <div className="blocked-icon">🚫</div>
        <div className="blocked-message">
          <span className="blocked-text">Comentario eliminado</span>
          <span className="blocked-reason">por contenido inapropiado</span>
        </div>
      </div>

      <div className="blocked-comment-footer">
        <small className="blocked-note">
          Este mensaje no se pudo enviar debido a que contenía lenguaje inapropiado.
        </small>
      </div>
    </div>
  );
}
