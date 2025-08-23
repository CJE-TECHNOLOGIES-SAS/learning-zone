# Sistema de Temas - Variables CSS para Backgrounds

## Descripción
Este sistema proporciona variables CSS para todos los backgrounds de la aplicación en modo claro.

## Cómo usar

### 1. Variables CSS Disponibles

#### Fondos Principales
```css
.my-component {
  background-color: var(--bg-primary);        /* Fondo principal */
  background-color: var(--bg-secondary);      /* Fondo secundario */
  background-color: var(--bg-tertiary);       /* Fondo terciario */
}
```

#### Fondos de Tarjetas y Contenedores
```css
.card {
  background-color: var(--bg-card);           /* Fondo de tarjeta */
  background-color: var(--bg-container);      /* Fondo de contenedor */
  background-color: var(--bg-modal);          /* Fondo de modal */
  background-color: var(--bg-overlay);        /* Fondo de overlay */
}
```

#### Fondos de Secciones
```css
.header {
  background-color: var(--bg-header);         /* Fondo del header */
  background-color: var(--bg-footer);         /* Fondo del footer */
  background-color: var(--bg-sidebar);        /* Fondo del sidebar */
  background-color: var(--bg-navbar);         /* Fondo del navbar */
}
```

#### Fondos de Formularios
```css
.input {
  background-color: var(--bg-input);          /* Fondo de input */
}

.button {
  background-color: var(--bg-button);         /* Fondo de botón */
}

.button:hover {
  background-color: var(--bg-button-hover);   /* Fondo de botón hover */
}
```

#### Fondos de Estado
```css
.success {
  background-color: var(--bg-success);        /* Fondo de éxito */
}

.warning {
  background-color: var(--bg-warning);        /* Fondo de advertencia */
}

.error {
  background-color: var(--bg-error);          /* Fondo de error */
}

.info {
  background-color: var(--bg-info);           /* Fondo de información */
}
```

#### Fondos con Gradientes
```css
.hero {
  background: var(--bg-gradient-primary);     /* Gradiente primario */
}

.section {
  background: var(--bg-gradient-secondary);   /* Gradiente secundario */
}

.success-section {
  background: var(--bg-gradient-success);     /* Gradiente de éxito */
}
```

### 2. Clases de Utilidad

También puedes usar las clases predefinidas:

```css
<div className="bg-primary">Fondo principal</div>
<div className="bg-card">Fondo de tarjeta</div>
<div className="bg-gradient-primary">Gradiente primario</div>
```



## Estructura de Archivos

```
shared/
├── theme/
│   ├── Colors.css                # Variables CSS de colores
│   └── README.md                 # Esta documentación
```

## Notas Importantes

- **Solo backgrounds**: Este sistema está diseñado solo para fondos
- **Variables CSS**: Usa variables CSS nativas para mejor rendimiento
- **Responsive**: Funciona en todos los dispositivos
