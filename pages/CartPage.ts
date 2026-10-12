import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { config } from "../fixtures/config";

export { CartModal } from "./CartModal";

export class CartPage extends BasePage {
  readonly itemsCarrito: Locator;
  readonly nombresProductos: Locator;
  readonly preciosUnitarios: Locator;
  readonly inputsCantidad: Locator;
  readonly totalesLinea: Locator;
  readonly subtotalProductos: Locator;
  readonly totalCarrito: Locator;
  readonly botonesEliminar: Locator;
  readonly mensajeCarritoVacio: Locator;

  constructor(page: Page) {
    super(page);
    this.itemsCarrito = page.locator(".cart-item");
    this.nombresProductos = page.locator(".cart-item .product-line-info a");
    this.preciosUnitarios = page.locator(
      ".cart-item .current-price .price, .cart-item .product-price"
    );
    this.inputsCantidad = page.locator("input.js-cart-line-product-quantity");
    this.totalesLinea = page.locator(
      ".cart-item .product-total .price, .cart-item .product-line-grid-right .price"
    );
    this.subtotalProductos = page.locator("#cart-subtotal-products .value");
    this.totalCarrito = page.locator(".cart-total .value");
    this.botonesEliminar = page.locator("a.remove-from-cart");
    this.mensajeCarritoVacio = page.locator(".no-items");
  }

  /**
   * Navega directamente a la pantalla del carrito de compras.
   */
  async navegarAlCarrito(): Promise<void> {
    await this.page.goto(`${config.baseUrl}/index.php?controller=cart&action=show`);
    await this.page.waitForLoadState("domcontentloaded");
  }

  /**
   * Devuelve la cantidad de líneas de productos presentes en el carrito.
   */
  async contarItems(): Promise<number> {
    return this.itemsCarrito.count();
  }

  /**
   * Obtiene el nombre del producto ubicado en el índice indicado dentro del carrito.
   * @param indice Posición de la fila del producto (por defecto 0).
   */
  async obtenerNombreProducto(indice: number = 0): Promise<string> {
    return ((await this.nombresProductos.nth(indice).textContent()) ?? "").trim();
  }

  /**
   * Obtiene el texto del precio unitario del producto ubicado en el índice indicado.
   * @param indice Posición de la fila del producto (por defecto 0).
   */
  async obtenerTextoPrecioUnitario(indice: number = 0): Promise<string> {
    return (
      (await this.itemsCarrito
        .nth(indice)
        .locator(".current-price .price")
        .textContent()) ?? ""
    ).trim();
  }

  /**
   * Obtiene el valor numérico actual del campo de cantidad para un producto específico.
   * @param indice Posición de la fila del producto (por defecto 0).
   */
  async obtenerCantidadInput(indice: number = 0): Promise<string> {
    return this.inputsCantidad.nth(indice).inputValue();
  }

  /**
   * Obtiene el importe total de la línea (precio unitario * cantidad) para un producto.
   * @param indice Posición de la fila del producto (por defecto 0).
   */
  async obtenerTextoTotalLinea(indice: number = 0): Promise<string> {
    return (
      (await this.itemsCarrito
        .nth(indice)
        .locator(".product-line-grid-right strong")
        .textContent()) ?? ""
    ).trim();
  }

  /**
   * Obtiene el texto del subtotal general de todos los productos en el carrito.
   */
  async obtenerTextoSubtotal(): Promise<string> {
    return ((await this.subtotalProductos.textContent()) ?? "").trim();
  }

  /**
   * Obtiene el texto del importe total a pagar del carrito (incluyendo impuestos/envío).
   */
  async obtenerTextoTotal(): Promise<string> {
    return ((await this.totalCarrito.textContent()) ?? "").trim();
  }

