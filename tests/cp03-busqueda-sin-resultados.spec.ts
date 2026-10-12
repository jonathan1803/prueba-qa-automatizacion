import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";

test.describe("CP-03: Búsqueda sin resultados (caso negativo)", () => {
  test("debe mostrar 0 productos y el mensaje de sin coincidencias al buscar término inexistente", async ({
    page,
  }) => {
    const home = new HomePage(page);

    // 1. Navegar a la página principal
    await home.navegarAInicio();
    expect(await home.obtenerTitulo()).toContain("Test Store");

    // 2. Buscar un texto que no exista en el catálogo
    const terminoInexistente = "xyzqw123";
    await home.buscar(terminoInexistente);
    await page.waitForLoadState("domcontentloaded");

    // Condición 1: Que no se muestre ningún producto en los resultados
    const cantidadProductos = await home.contarProductosEnResultados();
    expect(cantidadProductos).toBe(0);
    await expect(home.productosEnResultados).toHaveCount(0);

    // Condición 2: Que la página presente el mensaje de búsqueda sin resultados
    await expect(home.tituloSinResultados).toBeVisible();
    await expect(home.sugerenciaSinResultados).toBeVisible();
  });
});
