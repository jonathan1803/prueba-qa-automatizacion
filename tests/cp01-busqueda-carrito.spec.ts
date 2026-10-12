import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { ProductPage } from "../pages/ProductPage";
import { CartPage, CartModal } from "../pages/CartPage";
import { parsearPrecio, redondear } from "../utils/precio";

test.describe("CP-01: Búsqueda de producto y agregado al carrito", () => {
  test("flujo completo desde la búsqueda hasta el carrito", async ({
    page,
    context,
  }) => {
    const home = new HomePage(page);
    const producto = new ProductPage(page);
    const modal = new CartModal(page);
    const cart = new CartPage(page);

    // Precondición: Preparación de estado inicial limpio e independiente (sitio demo compartido)
    await cart.vaciarCarritoSiTieneElementos();

    // Paso 1: Abrir el navegador y navegar a la URL del ambiente de pruebas
    // Resultado esperado: La página principal carga correctamente y el título corresponde a la tienda
    await home.navegarAInicio();
    expect(await home.obtenerTitulo()).toContain("Test Store");
    const cantidadInicial = await home.obtenerCantidadCarrito();

    // Paso 2: Escribir la palabra "best" en el campo de búsqueda
    // Resultado esperado: Se despliegan las sugerencias y al menos una contiene la palabra buscada
    await home.escribirEnBuscador("best");
    await expect(home.sugerencias.first()).toBeVisible({ timeout: 15000 });
    const textos = await home.obtenerTextosSugerencias();
    expect(textos.some((t) => t.toLowerCase().includes("best"))).toBe(true);

    // Paso 3: Seleccionar de las sugerencias el producto "The best is yet to come" Framed poster
    // Resultado esperado: Se muestra la página de detalle correspondiente al producto seleccionado
    await home.seleccionarSugerencia(["best is yet to come", "Framed poster"]);
    await expect(producto.nombre.first()).toContainText(/best is yet to come/i);
    expect(await home.obtenerUrl()).toContain("controller=product");

    // Paso 4: Verificar el detalle del producto (nombre y precio correspondientes)
    const nombreProducto = await producto.obtenerNombre();
    expect(nombreProducto.toLowerCase()).toContain("framed poster");
    const textoPrecioInicial = await producto.obtenerTextoPrecio();
    expect(parsearPrecio(textoPrecioInicial)).toBeGreaterThan(0);

    // Paso 5: Desplazarse (scroll) hasta la sección de descripción o detalles del producto
    // Resultado esperado: La sección queda visible y su contenido puede leerse
    await producto.irASeccionDescripcion();
    await expect(producto.seccionDescripcion).toBeVisible();
    expect((await producto.obtenerTextoDescripcion()).length).toBeGreaterThan(
      0,
    );

    // Paso 6: Si ofrece opciones de dimensión, seleccionar una distinta a la predeterminada
    // Resultado esperado: El precio mostrado se actualiza según la dimensión seleccionada
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

    // Paso 7: Modificar la cantidad a 3 unidades
    // Resultado esperado: El campo de cantidad refleja el valor 3 antes de agregar al carrito
    await producto.establecerCantidad(3);
    await expect(producto.campoCantidad).toHaveValue("3");

    // Paso 8: Agregar el producto al carrito
    // Resultado esperado: Ventana de confirmación con nombre, cantidad 3 y subtotal = precio unitario * 3
    await producto.agregarAlCarrito();
    await expect(modal.modal).toBeVisible({ timeout: 30000 });
    await expect(modal.nombreProducto).toContainText(/framed poster/i, {
      timeout: 15000,
    });
    await expect(modal.cantidad).toContainText("3", { timeout: 10000 });
    await expect(modal.subtotal).toBeVisible({ timeout: 10000 });

    expect((await modal.obtenerNombre()).toLowerCase()).toContain(
      "framed poster",
    );
    expect(await modal.obtenerCantidad()).toBe(3);
    const subtotal = parsearPrecio(await modal.obtenerTextoSubtotal());
    expect(subtotal).toBeGreaterThan(0);
    expect(subtotal).toBeGreaterThanOrEqual(redondear(precioUnitario * 3));

    // Paso 9: Hacer clic en la opción de continuar comprando
    // Resultado esperado: La ventana se cierra y el contador del carrito en el encabezado muestra 3 artículos
    await modal.continuarComprando();
    await expect(modal.modal).toBeHidden();
    const cantidadEsperada = cantidadInicial + 3;
    await expect(home.contadorCarrito).toContainText(String(cantidadEsperada));
    expect(await home.obtenerCantidadCarrito()).toBe(cantidadEsperada);
  });
});
