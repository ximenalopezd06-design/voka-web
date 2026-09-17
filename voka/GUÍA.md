# VOKA · Guía del sitio por páginas

## 1. Estructura de archivos

- `index.html`: bienvenida y enlaces a menú, pedido e Instagram.
- `menu.html`: ocho sabores y filtros, renderizados desde JavaScript.
- `pedido.html`: carrito completo y formulario del cliente.
- `historia.html`: historia e imagen de marca.
- `preguntas.html`: preguntas frecuentes con acordeones.
- `contacto.html`: Instagram principal y WhatsApp secundario.
- `styles.css`: diseño compartido, paleta y adaptación a pantallas.
- `script.js`: configuración, productos, carrito y envío a WhatsApp.
- `images/`: logo y fotografías.

Las páginas tienen direcciones propias. Los enlaces del menú abren documentos, no hacen scroll. El header y footer son iguales, con el apartado actual marcado. No hay frameworks, pagos, cuentas ni base de datos.

## 2. Colocar el logo

Guarda la versión crema como `images/logo.svg` o `images/logo.png`. En los seis HTML busca los enlaces con `class="logo"` del header y footer. Sustituye su contenido por:

```html
<img src="images/logo.svg" alt="VOKA">
```

El fondo del header y footer es burgundy. La marca textual actual es provisional, basada en la identidad descrita. Para cambiar también el texto decorativo de portada, edita `.giant-logo` en `index.html`.

## 3. Fotografías

Coloca en `images/`:

- `hero-chocolate-malvavisco.png`: composición de portada con chocolate, malvavisco y VOKA.
- `historia.jpg`: imagen de marca.
- `hershey.jpg`, `kitkat.jpg`, `kinder.jpg`, `oreo.jpg`, `chocolate.png`, `malvavisco.jpg`: productos.

Las imágenes reemplazan automáticamente los placeholders cuando cargan. Para nombres o formatos distintos, cambia `image` en `localProducts` de `script.js`, o `data-photo` en el HTML para portada e historia. Actualiza también `data-alt` con una descripción adecuada. JPG o WebP de unos 800 px para productos y 1200 px para portada son suficientes para empezar. El recorte se controla con `object-fit: cover` en CSS.

## 4. Precios

En `script.js`, busca `const localProducts`. Cada sabor tiene un comentario y un campo `price`. Precios actuales en MXN: Hershey $55, KitKat $55, Kinder $55, Oreo $60, Chocolate $60, Malvavisco $60, Nutella $60 y Clásica $50. Escribe números sin signo `$`:

```js
price: 70,
```

El total se calcula siempre desde los precios vigentes del arreglo, aunque un carrito antiguo conserve otra copia informativa del precio.

## 5. Agregar sabores

Agrega otro objeto al arreglo, separado por una coma:

```js
{ id: 9, name: 'Brownie', category: 'Especiales', price: 60,
  description: 'Escribe tu descripción.', image: 'images/brownie.jpg' }
```

Usa un `id` único y estable. No reutilices el id de otro producto. Las categorías nuevas aparecen automáticamente en los filtros. Para quitar un sabor, elimina su objeto; dejará de aparecer también en los carritos recuperados.

## 6. Instagram

Ya está configurado el perfil real:

`https://www.instagram.com/voka.bake?stkn=MXQxajJycDQweHMyYQ==`

Para cambiarlo, edita `settings.instagramUrl` al principio de `script.js`. Se aplica a todos los enlaces con `data-instagram`. Cambia también sus `href` en los HTML si quieres conservar el destino actualizado sin JavaScript, y el texto visible `@voka.bake`.

Instagram abre una pestaña nueva, está visible en todos los headers y footers y es el primer contacto en `contacto.html`.

## 7. Carrito

En Menú elige una cantidad y pulsa **Agregar al pedido**. El icono cuenta unidades totales. Abre **Pedido** para aumentar, disminuir o eliminar productos. Al reducir a cero se elimina esa línea. El límite es 99 unidades por sabor.

El formulario aparece cuando hay productos. Para Entrega, la dirección es obligatoria. Con Recoger, se oculta y no se incluye en el mensaje. Teléfono, nombre, día y hora son obligatorios. El total incluye productos; entrega y disponibilidad se confirman con VOKA.

## 8. localStorage

El navegador guarda el pedido en la clave `voka-cart-v2`: id, nombre, cantidad, precio y subtotal. No guarda los datos personales del formulario. Al cambiar de página o recargar, se validan los ids y cantidades y se recalculan los importes desde el catálogo actual.

`localStorage` pertenece a ese navegador y dirección web: no sincroniza entre dispositivos. Al cambiar de puerto o dominio verás otro almacenamiento. Puede borrarse desde las herramientas del navegador. Si está bloqueado, la página avisa; habilítalo para conservar el pedido entre páginas.

Se usa una clave nueva para evitar que los productos de ejemplo de la versión anterior se conviertan accidentalmente en los nuevos sabores.

## 9. WhatsApp

Ya está configurado `settings.whatsappNumber: '526941166171'`.

El contacto directo abre `https://wa.me/526941166171`. El formulario genera el resumen con nombre, teléfono, productos, cantidades, precios, total, entrega, dirección cuando corresponde, día, hora y notas. `encodeURIComponent()` conserva correctamente espacios, acentos y saltos de línea en la URL.

