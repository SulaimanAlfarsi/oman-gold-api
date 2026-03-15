export interface GoldApiResponse {
  price: number
  [key: string]: unknown
}

export async function fetchGoldPrice(): Promise<GoldApiResponse> {
  const apiKey = process.env.GOLD_API_KEY
  if (!apiKey) {
    throw new Error('GOLD_API_KEY is not set')
  }

  const response = await fetch('https://www.goldapi.io/api/XAU/USD', {
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

  const data = (await response.json()) as GoldApiResponse
  return data
}