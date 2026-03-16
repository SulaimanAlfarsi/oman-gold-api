'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

type HistoryPoint = {
  created_at: string
  prices: { '24k': number; '22k': number; '21k': number; '18k': number }
}

type ChartPoint = {
  date: string
  label: string
  labelShort?: string
  value: number
  sortKey?: number
  xKey: string
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function formatDateAndTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function buildChartPoints(json: { success?: boolean; data?: unknown }): ChartPoint[] {
  if (json.success !== true || !Array.isArray(json.data)) return []
  return (json.data as HistoryPoint[])
    .slice()
    .reverse()
    .map((row, index) => {
      const ts = new Date(row.created_at).getTime()
      return {
        date: row.created_at,
        label: formatDateAndTime(row.created_at),
        labelShort: formatDate(row.created_at),
        value: Number(row.prices?.['24k'] ?? 0),
        sortKey: ts + index * 0.001,
        xKey: `${ts}-${index}`,
      }
    })
    .filter((p) => p.value > 0)
}

export default function HeroGoldChart() {
  const [data, setData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    function load() {
      fetch('/api/gold/history')
        .then((res) => {
          if (!res.ok) throw new Error(`API ${res.status}`)
          return res.json()
        })
        .then((json) => {
          if (cancelled) return
          if (json.success !== true || !Array.isArray(json.data)) {
            setError('Invalid response')
            return
          }
          setData(buildChartPoints(json))
          setError(null)
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Failed to load')
            setData([])
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    load()
    const interval = setInterval(load, 2 * 60 * 1000)
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  if (loading) {
    return (
      <div className="w-full max-w-2xl h-[180px] sm:h-[220px] mx-auto flex items-center justify-center mt-8">
        <div className="w-8 h-8 border-2 border-[#F5BE27] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 px-4 py-6 rounded-xl bg-white/60 border border-amber-200 text-center">
        <p className="text-sm text-[#5c5c5c]">Could not load chart</p>
        <p className="text-xs text-[#888] mt-1">{error}</p>
      </div>
    )
  }

  if (data.length < 2) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 px-4 py-6 rounded-xl bg-white/60 border border-amber-200 text-center">
        <p className="text-sm text-[#5c5c5c]">
          Chart will appear after at least 2 price updates are saved.
        </p>
        <p className="text-xs text-[#888] mt-1">
          Call <code className="bg-black/5 px-1 rounded">/api/gold/update</code> or run the cron to add history.
        </p>
      </div>
    )
  }

  const yMin = Math.min(...data.map((d) => d.value))
  const yMax = Math.max(...data.map((d) => d.value))
  const yPadding = Math.max(0.5, (yMax - yMin) * 0.5 || 0.5)
  const yDomain: [number, number] = [
    Math.floor((yMin - yPadding) * 10) / 10,
    Math.ceil((yMax + yPadding) * 10) / 10,
  ]
  const xTickInterval = Math.max(0, Math.floor(data.length / 8))

  return (
    <div className="w-full max-w-2xl h-[200px] sm:h-[240px] mx-auto mt-8 px-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 20, left: 8, bottom: 28 }}
        >
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5BE27" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#F5BE27" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="xKey"
            tick={{ fontSize: 9, fill: '#5c5c5c' }}
            axisLine={false}
            tickLine={false}
            interval={xTickInterval}
            angle={-40}
            textAnchor="end"
            height={40}
            tickFormatter={(xKey) => {
              const point = data.find((d) => d.xKey === xKey)
              return point ? formatDateAndTime(point.date) : ''
            }}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 10, fill: '#5c5c5c' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Number(v).toFixed(2)}`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: '1px solid #e8e4df',
              borderRadius: '12px',
              fontSize: '12px',
            }}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.date
                ? formatDate(payload[0].payload.date)
                : ''
            }
            formatter={(value: unknown) => [`${Number(value ?? 0).toFixed(3)} OMR`, '24k']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#F5BE27"
            strokeWidth={2}
            fill="url(#goldGradient)"
            isAnimationActive
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-[#888] mt-1">24k gold · last 50 updates</p>
    </div>
  )
}
