import { Locator, Page } from "@playwright/test";

export class CartModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly nombreProducto: Locator;
  readonly cantidad: Locator;
  readonly subtotal: Locator;
  readonly botonContinuar: Locator;
  readonly botonProcederAlPago: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator("#blockcart-modal");
    this.nombreProducto = this.modal.locator(".product-name");
    this.cantidad = this.modal.locator(".product-quantity");
    this.subtotal = this.modal.locator(".cart-content .subtotal.value");
    this.botonContinuar = this.modal.getByRole("button", {
      name: "Continue shopping",
    });
    this.botonProcederAlPago = this.modal.getByRole("link", {
      name: "Proceed to checkout",
    });
  }

  /**
   * Obtiene el nombre del producto mostrado en la cabecera del modal de confirmación.
   */
  async obtenerNombre(): Promise<string> {
    return ((await this.nombreProducto.textContent()) ?? "").trim();
  }

  /**
   * Obtiene la cantidad numérica agregada que muestra el modal.
   */
  async obtenerCantidad(): Promise<number> {
    const texto = (await this.cantidad.textContent()) ?? "";
    return parseInt(texto.replace(/\D/g, ""), 10);
  }

  /**
   * Obtiene el texto del subtotal calculado dentro del modal de confirmación.
   */
  async obtenerTextoSubtotal(): Promise<string> {
    return ((await this.subtotal.textContent()) ?? "").trim();
  }

  /**
   * Cierra el modal de confirmación haciendo clic en el botón "Continue shopping".
   */
  async continuarComprando(): Promise<void> {
    await this.botonContinuar.click();
  }

  /**
   * Hace clic en "Proceed to checkout" dentro del modal para transferir al usuario a la página del carrito.
   */
  async irAlCarrito(): Promise<void> {
    await this.botonProcederAlPago.click();
    await this.page.waitForLoadState("domcontentloaded");
  }
}
