# Backend Testing

La suite usa el runner nativo de Node.js: `node --test`. No requiere `jest`, `supertest` ni dependencias nuevas.

## Requisitos

- Node.js 20 o superior.
- MongoDB disponible.

Para desarrollo local con Docker:

```powershell
docker run -d --name antoniotrinidad-mongo -p 27017:27017 mongo:7
```

Si el contenedor ya existe:

```powershell
docker start antoniotrinidad-mongo
```

## Variables de entorno

Los tests usan estas variables si no estan definidas:

```env
NODE_ENV=test
PORT=0
MONGODB_URI=mongodb://127.0.0.1:27017/antoniotrinidad-test
JWT_SECRET=test-secret-for-antoniotrinidad-backend
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:5173
```

Puedes copiar `.env.test.example` como referencia si quieres correrlos contra otra base:

```powershell
Copy-Item .env.test.example .env.test
```

La suite hace `dropDatabase()` sobre la base indicada en `MONGODB_URI`, asi que no debe apuntar a una base con datos reales.

## Ejecutar

Con npm funcionando:

```powershell
npm test
```

Sin npm:

```powershell
node --test
```

Lint y cobertura:

```powershell
npm run lint
npm run test:coverage
```

La ultima ejecucion local obtuvo:

- Lineas: `95.44%`
- Ramas: `85.09%`
- Funciones: `94.74%`

La cobertura es una referencia del estado actual y debe revisarse en cada cambio; no sustituye pruebas de comportamiento.

## Cobertura actual

La suite E2E cubre:

- `GET /api/health`
- Estado `503` de health cuando MongoDB esta desconectado
- Validacion de variables de entorno obligatorias y formatos seguros
- Validacion y persistencia de `POST /api/contact`
- Deduplicacion, honeypot y rate limiting del formulario de contacto
- Filtros, busqueda, estados y eliminacion administrativa de mensajes
- Proteccion JWT de rutas privadas
- Login de administrador y `GET /api/auth/me`
- Claims JWT, tokens invalidos, usuarios eliminados y autorizacion por rol
- Creacion idempotente del administrador inicial
- Creacion y listado de categorias
- Creacion y consulta publica de proyectos por `slug`
- CRUD completo de proyectos, duplicados, filtros, busqueda literal, paginacion y destacados
- Creacion de posts, normalizacion de tags y visibilidad publica solo de posts publicados
- CRUD de categorias, unicidad por tipo y validacion de filtros
- Programacion de posts, Markdown, reading time, filtros, destacados y ciclo draft/published

## Archivos

- Suite: `test/api.test.js`
- Configuracion: `test/env.test.js`
- Runner: `node --test`
- Script: `npm test`
