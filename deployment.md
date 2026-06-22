# Deployment: Portfolio y Blog MERN

Este documento define como desplegar el portfolio y blog tecnico descrito en `planning.md`.

La estrategia recomendada separa los servicios para mantener el proyecto simple, escalable y facil de operar:

- Frontend React/Vite en Vercel.
- Backend Node.js/Express en Render.
- Base de datos MongoDB en MongoDB Atlas.
- Imagenes en Cloudinary o almacenamiento externo equivalente.
- Dominio personalizado apuntando al frontend.

## 1. Arquitectura de produccion

```text
Usuario
  |
  v
Dominio personalizado
  |
  v
Vercel: client/
  |
  | VITE_API_URL=https://api.antoniotrinidad.dev/api
  v
Render: server/
  |
  | MONGODB_URI
  v
MongoDB Atlas

Cloudinary almacena imagenes de proyectos y articulos.
```

## 2. Servicios elegidos

### Frontend

Servicio recomendado: Vercel.

Motivos:

- Integracion directa con proyectos Vite.
- Builds automaticos por push a Git.
- CDN global para assets estaticos.
- SSL y dominio personalizado sin configuracion compleja.

Configuracion:

- Root directory: `client`
- Install command: `pnpm install`
- Build command: `pnpm build`
- Output directory: `dist`
- Node.js: version 20 o superior.

### Backend

Servicio recomendado: Render Web Service.

Motivos:

- Soporta Node.js/Express sin cambios grandes.
- Permite variables de entorno por entorno.
- Logs accesibles.
- Deploy automatico desde Git.
- SSL incluido.

Configuracion:

- Root directory: `server`
- Runtime: Node
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/api/health`.
- Node.js: version 20 o superior.

### Base de datos

Servicio recomendado: MongoDB Atlas.

Configuracion:

- Crear un cluster dedicado o free tier para MVP.
- Crear usuario de base de datos con permisos limitados a la base del proyecto.
- Configurar Network Access segun el proveedor de backend.
- Obtener el connection string para `MONGODB_URI`.
- Activar backups cuando el proyecto tenga contenido real.

### Imagenes

Servicio recomendado: Cloudinary.

Uso previsto:

- Portadas de proyectos.
- Galerias de proyectos.
- Portadas de posts.
- Imagenes embebidas en articulos.

Variables sugeridas:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## 3. Variables de entorno

### Backend en Render

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_URL=https://antoniotrinidad.dev
TRUST_PROXY=1
ADMIN_NAME=Antonio Trinidad
ADMIN_EMAIL=
ADMIN_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Notas:

- `PORT` puede ser definido automaticamente por Render. Si Render lo inyecta, no hace falta fijarlo manualmente.
- `JWT_SECRET` debe ser largo, aleatorio y privado.
- `CLIENT_URL` debe coincidir exactamente con el dominio publico del frontend para que CORS funcione correctamente.
- `TRUST_PROXY=1` permite obtener la IP real detras del proxy de Render para aplicar rate limiting correctamente.
- `ADMIN_PASSWORD` solo debe usarse para crear el primer administrador; despues conviene rotarla o eliminarla si el script ya no se necesita.

### Frontend en Vercel

```env
VITE_API_URL=https://api.antoniotrinidad.dev/api
VITE_SITE_URL=https://antoniotrinidad.dev
```

Si no se usa subdominio para la API, usar la URL publica que Render entregue:

```env
VITE_API_URL=https://nombre-del-servicio.onrender.com/api
```

## 4. Preparacion antes del despliegue

1. Confirmar que el proyecto compila localmente.

```bash
cd client
pnpm install
pnpm build
```

```bash
cd server
npm ci
npm run check
npm test
```

2. Confirmar que el backend conecta con MongoDB Atlas usando `MONGODB_URI`.

3. Confirmar que las rutas publicas principales responden:

- `GET /api/projects`
- `GET /api/projects/featured`
- `GET /api/posts`
- `GET /api/posts/featured`
- `POST /api/contact`

4. Crear contenido inicial:

- Usuario administrador.
- Proyectos principales.
- Posts iniciales.
- Categorias base.

## 5. Despliegue del backend en Render

1. Crear un nuevo Web Service en Render.
2. Conectar el repositorio del proyecto.
3. Configurar:

```text
Root Directory: server
Build Command: npm ci
Start Command: npm start
Health Check Path: /api/health
```

4. Agregar las variables de entorno del backend.
5. Desplegar el servicio.
6. Revisar logs para confirmar:

- Express inicio correctamente.
- MongoDB conecto correctamente.
- No faltan variables requeridas.

7. Guardar la URL publica del backend.

Ejemplo:

```text
https://antoniotrinidad-api.onrender.com
```

## 6. Creacion del administrador inicial

Cuando el backend ya tenga acceso a MongoDB Atlas, crear el primer usuario administrador ejecutando el script del servidor:

```bash
cd server
npm run create:admin
```

En produccion, este comando debe ejecutarse con estas variables disponibles:

```env
MONGODB_URI=
JWT_SECRET=
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Despues de crear el usuario:

- Verificar login en `/admin/login`.
- Rotar o eliminar `ADMIN_PASSWORD` del entorno de produccion si no se usara de nuevo.

