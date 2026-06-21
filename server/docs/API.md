# Backend API

Base URL local: `http://localhost:5000`

Todas las respuestas JSON usan una propiedad `status`:

- `success` para operaciones correctas.
- `fail` para errores esperados de cliente, autenticacion o validacion.
- `error` para errores internos.

## Autenticacion

Las rutas privadas requieren un token JWT en el header:

```http
Authorization: Bearer <token>
```

El token se obtiene con `POST /api/auth/login`.

Los JWT se firman exclusivamente con `HS256`. El backend acepta temporalmente tokens anteriores que usen el claim `id`; los tokens nuevos identifican al usuario mediante el claim estandar `sub`.

### POST /api/auth/login

Inicia sesion de administrador.

Body:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Respuesta `200`:

```json
{
  "status": "success",
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": "7d",
  "data": {
    "user": {
      "_id": "...",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

Errores comunes:

- `400` si faltan campos o el email no es valido.
- `401` si las credenciales son incorrectas.

La respuesta incluye `Cache-Control: no-store` y nunca expone `passwordHash`.

### POST /api/auth/logout

Cierra sesion del lado del cliente. No requiere token.

El logout es stateless: el cliente debe eliminar el JWT almacenado. El token no se guarda en cookies ni se mantiene una lista de revocacion en el servidor.

Respuesta `200`:

```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### GET /api/auth/me

Devuelve el usuario autenticado.

Requiere: `Authorization: Bearer <token>`

Respuesta `200`:

```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "...",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

## Health

### GET /api/health

Comprueba que Express esta activo y ejecuta un `ping` real contra MongoDB. El chequeo de base tiene un timeout de 2 segundos.

Respuesta `200`:

```json
{
  "status": "success",
  "message": "API is healthy",
  "services": {
    "database": "connected"
  },
  "timestamp": "2026-06-20T12:00:00.000Z",
  "uptime": 120
}
```

Respuesta `503` cuando MongoDB no esta disponible:

```json
{
  "status": "fail",
  "message": "API is not ready",
  "services": {
    "database": "disconnected"
  },
  "timestamp": "2026-06-20T12:00:00.000Z",
  "uptime": 120
}
```

## Paginacion y filtros

Los listados paginados aceptan:

- `page`: pagina actual. Por defecto `1`.
- `limit`: resultados por pagina. Por defecto `10`.
- `sort`: campo de orden. Por defecto `-createdAt`.
- `search`: busqueda de texto donde aplique.

Respuesta paginada:

```json
{
  "status": "success",
  "results": 1,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  },
  "data": {}
}
```

## Projects

### GET /api/projects

Lista proyectos.

Query opcional:

- `category`
- `status`: `planned`, `in-progress`, `completed`, `archived`
- `featured`: `true` o `false`
- `search`
- `page`, `limit`, `sort`

`page` y `limit` deben ser enteros positivos; `limit` se limita a 50. Los campos permitidos para `sort` son `createdAt`, `updatedAt`, `title`, `startDate`, `endDate`, `featured` y `status`, con prefijo `-` para orden descendente. `search` admite hasta 100 caracteres y se trata como texto literal, no como expresion regular.

Respuesta `200`:

```json
{
  "status": "success",
  "results": 1,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  },
  "data": {
    "projects": []
  }
}
```

### GET /api/projects/featured

Devuelve hasta 6 proyectos con `featured: true` y `status: "completed"`.

### GET /api/projects/:slug

Devuelve un proyecto por `slug`.

Errores comunes:

- `404` si el proyecto no existe.

### POST /api/projects

Crea un proyecto.

Requiere rol `admin`.

Body minimo:

```json
{
  "title": "Portfolio API",
  "summary": "API for portfolio content.",
  "description": "A tested Express and MongoDB API."
}
```

Campos aceptados:

- `title`, `slug`, `summary`, `description`
- `coverImage`, `gallery`
- `technologies`
- `category`
- `status`
- `featured`
- `liveUrl`, `repoUrl`
- `startDate`, `endDate`

Restricciones:

- Si no se envia `slug`, se genera desde `title`; un slug enviado se normaliza.
- `coverImage`, elementos de `gallery`, `liveUrl` y `repoUrl` deben usar HTTP o HTTPS.
- `gallery` admite hasta 20 URLs y `technologies` hasta 30 textos no vacios.
- `endDate` no puede ser anterior a `startDate`.
- Tecnologias y URLs de galeria duplicadas se eliminan al guardar.

### PATCH /api/projects/:id

Actualiza un proyecto por `_id`.

Requiere rol `admin`.

El body debe contener al menos un campo reconocido. El slug solo cambia cuando se envia expresamente; cambiar el titulo no rompe URLs existentes.

### DELETE /api/projects/:id

Elimina un proyecto por `_id`.

Requiere rol `admin`.

Respuesta `204` sin body.

## Posts

### GET /api/posts

Lista solo posts publicados cuya fecha `publishedAt` ya haya llegado. Los borradores y posts programados para el futuro no aparecen.

Query opcional:

- `category`
- `tag`
- `featured`: `true` o `false`
- `search`
- `page`, `limit`, `sort`

`page` y `limit` deben ser enteros positivos; `limit` se limita a 50. Los campos permitidos para `sort` son `createdAt`, `updatedAt`, `title`, `publishedAt`, `featured`, `status` y `readingTime`. `search` admite hasta 100 caracteres tratados como texto literal.

### GET /api/posts/featured

Devuelve hasta 6 posts con `status: "published"` y `featured: true`.

### GET /api/posts/:slug

Devuelve un post publicado por `slug`.

### GET /api/posts/admin/all

Lista posts publicados y borradores.

Requiere rol `admin`.

Admite `status`, `category`, `tag`, `featured`, `search`, `page`, `limit` y `sort`. A diferencia del listado publico, incluye posts programados.

### POST /api/posts

Crea un post.

Requiere rol `admin`.

Body minimo:

```json
{
  "title": "Published Post",
  "excerpt": "Short public excerpt.",
  "content": "Full article content.",
  "status": "published"
}
```

Campos aceptados:

- `title`, `slug`, `excerpt`, `content`
- `coverImage`
- `category`
- `tags`
- `status`: `draft` o `published`
- `featured`
- `publishedAt`

El backend asigna `author` desde el token. Si `status` es `published` y no se envia `publishedAt`, se usa la fecha actual.

El campo `content` usa Markdown. El renderer del frontend debe mantener deshabilitado el HTML crudo o sanitizarlo antes de mostrarlo.

Restricciones:

- El slug se genera desde `title` cuando falta y se normaliza cuando se envia.
- `coverImage` debe usar HTTP o HTTPS.
- Se admiten hasta 20 tags no vacios; se normalizan a minusculas y se eliminan duplicados.
- `readingTime` se calcula automaticamente a 200 palabras por minuto.
- Un post publicado con fecha futura queda programado y no se muestra publicamente hasta esa fecha.

### PATCH /api/posts/:id

Actualiza un post por `_id`.

Requiere rol `admin`.

El body debe contener al menos un campo reconocido. Volver un post a `draft` elimina `publishedAt`; publicarlo de nuevo asigna la fecha actual si no se envia otra.

### DELETE /api/posts/:id

Elimina un post por `_id`.

Requiere rol `admin`.

Respuesta `204` sin body.

## Categories

### GET /api/categories

Lista categorias.

Query opcional:

- `type`: `project` o `post`

Un tipo distinto devuelve `400`.

### POST /api/categories

Crea una categoria.

Requiere rol `admin`.

Body:

```json
{
  "name": "Backend",
  "type": "post"
}
```

Si no se envia `slug`, se genera desde `name`.

La combinacion `slug` + `type` es unica. El mismo slug puede existir una vez para proyectos y otra para posts.

### PATCH /api/categories/:id

Actualiza una categoria por `_id`.

Requiere rol `admin`.

El body debe contener al menos un campo reconocido. Cambiar `name` no cambia el slug salvo que se envie `slug` expresamente.

### DELETE /api/categories/:id

Elimina una categoria por `_id`.

Requiere rol `admin`.

Respuesta `204` sin body.

## Contact

### POST /api/contact

Guarda un mensaje de contacto publico.

Body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "subject": "Project inquiry",
  "message": "I would like to talk about a project."
}
```

