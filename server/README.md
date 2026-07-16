# Backend MERN

API Express/MongoDB para el portafolio profesional y blog de Antonio Trinidad Mercedes.

## Requisitos

- Node.js 20 o superior.
- MongoDB Atlas o una instancia local de MongoDB.

## Instalacion

```bash
cd server
npm install
cp .env.example .env
```

Completa las variables de entorno en `.env`.

Para levantar MongoDB local con Docker:

```powershell
docker run -d --name antoniotrinidad-mongo -p 27017:27017 mongo:7
```

Si el contenedor ya existe:

```powershell
docker start antoniotrinidad-mongo
```

## Variables de entorno

| Variable | Requerida | Descripcion |
| --- | --- | --- |
| `PORT` | No | Puerto HTTP. Por defecto `5000`. |
| `NODE_ENV` | No | Entorno de ejecucion. Por defecto `development`. |
| `MONGODB_URI` | Si | Cadena de conexion de MongoDB. |
| `JWT_SECRET` | Si | Secreto para firmar tokens JWT. |
| `JWT_EXPIRES_IN` | No | Duracion del JWT. Por defecto `7d`. |
| `CLIENT_URL` | No | Origen permitido por CORS. Por defecto `http://localhost:5173`. |
| `TRUST_PROXY` | No | Numero de proxies confiables para obtener la IP real. Usa `1` en Render/Railway si hay un proxy delante. Por defecto `0`. |
| `ADMIN_NAME` | No | Nombre usado por `npm run create:admin`. |
| `ADMIN_EMAIL` | No | Email usado por `npm run create:admin`. |
| `ADMIN_PASSWORD` | No | Password usado por `npm run create:admin`. |
| `CLOUDINARY_CLOUD_NAME` | No | Cloud name de Cloudinary para subir imagenes desde el admin. |
| `CLOUDINARY_API_KEY` | No | API key de Cloudinary. Debe configurarse junto con `CLOUDINARY_CLOUD_NAME` y `CLOUDINARY_API_SECRET`. |
| `CLOUDINARY_API_SECRET` | No | API secret de Cloudinary para firmar subidas desde el backend. |
| `CLOUDINARY_FOLDER` | No | Carpeta base para imagenes subidas. Por defecto `antoniotrinidad-dev`. |
| `RESEND_API_KEY` | Si en produccion | API key de Resend para enviar emails de recuperacion de password. |
| `EMAIL_FROM` | Si en produccion | Remitente verificado en Resend, por ejemplo `Antonio Trinidad <no-reply@antoniotrinidad.dev>`. |

Si Cloudinary no esta configurado, el admin puede seguir pegando URLs existentes o rutas publicas. Para activar la subida directa, configura las tres credenciales de Cloudinary en el entorno del backend.

Cuando una imagen subida por el backend deja de usarse en un proyecto o post, la API intenta borrarla de Cloudinary. Las URLs externas pegadas manualmente no se eliminan.

En produccion, la recuperacion de password del admin requiere Resend configurado. En desarrollo y test, `POST /api/auth/forgot-password` devuelve `resetUrl` en la respuesta para probar el flujo sin enviar correos.

## Scripts

```bash
npm run dev          # nodemon src/server.js
npm start            # node src/server.js
npm test             # node --test
npm run test:coverage # tests con reporte de cobertura
npm run lint         # ESLint
npm run check        # lint y comprobacion de sintaxis
npm run create:admin # crea el admin inicial si no existe
npm run reset:admin-password # reemplaza el password del admin existente
```

`create:admin` es idempotente: crea el usuario definido por `ADMIN_EMAIL` solo cuando no existe y nunca reemplaza su password automaticamente.

Para restablecer el password, configura temporalmente `ADMIN_EMAIL` y
`ADMIN_PASSWORD`, ejecuta `npm run reset:admin-password`, verifica el login y
elimina `ADMIN_PASSWORD` de nuevo.

Si `npm` no esta disponible, puedes usar Node directamente:

```powershell
node src/server.js
node --test
```

## Documentacion

- [API reference](docs/API.md)
- [Testing guide](docs/TESTING.md)
- [Security guide](docs/SECURITY.md)
- [Deployment guide](../deployment.md)

## Docker

Construir y ejecutar el backend:

```bash
docker build -t antoniotrinidad-backend .
docker run --env-file .env.production -p 5000:5000 antoniotrinidad-backend
```

La imagen usa un usuario sin privilegios e incluye health check en `/api/health`.

## Endpoints principales

| Area | Endpoints |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/login`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Projects | `GET /api/projects`, `GET /api/projects/featured`, `GET /api/projects/:slug`, `POST /api/projects`, `PATCH /api/projects/:id`, `DELETE /api/projects/:id` |
| Posts | `GET /api/posts`, `GET /api/posts/featured`, `GET /api/posts/:slug`, `GET /api/posts/admin/all`, `POST /api/posts`, `PATCH /api/posts/:id`, `DELETE /api/posts/:id` |
| Post comments | `GET /api/posts/:slug/comments`, `POST /api/posts/:slug/comments`, `POST /api/posts/:slug/comments/:commentId/replies`, `GET /api/posts/admin/comments`, `PATCH /api/posts/admin/comments/:commentId`, `DELETE /api/posts/admin/comments/:commentId` |
| Categories | `GET /api/categories`, `POST /api/categories`, `PATCH /api/categories/:id`, `DELETE /api/categories/:id` |
| Contact | `POST /api/contact`, `GET /api/contact/messages`, `PATCH /api/contact/messages/:id`, `DELETE /api/contact/messages/:id` |
| Uploads | `POST /api/uploads/images` |

## Autenticacion

Las rutas privadas esperan un header:

```http
Authorization: Bearer <token>
```

El token se obtiene con `POST /api/auth/login`.

## Testing

Los tests usan la base definida en `MONGODB_URI` y ejecutan `dropDatabase()`. Para evitar borrar datos reales, usa una base dedicada como:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/antoniotrinidad-test
```

Ejecutar:

```powershell
node --test
```

## Estructura

```text
server/
  docs/
    API.md
    SECURITY.md
    TESTING.md
  src/
    config/
    controllers/
    middlewares/
    models/
    routes/
    scripts/
    utils/
    validators/
  test/
    api.test.js
    env.test.js
```
