import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ShoppingBag, ShieldCheck, Wallet } from 'lucide-react'
import Layout from '../components/Layout'
import Hero from '../components/Hero'
import MarketControls from '../components/MarketControls'
import NFTGrid from '../components/NFTGrid'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import {
  buyNft,
  fetchMarketItems,
} from '../lib/marketplace'
import { subscribeChainMode } from '../lib/chainMode'
import {
  getDemoLikeCount,
  isDemoLiked,
  toggleDemoLike,
} from '../lib/demoStore'

export default function Home() {
  const { data: session } = useSession()
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const [, setLikeTick] = useState(0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')

  const userKey = session?.user?.name || session?.user?.email || 'anon'

  const loadNFTs = useCallback(async () => {
    setLoading(true)
    try {
      const items = await fetchMarketItems()
      setNfts(items)
    } catch (err) {
      console.error('LOAD ERROR:', err)
      toast.error('Failed to load NFTs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNFTs()
    return subscribeChainMode(() => {
      loadNFTs()
    })
  }, [loadNFTs])

  async function handleBuy(nft) {
    const id = toast.loading('Processing purchase…')
    try {
      await buyNft(nft)
      toast.success('Purchase complete!', { id })
      await loadNFTs()
    } catch (err) {
      console.error('BUY ERROR:', err)
      toast.error('Purchase failed', { id })
    }
  }

  function handleToggleLike(itemId) {
    toggleDemoLike(itemId, userKey)
    setLikeTick((t) => t + 1)
  }

  const likeCount = (id) => getDemoLikeCount(id)
  const liked = (id) => isDemoLiked(id, userKey)

  const filteredNfts = useMemo(() => {
    let list = [...nfts]
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (n) =>
          (n.name || '').toLowerCase().includes(q) ||
          (n.description || '').toLowerCase().includes(q) ||
          (n.creatorName || '').toLowerCase().includes(q)
      )
    }
    if (category) {
      list = list.filter((n) => n.category === category)
    }
    list.sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime()
      const db = new Date(b.createdAt || 0).getTime()
      const pa = parseFloat(String(a.price)) || 0
      const pb = parseFloat(String(b.price)) || 0
      if (sort === 'newest') return db - da
      if (sort === 'oldest') return da - db
      if (sort === 'price_desc') return pb - pa
      if (sort === 'price_asc') return pa - pb
      return 0
    })
    return list
  }, [nfts, search, category, sort])

  return (
    <Layout title="MetaNFT — Explore">
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Wallet,
              title: 'Blockchain powered',
              body: 'List and trade with Solidity smart contracts when chain mode is enabled.',
              color: 'text-indigo-500',
            },
            {
              icon: ShieldCheck,
              title: 'Secure ownership',
              body: 'ERC-721 standard with transparent provenance and metadata.',
              color: 'text-violet-500',
            },
            {
              icon: ShoppingBag,
              title: 'Demo-safe UX',
              body: 'Wallet-less demo mode keeps your presentation smooth and stress-free.',
              color: 'text-fuchsia-500',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-8 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <f.icon className={`mb-4 ${f.color}`} size={40} />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="trending" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Trending NFTs
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Discover the latest listed assets.</p>
          </div>
          <Link href="/create-item">
            <Button>Create NFT</Button>
          </Link>
        </div>

        <MarketControls
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
        />

        {!loading && nfts.length === 0 ? (
          <EmptyState
            title="No NFTs listed yet"
            description="Create your first NFT and it will appear here."
            action={
              <Link href="/create-item">
                <Button>Mint an NFT</Button>
              </Link>
            }
          />
        ) : !loading && filteredNfts.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try adjusting search or filters."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('')
                  setCategory('')
                  setSort('newest')
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <NFTGrid
            nfts={filteredNfts}
            loading={loading}
            onBuy={handleBuy}
            onToggleLike={handleToggleLike}
            isLiked={liked}
            likeCount={likeCount}
            userKey={userKey}
          />
        )}
      </section>
    </Layout>
  )
}