  /**
   * Modifica la cantidad de un producto usando los botones nativos TouchSpin (+/-) de PrestaShop.
   * Calcula la diferencia respecto a la cantidad actual y pulsa el botón correspondiente,
   * esperando la confirmación de la petición AJAX del servidor por cada cambio.
   * @param cantidad Nueva cantidad deseada.
   * @param indice Posición de la fila del producto (por defecto 0).
   */
  async modificarCantidad(cantidad: number, indice: number = 0): Promise<void> {
    const item = this.itemsCarrito.nth(indice);
    const input = item.locator("input.js-cart-line-product-quantity");
    const actual = parseInt(await input.inputValue(), 10);
    const diff = cantidad - actual;

    if (diff !== 0) {
      const boton =
        diff < 0
          ? item.locator(".bootstrap-touchspin-down, button.touchspin-down")
          : item.locator(".bootstrap-touchspin-up, button.touchspin-up");

      const veces = Math.abs(diff);
      for (let i = 0; i < veces; i++) {
        const respuestaCart = this.page
          .waitForResponse(
            (r) => r.url().includes("controller=cart") && r.status() === 200,
            { timeout: 15000 }
          )
          .catch(() => null);
        await boton.click();
        await respuestaCart;
        await this.page.waitForTimeout(500);
      }
    }
  }

  /**
   * Elimina un producto específico del carrito haciendo clic en su botón de papelera
   * y esperando a que la petición AJAX termine y el elemento desaparezca del DOM.
   * @param indice Posición de la fila del producto a eliminar (por defecto 0).
   */
  async eliminarProducto(indice: number = 0): Promise<void> {
    const item = this.itemsCarrito.nth(indice);
    const boton = this.botonesEliminar.nth(indice);
    const respuestaCart = this.page.waitForResponse(
      (r) => r.url().includes("controller=cart") && r.status() === 200,
      { timeout: 15000 }
    ).catch(() => null);
    await boton.click();
    await respuestaCart;
    await item.waitFor({ state: "detached", timeout: 10000 }).catch(() => {});
  }

  /**
   * Busca entre las líneas del carrito el producto cuyo título contenga el texto buscado
   * y devuelve su índice numérico dentro de la lista.
   * @param nombre Subcadena del nombre del producto a localizar.
   */
  async obtenerIndiceProductoPorNombre(nombre: string): Promise<number> {
    const cantidad = await this.nombresProductos.count();
    for (let i = 0; i < cantidad; i++) {
      const texto = await this.nombresProductos.nth(i).textContent();
      if (texto && texto.toLowerCase().includes(nombre.toLowerCase())) {
        return i;
      }
    }
    return 0;
  }

  /**
   * Garantiza que el carrito quede completamente vacío (0 artículos) antes de iniciar una prueba.
   * En esta tienda demo compartida de PrestaShop, la base de datos precarga artículos residuales
   * (como camisetas) que no son visibles en la interfaz hasta que se añade el primer artículo.
   * Por ello, este método:
   * 1. Verifica si ya hay enlaces de eliminación visibles.
   * 2. Si el carrito parece vacío, agrega un producto detonante rápido para forzar la
   *    instanciación del carrito en la base de datos y revelar los ítems precargados.
   * 3. Navega directamente a cada enlace oficial de eliminación (`controller=cart&delete=1...`),
   *    asegurando una purga 100% limpia sin depender de eventos de interfaz volátiles.
   */
  async vaciarCarritoSiTieneElementos(): Promise<void> {
    await this.navegarAlCarrito();
    let deleteLinks = await this.page
      .locator("a.remove-from-cart")
      .evaluateAll((links) => links.map((l) => (l as HTMLAnchorElement).href));

    if (deleteLinks.length === 0) {
      // Forzar instanciación del carrito para purgar ítems precargados de la base de datos demo
      await this.page.goto(
        `${config.baseUrl}/index.php?id_product=1&controller=product`
      );
      await this.page
        .locator('button[data-button-action="add-to-cart"]')
        .click();
      await this.page.waitForTimeout(1000);
      await this.navegarAlCarrito();
      deleteLinks = await this.page
        .locator("a.remove-from-cart")
        .evaluateAll((links) => links.map((l) => (l as HTMLAnchorElement).href));
    }

    for (const href of deleteLinks) {
      await this.page.goto(href);
      await this.page.waitForLoadState("domcontentloaded");
    }
    await this.navegarAlCarrito();
  }
}
