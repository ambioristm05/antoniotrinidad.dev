# Planning: Portfolio y Blog Fullstack MERN

## 1. Objetivo del proyecto

Crear un sitio web profesional para portafolio personal y blog técnico usando el stack MERN:

- MongoDB para persistencia de datos.
- Express.js y Node.js para la API backend.
- React para el frontend.
- Mongoose como ODM para MongoDB.

El sitio debe servir como carta de presentación profesional, mostrar proyectos, publicar artículos, permitir contacto y contar con un panel administrativo para gestionar contenido.

## 2. Alcance principal

### Funcionalidades publicas

- Home profesional con resumen, especialidad, llamadas a la accion y proyectos destacados.
- Pagina "Sobre mi" con experiencia, habilidades, enfoque profesional y trayectoria.
- Pagina de proyectos con filtros por tecnologia, categoria o estado.
- Pagina individual de proyecto con descripcion, stack, imagenes, enlaces, retos y resultados.
- Blog con listado de articulos, categorias, etiquetas y busqueda.
- Pagina individual de articulo con contenido enriquecido.
- Formulario de contacto con validacion y envio al backend.
- SEO basico por pagina.
- Diseno responsive para mobile, tablet y desktop.

### Funcionalidades privadas

- Login de administrador.
- Dashboard administrativo.
- CRUD de proyectos.
- CRUD de articulos del blog.
- Gestion de categorias y etiquetas.
- Gestion de mensajes recibidos desde el formulario de contacto.
- Subida o vinculacion de imagenes para proyectos y articulos.

## 3. Stack tecnico

### Frontend

- React.
- React Router.
- Vite.
- Tailwind CSS o CSS Modules.
- Axios o TanStack Query para consumo de API.
- React Hook Form para formularios.
- Zod o Yup para validacion.
- Markdown/MDX o editor enriquecido para articulos.

### Backend

- Node.js.
- Express.js.
- MongoDB.
- Mongoose.
- JWT para autenticacion.
- bcrypt para hash de contrasenas.
- CORS configurado por entorno.
- dotenv para variables de entorno.
- Helmet para headers de seguridad.
- express-rate-limit para proteger endpoints sensibles.

### DevOps y despliegue

- Frontend: Vercel, Netlify o Render.
- Backend: Render, Railway, Fly.io o VPS.
- Base de datos: MongoDB Atlas.
- Imagenes: Cloudinary, S3 compatible o almacenamiento externo.
- Dominio personalizado.
- SSL habilitado.

## 4. Arquitectura propuesta

```text
root/
  client/
    src/
      assets/
      components/
      features/
      hooks/
      layouts/
      pages/
      routes/
      services/
      styles/
      utils/
  server/
    src/
      config/
      controllers/
      middlewares/
      models/
      routes/
      services/
      utils/
      validators/
    tests/
  planning.md
  README.md
```

## 5. Modelo de datos inicial

### User

- name
- email
- passwordHash
- role
- avatar
- createdAt
- updatedAt

### Project

- title
- slug
- summary
- description
- coverImage
- gallery
- technologies
- category
- status
- featured
- liveUrl
- repoUrl
- startDate
- endDate
- createdAt
- updatedAt

### Post

- title
- slug
- excerpt
- content
- coverImage
- author
- category
- tags
- status: draft | published
- featured
- publishedAt
- readingTime
- createdAt
- updatedAt

### Category

- name
- slug
- type: project | post
- createdAt
- updatedAt

### ContactMessage

- name
- email
- subject
- message
- status: unread | read | archived
- createdAt

## 6. API inicial

### Auth

- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/me`

### Projects

- GET `/api/projects`
- GET `/api/projects/featured`
- GET `/api/projects/:slug`
- POST `/api/projects`
- PATCH `/api/projects/:id`
- DELETE `/api/projects/:id`

### Posts

- GET `/api/posts`
- GET `/api/posts/featured`
- GET `/api/posts/:slug`
- POST `/api/posts`
- PATCH `/api/posts/:id`
- DELETE `/api/posts/:id`

### Categories

- GET `/api/categories`
- POST `/api/categories`
- PATCH `/api/categories/:id`
- DELETE `/api/categories/:id`

### Contact

- POST `/api/contact`
- GET `/api/contact/messages`
- PATCH `/api/contact/messages/:id`
- DELETE `/api/contact/messages/:id`

## 7. Paginas del frontend

### Publicas

- `/` Home.
- `/about` Sobre mi.
- `/projects` Listado de proyectos.
- `/projects/:slug` Detalle de proyecto.
- `/blog` Listado del blog.
- `/blog/:slug` Detalle de articulo.
- `/contact` Contacto.
- `/privacy` Politica de privacidad.

### Administracion

- `/admin/login`
- `/admin`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/:id/edit`
- `/admin/posts`
- `/admin/posts/new`
- `/admin/posts/:id/edit`
- `/admin/categories`
- `/admin/messages`

## 8. Diseno y experiencia de usuario

