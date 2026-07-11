# GofiGeeks GraphQL Backend

![Node.js](https://img.shields.io/badge/Node.js-24%2B-339933?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![GraphQL](https://img.shields.io/badge/GraphQL-16-E10098?logo=graphql)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791?logo=postgresql)
![Drizzle](https://img.shields.io/badge/Drizzle%20ORM-0.45-C5D9F1)

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Runtime** | Node.js | 24+ |
| **Lenguaje** | TypeScript | 6.0.3 |
| **Servidor GraphQL** | GraphQL Yoga | 5.21.2 |
| **ORM** | Drizzle ORM | 0.45.2 |
| **Base de datos** | PostgreSQL | 15+ |
| **Autenticación** | Better-Auth | 1.6.19 |
| **Almacenamiento** | Supabase Storage | 2.108.2 |


## 📋 Prerequisitos

- **Node.js** 24.x o superior
- **Supabase** cuenta con proyecto configurado (para almacenamiento de archivos y base de datos)


## 🚀 Preparación

### 1. Clonar y instalar

```bash
git clone <repository-url>
cd gofigeeks-gql-backend
npm install
```

### 2. Configurar variables de entorno

Abre el archivo `.env` y obten las variables de entorno de tu proyecto de supabase.

### 3. Crear y migrar la base de datos

Como usamos drizzle para gestionar cambios en base de datos, cada vez que cambies un archivo `*.schema.ts` deberas usar los siguientes comandos. Al **iniciar el proyecto** por primera vez, tambien deberas usarlos.

```bash
# Generar migraciones y schema de autenticación
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Inicializar datos (la primera vez, y en el punto 14, pero puedes ir haciendolo desde el principio)
npm run db:seed
```

### 4. Iniciar servidor en desarrollo

```bash
npm run dev
```

Si estas usando vscode, se recomienda usar `F5` para iniciar el debugger, en lugar de `npm run dev`.

El servidor estará disponible en `http://localhost:4000/graphql`. En este enlace dispondras de un playground de graphql, aunque también puedes usar Postman si lo prefieres.


### 5. Instala una Herramienta de Red

Uno de los mayores puntos de fricción con GraphQL es el seguimiento de sus peticiones. Ya que la tradicional pestaña de Red disponible en las Herramientas de Desarrollo de Chrome no están planteadas para trabajar con este tipo de apis.

Para trabajar con fluidez, necesitarás instalar alguna extensión que te permita seguir mejor lo que está pasando. Instala alguna de las siguientes opciones:

- [Recomendada] [GraphQL Network](https://chromewebstore.google.com/detail/graphql-network/kioemmijacihfbmkedmodekdhggddgck)
- [GraphQL Network Inspector](https://chromewebstore.google.com/detail/graphql-network-inspector/ndlbedplllcgconngcnfmkadhokfaaln)


## 🔧 Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor en modo watch (desarrollo) |
| `npm run db:generate` | Genera migraciones y schema de autenticación |
| `npm run db:migrate` | Ejecuta las migraciones pendientes |

El resto de comandos no necesitas conocerlos


## 📡 API GraphQL

El servidor contiene una estructura por defecto que facilita los siguientes puntos:

- Formateado y corrección de codigo con eslint y prettier
- Lectura automática de archivos `.gql`
- Extension del sistema de tipos mediante la libreria [Scalars](https://the-guild.dev/graphql/scalars)
- Simplificación de la escritura de DataLoaders siguiendo la metodología de [Mercurius](https://mercurius.dev/#/docs/loaders)
- Mutaciones de autenticación usando cookies (signIn y singOut) [better-auth](https://better-auth.com/)
- ORM de base de datos usando [drizzle](https://orm.drizzle.team/)

No tienes por que entender todo, simplemente te dejo esta información para que tengas una visión de las cosas añadidas que tiene este proyecto.


## 🗄️ Estructura del Proyecto

```
src/
├── app/
│   ├── graphql/
│   │   ├── resolvers/             # Resolvers de Query/Mutation/Subscription
│   │   ├── loaders/               # DataLoaders para batch loading
│   │   ├── directives/            # Directivas
│   │   ├── schema.ts              # Schema combinado de GraphQL
│   │   ├── type-defs.ts           # Definiciones de tipos GraphQL
│   │   └── loaders.ts             # Configuración de loaders
│   ├── env.ts                     # Validación de variables de entorno
│   ├── init-db.ts                 # Inicialización de base de datos
│   └── index.ts                   # Entry point del servidor
│
└── contexts/                      # Lógica de dominio por contexto
    ├── auth/                      # Autenticación y autorización
    ├── role/                      # Roles disponibles
    ├── shared/                    # Utilidades compartidas (DDD base classes)
    └── user/                      # Perfiles de usuario
```


## 🔐 Autenticación

El proyecto utiliza **Better-Auth** para gestionar:

- ✅ Registro y login con email/contraseña
- ✅ Gestión de sesiones
- ✅ Control de roles (admin, usuario)
- ✅ Directiva GraphQL `@auth` para proteger queries/mutations


## Alternativa a Supabase (opcional)

Si no quieres usar supabase, puedes utilizar una base de datos sqlite que no requiere instalacion en tu ordenador. Y para el almacenamiento de archivos, sustituir las llamadas a supabase por escrituras en una carpeta dentro de tu proyecto, por ejemplo `/public`. Este sistema no funcionará en la mayoría de los cloud hosting.

Para usar sqlite, debes cambiar el adaptador de drizzle por el de [sqlite](https://orm.drizzle.team/docs/get-started/node-sqlite-new).


## Empieza el workshop

Echale un vistazo al código, no te pares mucho en las partes mas complejas. Pero si entiende los archivos principales: index, resolvers, schema.

Comprueba que la autenticación funciona y te está devolviendo un cookie. Comprueba que puedes ejecutar una migracion de base de datos sin problemas.

Una vez tengas una vision general de como funciona, escoge que proyecto deseas implementar:

- [Twitter clon](./guide.twitter.md)
- [Tiktok clon](./guide.tiktok.md)


## 📖 Enlaces de interés

- [GraphQL Documentation](https://graphql.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better-Auth](https://better-auth.dev/)
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
- [Supabase](https://supabase.com/)

---

# 🐳 Local infra & deployment (TikTok clone)

This implementation runs a **local, self-hostable "supabase-style" stack** instead
of hosted Supabase: **Postgres** for the database and **MinIO** (S3-compatible) for
video/thumbnail storage. Uploads go through an S3 client (`@aws-sdk/client-s3`) —
see `src/contexts/shared/storage.ts`.

## Local development

```bash
# 1. Start Postgres + MinIO + a public "uploads" bucket + Adminer
docker compose up -d

# 2. Copy env and (optionally) tweak values
cp .env.example .env

# 3. Create schema + seed deterministic data (5 users, 40 videos, likes)
npm run db:generate   # first time / after changing a *.schema.ts
npm run db:migrate
npm run db:seed

# 4. Run the API (http://localhost:4000/graphql)
npm run dev
```

Services: Postgres `:5432`, MinIO API `:9000`, MinIO console `:9001`
(`minioadmin`/`minioadmin`), Adminer `:8080`.

Test accounts (password = the part before `@`): `admin@example.com` / `admin`,
`user@example.com` / `user`.

## Environment variables

See `.env.example`. Storage uses `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`,
`S3_BUCKET` and `S3_PUBLIC_URL` (the public base URL objects are served from).
Auth uses `BETTER_AUTH_SECRET` (≥32 chars in prod: `openssl rand -base64 32`),
`BETTER_AUTH_URL` and `TRUSTED_ORIGINS` (comma-separated frontend origins for CORS
+ credentialed cookies).

## Testing

```bash
npm run test    # Vitest against yoga.fetch (no real HTTP server)
```

## Docker Swarm (smoke test)

```bash
docker swarm init                       # once
docker build -t tiktok-backend:latest .
docker stack deploy -c docker-stack.yml tiktok
docker service ls
```

The image runs `drizzle-kit migrate` then boots via `tsx` (so TS path aliases and
ESM imports resolve exactly as in dev). Override defaults with env vars consumed
by `docker-stack.yml` (`POSTGRES_PASSWORD`, `BETTER_AUTH_SECRET`,
`MINIO_ROOT_USER/PASSWORD`, `S3_PUBLIC_URL`, `BACKEND_IMAGE`, …). After deploy,
seed once: `docker exec <backend-task> npm run db:seed`.

## CapRover

1. **Postgres**: deploy the one-click "PostgreSQL" app. Note its internal
   host/credentials → build `DATABASE_URL`.
2. **MinIO**: deploy a MinIO app (or point at any S3 provider). Create a public
   `uploads` bucket. Enable HTTPS + a domain; `S3_PUBLIC_URL` must be the
   **externally reachable** URL clients use to load videos.
3. **Backend**: this repo ships a `captain-definition` (→ `Dockerfile`). Deploy
   with `caprover deploy` or Git. In the app's **App Configs**, set all env vars
   (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` = the app's HTTPS URL,
   `TRUSTED_ORIGINS` = frontend origin, and the `S3_*` block). Enable HTTPS and
   "Websocket Support" (for GraphQL SSE subscriptions).
4. For production cookies over HTTPS, better-auth issues `Secure`/`SameSite`
   cookies automatically once `BETTER_AUTH_URL` is an `https://` origin.

> The migrations run on container start, so a fresh deploy provisions its own
> schema. Run `db:seed` manually only if you want demo data.
