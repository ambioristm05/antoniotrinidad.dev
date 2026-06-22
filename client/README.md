# Frontend

## Entorno

Configura la URL base del backend en `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SITE_URL=http://localhost:5173
```

Para produccion usa `.env.production.example` como referencia.

`VITE_SITE_URL` se usa para enlaces canonical, Open Graph y sitemap. El script
`pnpm sitemap` consulta el API y añade proyectos completados y artículos publicados;
si el API no está disponible, conserva las rutas públicas estáticas.

Las rutas se cargan bajo demanda. `postbuild` comprueba que ningún chunk JavaScript
supere 300 KB y `vercel.json` configura fallback SPA, caché inmutable para assets y
headers básicos de seguridad.

## Cliente HTTP

`src/services/httpClient.js` centraliza:

- URL base y query params.
- Serializacion JSON.
- Timeout de 10 segundos.
- Errores HTTP, de red, cancelacion y timeout mediante `ApiError`.
- Respuestas `204`.
- Soporte para token Bearer mediante `getAccessToken`.

`src/services/api.js` contiene los endpoints de negocio.

## Autenticacion

- El JWT administrativo se conserva en `sessionStorage`, no en almacenamiento permanente.
- `AuthProvider` restaura la sesion mediante `GET /auth/me`.
- Un `401` elimina automaticamente el token.
- `ProtectedRoute` bloquea todo `/admin` y redirige a `/admin/login`.
- Cerrar sesion elimina el token y vuelve al login.

## Scripts

```bash
corepack pnpm dev
corepack pnpm sitemap
corepack pnpm build
corepack pnpm test
corepack pnpm check
```
