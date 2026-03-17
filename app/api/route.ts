import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { fetchGoldPriceOmr } from '@/lib/gold-api'

/** Serves latest gold prices from DB to conserve GoldAPI.io quota (e.g. 100 req/month). Only calls API if DB is empty. */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('gold_prices')
      .select('price_24k, price_22k, price_21k, price_18k, currency, source, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

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

    const prices = await fetchGoldPriceOmr()
    await supabaseAdmin.from('gold_prices').insert([
      {
        price_24k: prices['24k'],
        price_22k: prices['22k'],
        price_21k: prices['21k'],
        price_18k: prices['18k'],
        currency: 'OMR',
        source: 'goldapi.io',
      },
    ])

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
