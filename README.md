# Prueba práctica QA - Automatización

## 1. Descripción del proyecto

Este proyecto consiste en una práctica de automatización de pruebas de usuario para una tienda de ejemplo basada en Playwright y TypeScript. Su objetivo es validar el flujo principal de compra en una aplicación web, aplicando buenas prácticas de automatización como Page Object Model (POM), centralización de configuración y validaciones de negocio en la capa de pruebas.

La automatización se enfoca en comprobar que el comportamiento del usuario sea consistente y reproducible: búsqueda de productos, validación del carrito, manejo de mensajes de errores y comprobación de la lógica de compra.

## 2. Tecnologías utilizadas

- Node.js
- TypeScript
- Playwright
- @playwright/test
- Page Object Model (POM)
- HTML Report de Playwright

## 3. Requisitos previos

Antes de ejecutar este proyecto, asegúrate de tener instalado:

- Node.js 18 o superior
- npm
- Navegador Chromium disponible para Playwright

## 4. Instalación y configuración

1. Clona el repositorio.
2. Entra a la carpeta del proyecto.
3. Ejecuta la instalación de dependencias:

```bash
npm install
```

4. Instala los navegadores de Playwright si aún no están disponibles:

```bash
npx playwright install
```

5. Opcionalmente, para instalaciones con dependencias del sistema:

```bash
npx playwright install --with-deps
```

La configuración general del proyecto se encuentra en [playwright.config.ts](playwright.config.ts), mientras que los valores base del entorno y rutas se centralizan en [fixtures/config.ts](fixtures/config.ts).

## 5. Estructura del proyecto

```text
prueba-qa-automatizacion/
├── README.md
├── package.json
├── playwright.config.ts
├── fixtures/
│   └── config.ts
├── pages/
│   ├── BasePage.ts
│   ├── HomePage.ts
│   ├── ProductPage.ts
│   ├── CartModal.ts
│   ├── CartPage.ts
│   └── LoginPage.ts
├── tests/
│   ├── cp01-busqueda-carrito.spec.ts
│   ├── cp02-carrito.spec.ts
│   ├── cp03-busqueda-sin-resultados.spec.ts
│   └── cp04-login-invalido.spec.ts
├── utils/
│   └── precio.ts
├── test-results/
├── playwright-report/
├── evidencia/
│   ├── screenshots/
│   └── videos/
└── node_modules/
```

## 6. Casos de prueba implementados

### CP-01: Búsqueda de producto y agregar al carrito

Valida el flujo completo desde la búsqueda en la tienda hasta la confirmación de que el producto quedó en el carrito:

- **Precondición (Aislamiento e independencia de pruebas):** Al tratarse de una tienda demo pública y multi-usuario (`teststore.automationtesting.co.uk`), la base de datos de PrestaShop asocia artículos residuales al tráfico compartido (por ejemplo, 2 camisetas precargadas). Para cumplir el principio de **independencia de pruebas** exigido en el examen, se implementó `vaciarCarritoSiTieneElementos()` en `CartPage`, el cual purga de forma determinista cualquier ítem remanente antes de iniciar el flujo, asegurando que el carrito arranque en cero y que la aserción final de 3 artículos sea 100% confiable y reproducible.
- **Paso 1:** Apertura del navegador y navegación a la URL base; verificación del título de la tienda.
- **Paso 2:** Búsqueda predictiva con el término `"best"`; verificación de sugerencias desplegadas.
- **Paso 3:** Selección del producto *"The best is yet to come' Framed poster"* desde el autocompletado y validación de llegada a la página de detalle.
- **Paso 4:** Verificación del nombre y precio del producto.
- **Paso 5:** Desplazamiento (scroll) hacia la sección de descripción para comprobar visibilidad y lectura.
- **Paso 6:** Selección de una dimensión distinta a la predeterminada (`Dimension: 60x90cm`) y verificación de actualización de precio.
- **Paso 7:** Modificación de cantidad a 3 unidades con comprobación de valor en el campo.
- **Paso 8:** Agregado al carrito y validación reactiva del modal de confirmación (nombre del producto, cantidad 3 y subtotal igual a precio unitario × 3).
- **Paso 9:** Clic en *"Continue shopping"*, cierre de la ventana modal y confirmación de que el contador del encabezado refleja exactamente 3 artículos.

### CP-02: Validación y modificación del carrito

Valida que el carrito calcula correctamente los precios y responde a las acciones de modificación del usuario de forma independiente:

- **Preparación de estado:** Ejecuta su propia limpieza previa para no depender de la ejecución de CP-01.
- **Agregado e ingreso:** Agrega 3 unidades del producto y navega a la vista completa del carrito (`controller=cart&action=show`).
- **Verificación de línea:** Valida consistencia matemática de la fila: `total = precio unitario × cantidad`.
- **Modificación de cantidad:** Reduce la cantidad del producto de 3 a 1 mediante los controles nativos de PrestaShop y comprueba el recálculo inmediato del total de la línea.
- **Eliminación y vaciado:** Elimina el producto del carrito y valida que el aviso de carrito vacío sea visible y el contador del encabezado vuelva a `(0)`.

### CP-03: Búsqueda sin resultados (caso negativo)

Verifica el comportamiento y la resiliencia del sistema ante búsquedas sin coincidencias en el catálogo:

- **Búsqueda inexistente:** Ingresa el término `"xyzqw123"` en el buscador y presiona Enter.
- **Doble condición de validación:** Confirma que la lista de productos encontrados tenga 0 resultados (`article.product-miniature`) y que se muestren los mensajes oficiales de PrestaShop: *"No matches were found for your search"* y *"Please try other keywords to describe what you are looking for."*.

