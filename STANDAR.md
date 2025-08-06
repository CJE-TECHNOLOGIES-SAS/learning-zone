# ✨ Estándar entre Backend y Frontend

## 🔁 Rutas - Flujo General

* **Prefijo Backend:** `/api/v1/student`

---

## 🛠️ Actualizar Perfil

### 📤 Flujo de comunicación:

1. **Frontend**:

   * Envía un **token de acceso** en el encabezado `Authorization`.
   * Incluye un **JSON** en el body con la información a actualizar.

2. **Backend**:

   * **Valida el token** recibido.
   * Si el token es **válido**, actualiza los datos del estudiante.
   * Retorna un **código de estado HTTP** y un **mensaje** según el resultado de la operación.

3. **En caso de error**:

   * El backend responde con un código de estado acorde al tipo de error.
   * **No se actualiza la información del estudiante.**

4. **Respuesta del Frontend**:

   * Espera el código de estado y mensaje.
   * Si recibe un **200 OK**, ejecuta el microservicio que envía nuevamente el `access_token` al backend.
   * Espera como respuesta la **información del estudiante actualizada**, siempre y cuando no ocurra ningún error.

---

## 🧭 Rutas

| Función          | Ruta              | Método |
| ---------------- | ----------------- | ------ |
| Backend (API)    | `/update-profile` | `PUT`  |
| Frontend (vista) | `/profile`        | -      |

---

## 📨 Parámetros Esperados

* **Header:** `Authorization: Bearer <access-token>`
* **Body:** JSON con los datos del estudiante a actualizar

---

## 📥 Respuesta esperada

* **Código de estado HTTP** (`200`, `400`, `401`, etc.)
* **Mensaje** explicativo del resultado

---

## ⏳ Datos que se modificaran:

* **Nombres**
* **Apellidos**

## ⏳ Datos que no se modificaran:
* **correo**
* **n° identificación**
---
## 🛠️ Notificaciones

### 📤 Flujo de comunicación:

1. **Frontend**:

   * Envía un **token de acceso** en el encabezado `Authorization`.

2. **Backend**:

   * **Valida el token** recibido.
   * Si el token es **válido**, busca las notificaciones asociadas al estudiante.
   * Retorna un **código de estado HTTP** y todas las notificaciones asociadas.

3. **En caso de error - Backend**:

   * El backend responde con un código de estado acorde al tipo de error y un mensaje.

4. **Respuesta del Frontend**:

   * Espera el código de estado y una lista de notificaciones(array).
   * Si el resultado es exitoso (`200 OK`), se renderizan todas las notificaciones(asociadas).

5. **En caso de error - Frontend**
    * Renderiza mensaje segun el error.
---

## 🧭 Rutas

| Función          | Ruta              | Método          |
| ---------------- | ----------------- | --------------- |
| Backend (API)    | `/notifications`  | `get`           |
| Frontend (vista) | `/notifications`  | `get`           |

---

## 📨 Parámetros Esperados

* **Header:** `Authorization: Bearer <access-token>`

---

## 📥 Respuesta esperada
* **Código de estado HTTP:** `200`
* **Lista(Array):** `list_notifications`
---











## 🛠 Cursos

### 📤 Flujo de comunicación:

## Ruta cursos estudiante

1. **Frontend**:
   * Envía un **token de acceso** en el encabezado `Authorization`.

2. **Backend**:

   * **Valida el token** recibido.
   * Si el token es **válido**, retorna los cursos.
   * Retorna un **código de estado HTTP** y un **mensaje** según el resultado de la operación.

3. **En caso de error**:

   * El backend responde con un código de estado acorde al tipo de error.
   * **No se retornan los cursos.**

4. **Respuesta del Frontend**:

   * Espera el código de estado, mensaje, y los cursos.
   * Si recibe un **200 OK**,  renderiza los cursos en el home
---

## 🧭 Rutas

| Función          | Ruta              | Método |
| ---------------- | ----------------- | ------ |
| Backend (API)    | `/course`         | `GET`  |
| Frontend (vista) | `/course`         | -GET   |

---

## 📨 Parámetros Esperados

* **Header:** `Authorization: Bearer <access-token>`

## 📥 Respuesta esperada

* **Código de estado HTTP** (`200`, `400`, `401`, etc.)
* **Mensaje** explicativo del resultado
* **Cursos** (excel, word,powerPoint)

---


