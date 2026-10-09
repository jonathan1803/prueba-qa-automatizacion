import { Locator, Page } from "@playwright/test";

export class CartModal {
  readonly modal: Locator;
  readonly nombreProducto: Locator;
  readonly cantidad: Locator;
  readonly subtotal: Locator;
  readonly botonContinuar: Locator;

  constructor(page: Page) {
    this.modal = page.locator("#blockcart-modal"); // verificar
    this.nombreProducto = this.modal.locator(".product-name"); // verificar
    this.cantidad = this.modal.locator(".product-quantity"); // verificar
    this.subtotal = this.modal.locator(".cart-content .subtotal.value"); // verificar
    this.botonContinuar = this.modal.getByRole("button", {
      name: "Continue shopping",
    });
  }

  async obtenerNombre(): Promise<string> {
    return ((await this.nombreProducto.textContent()) ?? "").trim();
  }

  async obtenerCantidad(): Promise<number> {
    const texto = (await this.cantidad.textContent()) ?? "";
    return parseInt(texto.replace(/\D/g, ""), 10);
  }

  async obtenerTextoSubtotal(): Promise<string> {
    return ((await this.subtotal.textContent()) ?? "").trim();
  }

  async continuarComprando(): Promise<void> {
    await this.botonContinuar.click();
  }
}
