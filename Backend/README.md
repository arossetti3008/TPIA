# Nódos — Backend (Fase 1: modelos + autenticación)

Backend del proyecto "Nódos", construido con Express + MongoDB (Mongoose) + JWT.

## Qué incluye esta fase

- **Modelos** (`src/models/`): `Usuario`, `Nodo`, `Conversacion`, `Evaluacion`, mapeados desde el diagrama UML del TP.
- **Autenticación**: registro, login, refresh token, ruta protegida `/api/auth/perfil`.
- **Seguridad**: contraseñas hasheadas con bcrypt, JWT de corta duración + refresh token, `helmet`, CORS restringido a un solo origen, rate limiting (global y específico en auth), límite de tamaño de payload.
- **Seed**: script que carga los 5 conceptos del árbol (Contraste, Ritmo, Jerarquía, Gestalt, Tensión) con sus prerrequisitos.

## Cómo correrlo localmente

```bash
npm install
cp .env.example .env
# completá .env con tu MONGO_URI real de MongoDB Atlas y tus propios JWT_SECRET

npm run seed   # carga los 5 nodos en la base (una sola vez)
npm run dev    # levanta el servidor con nodemon en el puerto 5000
```

Probá que esté vivo: `GET http://localhost:5000/api/health`

## Endpoints disponibles

| Método | Ruta                  | Protegida | Descripción                          |
|--------|-----------------------|-----------|---------------------------------------|
| POST   | `/api/auth/registro`  | No        | Crea un usuario nuevo                 |
| POST   | `/api/auth/login`     | No        | Devuelve `accessToken` + `refreshToken` |
| POST   | `/api/auth/refresh`   | No        | Renueva el `accessToken`              |
| GET    | `/api/auth/perfil`    | Sí (JWT)  | Devuelve los datos del usuario logueado |

Para las rutas protegidas, mandá el header:
`Authorization: Bearer <accessToken>`

## Setup en MongoDB Atlas (free tier)

1. Creá una cuenta en https://www.mongodb.com/cloud/atlas
2. Creá un cluster **M0 (gratis)**.
3. En "Database Access", creá un usuario con password.
4. En "Network Access", agregá `0.0.0.0/0` (o la IP de Render cuando la tengas) para que el backend pueda conectarse.
5. Copiá el connection string y pegalo en `MONGO_URI` dentro de tu `.env`.

## Deploy en Render

1. Subí este repo a GitHub (repo separado del frontend, tal como definiste).
2. En Render: **New > Web Service**, conectá el repo.
3. Build command: `npm install` — Start command: `npm start`
4. Cargá TODAS las variables de `.env.example` en la sección **Environment** de Render (nunca subas el `.env` al repo).
5. En `FRONTEND_URL`, poné la URL real de tu deploy en Vercel para que CORS funcione.

## Importante sobre seguridad

- El `.env` está en `.gitignore`: nunca lo subas a GitHub.
- `JWT_SECRET` y `JWT_REFRESH_SECRET` deben ser distintos entre sí y generados vos mismo (no uses el valor de ejemplo).
- El `passwordHash` del usuario nunca se devuelve en las respuestas de la API (está marcado `select: false` en el modelo).

## Próxima fase

Fase 2: lógica del árbol de habilidades y sistema de desbloqueo progresivo (endpoints `GET /api/nodos` y `PATCH /api/nodos/:id/dominar`), usando el campo `progreso` del modelo `Usuario`.