El cliente revisa y pulsa **Enviar dentro de WhatsApp**. Abrir el enlace no significa que el pedido ya se haya enviado o confirmado. Al pulsar Enviar pedido por WhatsApp con datos válidos, se genera primero el mensaje completo y después se vacían el carrito guardado y el formulario. El cliente debe pulsar Enviar dentro de WhatsApp; la web no puede detectar ese paso. Si cierra WhatsApp sin enviarlo, el carrito ya estará vacío. Los intentos con datos inválidos no vacían el pedido.

Para cambiar el número, edita `settings.whatsappNumber` con código de país y solo dígitos. Actualiza también el teléfono visible y los enlaces estáticos en los HTML.

## 10. Probar con Live Server

1. En VS Code, selecciona **Archivo → Abrir carpeta** y elige `Documentos/VILLA DULCE/voka`.
2. Instala **Live Server**, de Ritwick Dey, desde Extensiones.
3. Haz clic derecho en `index.html` → **Open with Live Server**.
4. Recorre Inicio, Menú, Pedido, Nuestra historia, Preguntas y Contacto. La dirección debe cambiar.
5. Agrega 2 Hershey, 1 Kinder y 1 Oreo: el icono debe marcar 4 y el total debe ser **$225.00** con los precios actuales.
6. Navega a Historia y después Pedido; recarga y confirma que el carrito persiste.
7. Prueba aumentar, disminuir y eliminar. Vacía el carrito para comprobar el estado vacío.
8. Completa el formulario y prueba Recoger y Entrega. Comprueba que no permite enviar sin dirección cuando eliges Entrega.
9. Abre WhatsApp y revisa el número, el texto y el total. Puedes cerrar sin enviar durante la prueba.
10. Abre Instagram desde header, inicio, contacto y footer.
11. Estrecha la ventana: menú hamburguesa y productos en una columna. Escape cierra el menú.

Guarda cambios con `Cmd + S`. Mantén el mismo puerto al probar persistencia. Puedes abrir HTML desde Finder para una vista rápida; Live Server es la forma recomendada para probar el carrito compartido entre páginas.

[Extensión Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

## 11. Subir a GitHub

1. Crea un repositorio `voka-web` en GitHub.
2. Selecciona **Add file → Upload files**.
3. Sube los seis HTML, `styles.css`, `script.js` y `images/` con tus fotografías. El `index.html` debe quedar en la raíz.
4. Pulsa **Commit changes**.
5. Para actualizarlo, sube los archivos modificados y crea otro commit.

Sube solo el contenido de VOKA, sin `node_modules`, `dist` ni los proyectos Villa Dulce/Mimiga Mía. Usa GitHub para almacenar el código y conéctalo a Vercel para publicar la tienda. GitHub Pages restringe sitios destinados principalmente a facilitar transacciones comerciales.

[Restricciones de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## 12. Publicar en Vercel

1. Inicia sesión en Vercel y conecta tu GitHub.
2. Selecciona **Add New → Project** e importa `voka-web`.
3. Selecciona **Framework Preset: Other**.
4. Deja la raíz del repositorio como **Root Directory** si subiste solo el contenido de VOKA. Si subiste la carpeta completa, elige `voka`.
5. Deja **Build Command** vacío (activa Override si hace falta). No necesitas instalar dependencias.
6. Usa `.` como **Output Directory** o el valor por defecto de Other que sirve la raíz.
7. Pulsa **Deploy** y prueba todas las páginas y el pedido desde el enlace asignado.
8. Los siguientes commits al repositorio conectado actualizarán el despliegue.

Para una tienda comercial usa un plan que permita actividad comercial: Hobby está limitado a uso personal no comercial. No se ha publicado automáticamente el sitio.

[Configuración de Vercel](https://vercel.com/docs/builds/configure-a-build) · [Plan Hobby](https://vercel.com/docs/plans/hobby).

## Disponibilidad e inventario

En `script.js`, los ocho productos están en `localProducts`. Cada uno comienza con `stock: 5` (dato de ejemplo, no inventario real) y `available: true`. Mantienen sus precios actuales.

- `available: true` y `stock > 0`: Disponible.
- `available: false` o `stock: 0`: AGOTADO, foto visible y compra desactivada.
- Las cantidades ya agregadas cuentan contra el límite; no puedes superar el stock al agregar repetidamente o aumentar desde Pedido.
- Al recuperar un carrito se eliminan los agotados y se reducen cantidades que superen las disponibles, con aviso.

Busca `// FUTURA CONEXIÓN CON INVENTARIO EXTERNO`. Reemplaza únicamente el cuerpo de `inventorySource.load()` por la petición a tu API, devolviendo una promesa con el arreglo de productos. Transforma allí los campos externos a números y booleanos reales. Un fallo de carga bloquea la compra y mantiene el carrito guardado.

`isAvailable`, `productLimit` y `reconcileCart` contienen las reglas separadas de la presentación. Este inventario local no reserva ni descuenta unidades entre clientes. Para inventario compartido, la fuente externa deberá validar y reservar las unidades en servidor al confirmar un pedido; abrir WhatsApp no equivale a confirmación.
