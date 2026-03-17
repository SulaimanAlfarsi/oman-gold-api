'use client'

import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'

type HistoryPoint = {
  created_at: string
  prices: { '24k': number; '22k': number; '21k': number; '18k': number }
}

type ChartPoint = {
  date: string
  label: string
  labelShort?: string
  xKey: string
  '24k': number
  '22k': number
  '21k': number
  '18k': number
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

const KARATS = ['24k', '22k', '21k', '18k'] as const
type KaratKey = (typeof KARATS)[number]

const KARAT_COLORS: Record<KaratKey, string> = {
  '24k': '#B8860B',
  '22k': '#D4A017',
  '21k': '#F5BE27',
  '18k': '#C9A227',
}

function buildChartPoints(json: { success?: boolean; data?: unknown }): ChartPoint[] {
  if (json.success !== true || !Array.isArray(json.data)) return []
  return (json.data as HistoryPoint[])
    .slice()
    .reverse()
    .map((row, index) => {
      const ts = new Date(row.created_at).getTime()
      const p = row.prices ?? {}
      return {
        date: row.created_at,
        label: formatDateAndTime(row.created_at),
        labelShort: formatDate(row.created_at),
        xKey: `${ts}-${index}`,
        '24k': Number(p['24k'] ?? 0),
        '22k': Number(p['22k'] ?? 0),
        '21k': Number(p['21k'] ?? 0),
        '18k': Number(p['18k'] ?? 0),
      }
    })
    .filter((p) => p['24k'] > 0 || p['22k'] > 0 || p['21k'] > 0 || p['18k'] > 0)
}

export default function HeroGoldChart() {
  const [data, setData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedKarat, setSelectedKarat] = useState<KaratKey>('24k')

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
      <div className="w-full h-[140px] sm:h-[180px] md:h-[220px] mx-auto flex items-center justify-center mt-4 sm:mt-6">
        <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-[#F5BE27] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full mx-auto mt-4 sm:mt-6 px-3 py-4 sm:px-4 sm:py-6 rounded-xl bg-white/60 border border-amber-200 text-center">
        <p className="text-sm text-[#5c5c5c]">Could not load chart</p>
        <p className="text-xs text-[#888] mt-1">{error}</p>
      </div>
    )
  }

  if (data.length < 2) {
    return (
      <div className="w-full mx-auto mt-4 sm:mt-6 px-3 py-4 sm:px-4 sm:py-6 rounded-xl bg-white/60 border border-amber-200 text-center">
        <p className="text-sm text-[#5c5c5c]">
          Chart will appear after at least 2 price updates are saved.
        </p>
        <p className="text-xs text-[#888] mt-1">
          Call <code className="bg-black/5 px-1 rounded">/api/gold/update</code> or run the cron to add history.
        </p>
      </div>
    )
  }

  const latest = data[data.length - 1]
  const selectedValues = data.map((d) => d[selectedKarat]).filter((v) => v > 0)
  const yMin = selectedValues.length ? Math.min(...selectedValues) : 0
  const yMax = selectedValues.length ? Math.max(...selectedValues) : 0
  const yPadding = Math.max(0.5, (yMax - yMin) * 0.5 || 0.5)
  const yDomain: [number, number] = [
    Math.floor((yMin - yPadding) * 10) / 10,
    Math.ceil((yMax + yPadding) * 10) / 10,
  ]
  const xTickInterval = Math.max(0, Math.floor(data.length / 8))

  return (
    <div className="w-full mx-auto mt-4 sm:mt-5 md:mt-6 px-0">
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
        {KARATS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSelectedKarat(k)}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all border-2 min-w-[3rem] sm:min-w-[3.5rem] md:min-w-[4rem]"
            style={{
              borderColor: selectedKarat === k ? KARAT_COLORS[k] : 'rgba(0,0,0,0.12)',
              backgroundColor: selectedKarat === k ? `${KARAT_COLORS[k]}18` : 'transparent',
              color: selectedKarat === k ? '#1a1a1a' : '#5c5c5c',
            }}
          >
            {k}
          </button>
        ))}
      </div>
      {latest && (
        <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-0.5 mb-2 sm:mb-2.5 text-xs sm:text-sm text-[#5c5c5c]">
          <span className="font-medium text-[#1a1a1a]">Latest per gram:</span>
          <span><span className="font-medium" style={{ color: KARAT_COLORS['24k'] }}>24k</span> {latest['24k'].toFixed(3)}</span>
          <span><span className="font-medium" style={{ color: KARAT_COLORS['22k'] }}>22k</span> {latest['22k'].toFixed(3)}</span>
          <span><span className="font-medium" style={{ color: KARAT_COLORS['21k'] }}>21k</span> {latest['21k'].toFixed(3)}</span>
          <span><span className="font-medium" style={{ color: KARAT_COLORS['18k'] }}>18k</span> {latest['18k'].toFixed(3)}</span>
          <span className="text-[#888]">OMR</span>
        </div>
      )}
      <div className="h-[160px] min-[400px]:h-[180px] sm:h-[200px] md:h-[230px] lg:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 20 }}
          >
            <XAxis
              dataKey="xKey"
              tick={{ fontSize: 8, fill: '#5c5c5c' }}
              axisLine={false}
              tickLine={false}
              interval={xTickInterval}
              angle={-38}
              textAnchor="end"
              height={36}
              tickFormatter={(xKey) => {
                const point = data.find((d) => d.xKey === xKey)
                return point ? formatDateAndTime(point.date) : ''
              }}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 9, fill: '#5c5c5c' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${Number(v).toFixed(2)}`}
              width={30}
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
                  ? formatDateAndTime((payload[0].payload as ChartPoint).date)
                  : ''
              }
              formatter={(value: unknown, name: unknown) => [`${Number(value ?? 0).toFixed(3)} OMR`, String(name ?? '')]}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px' }}
              formatter={(value) => <span style={{ color: KARAT_COLORS[value as KaratKey] }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey={selectedKarat}
              stroke={KARAT_COLORS[selectedKarat]}
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={1200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
