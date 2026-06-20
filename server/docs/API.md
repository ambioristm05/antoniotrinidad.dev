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

### POST /api/auth/logout

Cierra sesion del lado del cliente. No requiere token.

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

Respuesta `200`:

```json
{
  "status": "success",
  "message": "API is healthy"
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

Si no se envia `slug`, se genera desde `title`.

### PATCH /api/projects/:id

Actualiza un proyecto por `_id`.

Requiere rol `admin`.

### DELETE /api/projects/:id

Elimina un proyecto por `_id`.

Requiere rol `admin`.

Respuesta `204` sin body.

## Posts

### GET /api/posts

Lista solo posts publicados.

Query opcional:

- `category`
- `tag`
- `featured`: `true` o `false`
- `search`
- `page`, `limit`, `sort`

### GET /api/posts/featured

Devuelve hasta 6 posts con `status: "published"` y `featured: true`.

### GET /api/posts/:slug

Devuelve un post publicado por `slug`.

### GET /api/posts/admin/all

Lista posts publicados y borradores.

Requiere rol `admin`.

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

### PATCH /api/posts/:id

Actualiza un post por `_id`.

Requiere rol `admin`.

### DELETE /api/posts/:id

Elimina un post por `_id`.

Requiere rol `admin`.

Respuesta `204` sin body.

## Categories

### GET /api/categories

Lista categorias.

Query opcional:

- `type`: `project` o `post`

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

### PATCH /api/categories/:id

Actualiza una categoria por `_id`.

Requiere rol `admin`.

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
  "message": "Message received successfully",
  "data": {
    "contactMessage": {
      "_id": "...",
      "name": "Ada Lovelace",
      "email": "ada@example.com",
      "subject": "Project inquiry",
      "message": "I would like to talk about a project.",
      "status": "unread"
    }
  }
}
```

### GET /api/contact/messages

Lista mensajes de contacto.

Requiere rol `admin`.

Query opcional:

- `status`: `unread`, `read`, `archived`
- `page`, `limit`, `sort`

### PATCH /api/contact/messages/:id

Actualiza el estado de un mensaje.

Requiere rol `admin`.

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
