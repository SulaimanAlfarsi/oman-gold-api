const PRICE_DECIMALS = 3

export function roundPrice(value: number): number {
  return Number(Number(value).toFixed(PRICE_DECIMALS))
}

/** Compare two prices for equality at 3 decimal places (avoids float drift). */
export function pricesEqual(a: number, b: number): boolean {
  return roundPrice(a) === roundPrice(b)
}