### CP-04: Inicio de sesión con credenciales inválidas (caso negativo)

Verifica el manejo de errores de autenticación y la seguridad de la sesión:

- **Ingreso al formulario:** Navega a la pantalla de autenticación y valida la presencia de los campos de correo y contraseña.
- **Envío con datos inválidos:** Ingresa un correo con formato válido pero inexistente (`qa.candidato@example.com`) y envía el formulario.
- **Validación de error y permanencia:** Comprueba la alerta de error de autenticación (*"Authentication failed."*) y valida que el usuario permanezca sin autenticar manteniendo visible el botón de iniciar sesión (*"Sign in"*).

## 7. Ejecución de las pruebas

Desde la raíz del proyecto, se pueden ejecutar las pruebas con los siguientes comandos:

```bash
# Ejecutar toda la suite de pruebas (CP-01 a CP-04), se ejecutan las pruebas en consola y genera un reporte HTML. despues de npm test, ejecuta el comando que aparece en consola para ver el reporte.
npm test
```



Ejecución de un caso específico:

```bash
npx playwright test tests/cp01-busqueda-carrito.spec.ts
npx playwright test tests/cp02-carrito.spec.ts
npx playwright test tests/cp03-busqueda-sin-resultados.spec.ts
npx playwright test tests/cp04-login-invalido.spec.ts
```

Ejecución con navegador visible:

```bash
npm run test:headed
```

Abrir el reporte interactivo de Playwright:

```bash
npm run report
```

También se puede ejecutar la interfaz visual interactiva de Playwright:

```bash
npx playwright test --ui
```

## 8. Decisiones técnicas

### ¿Por qué elegí Playwright?

Porque ofrece una solución robusta para automatización web con soporte nativo para esperas inteligentes automáticas (auto-waiting), aislamiento de contexto por prueba, capturas de pantalla, grabación de trazas (trace viewer), ejecución multi-navegador y un reporte HTML detallado para auditoría de evidencias.

### ¿Qué problema resuelve el patrón POM (Page Object Model)?

El patrón POM desacopla los localizadores y las interacciones de la interfaz de la lógica de validación de las pruebas. Si un selector o flujo de la página cambia en el futuro, solo se actualiza en la clase de página correspondiente (`pages/`), manteniendo los archivos de prueba (`tests/`) limpios, legibles y mantenibles.

### ¿Por qué las aserciones están en las pruebas?

Siguiendo las mejores prácticas estrictas de Page Object Model, las clases de página solo deben exponer acciones y métodos para consultar el estado de la UI (sin aserciones duras internas). Todas las aserciones (`expect`) residen en los archivos de prueba (`tests/`), permitiendo que el flujo de verificación y los criterios de aceptación sean explícitos.

### ¿Cómo evito depender de precios fijos?

Se creó el módulo auxiliar [utils/precio.ts](utils/precio.ts) para extraer numéricamente los importes (`parsearPrecio`) y redondear con precisión (`redondear`). Los precios y totales esperados se calculan dinámicamente en tiempo de ejecución (`precioUnitario * cantidad`), haciendo las pruebas inmunes a variaciones de catálogo o descuentos del entorno.

### ¿Por qué se implementó la limpieza previa del carrito (`vaciarCarritoSiTieneElementos`)?

Uno de los principios esenciales de QA Automation es que **ninguna prueba debe depender del estado de ejecuciones previas ni de datos residuales de terceros**. Al interactuar con una tienda demo pública (`teststore.automationtesting.co.uk`), la base de datos almacena carritos huérfanos. Para evitar falsos negativos en los contadores, `vaciarCarritoSiTieneElementos()` inspecciona los enlaces nativos de eliminación (`controller=cart&delete=1...`) y purga la sesión directamente a nivel de servidor, garantizando que el carrito arranque en 0 artículos.

### ¿Cómo se resolvieron las condiciones de carrera con peticiones asíncronas de PrestaShop?

Al seleccionar dimensiones o agregar al carrito, PrestaShop dispara peticiones AJAX en segundo plano (`controller=product` y `ps_shoppingcart`) que reconstruyen partes del DOM. Para evitar pruebas frágiles ("flaky tests"):
1. En `ProductPage` se espera activamente la resolución de las peticiones AJAX antes de interactuar con el siguiente elemento.
2. En las pruebas se utilizan aserciones reactivas de Playwright (`await expect(locator).toContainText(...)`) con reintento automático en lugar de lecturas síncronas instantáneas.

## 9. Evidencias de ejecución

Siguiendo las pautas del apartado **6.2 del documento de evaluación**, se organizó la carpeta [evidencia](evidencia) para presentar los respaldos visuales de las pruebas directamente en el repositorio:

- **[evidencia/screenshots/](evidencia/screenshots/):** Capturas de pantalla del estado final exitoso de cada uno de los casos (`cp01`, `cp02`, `cp03`, `cp04`).
- **[evidencia/videos/](evidencia/videos/):** Grabaciones en video (`.webm`) de la ejecución completa y automatizada en el navegador para cada flujo.
- El reporte interactivo completo de Playwright puede generarse y visualizarse localmente en cualquier momento mediante `npm run report`.

## 10. Observaciones finales

- Los **4 casos de prueba requeridos (CP-01, CP-02, CP-03 y CP-04)** se encuentran **100% implementados, documentados y pasando satisfactoriamente**.
- Se respetó estrictamente la estructura de directorios (`pages/`, `tests/`, `fixtures/`, `utils/`) solicitada en la guía de evaluación.
- El proyecto está configurado para ejecutarse de manera autónoma en cualquier entorno con Node.js 18+.