## Ruta lecciones curso

1. **Frontend**:
   * Envía un **token de acceso** en el encabezado `Authorization`.
   * Envia el id del curso por parametro de ruta

2. **Backend**:

   * **Valida el token** recibido.
   * Si el token es **válido** y el id del curso tambien,
   * Retorna un **código de estado HTTP**, un **mensaje** según el resultado de la operación y las **lecciones** de dicho curso..

3. **En caso de error**:

   * El backend responde con un código de estado acorde al tipo de error.
   * **No se retornan las lecciones del curso.**

4. **Respuesta del Frontend**:

   * Espera el código de **estado**, **mensaje***, y las **lecciones**.
   * Si recibe un **200 OK**,  renderiza las lecciones en el apartado del curso
---

## 🧭 Rutas

| Función          | Ruta                              | Método |
| ---------------- | -----------------                 | ------ |
| Backend (API)    | `/api/courses/{id_course}/lessons`| `GET`  |
| Frontend (vista) | `/api/courses/{id_course}/lessons`| -GET   |

---

## 📨 Parámetros Esperados

* **Header:** `Authorization: Bearer <access-token>`
* **Query parameter** `{id_course}`

## 📥 Respuesta esperada

* **Código de estado HTTP** (`200`, `400`, `401`, etc.)
* **Mensaje** explicativo del resultado
* **lecciones** (leccion1, leccion2,leccion3 ...)
lessons {
   id_lesson,
   name,
   estado
}

---

## Ruta contenido leccion

1. **Frontend**:
   * Envía un **token de acceso** en el encabezado `Authorization`.
   * Envia el id del curso y leccion por parametro de ruta

2. **Backend**:

   * **Valida el token** recibido.
   * Si el token es **válido** y el id del curso y de leccion tambien,
   * Retorna un **código de estado HTTP**, un **mensaje** según el resultado de la operación y el **contenido** de dicha leccion..

3. **En caso de error**:

   * El backend responde con un código de estado acorde al tipo de error.
   * **No se retorna el contenido de la leccion**

4. **Respuesta del Frontend**:

   * Espera el código de **estado**, **mensaje***, y el **contenido**.
   * Si recibe un **200 OK**,  renderiza el contenido en el apartado del la leccion
---

## 🧭 Rutas

| Función          | Ruta                                              | Método |
| ---------------- | ------------------------------------------------- | ------ |
| Backend (API)    | `/courses/{id_course}/lessons/{id_lesson}/content`| `GET`  |
| Frontend (vista) | `/courses/{id_course}/lessons/{id_lesson}/content`| -GET   |

---

## 📨 Parámetros Esperados

* **Header:** `Authorization: Bearer <access-token>`
* **Query parameter** `/courses/{id_course}/lessons/{id_lesson}`

## 📥 Respuesta esperada

* **Código de estado HTTP** (`200`, `400`, `401`, etc.)
* **Mensaje** explicativo del resultado
* **contenido** (contenido)
content {
   id,
   content_type,
   content,
   text
}

---




# Estándar de Evaluación de Lecciones

## **Flujo General – Evaluación de Lección**

1. **Frontend:**
   - Envía un **token de acceso** en el header `Authorization: Bearer <token>`.
   - Llama a la ruta `/courses/{id_course}/lessons/{id_lesson}/evaluation}`.
   - Si es **GET**, obtiene la pregunta (para renderizarla).
   - Si es **POST**, envía la **respuesta del estudiante** y el tipo de pregunta.

2. **Backend (GET – Mostrar Evaluación):**
   - Valida el token y los IDs (`id_course`, `id_lesson`).
   - Busca la pregunta de la evaluación en la base de datos.
   - Retorna:
     ```json
     {
       "status": 200,
       "message": "Evaluación obtenida con éxito",
       "evaluation": {
         "id_evaluation": 12,
         "question": "¿Qué es una celda en Excel?",
         "question_type": "open_question",   // o "multiple_choice"
         "options": ["Opción A", "Opción B", "Opción C"]  // Solo si es multiple_choice
       }
     }
     ```

3. **Frontend (Renderiza):**
   - Si la pregunta es de **opción múltiple**, muestra las opciones.
   - Si es de **respuesta abierta**, muestra un campo de texto.
   - Recoge la respuesta y hace un **POST** a la misma ruta: /courses/{id_course}/lessons/{id_lesson}/evaluation/{id_evaluation} con:
     ```json
     {
       "response": "Respuesta del estudiante",
       "question_type": "open_question"  // o "multiple_choice"
     }
     ```

