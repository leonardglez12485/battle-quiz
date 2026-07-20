# Despliegue: Render + Neon

Guía paso a paso para dejar el backend corriendo en Render con la base de
datos en Neon. El resultado es una URL pública (ej. `https://battlequiz-api.onrender.com`)
que la app móvil MAUI consumirá por HTTP.

## 1. Crear la base de datos en Neon

1. Entrá a https://neon.tech y creá un proyecto (elegí la región más cercana a
   la región de Render que vayas a usar, p. ej. AWS us-east).
2. Creá una base de datos llamada `battlequiz` (o el nombre que prefieras).
3. En **Connection Details**, copiá DOS cadenas:
   - **Pooled connection** (la que tiene `-pooler` en el host) → será `DATABASE_URL`.
   - **Direct connection** (sin `-pooler`) → será `DIRECT_URL`.
   Ambas deben terminar en `?sslmode=require`.

Por qué dos: el runtime usa el pooler (mejor para serverless), pero Prisma
necesita la conexión directa para aplicar migraciones.

## 2. Subir el código a un repositorio Git

Render despliega desde GitHub/GitLab. Subí la carpeta `backend/` a un repo.
Si el repo contiene también `mobile/`, no hay problema: en el paso 3 se indica
el subdirectorio.

## 3. Crear el Web Service en Render

Opción A — con el archivo `render.yaml` (Blueprint, recomendado):

1. En Render: **New > Blueprint**, conectá el repo. Render lee `render.yaml`.
2. Si el backend está en un subdirectorio (`/backend`), descomentá `rootDir: backend`
   en `render.yaml` antes de subirlo.
3. Render crea el servicio con estos comandos ya definidos:
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npx prisma migrate deploy && node dist/main`
   - Health check: `/health`

Opción B — manual:

1. **New > Web Service**, conectá el repo.
2. Runtime: **Node**. Root Directory: `backend` (si aplica).
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npx prisma migrate deploy && node dist/main`
5. Health Check Path: `/health`

## 4. Variables de entorno en Render

En el servicio → **Environment**, agregá:

| Clave | Valor |
|-------|-------|
| `DATABASE_URL` | cadena **pooled** de Neon (`...-pooler...?sslmode=require`) |
| `DIRECT_URL` | cadena **directa** de Neon (`...?sslmode=require`) |
| `JWT_SECRET` | un secreto largo y aleatorio (Render puede generarlo) |
| `JWT_EXPIRES_IN` | `60m` |
| `NODE_ENV` | `production` |

`PORT` lo inyecta Render automáticamente; el código lo lee de `process.env.PORT`.

## 5. Deploy

Render corre el build y el start. En el primer arranque, `prisma migrate deploy`
crea todas las tablas en Neon. Cuando el servicio quede **Live**, verificá:

```
GET https://TU-SERVICIO.onrender.com/health
→ { "status": "ok", "database": "up" }
```

Swagger queda en `https://TU-SERVICIO.onrender.com/docs`.

## 6. Cargar los catálogos (seed)

`migrate deploy` crea las tablas pero no corre el seed automáticamente. Para
cargar categorías, dificultades, tipos de pregunta y logros, una opción simple
es abrir un **Shell** en el servicio de Render y ejecutar:

```bash
npm run prisma:seed
```

(Alternativa: agregar el seed al Start Command la primera vez, o correrlo desde
tu máquina apuntando `DATABASE_URL` a Neon.)

## Notas

- **Plan free de Render**: el servicio se "duerme" tras inactividad y tarda unos
  segundos en despertar en la primera request. Para producción real, subir de plan.
- **Neon free**: suficiente para desarrollo y una primera versión.
- Las **preguntas** (contenido) se cargan aparte por scripts SQL, no por el
  seed de catálogos — v1 no tiene panel de administración.
