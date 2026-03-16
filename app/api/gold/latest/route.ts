import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { fetchGoldPriceOmr } from '@/lib/gold-api'
import { pricesEqual } from '@/lib/gold-calculations'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const useLive = searchParams.get('live') === 'true'

    if (useLive) {
      const prices = await fetchGoldPriceOmr()
      const { data: lastPrice } = await supabaseAdmin
        .from('gold_prices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const priceUnchanged =
        lastPrice &&
        pricesEqual(lastPrice.price_24k, prices['24k']) &&
        pricesEqual(lastPrice.price_22k, prices['22k']) &&
        pricesEqual(lastPrice.price_21k, prices['21k']) &&
        pricesEqual(lastPrice.price_18k, prices['18k'])
      const lastCreated = lastPrice?.created_at ? new Date(lastPrice.created_at).getTime() : 0
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      const shouldInsertDaily = lastCreated < oneDayAgo

      if (!priceUnchanged || shouldInsertDaily) {
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
      }

      return NextResponse.json({
        currency: 'OMR',
        prices,
        updated_at: new Date().toISOString(),
        source: 'goldapi.io',
      })
    }

    const { data, error } = await supabaseAdmin
      .from('gold_prices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    if (!data) {
      const prices = await fetchGoldPriceOmr()
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('gold_prices')
        .insert([
          {
            price_24k: prices['24k'],
            price_22k: prices['22k'],
            price_21k: prices['21k'],
            price_18k: prices['18k'],
            currency: 'OMR',
            source: 'goldapi.io',
          },
        ])
        .select()
        .single()
      if (insertError) throw insertError
      return NextResponse.json({
        currency: inserted.currency,
        prices: {
          '24k': inserted.price_24k,
          '22k': inserted.price_22k,
          '21k': inserted.price_21k,
          '18k': inserted.price_18k,
        },
        updated_at: inserted.created_at,
        source: inserted.source,
      })
    }

    return NextResponse.json({
      currency: data.currency,
      prices: {
        '24k': data.price_24k,
        '22k': data.price_22k,
        '21k': data.price_21k,
        '18k': data.price_18k,
      },
      updated_at: data.created_at,
      source: data.source,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch latest gold price' },
      { status: 500 }
    )
  }
}
