# Guía: Creación de un Clon de Twitter

## Paso 1: Conectate a la API

Tendrás disponible una api con todo lo que necesitas para este taller en el siguiente enlace:

https://twitter-api.mariofdezzz.com/graphql

Accediendo al enlace, encontraras un playground que te permite visualizar e interactuar con la API. Añade esta url a tu configuracion de ApolloClient.

## Paso 1: Login

La api se encuentra protegida por autenticación. Tu primer paso será crear una página de login que te permita gestionar la sesión.

La sesión se gestiona mediante las mutation `signIn` y `signOut`, y la query `session`. Gestiona los errores como el de credenciales inválidas. Bloquea las rutas protegidas si no tienes una sesión activa. Guarda la sesión aunque se refresque la página.

Puedes utilizar las siguientes credenciales:

- admin@example.com - admin
- user@example.com - user


## Paso 2: Vista principal

Una vez tengas una sesión activa, debes redirigir al usuario a la home. Esta vista se compone de dos elementos. En el centro, una lista de tweets. A un lateral, deberás mostrar tu información de perfil.

El ultimo punto ya puedes implementarlo sin necesidad de nada más.


## Paso 3: Listado de tweets

Muestra un listado de tweets, optimiza la información y no pidas datos que no necesites. Pide todos los datos, no queremos paginar datos ahora. Puedes usar la query `tweets`.

Al hacer hover sobre la foto de perfil del usuario que ha publicado el tweet, debe aparecer un popover que muestre su foto en un tamaño más grande, su nombre y si biografía.


## Paso 4: Paginación

Modifica la query anterior para paginar los resultados, hasta un máximo de 15 tweets por página.

Utiliza [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) para detectar cuando debes paginar de nuevo más tweets.

Usa skeletons para mostrar contenido mientras cargas una nueva página.

## Paso 5: Crea un tweet

Añade un formulario que permita crear un tweet. Centrate solo en el texto. Debes utilizar una `mutation`.

Comprueba que tus tweets se estan publicando correctamente.


## Paso 6: Añade archivos a tu tweet

Añade la posibilidad de adjuntar varias imagenes a tu archivo. Utiliza la mutation `upload` para obtener una url por cada archivo que quieras adjuntar.


## Paso 7: Visualiza perfiles

Añade una nueva vista de detalle de un perfil. A esta vista se puede acceder desde:

- La imagen o el nombre de un usuario en un tweet
- El popover que se muestra sobre el nombre o la foto anterior
- Al hacer click sobre tu foto o nombre en el panel lateral

En esta vista se debe mostrar:

- El nombre
- La foto de perfil
- La biografía
- Los tweets de este usuario

Para mostrar los tweets de este usuario, crea una nueva query usando `tweets` y pasandole el id del usuario que se esta viendo.


## Paso 8: Nuevos tweets

En la vista home, muestra un pequeño banner en la parte superior del listado de tweets cuando recibas la notificación de nuevos tweets creados. Al hacer click, se expandirá la lista de tweets con estas nuevas incorporaciones.

Para lograrlo, utiliza una `subscription` que te irá notificando en tiempo real todos los nuevos tweets creados.


## Paso 9: Likes en tiempo real

Cada 3 segundos, actualiza los likes de los tweets que tienes ahora mismo en pantalla y solo estos tweets. Puedes apoyarte de la API [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
