import dynamic from 'next/dynamic'
import { getServerSession } from 'next-auth/next'
import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { authOptions } from '../lib/authOptions'
import { fetchDemoAllItems, getDemoLikeCount } from '../lib/demoStore'
import { NFT_CATEGORIES } from '../lib/categories'
import { shouldUseDemo } from '../lib/marketplace'
import { fetchMarketItems, fetchMyNfts } from '../lib/marketplace'

const DashboardCharts = dynamic(() => import('../components/DashboardCharts'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/10" />
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/10" />
    </div>
  ),
})

function buildStats(all) {
  let sales = 0
  const activity = []
  for (const n of all) {
    for (const t of n.transactions || []) {
      if (t.type === 'sale' && t.price != null) {
        sales += parseFloat(String(t.price)) || 0
        activity.push({
          label: `${t.type} · ${n.name}`,
          ts: t.ts,
          price: t.price,
        })
      }
    }
  }
  activity.sort((a, b) => new Date(b.ts) - new Date(a.ts))

  const byCategory = NFT_CATEGORIES.map((name) => ({
    name,
    count: all.filter((n) => n.category === name).length,
  }))

  const trending = [...all]
    .map((n) => ({ ...n, likes: getDemoLikeCount(n.itemId) }))
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5)

  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const day = d.toISOString().slice(0, 10)
    let volume = 0
    for (const n of all) {
      for (const t of n.transactions || []) {
        if (t.type === 'sale' && t.ts && String(t.ts).startsWith(day)) {
          volume += parseFloat(String(t.price)) || 0
        }
      }
    }
    last7.push({ day: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), volume: Number(volume.toFixed(4)) })
  }

  return {
    totalNfts: all.length,
    totalSales: sales.toFixed(3),
    totalUsers: Math.max(12, new Set(all.map((n) => n.creatorName).filter(Boolean)).size + 8),
    activity: activity.slice(0, 12),
    byCategory,
    trending,
    salesTrend: last7,
  }
}

export default function Dashboard({ session }) {
  const [allItems, setAllItems] = useState(() =>
    shouldUseDemo() ? fetchDemoAllItems() : []
  )

  useEffect(() => {
    let mounted = true

    async function load() {
      if (shouldUseDemo()) {
        if (mounted) setAllItems(fetchDemoAllItems())
        return
      }
      try {
        const [market, mine] = await Promise.all([fetchMarketItems(), fetchMyNfts()])
        const map = new Map()
        ;[...market, ...mine].forEach((x) => map.set(x.itemId, x))
        if (mounted) setAllItems([...map.values()])
      } catch (e) {
        console.error('DASHBOARD LOAD ERROR:', e)
        if (mounted) setAllItems([])
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [])

  const stats = useMemo(() => buildStats(allItems), [allItems])

  return (
    <Layout title="Dashboard — MetaNFT">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">Analytics</div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Marketplace dashboard</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Signed in as <span className="font-semibold text-slate-800 dark:text-slate-200">{session?.user?.name}</span>
          . Demo metrics aggregate local demo data.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total NFTs', value: stats.totalNfts },
            { label: 'Est. users', value: stats.totalUsers },
            { label: 'Total sales (ETH)', value: stats.totalSales },
            { label: 'Categories', value: NFT_CATEGORIES.length },
          ].map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 shadow-sm backdrop-blur-xl"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">{c.label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardCharts byCategory={stats.byCategory} salesTrend={stats.salesTrend} />
          </div>
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Trending (likes)</h3>
              <ul className="space-y-3">
                {stats.trending.map((n) => (
                  <li key={n.itemId} className="flex justify-between gap-2 text-sm">
                    <span className="truncate text-slate-700 dark:text-slate-300">{n.name}</span>
                    <span className="shrink-0 font-semibold text-indigo-600 dark:text-indigo-400">
                      {getDemoLikeCount(n.itemId)} ♥
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent activity</h3>
              <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
                {stats.activity.length === 0 ? (
                  <li className="text-slate-500 dark:text-slate-400">No sales yet.</li>
                ) : (
                  stats.activity.map((a, i) => (
                    <li key={i} className="text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-white/5 pb-2">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{a.label}</span>
                      <span className="ml-2 text-xs">{a.ts ? new Date(a.ts).toLocaleString() : ''}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/dashboard',
        permanent: false,
      },
    }
  }
  return { props: { session } }
}
