export function parsearPrecio(texto: string): number {
  const limpio = texto.replace(/[^0-9.,-]/g, "").replace(",", "");
  return parseFloat(limpio);
}

export function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}
