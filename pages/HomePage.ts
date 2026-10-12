import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class HomePage extends BasePage {
  readonly campoBusqueda: Locator;
  readonly sugerencias: Locator;
  readonly productosEnResultados: Locator;
  readonly tituloSinResultados: Locator;
  readonly sugerenciaSinResultados: Locator;

  constructor(page: Page) {
    super(page);
    this.campoBusqueda = page.locator('input[name="s"]');
    this.sugerencias = page.locator(".ui-autocomplete .ui-menu-item"); // verificar
    this.productosEnResultados = page.locator("article.product-miniature");
    this.tituloSinResultados = page.getByText(
      "No matches were found for your search",
    );
    this.sugerenciaSinResultados = page.getByText(
      "Please try other keywords to describe what you are looking for.",
    );
  }

  async escribirEnBuscador(texto: string): Promise<void> {
    await this.campoBusqueda.click();
    // pressSequentially dispara los eventos de teclado que activan el autocompletado
    await this.campoBusqueda.pressSequentially(texto, { delay: 100 });
  }

  async buscar(texto: string): Promise<void> {
    await this.campoBusqueda.fill(texto);
    await this.campoBusqueda.press("Enter");
  }

  async obtenerTextosSugerencias(): Promise<string[]> {
    return this.sugerencias.allTextContents();
  }

  async seleccionarSugerencia(fragmentos: string[]): Promise<void> {
    let sugerencia = this.sugerencias;
    for (const fragmento of fragmentos) {
      sugerencia = sugerencia.filter({ hasText: fragmento });
    }
    await sugerencia.first().click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async contarProductosEnResultados(): Promise<number> {
    return this.productosEnResultados.count();
  }
}
