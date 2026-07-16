# antoniotrinidad.dev

Portfolio profesional y blog tecnico de Antonio Trinidad Mercedes. El proyecto
esta dividido en una aplicacion React/Vite para el sitio publico y panel admin,
mas una API Express/MongoDB para contenido, autenticacion y administracion.

## Que incluye

- Sitio publico con home, proyectos, detalle de proyectos, blog, contacto,
  privacidad y pagina 404.
- Panel admin protegido con JWT para proyectos, posts, categorias, mensajes y
  moderacion de comentarios.
- Recuperacion de password admin mediante token temporal.
- Subida de imagenes firmada desde el backend hacia Cloudinary.
- Comentarios publicos en posts con moderacion desde el admin.
- CV descargable desde home, about y footer.
- SEO tecnico: metadata, Open Graph, sitemap dinamico y rutas canonicas.
- Checks de accesibilidad, utilidades de formularios, HTTP client y build.

## Stack

- Frontend: React 19, Vite 6, React Router, CSS, lucide-react.
- Backend: Node.js 20, Express, MongoDB, Mongoose, JWT, Helmet, CORS.
- Servicios: MongoDB Atlas, Cloudinary, Resend, Vercel y Render.

## Estructura

```text
.
  client/          Frontend React/Vite
  server/          API Express/MongoDB
  docs/            Documentacion general
  deployment.md    Guia de despliegue
  planning.md      Planeacion del producto
  render.yaml      Blueprint de Render para el backend
```

## Requisitos

- Node.js 20 o superior.
- npm para `server/`.
- pnpm o corepack para `client/`.
- MongoDB local o MongoDB Atlas.
- Cuenta de Cloudinary si quieres subir imagenes desde el admin.
- Cuenta de Resend para enviar correos de recuperacion en produccion.

## Configuracion local

1. Instala dependencias.

```bash
cd server
npm install

cd ../client
corepack pnpm install
```

2. Crea los archivos de entorno desde los ejemplos.

```bash
cd server
cp .env.example .env

cd ../client
cp .env.example .env
```

3. Configura `server/.env`.

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/antoniotrinidad-dev
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
TRUST_PROXY=0
ADMIN_NAME=Antonio Trinidad
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-now
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=antoniotrinidad-dev
RESEND_API_KEY=
EMAIL_FROM=
```

4. Configura `client/.env`.

```env
VITE_API_URL=http://localhost:5000/api
VITE_SITE_URL=http://localhost:5173
```

## Levantar en desarrollo

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
corepack pnpm dev
```

URLs locales:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

## Admin inicial

Con `ADMIN_EMAIL` y `ADMIN_PASSWORD` configurados:

```bash
cd server
npm run create:admin
```

Para reemplazar el password del admin:

```bash
cd server
npm run reset:admin-password
```

Despues de crear o resetear el admin, elimina `ADMIN_PASSWORD` del entorno de
produccion.

## Imagenes con Cloudinary

El admin puede pegar URLs existentes o subir imagenes desde proyectos/posts. Para
activar subidas reales, configura en el backend:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=antoniotrinidad-dev
```

El `API_SECRET` nunca debe estar en el frontend. El backend firma la subida y
Cloudinary devuelve una URL segura que se guarda en el formulario.

Cuando un proyecto o post reemplaza/elimina una imagen subida por este backend,
la API intenta borrar la version anterior en Cloudinary para evitar archivos
huerfanos. Las URLs externas pegadas manualmente no se eliminan.

## Recuperacion de password

En desarrollo, el endpoint de recuperacion devuelve un `resetUrl` para probar el
flujo sin correo. En produccion, el backend envia ese enlace por Resend y exige:

```env
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=Antonio Trinidad <no-reply@antoniotrinidad.dev>
```

El remitente debe estar verificado en Resend. No coloques `RESEND_API_KEY` en el
frontend.

## Scripts utiles

Frontend:

```bash
cd client
corepack pnpm dev
corepack pnpm check
corepack pnpm build
corepack pnpm preview
```

Backend:

```bash
cd server
npm run dev
npm run check
npm test
npm run create:admin
npm run reset:admin-password
```

## Testing

El backend ejecuta pruebas de integracion contra la base definida en
`MONGODB_URI` y llama `dropDatabase()`. Usa siempre una base de prueba dedicada:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/antoniotrinidad-test
```

Si MongoDB local no esta corriendo, la suite de API no podra iniciar.

## Despliegue

La estrategia recomendada esta en [deployment.md](deployment.md):

- Frontend en Vercel desde `client/`.
- Backend en Render desde `server/`.
- Base de datos en MongoDB Atlas.
- Imagenes en Cloudinary.
- Emails transaccionales en Resend.

## Documentacion

- [Frontend README](client/README.md)
- [Backend README](server/README.md)
- [API backend](server/docs/API.md)
- [Testing backend](server/docs/TESTING.md)
- [Seguridad backend](server/docs/SECURITY.md)
- [Deployment](deployment.md)
