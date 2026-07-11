# Guía: Creación de un Clon de TikTok

## Paso 1: Crear la Query de Videos Básica

Implementa tu primera query que devuelva un listado de videos. Cada video debe contener:
- **Descripción**: el texto que acompaña al video
- **URL del video**: la dirección donde está alojado el video
- **Likes**: número de reacciones que ha recibido
- **Fecha de creación**: cuándo se publicó el video

Todos estos campos deben ser obligatorios (no pueden ser nulos). Excepto la descripcion.

Para mantener tu código organizado, define el tipo `Video` en un archivo separado `.gql`. Luego, inserta datos de ejemplo en tu base de datos para que puedas visualizar los resultados cuando hagas consultas.


## Paso 2: Añadir el Creador del Video

Expande tu tipo Video con un nuevo campo que indique quién es el creador del video. Este campo debe ser de tipo `User` y es obligatorio.

Asegúrate de que cuando consultes videos, la información del creador se obtenga automáticamente desde la base de datos mediante un join.


## Paso 3: Optimizar la Carga del Creador con DataLoaders

El enfoque anterior trae información del creador incluso cuando nadie la solicita, lo cual es ineficiente. Mejora esto para que el creador solo se cargue cuando explícitamente se pida en la consulta.

Implementa un sistema que agrupe estas solicitudes automáticamente y las resuelva de manera eficiente, evitando consultas innecesarias a la base de datos.

La estructura del archivo loaders espera algo como:

```ts
export const loaders = {
  Video: {
    creator: async (entries: { obj: Video }[]) => {
      return []
    },
  },
}
```


## Paso 4: Añadir autenticación

Ahora necesitas que los usuarios puedan iniciar y cerrar sesión. Crea dos mutaciones:
- **signIn**: permite que un usuario inicie sesión con sus credenciales
- **signOut**: permite que un usuario cierre sesión

Utiliza la librería better-auth para manejar toda la lógica de autenticación. Asegúrate de que las sesiones se almacenen en cookies para que el navegador pueda mantenerlas automáticamente.


## Paso 5: Proteger la Query de Videos

Ahora que tienes autenticación, necesitas asegurar que solo los usuarios autenticados puedan consultar videos.

Completa la directiva `@auth` para que valide si existe una sesión activa en el contexto. Luego, aplica esta directiva a tu query `videos()` para restringir el acceso únicamente a usuarios autenticados.


## Paso 6: Subir Archivos

