import { NextResponse } from 'next/server'
import { fetchGoldPrice } from '@/lib/gold-api'
import { calculateGoldPrices } from '@/lib/gold-calculations'

export async function GET() {
  try {
    const goldData = await fetchGoldPrice()

    const ouncePriceUsd = goldData.price
    const prices = calculateGoldPrices(ouncePriceUsd)

    return NextResponse.json({
      success: true,
      currency: 'OMR',
      source: 'goldapi.io',
      ounce_price_usd: ouncePriceUsd,
      prices,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}