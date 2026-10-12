import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("CP-04: Inicio de sesión con credenciales inválidas (caso negativo)", () => {
  test("debe mostrar error de autenticación y mantener al usuario sin sesión", async ({
    page,
  }) => {
    const login = new LoginPage(page);

    // 1. Ingresar a la pantalla de inicio de sesión
    await login.navegarALogin();

    // Validar que se muestra el formulario con los campos de correo y contraseña
    await expect(login.formularioLogin).toBeVisible();
    await expect(login.campoEmail).toBeVisible();
    await expect(login.campoPassword).toBeVisible();
    await expect(login.botonSubmit).toBeVisible();

    // 2. Ingresar un correo inexistente con formato válido y cualquier contraseña, y enviar
    const emailInexistente = "qa.candidato@example.com";
    const passwordCualquiera = "ClaveErronea123!";
    await login.iniciarSesion(emailInexistente, passwordCualquiera);

    // El sistema no permite el acceso y muestra el mensaje de error de autenticación
    await expect(login.alertaError).toBeVisible();
    const mensajeError = await login.obtenerMensajeError();
    expect(mensajeError).toContain("Authentication failed.");

    // 3. Verificar el estado de la sesión: el usuario permanece sin autenticar
    await expect(login.enlaceSignIn).toBeVisible();
    const textoEnlace = await login.obtenerTextoEnlaceUsuario();
    expect(textoEnlace.toLowerCase()).toContain("sign in");
  });
});
