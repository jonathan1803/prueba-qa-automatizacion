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
│   └── CartPage.ts
├── tests/
│   └── cp01-busqueda-carrito.spec.ts
├── utils/
│   └── precio.ts
├── test-results/
├── playwright-report/
├── evidencia/
└── node_modules/
```

## 6. Casos de prueba implementados

### CP-01: Búsqueda de producto y agregar al carrito

Este caso valida el flujo completo desde la búsqueda hasta el agregado del producto al carrito. Comprueba:

- acceso a la página principal
- búsqueda con sugerencias
- selección del producto
- validación del nombre y precio
- cambio de dimensión cuando aplica
- ajuste de cantidad
- validación del modal del carrito
- confirmación del contador de carrito

### CP-02: Validación y modificación del carrito

Caso previsto para validar la edición del carrito, como cambiar cantidad de artículos, eliminar productos o comprobar subtotales y totales. En esta entrega aún no está automatizado.

### CP-03: Búsqueda sin resultados

Caso previsto para validar el comportamiento al buscar un término que no exista, verificando mensajes de "sin resultados" y evitando falsos positivos en la prueba. En esta entrega aún no está automatizado.

### CP-04: Inicio de sesión inválido

Caso previsto para verificar el flujo de autenticación con credenciales incorrectas, comprobando los mensajes de error y la permanencia en la pantalla de login. En esta entrega aún no está automatizado.

## 7. Ejecución de las pruebas

Desde la raíz del proyecto, se pueden ejecutar las pruebas con los siguientes comandos:

```bash
npm test
```

Ejecución con navegador visible:

```bash
npm run test:headed
```

Abrir el reporte de Playwright:

```bash
npm run report
```

También se puede ejecutar la interfaz visual de Playwright:

```bash
 npx playwright test --ui
```

## 8. Decisiones técnicas

### ¿Por qué elegí Playwright?

Porque ofrece una solución robusta para automatización web con soporte nativo para esperas inteligentes, capturas de pantalla, trazas, ejecución multi-navegador y un reporte muy útil para depuración y evidencias.

### ¿Qué problema resuelve el patrón POM?

El patrón POM encapsula los selectores, acciones y validaciones por página para evitar duplicar lógica en cada prueba y facilitar el mantenimiento del código cuando cambian los elementos de la interfaz.

### ¿Por qué las aserciones están en las pruebas?

Porque las pruebas deben validar el comportamiento observable del sistema. Si la aserción se mueve demasiado hacia la lógica interna, el automatizador deja de representar el comportamiento real del usuario.

### ¿Cómo evito depender de precios fijos?

Se utilizan utilidades para parsear y normalizar precios, evitando comparaciones directas con valores hardcodeados. Esto hace que la prueba sea más estable ante cambios de precios o configuraciones regionales.

### ¿Cómo garantizo que CP-02 sea independiente de CP-01?

Cada caso debe prepararse con su propio estado inicial y no depender del contenido dejado por otra prueba. Esto se logra con datos controlados, navegación limpia y validaciones que no asuman que un caso anterior ya modificó el estado del sitio.

### ¿Cómo investigo una prueba fallida?

Reviso el error en la salida del navegador, analizo el trace, reviso los screenshots y el contexto de la ejecución, y comparo el flujo real contra la lógica esperada del Page Object. En Playwright esto suele resolver rápidamente la causa raíz del problema.

## 9. Evidencias de ejecución

La carpeta [playwright-report](playwright-report) contiene el reporte HTML generado por Playwright, mientras que [test-results](test-results) almacena resultados de ejecución, traces y contexto de errores para cada prueba. Estas evidencias sirven como respaldo para auditoría, revisión de fallas y documentación del estado del proyecto.

## 10. Limitaciones y observaciones

- El proyecto está orientado a una práctica educativa y de automatización web.
- El caso CP-01 está implementado y validado; los demás escenarios aparecen como casos de extensión para la siguiente iteración.
- El uso de datos dinámicos y de comercio electrónico puede requerir ajustes si el sitio cambia su estructura o textos.
- Las pruebas deben ejecutarse en un entorno estable y con acceso a la URL objetivo para evitar falsos negativos por disponibilidad del sitio.