4. **Backend (POST – Validación de Respuesta):**
   - Valida el token y los IDs.
   - Si es:
     - **Pregunta abierta: open_question**
       - Consulta la pregunta en la base de datos.
       - Envía la pregunta y la respuesta del estudiante a GPT (modelo).
       - El modelo devuelve algo como:
         ```json
         { "score": 82, "is_pass": true }
         ```
       - Si `is_pass` es `true`:
         - Marca la lección actual como `complete` y la siguiente como `in_progress`.
         - Guarda en `Student_answer`:
           - `student_id` (del token)
           - `evaluation_id`
           - `respuesta del estudiante`
           - `score` (sumandole la del modelo)
           - `fecha actual`.
         - Retorna `200 OK` con el resultado (score) y un mensaje. Basicamente la estructura de ´score´
       - Si `is_pass` es `false`:
         - Retorna `400 Bad Request` con `message: "Respuesta incorrecta"`.
     - **Pregunta de opción múltiple:**
       - Compara la respuesta enviada con la respuesta guardada en la base de datos.
       - Si es correcta:
         - Marca progreso (`complete` / `in_progress`) la leccion actual en complete y la siguiente en in_progress.
         - Guarda en `Student_answer` con `score: 100`. para las preguntas de opcion multiple, si pasa el score es 100
         - Retorna `200 OK` con el resultado (score) y un mensaje. (estructura ´score´)
       - Si es incorrecta:
         - Retorna `400 Bad Request` con `message: "Respuesta incorrecta"`.

3. **En caso de error**:

   * El backend responde con un código de estado acorde al tipo de error.
   * **No se retorna la estructura ´score´**

4. **Respuesta del Frontend**:

   * Espera el código de **estado**, **mensaje**, y la **evaluacion**.
   * Si recibe un **200 OK**,  renderiza la evaluacion en el apartado del la leccion
---
   * para la segunda parte tomaria los datos de la estructura ´score´ y los renderiza demostrando que el estudiante si paso la evaluación

## **Parámetros y Respuestas**

- **Header:** `Authorization: Bearer <token>`
- **Ruta:** `/courses/{id_course}/lessons/{id_lesson}/evaluation/{id_evaluation}`

### **Respuestas posibles**
- `200 OK`: Evaluación exitosa (devuelve `evaluation` o resultado de validación con la esctructura ´score´).
- `400 Bad Request`: Respuesta incorrecta.
- `401 Unauthorized`: Token inválido o no presente.
- `404 Not Found`: Curso o lección o evaluación no encontrada.

---

## **Estructura de `score`**

- **Para opción múltiple y pretunta abierta:**
  ```json
  {
    "status": 200,
    "message": "evaluacion pasada con exito"
    "score": {
      "old_score": 100,
      "new_score": 180,
      "date": 3-20-2025 3:53 pm
    }
  }
el old_score sera la sumatoria de todos los puntajes en las evaluaciones
el new_score sera esa sumatoria mas el puntaje obtenido en la evaluacion actual

## **Estructura de `evaluation`**

- **Para opción múltiple:**
  ```json
  {
    "id_evaluation": 1,
    "question": "¿Qué hace Excel?",
    "question_type": "multiple_choice",
    "options": ["Calcular datos", "Editar videos", "Enviar correos"]
  }


## 📝 Comentarios (Chat de Cursos)

### 📤 Flujo de comunicación general

1. **Frontend:**
   - Obtiene el token de acceso del usuario autenticado.
   - Solicita la lista de todos los estudiantes (REST, `/api/v1/student/all` o similar) para mostrar en el panel de usuarios del chat.
   - Se conecta al chat-service vía WebSocket (socket.io) y emite el evento `join` con el nombre del estudiante y el `courseId`.
   - Escucha eventos:
     - `commentList`: Recibe la lista de comentarios del curso.
     - `listStudentsConnects`: Recibe la lista de IDs de estudiantes conectados en tiempo real.
     - `newComment`: Recibe un nuevo comentario en tiempo real.
   - Envía comentarios usando el evento `newComment` con los datos del comentario y el token.

