export function calculateGoldPrices(ouncePriceUsd: number) {
  const ounceToGram = 31.1035
  const usdToOmr = 0.385

  const gram24Usd = ouncePriceUsd / ounceToGram
  const gram24Omr = gram24Usd * usdToOmr

  return {
    '24k': Number(gram24Omr.toFixed(3)),
    '22k': Number((gram24Omr * 0.916).toFixed(3)),
    '21k': Number((gram24Omr * 0.875).toFixed(3)),
    '18k': Number((gram24Omr * 0.75).toFixed(3)),
  }
}