- Estilo profesional, limpio y moderno.
- Priorizar legibilidad, velocidad y navegacion clara.
- Home con mensaje directo: quien eres, que haces y que puedes resolver.
- Proyectos con evidencia concreta: problema, solucion, tecnologias y resultado.
- Blog enfocado en conocimiento tecnico, procesos y aprendizajes.
- CTA visibles hacia contacto, CV, GitHub, LinkedIn y proyectos.
- Tema claro/oscuro opcional.
- Animaciones sutiles, sin afectar rendimiento.

## 9. Seguridad

- Validar datos en frontend y backend.
- Proteger rutas administrativas con JWT.
- Hash de contrasenas con bcrypt.
- Rate limiting en login y contacto.
- Sanitizar contenido del blog si se permite HTML.
- Configurar CORS por dominio.
- No exponer variables sensibles en el frontend.
- Manejo centralizado de errores.

## 10. SEO y rendimiento

- Meta title y description por pagina.
- Slugs limpios para proyectos y posts.
- Open Graph para compartir enlaces.
- Sitemap y robots.txt.
- Lazy loading de imagenes.
- Compresion de imagenes.
- Code splitting en React.
- Cache HTTP para assets estaticos.
- Buenas metricas Core Web Vitals.

## 11. Testing

### Backend

- Tests unitarios para servicios principales.
- Tests de integracion para endpoints criticos.
- Validar autenticacion y autorizacion.
- Validar CRUD de proyectos y posts.

### Frontend

- Tests de componentes principales.
- Tests de formularios.
- Tests de flujos criticos: login, crear post, crear proyecto, contacto.

### QA manual

- Revisar responsive en mobile, tablet y desktop.
- Revisar navegacion completa.
- Revisar estados vacios, loading y errores.
- Revisar accesibilidad basica con teclado.

## 12. Fases de desarrollo

### Fase 1: Preparacion

- Definir identidad visual basica.
- Crear repositorio y estructura `client` / `server`.
- Configurar Vite, Express, ESLint y variables de entorno.
- Conectar MongoDB Atlas.
- Crear README inicial.

### Fase 2: Backend base

- Configurar servidor Express.
- Configurar MongoDB con Mongoose.
- Crear modelos principales.
- Crear middleware de errores.
- Crear validaciones.
- Crear rutas publicas iniciales.

### Fase 3: Autenticacion y administracion

- Implementar login con JWT.
- Crear middleware de autenticacion.
- Proteger rutas privadas.
- Crear primer usuario administrador.
- Crear layout del dashboard.

### Fase 4: Proyectos

- Implementar CRUD de proyectos en backend.
- Crear paginas publicas de proyectos.
- Crear vistas administrativas para crear, editar y eliminar proyectos.
- Agregar filtros y proyectos destacados.

### Fase 5: Blog

- Implementar CRUD de posts.
- Definir formato de contenido: Markdown, MDX o editor enriquecido.
- Crear listado publico del blog.
- Crear detalle de articulo.
- Crear editor administrativo.
- Agregar categorias, tags y busqueda.

### Fase 6: Contacto

- Crear formulario publico.
- Validar y guardar mensajes.
- Agregar proteccion anti-spam basica.
- Crear vista administrativa de mensajes.
- Opcional: enviar email de notificacion.

### Fase 7: Pulido visual

- Refinar responsive.
- Agregar microinteracciones.
- Optimizar tipografia, espaciado y contraste.
- Revisar accesibilidad.
- Preparar contenido real: bio, proyectos, articulos iniciales.

### Fase 8: SEO, rendimiento y despliegue

- Configurar metadata.
- Crear sitemap y robots.txt.
- Optimizar imagenes.
- Configurar variables de produccion.
- Desplegar frontend, backend y base de datos.
- Conectar dominio.
- Revisar logs y errores en produccion.

## 13. Prioridades MVP

El MVP debe incluir:

- Home.
- Sobre mi.
- Listado y detalle de proyectos.
- Blog con listado y detalle de posts.
- Formulario de contacto.
- Login administrador.
- CRUD de proyectos.
- CRUD de posts.
- Despliegue funcional.

Puede quedar para una segunda version:

- Comentarios en blog.
- Newsletter.
- Busqueda avanzada.
- Tema claro/oscuro.
- Analiticas internas.
- Multiusuario.
- Internacionalizacion.

## 14. Variables de entorno sugeridas

### Server

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Client

```env
VITE_API_URL=http://localhost:5000/api
```

## 15. Checklist de entrega

- El sitio carga correctamente en produccion.
- Todas las paginas publicas funcionan.
- El dashboard permite gestionar proyectos y posts.
- Los formularios tienen validacion y estados de error.
- Las rutas privadas estan protegidas.
- El sitio es responsive.
- El contenido real esta cargado.
- Las imagenes estan optimizadas.
- SEO basico configurado.
- README actualizado con instalacion, scripts y variables.
- Backups o estrategia de respaldo definidos para MongoDB.

## 16. Roadmap posterior

- Agregar newsletter.
- Agregar sistema de comentarios moderados.
- Agregar panel de analiticas.
- Agregar version en ingles.
- Agregar descarga de CV desde el CMS.
- Agregar integracion con GitHub API para proyectos.
- Agregar busqueda full-text en posts y proyectos.
- Agregar RSS feed para el blog.
