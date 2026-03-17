/** Cron: fetches GoldAPI.io (1 call per run). Schedule in vercel.json – e.g. 3x/day keeps under 100 req/month. */
import { NextResponse } from 'next/server'
import { fetchGoldPriceOmr } from '@/lib/gold-api'
import { pricesEqual } from '@/lib/gold-calculations'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
    const tenMinAgo = Date.now() - 10 * 60 * 1000
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const shouldInsertByTime = lastCreated < tenMinAgo
    const shouldInsertDaily = lastCreated < oneDayAgo

    if (priceUnchanged && !shouldInsertByTime && !shouldInsertDaily) {
      return NextResponse.json({
        success: true,
        message: 'Price unchanged, skipping insert',
        prices,
      })
    }

    const { data, error } = await supabaseAdmin
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

    if (error) throw error

    return NextResponse.json({
      success: true,
      saved: data,
      prices,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update gold price' },
      { status: 500 }
    )
  }
}
