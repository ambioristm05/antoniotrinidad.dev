# Backend Security

## Controles implementados

- Helmet para headers HTTP seguros.
- CORS limitado exactamente a `CLIENT_URL`.
- JWT firmado y verificado con `HS256`.
- Passwords almacenados con bcrypt y nunca incluidos en JSON.
- Rate limiting general, de login y de contacto.
- Honeypot y deduplicacion para mensajes publicos.
- Limite de 1 MB para bodies JSON y formularios.
- Validacion de body y query en endpoints publicos y administrativos.
- Busquedas escapadas antes de construir expresiones regulares.
- Errores internos sin stack ni detalles en produccion.
- Timeouts HTTP y MongoDB para evitar conexiones colgadas.
- Usuario administrador unico e idempotente.

## Secretos

En produccion:

- Usa un `JWT_SECRET` aleatorio de al menos 32 caracteres.
- Guarda secretos solo en Render o el proveedor elegido.
- Nunca subas `.env` al repositorio.
- Elimina `ADMIN_PASSWORD` del entorno despues de crear el administrador.
- Para rotar el password, configura `ADMIN_PASSWORD` temporalmente, ejecuta
  `npm run reset:admin-password` y vuelve a eliminar la variable.
- Rota `JWT_SECRET` si se sospecha exposicion; esto invalida todos los tokens existentes.
- Usa un usuario MongoDB Atlas limitado a la base de esta aplicacion.

## JWT en el frontend

La API devuelve el JWT en el body. El frontend debe:

- Evitar incluirlo en logs o URLs.
- Enviarlo solo mediante `Authorization: Bearer <token>`.
- Eliminarlo al cerrar sesion.
- Evitar HTML sin sanitizar y dependencias que puedan introducir XSS.

## Contenido Markdown

Los posts almacenan Markdown. El frontend debe mantener deshabilitado el HTML crudo o sanitizarlo con una libreria mantenida antes de renderizarlo.

## Red y proxy

- Usa HTTPS para frontend y backend.
- En Render/Railway configura `TRUST_PROXY=1` para que el rate limit vea la IP real.
- Restringe MongoDB Atlas Network Access al proveedor cuando sea posible.
- No uses `0.0.0.0/0` permanentemente sin controles adicionales.

## Dependencias

Ejecuta regularmente:

```bash
npm audit
npm run lint
npm test
```

Las dependencias `bcrypt` y `cookie-parser` fueron retiradas porque el backend usa `bcryptjs` y autenticacion Bearer, sin cookies.

## Backups e incidentes

- Activa backups de Atlas antes de cargar contenido real.
- Crea un backup antes de cambios de esquema o migraciones.
- Ante una exposicion: rota credenciales Atlas, `JWT_SECRET` y password admin; revisa logs y redepliega.
