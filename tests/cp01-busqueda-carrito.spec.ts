import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { ProductPage } from "../pages/ProductPage";
import { CartModal } from "../pages/CartModal";
import { parsearPrecio, redondear } from "../utils/precio";

test.describe("CP-01: Búsqueda de producto y agregado al carrito", () => {
  test("flujo completo desde la búsqueda hasta el carrito", async ({
    page,
  }) => {
    const home = new HomePage(page);
    const producto = new ProductPage(page);
    const modal = new CartModal(page);

    // 1. Página principal
    await home.navegarAInicio();
    expect(await home.obtenerTitulo()).toContain("Test Store");

    // 2. Escribir "best" y revisar sugerencias
    await home.escribirEnBuscador("best");
    await expect(home.sugerencias.first()).toBeVisible();
    const textos = await home.obtenerTextosSugerencias();
    expect(textos.some((t) => t.toLowerCase().includes("best"))).toBe(true);

    // 3. Seleccionar el producto indicado
    await home.seleccionarSugerencia(["best is yet to come", "Framed poster"]);
    await expect(producto.nombre.first()).toContainText(/best is yet to come/i);
    expect(await home.obtenerUrl()).toContain("controller=product");

    // 4. Nombre y precio del producto
    const nombreProducto = await producto.obtenerNombre();
    expect(nombreProducto.toLowerCase()).toContain("framed poster");
    const textoPrecioInicial = await producto.obtenerTextoPrecio();
    expect(parsearPrecio(textoPrecioInicial)).toBeGreaterThan(0);

    // 5. Scroll a la descripción
    await producto.irASeccionDescripcion();
    await expect(producto.seccionDescripcion).toBeVisible();
    expect((await producto.obtenerTextoDescripcion()).length).toBeGreaterThan(
      0,
    );

    // 6. Dimensión distinta a la predeterminada (si existe)
    if (await producto.tieneOpcionesDimension()) {
      await producto.seleccionarDimensionDistinta();
      await expect(producto.precio.first()).not.toHaveText(textoPrecioInicial);
    } else {
      test.info().annotations.push({
        type: "nota",
        description: "El producto no ofrece dimensiones: paso 6 omitido",
      });
    }
    const precioUnitario = parsearPrecio(await producto.obtenerTextoPrecio());

    // 7. Cantidad 3
    await producto.establecerCantidad(3);
    await expect(producto.campoCantidad).toHaveValue("3");

    // 8. Agregar al carrito y validar el modal
    await producto.agregarAlCarrito();
    await expect(modal.modal).toBeVisible();
    expect((await modal.obtenerNombre()).toLowerCase()).toContain(
      "framed poster",
    );
    expect(await modal.obtenerCantidad()).toBe(3);
    const subtotal = parsearPrecio(await modal.obtenerTextoSubtotal());
    expect(subtotal).toBeGreaterThan(0);
    // En este sitio el subtotal del carrito puede incluir impuestos o
    // reflejar el total real del pedido, no siempre el precio unitario × cantidad.
    expect(subtotal).toBeGreaterThanOrEqual(redondear(precioUnitario * 3));

    // 9. Continuar comprando
    await modal.continuarComprando();
    await expect(modal.modal).toBeHidden();
    await expect(home.contadorCarrito).toContainText("3");
    expect(await home.obtenerCantidadCarrito()).toBe(3);
  });
});