2. **Chat-Service (Node.js):**
   - Recibe conexiones WebSocket y maneja los eventos:
     - `join`: Solicita al backend (FastAPI) la lista de comentarios del curso y la envía al usuario.
     - `newComment`: Valida el token, reenvía el comentario al backend (FastAPI) vía REST, y si es exitoso, emite el nuevo comentario a todos los clientes conectados y actualiza la lista de conectados.
   - Mantiene y emite la lista de estudiantes conectados por curso.

3. **Backend (FastAPI):**
   - Expone endpoints REST para:
     - Obtener todos los estudiantes (`/api/v1/student/all`)
     - Obtener comentarios de un curso (`/api/v1/comments?course_id={id}`)
     - Crear un nuevo comentario (`/api/v1/comments`)
   - Valida el token recibido en los endpoints protegidos.
   - Al crear un comentario, retorna el comentario creado y la lista actualizada de IDs de estudiantes conectados.

---

## 🧭 Rutas y Eventos

| Función                | Ruta/Event                | Método/Evento | Descripción |
|------------------------|--------------------------|---------------|-------------|
| Obtener estudiantes    | `/api/v1/student/all`    | `GET`         | REST: Lista de todos los estudiantes (para mostrar en el chat) |
| Obtener comentarios    | `/api/v1/comments?course_id=ID` | `GET`         | REST: Lista de comentarios de un curso |
| Crear comentario       | `/api/v1/comments`       | `POST`        | REST: Crear un nuevo comentario |
| Unirse a chat          | `join`                   | socket.io     | WS: Unirse a un curso (envía nombre y courseId) |
| Enviar comentario      | `newComment`             | socket.io     | WS: Enviar comentario (con token) |
| Lista comentarios      | `commentList`            | socket.io     | WS: Recibe lista de comentarios |
| Lista conectados       | `listStudentsConnects`   | socket.io     | WS: Recibe lista de IDs de estudiantes conectados |
| Nuevo comentario       | `newComment`             | socket.io     | WS: Recibe nuevo comentario en tiempo real |

---

## 📨 Parámetros Esperados

### 1. **Obtener estudiantes**
* **Header:** `Authorization: Bearer <access-token>`
* **Respuesta:**
  ```json
  {
    "students": [
      {
        "id": 1,
        "num_identification": "12345",
        "name": "Juan",
        "last_names": "Pérez",
        "email": "juan@example.com",
        "prefix_profile": "JP"
      },
      ...
    ]
  }
  ```

### 2. **Obtener comentarios**
* **Header:** `Authorization: Bearer <access-token>`
* **Query:** `course_id=<id>`
* **Respuesta:**
  ```json
  {
    "comments": [
      {
        "id": 1,
        "nameStudent": "Juan",
        "text": "¡Hola!",
        "timestamp": "2024-05-01T12:00:00Z",
        "parentId": null,
        "courseId": 1,
        "studentId": 1
      },
      ...
    ]
  }
  ```

### 3. **Crear comentario**
* **Header:** `Authorization: Bearer <access-token>`
* **Body:**
  ```json
  {
    "text": "Mi comentario",
    "timestamp": "2024-05-01T12:00:00Z",
    "parent_id": null, // o id del comentario padre
    "course_id": 1
  }
  ```
* **Respuesta:**
  ```json
  {
    "comment": {
      "id": 2,
      "nameStudent": "Juan",
      "text": "Mi comentario",
      "timestamp": "2024-05-01T12:00:00Z",
      "parentId": null,
      "courseId": 1,
      "studentId": 1
    },
    "listIdsConnects": [1, 2, 3]
  }
  ```

### 4. **Eventos WebSocket**
* **join**
  ```js
  socket.emit('join', { name: 'Juan', courseId: 1 })
  ```
* **newComment** (enviar)
  ```js
  socket.emit('newComment', {
    nameStudent: 'Juan',
    text: 'Mi comentario',
    timestamp: '2024-05-01T12:00:00Z',
    parentId: null,
    courseId: 1,
    token: '<access-token>'
  })
  ```
* **commentList** (recibir)
  ```js
  socket.on('commentList', (comments) => { ... })
  // comments: array de comentarios (ver formato arriba)
  ```
* **listStudentsConnects** (recibir)
  ```js
  socket.on('listStudentsConnects', (ids) => { ... })
  // ids: array de IDs de estudiantes conectados
  ```
* **newComment** (recibir)
  ```js
  socket.on('newComment', (comment) => { ... })
  // comment: objeto comentario (ver formato arriba)
  ```