## 7. Despliegue del frontend en Vercel

1. Crear un nuevo proyecto en Vercel.
2. Conectar el repositorio.
3. Configurar:

```text
Root Directory: client
Framework Preset: Vite
Install Command: pnpm install
Build Command: pnpm build
Output Directory: dist
```

4. Agregar la variable:

```env
VITE_API_URL=https://antoniotrinidad-api.onrender.com/api
VITE_SITE_URL=https://antoniotrinidad.dev
```

5. Desplegar.
6. Probar navegacion publica:

- `/`
- `/about`
- `/projects`
- `/blog`
- `/contact`
- `/privacy`

7. Probar flujo administrativo:

- `/admin/login`
- `/admin`
- CRUD de proyectos.
- CRUD de posts.
- Gestion de categorias.
- Gestion de mensajes.

## 8. Dominio personalizado

Dominio recomendado:

```text
antoniotrinidad.dev
```

Subdominio recomendado para API:

```text
api.antoniotrinidad.dev
```

Configuracion DNS sugerida:

```text
antoniotrinidad.dev      -> Vercel
www.antoniotrinidad.dev  -> Vercel
api.antoniotrinidad.dev  -> Render
```

Despues de conectar el dominio:

- Actualizar `CLIENT_URL` en Render:

```env
CLIENT_URL=https://antoniotrinidad.dev
```

- Actualizar `VITE_API_URL` en Vercel:

```env
VITE_API_URL=https://api.antoniotrinidad.dev/api
VITE_SITE_URL=https://antoniotrinidad.dev
```

- Redeplegar frontend y backend si las plataformas no lo hacen automaticamente.

## 9. Seguridad de produccion

Checklist minimo:

- `NODE_ENV=production`.
- `JWT_SECRET` fuerte y privado.
- CORS limitado a `CLIENT_URL`.
- Rate limiting activo en login y contacto.
- Helmet activo en Express.
- MongoDB Atlas con usuario limitado.
- Variables sensibles solo en el proveedor, nunca en el repo.
- Panel `/admin` protegido por JWT.
- Sanitizacion del contenido si el blog permite HTML.
- SSL activo en frontend, backend y dominio personalizado.

## 10. SEO y rendimiento

Antes de publicar oficialmente:

- Configurar title y description por pagina.
- Agregar Open Graph para Home, proyectos y posts.
- Crear `robots.txt`.
- Crear `sitemap.xml`.
- Optimizar imagenes antes de subirlas a Cloudinary.
- Usar lazy loading para imagenes publicas.
- Verificar Core Web Vitals con Lighthouse.

## 11. Monitoreo y mantenimiento

Backend:

- Revisar logs de Render despues de cada deploy.
- Monitorear errores 4xx/5xx.
- Revisar tiempos de respuesta en rutas de posts, proyectos y contacto.

Base de datos:

- Activar backups en MongoDB Atlas.
- Revisar crecimiento de colecciones.
- Mantener indices para `slug`, `status`, `featured`, `category` y busquedas frecuentes.

Frontend:

- Revisar errores de build en Vercel.
- Probar navegacion despues de cada deploy.
- Verificar que `VITE_API_URL` apunte al backend correcto.

## 12. Flujo de despliegue recomendado

Para cada release:

1. Desarrollar cambios en una rama.
2. Probar localmente frontend y backend.
3. Ejecutar checks:

```bash
cd client
pnpm build
```

```bash
cd server
npm run check
npm test
```

4. Hacer merge a la rama principal.
5. Render despliega backend automaticamente.
6. Vercel despliega frontend automaticamente.
7. Revisar logs y probar rutas criticas.
8. Validar formularios, login y paginas publicas.

## 13. Plan de rollback

Frontend:

- Usar el historial de deployments de Vercel.
- Promover el deployment anterior estable.

Backend:

- Usar el historial de deploys de Render.
- Volver al commit anterior si el error viene del codigo.
- Revisar que las variables de entorno no hayan cambiado.

Base de datos:

- Evitar migraciones destructivas sin backup.
- Crear backup manual antes de cambios grandes de esquema.
- Restaurar desde MongoDB Atlas si hay perdida o corrupcion de datos.

## 14. Checklist final de produccion

- Frontend desplegado en Vercel.
- Backend desplegado en Render.
- MongoDB Atlas conectado.
- Variables de entorno configuradas.
- Dominio personalizado conectado.
- SSL activo.
- CORS apuntando al dominio real.
- Login admin funcionando.
- CRUD de proyectos funcionando.
- CRUD de posts funcionando.
- Formulario de contacto funcionando.
- Imagenes cargando desde Cloudinary o proveedor elegido.
- Paginas publicas responsive.
- SEO basico configurado.
- Backups definidos.
- README actualizado con instrucciones de instalacion y despliegue.

## 15. Alternativas aceptables

Si se quiere reducir proveedores:

- Frontend y backend pueden desplegarse juntos en Render.
- Frontend puede ir en Netlify en lugar de Vercel.
- Backend puede ir en Railway o Fly.io en lugar de Render.
- Una VPS puede alojar frontend, backend y reverse proxy, pero requiere mas mantenimiento.

Para este proyecto, la combinacion Vercel + Render + MongoDB Atlas es la mas directa para un MVP profesional.