Respuesta `201`:

```json
{
  "status": "success",
  "message": "Message received successfully"
}
```

La respuesta publica no devuelve el mensaje ni datos personales. Enviar el mismo email, asunto y mensaje dentro de 15 minutos devuelve el mismo `201` sin crear un duplicado.

Proteccion anti-spam:

- Maximo de 5 solicitudes por IP cada hora.
- Campo honeypot opcional `website`; el frontend debe mantenerlo oculto y vacio.
- Si el honeypot contiene un valor, la API devuelve la misma respuesta generica pero no almacena el mensaje.
- `name` requiere 2 caracteres, `subject` 3 y `message` 10.

En despliegues detras de un proxy, configura `TRUST_PROXY` con el numero de saltos confiables (normalmente `1`) para que el limite use la IP real del visitante.

### GET /api/contact/messages

Lista mensajes de contacto.

Requiere rol `admin`.

Query opcional:

- `status`: `unread`, `read`, `archived`
- `search`: busca como texto literal en nombre, email, asunto y mensaje
- `page`, `limit`, `sort`

Los campos permitidos para `sort` son `createdAt`, `updatedAt`, `name`, `email`, `subject` y `status`.

### PATCH /api/contact/messages/:id

Actualiza el estado de un mensaje.

Requiere rol `admin`.

El body debe incluir `status`; un body vacio devuelve `400`.

Body:

```json
{
  "status": "read"
}
```

### DELETE /api/contact/messages/:id

Elimina un mensaje.

Requiere rol `admin`.

Respuesta `204` sin body.

## Rate limits

- API general: 300 requests cada 15 minutos.
- Login: 10 intentos cada 15 minutos.
- Contacto: 5 mensajes cada 1 hora.

## Errores

Formato comun:

```json
{
  "status": "fail",
  "message": "Authentication token is required"
}
```

Codigos habituales:

- `400`: validacion, ObjectId invalido o body incorrecto.
- `401`: token ausente, invalido o credenciales incorrectas.
- `403`: rol insuficiente.
- `404`: recurso o ruta no encontrada.
- `409`: valor duplicado en campo unico.
- `500`: error inesperado.
