/**
 * Extrae y normaliza un valor numérico a partir de un string de precio,
 * soportando múltiples divisas ($, €, £) y formatos decimales (. o ,).
 */
export function parsearPrecio(texto: string): number {
  if (!texto) return 0;

  const esNegativo = texto.includes("-");
  let limpio = texto.replace(/[^0-9.,]/g, "");

  if (!limpio) return 0;

  const lastDot = limpio.lastIndexOf(".");
  const lastComma = limpio.lastIndexOf(",");

  if (lastDot !== -1 && lastComma !== -1) {
    // Si contiene ambos, el último indica el separador decimal
    if (lastComma > lastDot) {
      // Formato europeo (ej. 1.234,56)
      limpio = limpio.replace(/\./g, "").replace(",", ".");
    } else {
      // Formato anglosajón (ej. 1,234.56)
      limpio = limpio.replace(/,/g, "");
    }
  } else if (lastComma !== -1) {
    // Solo contiene coma(s)
    const comas = (limpio.match(/,/g) || []).length;
    if (comas === 1) {
      limpio = limpio.replace(",", ".");
    } else {
      limpio = limpio.replace(/,/g, "");
    }
  } else if (lastDot !== -1) {
    // Solo contiene punto(s)
    const puntos = (limpio.match(/\./g) || []).length;
    if (puntos > 1) {
      limpio = limpio.replace(/\./g, "");
    }
  }

  const valor = parseFloat(limpio);
  if (Number.isNaN(valor)) return 0;
  return esNegativo ? -valor : valor;
}

export function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}
