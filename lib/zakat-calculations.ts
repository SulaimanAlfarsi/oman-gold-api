export const ZAKAT_NISAB_GRAMS = 85
export const ZAKAT_RATE = 0.025
export const HIJRI_YEAR_DAYS = 354.37

export const ZAKAT_KARATS = [24, 22, 21, 18] as const

export type ZakatKarat = (typeof ZAKAT_KARATS)[number]

export type ZakatHolding = {
  grams: number
  karat: ZakatKarat
  personalUse?: boolean
}

export type ZakatScenario = {
  pure_weight_grams: number
  nisab_met: boolean
  zakat_grams: number
  zakat_amount: number
}

export function roundZakatValue(value: number): number {
  return Number(value.toFixed(3))
}

export function parseZakatKarat(value: string | null): ZakatKarat | null {
  if (!value) return null

  const normalized = value.trim().toLowerCase().replace(/k$/, '')
  const karat = Number(normalized)

  return ZAKAT_KARATS.includes(karat as ZakatKarat) ? (karat as ZakatKarat) : null
}

export function pureGoldWeight(grams: number, karat: ZakatKarat): number {
  return grams * (karat / 24)
}

export function calculateZakatScenario(holdings: ZakatHolding[], pricePerGram24k: number): ZakatScenario {
  const pureWeight = holdings.reduce(
    (sum, holding) => sum + pureGoldWeight(holding.grams, holding.karat),
    0
  )
  const nisabMet = pureWeight >= ZAKAT_NISAB_GRAMS
  const zakatGrams = nisabMet ? pureWeight * ZAKAT_RATE : 0
  const zakatAmount = nisabMet ? pureWeight * pricePerGram24k * ZAKAT_RATE : 0

  return {
    pure_weight_grams: roundZakatValue(pureWeight),
    nisab_met: nisabMet,
    zakat_grams: roundZakatValue(zakatGrams),
    zakat_amount: roundZakatValue(zakatAmount),
  }
}

export function calculateHawl(acquiredDate: string, now = new Date()) {
  const acquired = new Date(`${acquiredDate}T00:00:00`)

  if (Number.isNaN(acquired.getTime())) {
    return null
  }

  const elapsedDays = (now.getTime() - acquired.getTime()) / (24 * 60 * 60 * 1000)
  const completionDate = new Date(acquired.getTime() + HIJRI_YEAR_DAYS * 24 * 60 * 60 * 1000)

  return {
    elapsed_days: roundZakatValue(Math.max(elapsedDays, 0)),
    hawl_completed: elapsedDays >= HIJRI_YEAR_DAYS,
    hawl_completion_date: completionDate.toISOString().slice(0, 10),
  }
}