Crea una mutación que permita subir un archivo de cualquier tipo y devuelva la URL donde queda alojado. Si utilizas Supabase como almacenamiento, no necesitas crear un endpoint adicional para exponer las URLs, Supabase las genera directamente. [GraphQL Upload](https://the-guild.dev/graphql/yoga-server/docs/features/file-uploads)

Este endpoint será utilizado para subir los videos antes de crear la publicación.


## Paso 7: Publicar un Video

Añade una mutación que permita a un usuario autenticado publicar un video. El creador del video no debe venir como argumento, sino que debe extraerse del token contenido en la cookie de sesión.

La mutación debe recibir la URL del video (previamente subido con la mutación del paso 6) y una descripción opcional.

Para no repetir lógica, utiliza el contexto de GraphQL para exponer el usuario autenticado de forma global en todos tus resolvers, procesando la cookie una sola vez al construir el contexto. Ten en cuenta que la directiva `@auth` se ejecuta después del contexto, así que puedes refactorizarla para reutilizar el usuario ya resuelto y no procesar la cookie dos veces.


## Paso 8: Sistema de Likes

Nuestros videos tienen likes, pero ¿quién ha dado cada like? Si un usuario refresca la página, ¿cómo sabe que ya le dio like a un video?

Crea dos mutaciones: una para dar like y otra para quitarlo. Necesitarás una nueva tabla que almacene el par usuario-video, asegurando que un mismo usuario no pueda dar like dos veces al mismo video.

Elimina la propiedad `likes` de la tabla de videos. En su lugar, utiliza un resolver a nivel de campo en el tipo `Video` que cuente los likes dinámicamente a partir de la nueva tabla:

```ts
const resolvers = {
  ...,
  Video: {
    likes: () => {
      // ejemplo orientativo, no codigo real
      return sql`select count(*) from video-likes where videoId = '...'`
    }
  }
}
```



## Paso 9: Paginación por Cursor

Nuestra app es un éxito y cada vez hay más usuarios. Pero cargar TODOS los videos de golpe es bastante ineficiente. Añade paginación por cursor a la query `videos()` para que el frontend pueda implementar un infinite scrolling y los usuarios se vuelvan adictos a nuestro feed de videos.


## Paso 10: Optimizar Likes con un Loader (OPCIONAL)

El resolver de likes que creamos en el paso 8 lanza una consulta por cada video. Si pides 10 videos, se lanzan 10 consultas en paralelo. Elimina ese resolver y reemplázalo por un loader que resuelva todos los conteos de likes en una sola consulta agrupada.


## Paso 11: Ver el Perfil de un Usuario

La gente quiere ver el perfil de un creador en detalle. Añade una query `user(id: ID!): User!` que devuelva la información de un usuario concreto. Puedes utilizar better-auth o drizzle directamente para obtener esta información.


## Paso 12: Videos de un Usuario Concreto

El perfil de un creador necesita mostrar sus videos. Modifica la query `videos()` para que reciba un nuevo argumento `filters`, donde se pueda pasar el id de un usuario para mostrar únicamente sus videos. De esta forma, reutilizas la misma query tanto para el feed general (estilo "Para Ti") como para el perfil de un creador.


## Paso 13: Notificaciones en Tiempo Real con Subscriptions

Parece que has creado un clon fantástico. Pero me acaba de llamar Zhang Yiming, dice que le encanta lo que hemos hecho, así que nos ha pedido que notifiquemos al usuario en tiempo real cuando un nuevo video es publicado.

Crea una subscription `videos: Video!` sin argumentos que emita un evento cada vez que se publique un video nuevo. Así el frontend podrá mostrar los videos nuevos al instante sin necesidad de refrescar la página.


Cuidado! Las subscription necesitaran un ajuste en tu implementacion de la directiva @auth.

> **Nota:** Para probar las subscripciones necesitas usar GraphiQL (el playground por defecto de Yoga) en lugar de Apollo Sandbox, ya que Apollo no soporta subscripciones por SSE actualmente. Para activar GraphiQL, comenta las líneas 22-26 de `index.ts` (la configuración de `renderGraphiQL` con Apollo Sandbox).

## Paso 14: Generar Datos por Defecto con Drizzle Seed

Insertar datos manualmente en la base de datos es tedioso y poco escalable. Utiliza el paquete `drizzle-seed` para generar datos de prueba de forma determinista y reproducible.


1. **Crea un script de seed**: crea un archivo (por ejemplo `src/seed.ts`) que importe tu esquema de drizzle y utilice la función `seed()` para poblar las tablas. Puedes usar `reset()` para limpiar la base de datos antes de sembrar datos nuevos:

```ts
import { seed, reset } from "drizzle-seed"
import * as schema from "./schema"

async function main() {
  await reset(db, schema)
  await seed(db, schema)
}
```

2. **Refina los datos generados**: utiliza `.refine()` para personalizar la generación por tabla y columna. Por ejemplo, genera descripciones realistas para los videos, nombres para los creadores, y relaciones coherentes entre tablas usando `with`:

```ts
await seed(db, schema).refine((f) => ({
  users: {
    count: 10,
    columns: {
      name: f.fullName(),
    },
    with: {
      videos: 5,
    },
  },
  videos: {
    columns: {
      description: f.loremIpsum(),
    },
  },
}))
```

3. **Añade un script en `package.json`** para ejecutar el seed fácilmente, por ejemplo `"db:seed": "tsx src/seed.ts"`.

Recuerda que `drizzle-seed` es determinista: usando el mismo número de seed, siempre se generarán los mismos datos. Puedes cambiar el seed en las opciones para obtener un conjunto diferente: `seed(db, schema, { seed: 12345 })`.


## Paso 15: Testing con Yoga y Vitest

Es hora de asegurarte de que tu API funciona correctamente y no se rompe con futuros cambios. Implementa tests automatizados usando **Vitest** como framework de testing y aprovechando la capacidad de **GraphQL Yoga** para simular peticiones HTTP sin levantar un servidor real.

1. **Configura Vitest**: crea un archivo `vitest.config.ts` o añade la configuración en tu `vite.config.ts`. Añade un script `"test": "vitest"` en `package.json`.

2. **Crea el executor de testing**: utiliza `buildHTTPExecutor` junto con `yoga.fetch` para simular peticiones sin hacer llamadas HTTP reales:

```ts
import { buildHTTPExecutor } from "@graphql-tools/executor-http"
import { parse } from "graphql"
import { yoga } from "../app"

const executor = buildHTTPExecutor({
  fetch: yoga.fetch,
  endpoint: "http://yoga/graphql",
})
```

3. **Escribe tests para tus queries y mutations**:

```ts
import { describe, it, expect } from "vitest"

describe("Videos", () => {
  it("debería obtener la lista de videos", async () => {
    const result = await executor({
      document: parse(/* GraphQL */ `
        query {
          videos {
            description
            likes
          }
        }
      `),
    })

    expect(result.data?.videos).toBeDefined()
  })
})
```

4. **Testa las subscriptions** si implementaste el paso 13, verificando que el executor devuelve un `AsyncIterable` al suscribirse.

5. **Testa los flujos de autenticación**: simula cookies o headers en el executor para verificar que las queries protegidas con `@auth` rechazan peticiones sin sesión y aceptan las autenticadas.
