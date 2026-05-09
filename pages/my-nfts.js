import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import Layout from '../components/Layout'
import NFTGrid from '../components/NFTGrid'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import { fetchMyNfts } from '../lib/marketplace'
import { subscribeChainMode } from '../lib/chainMode'
import {
  getDemoLikeCount,
  isDemoLiked,
  toggleDemoLike,
} from '../lib/demoStore'
import { useSession } from 'next-auth/react'

export default function MyNFTs() {
  const { data: session } = useSession()
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const [, setLikeTick] = useState(0)

  const userKey = session?.user?.name || session?.user?.email || 'anon'

  const loadNFTs = useCallback(async () => {
    setLoading(true)
    try {
      const items = await fetchMyNfts()
      setNfts(items)
    } catch (error) {
      console.error('MY NFT ERROR:', error)
      toast.error('Failed to load your NFTs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNFTs()
    return subscribeChainMode(() => loadNFTs())
  }, [loadNFTs])

  function handleToggleLike(itemId) {
    toggleDemoLike(itemId, userKey)
    setLikeTick((t) => t + 1)
  }

  const likeCount = (id) => getDemoLikeCount(id)
  const liked = (id) => isDemoLiked(id, userKey)

  return (
    <Layout title="My NFTs — MetaNFT">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <ArrowLeft size={18} />
              Back to marketplace
            </Link>
            <h1 className="mt-6 text-4xl font-black text-slate-900 dark:text-white">My NFTs</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              NFTs you created or own (demo + chain views).
            </p>
          </div>
          <Link href="/create-item">
            <Button>Create NFT</Button>
          </Link>
        </div>

        {!loading && nfts.length === 0 ? (
          <EmptyState
            title="No NFTs found"
            description="Create NFTs to see them here."
            action={
              <Link href="/create-item">
                <Button>Create your first</Button>
              </Link>
            }
          />
        ) : (
          <NFTGrid
            nfts={nfts}
            loading={loading}
            onToggleLike={handleToggleLike}
            isLiked={liked}
            likeCount={likeCount}
            userKey={userKey}
          />
        )}
      </div>
    </Layout>
  )
}
