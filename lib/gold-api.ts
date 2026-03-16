import { roundPrice } from './gold-calculations'

/** GoldAPI.io XAU/OMR response – per-gram prices already in OMR */
export interface GoldApiOmrResponse {
  price: number
  price_gram_24k?: number
  price_gram_22k?: number
  price_gram_21k?: number
  price_gram_18k?: number
  currency?: string
  [key: string]: unknown
}

export interface GoldPricesOmr {
  '24k': number
  '22k': number
  '21k': number
  '18k': number
}

export async function fetchGoldPriceOmr(): Promise<GoldPricesOmr> {
  const apiKey = process.env.GOLD_API_KEY
  if (!apiKey) {
    throw new Error('GOLD_API_KEY is not set')
  }

  const response = await fetch('https://www.goldapi.io/api/XAU/OMR', {
    method: 'GET',
    headers: {
      'x-access-token': apiKey,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`GoldAPI request failed: ${response.status}`)
  }

  const data = (await response.json()) as GoldApiOmrResponse

  return {
    '24k': roundPrice(Number(data.price_gram_24k ?? data.price ?? 0)),
    '22k': roundPrice(Number(data.price_gram_22k ?? 0)),
    '21k': roundPrice(Number(data.price_gram_21k ?? 0)),
    '18k': roundPrice(Number(data.price_gram_18k ?? 0)),
  }
}
