# Chat Service - Sistema de Filtrado de Contenido

## 🚫 Filtro de Palabras Prohibidas

Este servicio implementa un sistema de filtrado automático para detectar y bloquear mensajes que contengan lenguaje inapropiado o groserías.

### 🔧 Cómo Funciona

1. **Detección Automática**: Cada mensaje enviado al chat pasa por el filtro antes de ser procesado
2. **Bloqueo Inteligente**: Los mensajes que contengan palabras prohibidas son bloqueados inmediatamente
3. **Notificación al Usuario**: El frontend recibe una notificación de que el mensaje fue bloqueado
4. **Sin Almacenamiento**: Los mensajes bloqueados NO se guardan en la base de datos

### 📝 Palabras Prohibidas

El sistema incluye una lista predefinida de palabras inapropiadas en español:

```typescript
const BAD_WORDS = [
  "groseria1", "groseria2", "tonto", "idiota", "estupido", "imbecil",
  "pendejo", "hijo de puta", "puta", "mierda", "carajo", "coño",
  "verga", "pendeja", "huevon", "huevona", "gilipollas", "cabron",
  "cabrona", "malparido", "malparida", "hijueputa", "gonorrea",
  "marica", "maricon", "maricona", "lesbiana", "gay", "puto",
  "puta", "perra", "perro", "zorra", "zorro", "bastardo", "bastarda"
];
```

### 🔄 Flujo de Filtrado

#### 1. Nuevo Comentario
```
Usuario escribe → Socket recibe → Filtro verifica →
├─ Si es apropiado → Se envía al backend → Se guarda en BD
└─ Si es inapropiado → Se bloquea → Se notifica al usuario
```

#### 2. Actualización de Comentario
```
Usuario edita → Socket recibe → Filtro verifica →
├─ Si es apropiado → Se actualiza en el backend
└─ Si es inapropiado → Se bloquea → Se notifica al usuario
```

### 📡 Eventos del Socket

#### `commentBlocked`
Cuando un mensaje es bloqueado, se emite este evento:

```typescript
socket.emit('commentBlocked', {
  message: 'Comentario eliminado por contenido inapropiado',
  originalText: 'texto original del usuario',
  timestamp: '2024-01-01T12:00:00.000Z'
});
```

### 🎨 Frontend - Visualización

En el frontend, los comentarios bloqueados se muestran como:

- **Componente especial**: `BlockedComment.tsx`
- **Estilo distintivo**: Fondo rojo suave con ícono 🚫
- **Mensaje claro**: "Comentario eliminado por contenido inapropiado"
- **Sin interacción**: No se puede responder ni editar

### ⚙️ Configuración

#### Agregar Nuevas Palabras Prohibidas
Edita el array `BAD_WORDS` en `src/socket.ts`:

```typescript
const BAD_WORDS = [
  // ... palabras existentes
  "nueva_palabra_prohibida"
];
```

#### Personalizar Mensajes
Modifica los mensajes en la función `sanitizeMessage`:

```typescript
socket.emit('commentBlocked', {
  message: 'Tu mensaje personalizado aquí',
  originalText: text,
  timestamp: new Date().toISOString()
});
```

### 🧪 Testing

Para probar el filtro:

1. **Inicia el servidor**: `npm run dev`
2. **Conecta al chat** desde el frontend
3. **Escribe una palabra prohibida** en el chat
4. **Verifica** que aparezca "Comentario eliminado"

### 🔒 Seguridad

- **Filtrado del lado del servidor**: No se puede evadir desde el frontend
- **Sin almacenamiento**: Los mensajes inapropiados nunca se guardan
- **Logging**: Se registra cada mensaje bloqueado en la consola del servidor
- **Configuración centralizada**: Fácil de mantener y actualizar

### 📚 Dependencias

- `socket.io` - Para la comunicación en tiempo real
- `axios` - Para las llamadas al backend
- `dotenv` - Para variables de entorno

### 🚀 Uso

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor
npm run dev
```

El servidor estará disponible en `http://localhost:3001` (o el puerto configurado en `.env`).
