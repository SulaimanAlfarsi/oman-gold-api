import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

/** Serves latest gold prices from the database without spending GoldAPI.io quota. */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('gold_prices')
      .select('price_24k, price_22k, price_21k, price_18k, currency, source, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (!error && data) {
      return NextResponse.json({
        success: true,
        currency: data.currency ?? 'OMR',
        source: data.source ?? 'goldapi.io',
        prices: {
          '24k': data.price_24k,
          '22k': data.price_22k,
          '21k': data.price_21k,
          '18k': data.price_18k,
        },
        updated_at: data.created_at,
      })
    }

    return NextResponse.json(
      { success: false, error: 'No gold price data available' },
      { status: 404 }
    )
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
