import { Locator, Page } from "@playwright/test";
import { config } from "../fixtures/config";

export class BasePage {
  protected readonly page: Page;
  readonly contadorCarrito: Locator;

  constructor(page: Page) {
    this.page = page;
    this.contadorCarrito = page.locator(".cart-products-count");
  }

  async navegarAInicio(): Promise<void> {
    await this.page.goto(config.baseUrl + config.homePath);
  }

  async obtenerTitulo(): Promise<string> {
    return this.page.title();
  }

  async obtenerUrl(): Promise<string> {
    return this.page.url();
  }

  async obtenerCantidadCarrito(): Promise<number> {
    const texto = (await this.contadorCarrito.textContent()) ?? "";
    const digits = texto.replace(/\D/g, "");
    return Number.parseInt(digits || "0", 10);
  }
}
