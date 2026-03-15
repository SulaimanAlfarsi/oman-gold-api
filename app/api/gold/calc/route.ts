import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const gramsParam = searchParams.get('grams')
    const karatParam = searchParams.get('karat')

    if (!gramsParam || !karatParam) {
      return NextResponse.json(
        { error: 'grams and karat parameters are required' },
        { status: 400 }
      )
    }

    const grams = Number(gramsParam)
    const karat = karatParam.toLowerCase()

    if (isNaN(grams) || grams <= 0) {
      return NextResponse.json(
        { error: 'grams must be a positive number' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('gold_prices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Failed to fetch latest gold price' },
        { status: 500 }
      )
    }

    let pricePerGram = 0
    let karatLabel = ''

    switch (karat) {
      case '24':
      case '24k':
        pricePerGram = data.price_24k
        karatLabel = '24k'
        break

      case '22':
      case '22k':
        pricePerGram = data.price_22k
        karatLabel = '22k'
        break

      case '21':
      case '21k':
        pricePerGram = data.price_21k
        karatLabel = '21k'
        break

      case '18':
      case '18k':
        pricePerGram = data.price_18k
        karatLabel = '18k'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid karat. Use 24, 22, 21, or 18.' },
          { status: 400 }
        )
    }

    const totalPrice = Number((grams * pricePerGram).toFixed(3))

    return NextResponse.json({
      karat: karatLabel,
      grams: grams,
      price_per_gram: pricePerGram,
      total_price: totalPrice,
      currency: data.currency,
      unit: 'gram',
      updated_at: data.created_at
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate gold price' },
      { status: 500 }
    )
  }
}