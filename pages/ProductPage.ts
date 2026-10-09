import { Locator, Page } from "@playwright/test";
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
    this.nombre = page.locator("h1"); // verificar
    this.precio = page.locator('.current-price [itemprop="price"]'); // verificar
    this.selectorDimension = page.locator('select[name="group_3"]'); // verificar
    this.campoCantidad = page.locator("#quantity_wanted");
    this.botonAgregar = page.getByRole("button", { name: "Add to cart" });
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
      await this.selectorDimension.selectOption(otra);
    }
  }

  async establecerCantidad(cantidad: number): Promise<void> {
    await this.campoCantidad.fill(String(cantidad));
    await this.campoCantidad.press("Tab");
  }

  async agregarAlCarrito(): Promise<void> {
    await this.botonAgregar.click();
  }
}
