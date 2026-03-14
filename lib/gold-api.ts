export async function fetchGoldPrice() {
  const response = await fetch('https://www.goldapi.io/api/XAU/USD', {
    method: 'GET',
    headers: {
      'x-access-token': process.env.GOLD_API_KEY!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`GoldAPI request failed: ${response.status}`)
  }

  const data = await response.json()
  return data
}