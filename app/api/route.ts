import { NextResponse } from 'next/server'
import { fetchGoldPriceOmr } from '@/lib/gold-api'

export async function GET() {
  try {
    const prices = await fetchGoldPriceOmr()

    return NextResponse.json({
      success: true,
      currency: 'OMR',
      source: 'goldapi.io',
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
