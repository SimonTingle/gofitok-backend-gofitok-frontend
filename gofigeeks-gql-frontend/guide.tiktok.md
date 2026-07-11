# Guía: Creación de un Clon de TikTok

## Paso 1: Conectate a la API

Tendrás disponible una api con todo lo que necesitas para este taller en el siguiente enlace:

https://tiktok-api.mariofdezzz.com/graphql

Accediendo al enlace, encontraras un playground que te permite visualizar e interactuar con la API. Añade esta url a tu configuracion de ApolloClient.

## Paso 1: Login

La api se encuentra protegida por autenticación. Tu primer paso será crear una página de login que te permita gestionar la sesión.

La sesión se gestiona mediante las mutation `signIn` y `signOut`, y la query `session`. Gestiona los errores como el de credenciales inválidas. Bloquea las rutas protegidas si no tienes una sesión activa. Guarda la sesión aunque se refresque la página.

Puedes utilizar las siguientes credenciales:

- admin@example.com - admin
- user@example.com - user


## Paso 2: Vista principal

Una vez tengas una sesión activa, debes redirigir al usuario a la home. Esta vista se compone de un feed vertical de vídeos, similar a TikTok. A un lateral, deberás mostrar un menu con dos enlaces:

- Home
- Tu perfil


## Paso 3: Feed de vídeos

Muestra un feed vertical de vídeos. Optimiza la información y no pidas datos que no necesites. Pide todos los datos, no queremos paginar datos ahora. Puedes usar la query `videos`.

Cada vídeo debe mostrar superpuesto: el nombre del creador, la descripción y los botones de interacción (likes).


## Paso 4: Paginación

Modifica la query anterior para paginar los resultados, hasta un máximo de 5 vídeos por página.

Utiliza [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) para detectar cuando el usuario ha llegado al último vídeo y cargar más contenido automáticamente.

Usa skeletons para mostrar contenido mientras cargas una nueva página.

## Paso 5: Sube un vídeo

Añade un formulario que permita subir un vídeo. Debes incluir un campo de descripción (texto). Debes utilizar una `mutation`.

Comprueba que tus vídeos se están publicando correctamente.


## Paso 6: Añade una miniatura a tu vídeo

Añade la posibilidad de adjuntar una imagen de miniatura (thumbnail) a tu vídeo. Utiliza la mutation `upload` para obtener una url por cada archivo que quieras adjuntar.


## Paso 7: Visualiza perfiles

Añade una nueva vista de detalle de un perfil. A esta vista se puede acceder desde:

- La imagen o el nombre de un usuario en un vídeo
- Al hacer click sobre tu foto o nombre en el panel lateral

En esta vista se debe mostrar:

- El nombre
- La foto de perfil
- La biografía
- Los vídeos de este usuario en formato grid

Para mostrar los vídeos de este usuario, crea una nueva query usando `videos` y pasandole el id del usuario que se esta viendo.


## Paso 8: Nuevos vídeos

En la vista home, muestra un pequeño banner en la parte superior del feed cuando recibas la notificación de nuevos vídeos publicados. Al hacer click, se desplazará al inicio del feed mostrando las nuevas incorporaciones.

Para lograrlo, utiliza una `subscription` que te irá notificando en tiempo real todos los nuevos vídeos publicados.


## Paso 9: Likes en tiempo real

Cada 3 segundos, actualiza los likes del video que tienes ahora mismo en pantalla y solo estos vídeos. Puedes apoyarte de la API [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
