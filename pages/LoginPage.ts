import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { config } from "../fixtures/config";

export class LoginPage extends BasePage {
  readonly formularioLogin: Locator;
  readonly campoEmail: Locator;
  readonly campoPassword: Locator;
  readonly botonSubmit: Locator;
  readonly alertaError: Locator;
  readonly enlaceSignIn: Locator;

  constructor(page: Page) {
    super(page);
    this.formularioLogin = page.locator("#login-form");
    this.campoEmail = page.locator("#field-email");
    this.campoPassword = page.locator("#field-password");
    this.botonSubmit = page.locator("#submit-login");
    this.alertaError = page.locator(".alert-danger, li.alert-danger");
    this.enlaceSignIn = page.locator("#_desktop_user_info a");
  }

  async navegarALogin(): Promise<void> {
    await this.page.goto(`${config.baseUrl}/index.php?controller=authentication`);
    await this.page.waitForLoadState("domcontentloaded");
  }

  async ingresarEmail(email: string): Promise<void> {
    await this.campoEmail.fill(email);
  }

  async ingresarPassword(password: string): Promise<void> {
    await this.campoPassword.fill(password);
  }

  async enviarFormulario(): Promise<void> {
    await this.botonSubmit.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async iniciarSesion(email: string, password: string): Promise<void> {
    await this.ingresarEmail(email);
    await this.ingresarPassword(password);
    await this.enviarFormulario();
  }

  async obtenerMensajeError(): Promise<string> {
    return ((await this.alertaError.first().textContent()) ?? "").trim();
  }

  async obtenerTextoEnlaceUsuario(): Promise<string> {
    return ((await this.enlaceSignIn.first().textContent()) ?? "").trim();
  }
}
