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

## Cobertura actual

La suite E2E cubre:

- `GET /api/health`
- Validacion y persistencia de `POST /api/contact`
- Proteccion JWT de rutas privadas
- Login de administrador y `GET /api/auth/me`
- Creacion y listado de categorias
- Creacion y consulta publica de proyectos por `slug`
- Creacion de posts, normalizacion de tags y visibilidad publica solo de posts publicados

## Archivos

- Suite: `test/api.test.js`
- Runner: `node --test`
- Script: `npm test`
