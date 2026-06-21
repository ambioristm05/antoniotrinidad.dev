# Frontend

## Entorno

Configura la URL base del backend en `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Para produccion usa `.env.production.example` como referencia.

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
corepack pnpm build
corepack pnpm test
corepack pnpm check
```
