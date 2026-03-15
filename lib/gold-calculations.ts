const PRICE_DECIMALS = 3

function roundPrice(value: number): number {
  return Number(Number(value).toFixed(PRICE_DECIMALS))
}

/** Compare two prices for equality at 3 decimal places (avoids float drift). */
export function pricesEqual(a: number, b: number): boolean {
  return roundPrice(a) === roundPrice(b)
}

export function calculateGoldPrices(ouncePriceUsd: number) {
  const ounceToGram = 31.1035
  const usdToOmr = 0.3845

  const gram24Usd = ouncePriceUsd / ounceToGram
  const gram24Omr = gram24Usd * usdToOmr

  return {
    '24k': roundPrice(gram24Omr),
    '22k': roundPrice(gram24Omr * 0.916),
    '21k': roundPrice(gram24Omr * 0.875),
    '18k': roundPrice(gram24Omr * 0.75),
  }
}