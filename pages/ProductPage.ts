import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProductPage extends BasePage {
  readonly nombre: Locator;
  readonly precio: Locator;
  readonly selectorDimension: Locator;
  readonly campoCantidad: Locator;
  readonly botonAgregar: Locator;
  readonly seccionDescripcion: Locator;

  constructor(page: Page) {
    super(page);
    this.nombre = page.locator("h1");
    this.precio = page.locator(".current-price-value");
    this.selectorDimension = page.locator('select#group_3, select[name="group[3]"]');
    this.campoCantidad = page.locator("#quantity_wanted");
    this.botonAgregar = page.locator('button[data-button-action="add-to-cart"]');
    this.seccionDescripcion = page.locator("#description"); // verificar
  }

  async obtenerNombre(): Promise<string> {
    return ((await this.nombre.first().textContent()) ?? "").trim();
  }

  async obtenerTextoPrecio(): Promise<string> {
    return ((await this.precio.first().textContent()) ?? "").trim();
  }

  async irASeccionDescripcion(): Promise<void> {
    await this.seccionDescripcion.scrollIntoViewIfNeeded();
  }

  async obtenerTextoDescripcion(): Promise<string> {
    return ((await this.seccionDescripcion.textContent()) ?? "").trim();
  }

  async tieneOpcionesDimension(): Promise<boolean> {
    return (await this.selectorDimension.count()) > 0;
  }

  // Elige la primera opción distinta a la que está seleccionada
  async seleccionarDimensionDistinta(): Promise<void> {
    const valorActual = await this.selectorDimension.inputValue();
    const opciones = await this.selectorDimension
      .locator("option")
      .evaluateAll((nodos) => nodos.map((n) => (n as HTMLOptionElement).value));
    const otra = opciones.find((v) => v !== valorActual);
    if (otra) {
      const respuestaProducto = this.page
        .waitForResponse(
          (r) => r.url().includes("controller=product") && r.status() === 200,
          { timeout: 15000 }
        )
        .catch(() => null);
      await this.selectorDimension.selectOption(otra);
      await respuestaProducto;
      await this.page.waitForTimeout(1000);
    }
  }

  async establecerCantidad(cantidad: number): Promise<void> {
    await this.campoCantidad.waitFor({ state: "visible", timeout: 10000 });
    const respuestaProducto = this.page
      .waitForResponse(
        (r) => r.url().includes("controller=product") && r.status() === 200,
        { timeout: 5000 }
      )
      .catch(() => null);
    await this.campoCantidad.fill(String(cantidad));
    await this.campoCantidad.press("Tab");
    await respuestaProducto;
    await this.page.waitForTimeout(500);
  }

  async agregarAlCarrito(): Promise<void> {
    // 1. Esperar a que el script de PrestaShop esté listo
    await this.page
      .waitForFunction(() => {
        return Boolean((window as any).prestashop);
      }, { timeout: 5000 })
      .catch(() => {});

    // 2. Asegurar que el botón esté visible y habilitado
    await this.botonAgregar.waitFor({ state: "visible", timeout: 10000 });
    await expect(this.botonAgregar).toBeEnabled({ timeout: 10000 });

    // 3. Preparar espera de las respuestas del carrito y del modal
    const respuestaCart = this.page
      .waitForResponse(
        (r) => r.url().includes("controller=cart") && r.status() === 200,
        { timeout: 15000 }
      )
      .catch(() => null);

    const respuestaModal = this.page
      .waitForResponse(
        (r) => r.url().includes("ps_shoppingcart") && r.status() === 200,
        { timeout: 15000 }
      )
      .catch(() => null);

    // 4. Click en agregar al carrito
    await this.botonAgregar.click();
    await Promise.all([respuestaCart, respuestaModal]);

    // 5. Esperar a que el modal aparezca visible y con contenido
    await this.page.locator("#blockcart-modal").waitFor({
      state: "visible",
      timeout: 15000,
    });
    await this.page.locator("#blockcart-modal .product-name").waitFor({
      state: "visible",
      timeout: 15000,
    });
  }
}
