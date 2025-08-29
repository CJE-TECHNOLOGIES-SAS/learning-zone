# Sistema de Manejo de Errores

Este directorio contiene todas las páginas de error de la aplicación, diseñadas para proporcionar una experiencia de usuario consistente y profesional cuando ocurren errores.

## 🚀 Características

- **Diseño consistente**: Todas las páginas de error comparten el mismo diseño base
- **Responsive**: Adaptable a todos los tamaños de pantalla
- **Animaciones**: Animaciones suaves y atractivas para mejorar la UX
- **Navegación inteligente**: Botones para ir al inicio o volver atrás
- **Manejo automático**: Redirección automática basada en códigos de error HTTP

## 📁 Estructura de Archivos

```
error/
├── styles/
│   ├── ErrorBase.css          # Estilos base comunes
│   ├── NotFound.css           # Estilos específicos para 404
│   ├── ServerError.css        # Estilos específicos para 500
│   ├── InvalidPermission.css  # Estilos específicos para 401
│   ├── UnauthorizedAccess.css # Estilos específicos para 403
│   └── WebsiteMaintenance.css # Estilos específicos para 503
├── NotFound.tsx               # Página 404
├── ServerError.tsx            # Página 500
├── InvalidPermission.tsx      # Página 401
├── UnauthorizedAccess.tsx     # Página 403
├── WebsiteMaintenance.tsx     # Página 503
├── ErrorTestPage.tsx          # Página de prueba
└── README.md                  # Este archivo
```

## 🎨 Páginas de Error Disponibles

### 401 - Permiso Inválido (`/401`)
- **Propósito**: Usuario no autenticado o sesión expirada
- **Acción**: Redirigir al login o mostrar mensaje de autenticación requerida

### 403 - Acceso No Autorizado (`/403`)
- **Propósito**: Usuario autenticado pero sin permisos suficientes
- **Acción**: Mostrar mensaje de permisos insuficientes

### 404 - Página No Encontrada (`/404`)
- **Propósito**: Ruta no existente o recurso no encontrado
- **Acción**: Catch-all para rutas no definidas

### 500 - Error del Servidor (`/500`)
- **Propósito**: Errores internos del servidor o de la aplicación
- **Acción**: Mostrar mensaje de error técnico

### 503 - Mantenimiento (`/503`)
- **Propósito**: Servicio temporalmente no disponible
- **Acción**: Informar sobre mantenimiento programado

## 🛠️ Uso

### Navegación Manual
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navegar a una página de error específica
navigate('/401');  // Permiso inválido
navigate('/403');  // Acceso no autorizado
navigate('/404');  // Página no encontrada
navigate('/500');  // Error del servidor
navigate('/503');  // Mantenimiento
```

### Uso del Hook useErrorHandler
```tsx
import { useErrorHandler } from '../../hooks/useErrorHandler';

const { handleError, handleAuthError, handleServerError } = useErrorHandler();

// Manejar errores automáticamente
try {
  // Código que puede fallar
} catch (error) {
  handleError(error); // Redirige automáticamente según el tipo de error
}

// O manejar tipos específicos
handleAuthError();     // Redirige a /401
handleServerError();   // Redirige a /500
```

### Uso del Error Boundary
```tsx
import ErrorBoundary from '../shared/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      {/* Tu aplicación aquí */}
    </ErrorBoundary>
  );
}
```

## 🧪 Pruebas

Para probar todas las páginas de error, visita `/test-errors` en tu navegador. Esta página te permitirá navegar a cada tipo de error para verificar que funcionen correctamente.

## 🎯 Personalización

### Cambiar Colores de Fondo
Modifica el archivo CSS específico de cada página:

```css
/* En NotFound.css */
.notfound-page {
  background: linear-gradient(135deg, #tu-color-1 0%, #tu-color-2 100%);
}
```

### Cambiar Animaciones
Modifica las animaciones en los archivos CSS específicos:

```css
/* En ServerError.css */
.server-error-animation {
  animation: tu-animacion 2s ease-in-out infinite;
}

@keyframes tu-animacion {
  /* Define tu animación aquí */
}
```

### Agregar Nuevas Páginas de Error
1. Crea el componente React en `error/`
2. Crea el archivo CSS en `error/styles/`
3. Agrega la ruta en `src/routers/Errors.tsx`
4. Importa y usa el CSS base: `@import './ErrorBase.css';`

## 🔧 Configuración

### Rutas
Las rutas de error están configuradas en `src/routers/Errors.tsx` y se importan tanto en las rutas públicas como privadas.

### Layouts
- **Rutas públicas**: Usan `PublicLayout`
- **Rutas privadas**: Usan `AuthLayout`

### Catch-all 404
La ruta `*` captura todas las rutas no definidas y redirige a la página 404.

## 📱 Responsive Design

Todas las páginas de error son completamente responsivas y se adaptan a:
- Dispositivos móviles (320px+)
- Tablets (768px+)
- Escritorio (1024px+)

## 🎨 Temas y Colores

El sistema utiliza un esquema de colores consistente:
- **Primario**: Gradientes azules y púrpuras
- **Secundario**: Gradientes rojos y naranjas
- **Accent**: Gradientes suaves y pasteles

## 🚨 Solución de Problemas

### Página no se muestra correctamente
1. Verifica que el CSS base esté importado
2. Asegúrate de que las clases CSS coincidan con el JSX
3. Revisa la consola del navegador para errores

### Navegación no funciona
1. Verifica que las rutas estén correctamente configuradas
2. Asegúrate de que el componente use `useNavigate` correctamente
3. Revisa que no haya conflictos con otras rutas

### Estilos no se aplican
1. Verifica la importación del CSS
2. Asegúrate de que las clases CSS estén definidas
3. Revisa que no haya conflictos con otros estilos

## 📚 Recursos Adicionales

- [React Router Documentation](https://reactrouter.com/)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
