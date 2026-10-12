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
    await this.campoBusqueda.waitFor({ state: "visible" });
    // Asegurar que PrestaShop haya adjuntado el widget jQuery UI de autocompletado (.ui-autocomplete-input)
    await this.page
      .locator('input[name="s"].ui-autocomplete-input')
      .waitFor({ state: "attached", timeout: 8000 })
      .catch(() => {});

    await this.campoBusqueda.click();
    await this.campoBusqueda.fill("");
    // pressSequentially dispara los eventos de teclado requeridos por el autocompletado
    await this.campoBusqueda.pressSequentially(texto, { delay: 150 });

    // Si por latencia del servidor compartido las sugerencias no se despliegan de inmediato, reactivar el trigger
    const visible = await this.sugerencias
      .first()
      .isVisible({ timeout: 4000 })
      .catch(() => false);
    if (!visible) {
      await this.campoBusqueda.press("Backspace");
      await this.page.waitForTimeout(300);
      await this.campoBusqueda.pressSequentially(texto.slice(-1), { delay: 200 });
    }
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
