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
   description,
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
   * **No se retornan los cursos.**

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
   id_content,
   content_type,
   url
}

---






## Ruta evaluacion leccion

1. **Frontend**:
   * Envía un **token de acceso** en el encabezado `Authorization`.
   * Envia el id del curso y leccion por parametro de ruta

2. **Backend**:

   * **Valida el token** recibido.
   * Si el token es **válido** y el id del curso y de leccion tambien,
   * Retorna un **código de estado HTTP**, un **mensaje** según el resultado de la operación y la **evaluacion** de dicha leccion..

3. **En caso de error**:

   * El backend responde con un código de estado acorde al tipo de error.
   * **No se retornan los cursos.**

4. **Respuesta del Frontend**:

   * Espera el código de **estado**, **mensaje***, y la **evaluacion**.
   * Si recibe un **200 OK**,  renderiza la evalaucion en el apartado del la leccion
---

## 🧭 Rutas

| Función          | Ruta                                                 | Método |
| ---------------- | -----------------------------------------------------| ------ |
| Backend (API)    | `/courses/{id_course}/lessons/{id_lesson}/evaluation`| `GET`  |
| Frontend (vista) | `/courses/{id_course}/lessons/{id_lesson}/evaluation`| -GET   |

---

## 📨 Parámetros Esperados

* **Header:** `Authorization: Bearer <access-token>`
* **Query parameter** `/courses/{id_course}/lessons/{id_lesson}`

## 📥 Respuesta esperada

* **Código de estado HTTP** (`200`, `400`, `401`, etc.)
* **Mensaje** explicativo del resultado
* **contenido** (evaluacion)
evaluation {
   id_evaluation,
   question,
   question_type
   options
} en caso de que sea opcion multiple

evaluation {
   id_evaluation,
   question,
   question_type
} en caso de que sea pregunta abierta

---
