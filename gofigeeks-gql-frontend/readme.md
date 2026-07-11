# GofiGeeks GraphQL Backend

![Node.js](https://img.shields.io/badge/Node.js-24%2B-339933?logo=node.js)
![GraphQL](https://img.shields.io/badge/GraphQL-16-E10098?logo=graphql)


## 📋 Prerequisitos

- **Node.js** 24.x o superior

## 🚀 Preparación

### 1. Prepara tu repositorio

Inicializa este repo con tu framework preferido: react, vue o angular. Configura el proyecto a tu gusto personal, utiliza librerías de componentes si te gusta alguna.


### 2. Prepara la conexión con GraphQL

Una vez tienes el codigo base, añade conexión con tu backend. No necesitas la url ahora mismo, solamente instala las dependencias necesarias siguiendo la guía que necesites:

- Vue - https://apollo.vuejs.org/
- React - https://www.apollographql.com/docs/react/get-started
- Angular - https://the-guild.dev/graphql/apollo-angular/docs/get-started

Para probar el correcto funcionamiento, puedes usar alguna api publica de GraphQL como https://graphql.anilist.co. Tienes toda la información en [Anilist](https://docs.anilist.co/).

> **Nota:** Instala apollo client versión 3 `npm i @apollo/client@3`


### 3. Deshabilitar la cache

Te habrás fijado que Apollo utiliza una cache en memoria por defecto. Esto evita llamadas innecesarias mediante algunos mecanismos bastante inteligentes y útiles. Sin embargo, requieren práctica y no es el propósito de este taller. Para aprender, deshabilitaremos su uso modificando la configuracion actual por la siguiente:

```js
new ApolloClient({ 
    link,
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: { 
            fetchPolicy: ‘no-cache’
        },
        query: {
            fetchPolicy: ‘no-cache’
        }, mutate: {
            fetchPolicy: ‘no-cache’
        },
    }
})
```


### 4. Añade soporte para archivos

Durante la practica necesitarás soporte para enviar archivos a través de graphql

```sh
npm i apollo-upload-client@17
```

Para utilizarlo, simplemente remplaza el metodo anterior para crear el link por el nuevo:

```js
import { createUploadLink } from 'apollo-upload-client'

const link = createUploadLink({ uri: '...' })
```


### 5. Añade soporte para subscriptions

Las subscriptions son peticiones que transmiten datos constantemente, sin cerrar la conexión. Existen varias librerías que añaden soporte, en función del protocolo interno que se quiera usar. En nuestro caso:

```sh
npm i graphql-sse
```

Y sustituye el link que acabamos de crear por:

```js
import { ApolloClient, ApolloLink, InMemoryCache, Observable, split } from '@apollo/client/core'
import { getMainDefinition } from '@apollo/client/utilities'
import { createUploadLink } from 'apollo-upload-client'
import { print } from 'graphql'
import { createClient } from 'graphql-sse'

const httpLink = createUploadLink({
  uri: '...',
})

const sseClient = createClient({
  url: '...',
})

const sseLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const { query, variables, operationName } = operation

    const unsubscribe = sseClient.subscribe(
      {
        query: print(query),
        variables,
        operationName,
      },
      {
        next: (data) => observer.next(data),
        error: (err) => observer.error(err),
        complete: () => observer.complete(),
      },
    )

    return () => unsubscribe()
  })
})

const link = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  sseLink,
  httpLink,
)
```


### 6. Instala una Herramienta de Red

Uno de los mayores puntos de fricción con GraphQL es el seguimiento de sus peticiones. Ya que la tradicional pestaña de Red disponible en las Herramientas de Desarrollo de Chrome no están planteadas para trabajar con este tipo de apis.

Para trabajar con fluidez, necesitarás instalar alguna extensión que te permita seguir mejor lo que está pasando. Instala alguna de las siguientes opciones:

- [Recomendada] [GraphQL Network](https://chromewebstore.google.com/detail/graphql-network/kioemmijacihfbmkedmodekdhggddgck)
- [GraphQL Network Inspector](https://chromewebstore.google.com/detail/graphql-network-inspector/ndlbedplllcgconngcnfmkadhokfaaln)



## Empieza el workshop

Esta es toda la configuración que necesitas! Cuando llegue el dia del taller, escoge el proyecto que quieres realizar y comienza su implementación:

- [Twitter clon](./guide.twitter.md)
- [Tiktok clon](./guide.tiktok.md)


## 📖 Enlaces de interés

- [GraphQL Documentation](https://graphql.org/)
- [Apollo Upload Client](https://github.com/jaydenseric/apollo-upload-client)

---

# 🎬 TikTok clone frontend (implementation notes)

**Stack:** React + Vite + TypeScript, Tailwind CSS v4, Apollo Client v3
(cache disabled), `apollo-upload-client` for uploads, `graphql-sse` for
subscriptions. Points at our own backend (`gofigeeks-gql-backend`).

## Local development

```bash
# Backend must be running first (see ../gofigeeks-gql-backend):
#   docker compose up -d && npm run db:migrate && npm run db:seed && npm run dev

npm install
# .env already sets VITE_API_URL=http://localhost:4000/graphql
npm run dev          # http://localhost:5173
```

Log in with `admin@example.com` / `admin` (or `user@example.com` / `user`).

The backend's `TRUSTED_ORIGINS` must include the frontend origin
(`http://localhost:5173` locally) so credentialed CORS + the session cookie
work.

## What's implemented (all 9 guide steps)

1. Login/session via `signIn`/`signOut`/`session`; cookie-based, survives reload;
   protected routes redirect to `/login`.
2–3. Sidebar layout + full-viewport vertical **snap feed**; autoplay-on-visible;
   creator/description/like overlay.
4. Cursor **infinite scroll** (5/page) via IntersectionObserver + skeletons.
5–6. **Upload** modal (video + optional thumbnail) → `upload` then `publishVideo`.
7. **Profile** view (`user(id)` + `videos(filters:{userId})`) as a thumbnail grid.
8. **New-videos banner** via the `videos` subscription (buffer → prepend on click).
9. **Live likes**: polls only the on-screen video (`video(id)`) every 3s.

Key files: `src/apollo/client.ts` (split upload/SSE link, no-cache),
`src/graphql/operations.ts`, `src/auth/*`, `src/components/VideoFeed.tsx`,
`VideoCard.tsx`, `UploadModal.tsx`, `NewVideosBanner.tsx`,
`src/hooks/useLiveLikes.ts`, `src/pages/ProfilePage.tsx`.

## Build & Docker (CapRover / Swarm)

```bash
npm run build                       # tsc + vite → dist/
docker build --build-arg VITE_API_URL=https://api.example.com/graphql \
  -t tiktok-frontend:latest .       # nginx serves the SPA
```

`VITE_API_URL` is inlined at **build time**, so set it to the deployed backend's
HTTPS GraphQL URL via the Docker build arg (CapRover: App Configs → Build args).
`captain-definition` points at the `Dockerfile`. After deploy, add the
frontend's HTTPS origin to the backend `TRUSTED_ORIGINS` and enable HTTPS on both
apps so the session cookie (`Secure`/`SameSite`) flows.
