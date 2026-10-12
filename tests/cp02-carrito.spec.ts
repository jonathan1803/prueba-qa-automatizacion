import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { ProductPage } from "../pages/ProductPage";
import { CartPage, CartModal } from "../pages/CartPage";
import { parsearPrecio, redondear } from "../utils/precio";

test.describe("CP-02: Validación y modificación del carrito", () => {
  test("debe validar cálculos, modificación de cantidad y vaciado del carrito", async ({
    page,
  }) => {
    const home = new HomePage(page);
    const producto = new ProductPage(page);
    const cart = new CartPage(page);
    const modal = new CartModal(page);

    // Preparación de estado inicial independiente y limpio
    await cart.vaciarCarritoSiTieneElementos();
    await home.navegarAInicio();

    // 1. Agregar al carrito 3 unidades del producto e ingresar al carrito
    await home.escribirEnBuscador("best");
    await expect(home.sugerencias.first()).toBeVisible();
    await home.seleccionarSugerencia(["best is yet to come", "Framed poster"]);
    await expect(producto.nombre.first()).toBeVisible();

    await producto.establecerCantidad(3);
    await expect(producto.campoCantidad).toHaveValue("3");
    await producto.agregarAlCarrito();

    // Ingresar al carrito de compras a través de la confirmación
    await expect(modal.modal).toBeVisible();
    await modal.irAlCarrito();

    await expect(cart.itemsCarrito.first()).toBeVisible();
    expect(await cart.contarItems()).toBeGreaterThan(0);

    const indiceProducto = await cart.obtenerIndiceProductoPorNombre("framed poster");
    expect(await cart.obtenerCantidadInput(indiceProducto)).toBe("3");

    // 2. Verificar detalle de la línea: total = precio unitario * cantidad
    const precioUnitario = parsearPrecio(
      await cart.obtenerTextoPrecioUnitario(indiceProducto)
    );
    const totalLineaInicial = parsearPrecio(
      await cart.obtenerTextoTotalLinea(indiceProducto)
    );
    expect(precioUnitario).toBeGreaterThan(0);
    expect(totalLineaInicial).toBe(redondear(precioUnitario * 3));

    // 3. Cambiar la cantidad del producto a 1 y verificar recálculo
    await cart.modificarCantidad(1, indiceProducto);
    await expect(cart.inputsCantidad.nth(indiceProducto)).toHaveValue("1");

    const totalLineaActualizado = parsearPrecio(
      await cart.obtenerTextoTotalLinea(indiceProducto)
    );
    expect(totalLineaActualizado).toBe(redondear(precioUnitario * 1));

    // 4. Eliminar el producto del carrito
    await cart.eliminarProducto(indiceProducto);

    // Si aún quedan artículos remanentes del sitio compartido, vaciarlos para validar estado final en cero
    if ((await cart.contarItems()) > 0) {
      await cart.vaciarCarritoSiTieneElementos();
    }

    await expect(cart.mensajeCarritoVacio).toBeVisible();
    await expect(cart.contadorCarrito).toContainText("(0)");
    expect(await cart.obtenerCantidadCarrito()).toBe(0);
  });
});
