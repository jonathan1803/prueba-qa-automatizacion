# Prueba Técnica de QA Automatización

Este proyecto está configurado como una base de automatización con Playwright + TypeScript, siguiendo un enfoque de Page Object Model (POM) y usando una configuración centralizada para la URL base y rutas de navegación.

## 1. Objetivo del proyecto

La intención del repositorio es servir como estructura inicial para pruebas automatizadas de UI, con:

- Playwright como framework de automatización.
- TypeScript para la lógica de pruebas.
- POM para encapsular la navegación y reutilización de acciones.
- Configuración centralizada para la URL base.

## 2. Tecnologías usadas

- Node.js
- TypeScript
- Playwright
- Page Object Model

## 3. Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js 18 o superior
- npm

## 4. Instalación

Desde la raíz del proyecto ejecuta:

```bash
npm install
npx playwright install
```

Si necesitas instalar los navegadores de Playwright explícitamente:

```bash
npx playwright install --with-deps
```

## 5. Scripts disponibles

En [package.json](package.json) están definidos estos scripts:

```bash
npm test
npm run test:headed
npm run report
```

### Descripción rápida

- `npm test`: ejecuta la suite de Playwright.
- `npm run test:headed`: ejecuta los tests con navegador visible.
- `npm run report`: abre el reporte HTML de Playwright.

## 6. Configuración principal

### Playwright
La configuración general del proyecto está en [playwright.config.ts](playwright.config.ts).

Dentro de esa configuración se define:

- directorio de tests: `./tests`
- salida de artefactos: `./test-results`
- timeout general
- espera esperada para validaciones
- navegador principal: Chromium
- screenshot, video y trace habilitados
- URL base leída desde `fixtures/config.ts`
- reporter HTML y en consola

### Configuración de entorno
La URL base y rutas de navegación están centralizadas en [fixtures/config.ts](fixtures/config.ts):

```ts
export const config = {
  baseUrl: "https://teststore.automationtesting.co.uk",
  homePath: "/index.php",
};
```

Esto permite evitar URLs hardcodeadas en cada prueba o página.

### BasePage
La estructura base para navegación está en [pages/BasePage.ts](pages/BasePage.ts).

La clase incluye métodos como:

- `navegarAInicio()`
- `obtenerTitulo()`
- `obtenerUrl()`

Esto es la base del Page Object Model para reutilizar acciones comunes.

## 7. Estructura del proyecto

```text
prueba-qa-automatizacion/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── playwright.config.ts
├── fixtures/
│   └── config.ts
├── pages/
│   └── BasePage.ts
├── tests/
│   └── (se agregarán las pruebas)
├── node_modules/   (no se sube al repositorio)
├── playwright-report/   (generado automáticamente)
├── test-results/   (generado automáticamente)
├── .env   (si se usa, no se sube)
└── .DS_Store   (no se sube)
```

## 8. Pasos que se han seguido en este proyecto

investigar codegen:
npx playwright codegen https://teststore.automationtesting.co.uk/index.php

Hasta este punto el proyecto ya cuenta con:

1. Inicialización del repositorio.
2. Instalación de Playwright y dependencias de Node.
3. Configuración de Playwright en TypeScript.
4. Creación de una configuración global para la URL base.
5. Implementación de una clase base para reutilizar navegación.
6. Preparación del proyecto para crear pruebas automatizadas de UI.