---

## 📥 Respuestas esperadas
* **Código de estado HTTP** (`200`, `400`, `401`, etc.)
* **Mensajes** explicativos del resultado
* **Datos**:
  - Lista de estudiantes
  - Lista de comentarios
  - Comentario creado y lista de conectados

---

## ⏳ Datos que se envían y reciben

### Comentario enviado (frontend → chat-service → backend):
```json
{
  "nameStudent": "Juan",
  "text": "Mi comentario",
  "timestamp": "2024-05-01T12:00:00Z",
  "parentId": null,
  "courseId": 1,
  "token": "<access-token>"
}
```

### Comentario recibido (backend → chat-service → frontend):
```json
{
  "id": 2,
  "nameStudent": "Juan",
  "text": "Mi comentario",
  "timestamp": "2024-05-01T12:00:00Z",
  "parentId": null,
  "courseId": 1,
  "studentId": 1
}
```

### Lista de estudiantes conectados:
```json
[1, 2, 3]
```

### Lista de todos los estudiantes (para mostrar en el chat):
```json
[
  {
    "id": 1,
    "numIdentification": "12345",
    "name": "Juan",
    "lastNames": "Pérez",
    "email": "juan@example.com",
    "prefixProfile": "JP",
    "stateConnect": false
  },
  ...
]
```

---

## 🛡️ Validaciones y errores
* El token debe ser válido en cada petición protegida.
* Si el token es inválido, se responde con `401 Unauthorized`.
* Si falta algún dato requerido, se responde con `400 Bad Request`.
* Los errores deben incluir un mensaje explicativo.

---


## 🏆 Certificación

### **Flujo General – Gestión de Certificados**

1. **Habilitación del Certificado (Backend):**  
   - La certificación solo se habilita cuando el estudiante ha completado exitosamente **los 3 cursos obligatorios**.  
   - Una vez validado, se genera o asocia un certificado digital (PDF) al estudiante en la base de datos.  

2. **Frontend – Visualización de Certificados:**  
   - El usuario ingresa al apartado **"Mis Certificaciones"** en el perfil (`/profile/certifications`).  
   - Envía una solicitud **GET** al backend para obtener la lista de certificados.  
   - El frontend:
     - Si **no existen certificados**, renderiza un mensaje: `"Aún no tienes certificaciones disponibles."`.
     - Si **existen certificados**, muestra una lista con:
       - Nombre del certificado.
       - Botón de descarga (atributo `download`) que apunta a la URL del documento.

3. **Backend – Respuesta de Certificados:**  
   - Valida el token del estudiante.
   - Recupera de la base de datos los certificados asociados al `student_id`.
   - Devuelve un array de objetos con la siguiente estructura:
     ```json
     {
       "status": 200,
       "message": "Certificados obtenidos exitosamente",
       "certificates": [
         {
           "id": 1,
           "certificate_name": "Certificado de Finalización - Excel Avanzado",
           "download_url": "/files/certificates/1.pdf",
           "issued_date": "2025-07-20"
         },
         ...
       ]
     }
     ```

4. **Descarga del Certificado:**  
   - El botón de descarga en el frontend permite al usuario descargar el archivo directamente usando el atributo `download`.
   - La URL de descarga puede ser pública o protegida (en este último caso, el frontend enviará el token para validación antes de entregar el archivo).

---

### **Rutas y Métodos**

| Función                       | Ruta                              | Método |
|------------------------------|-----------------------------------|--------|
| Obtener certificados         | `/api/v1/student/certificates`   | `GET`  |
| Descargar certificado (opcional, si es protegida) | `/api/v1/student/certificates/{id}/download` | `GET`  |

---

### **Parámetros Esperados**

* **Header:** `Authorization: Bearer <access-token>`  

---

### **Respuestas Posibles**

- `200 OK`: Devuelve lista de certificados o archivo de descarga.  
- `204 No Content`: No hay certificados disponibles.  
- `401 Unauthorized`: Token inválido o ausente.  
- `404 Not Found`: Certificado no encontrado (cuando se intenta descargar uno inexistente).  

---

### **Estructura de Certificados (Frontend → Backend)**

```json
{
  "certificates": [
    {
      "id": 1,
      "certificate_name": "Certificado de Finalización - Excel Avanzado",
      "download_url": "/files/certificates/1.pdf",
    }
  ]
}
