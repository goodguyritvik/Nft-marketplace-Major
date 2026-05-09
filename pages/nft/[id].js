import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import Layout from '../../components/Layout'
import Button from '../../components/Button'
import CategoryBadge from '../../components/CategoryBadge'
import { NFTCardSkeleton } from '../../components/Skeleton'
import { buyNft, fetchMarketItems, fetchNft } from '../../lib/marketplace'
import { addLocalComment, getLocalComments } from '../../lib/commentStore'
import { isFavorite, toggleFavorite } from '../../lib/favoritesStore'

export default function NFTDetails() {
  const router = useRouter()
  const { id } = router.query
  const { data: session } = useSession()
  const [nft, setNft] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [fav, setFav] = useState(false)

  const userKey = session?.user?.name || session?.user?.email || 'guest'
  const itemIdStr = Array.isArray(id) ? id[0] : id

  useEffect(() => {
    if (itemIdStr) setFav(isFavorite(itemIdStr, userKey))
  }, [itemIdStr, userKey])

  const load = useCallback(async () => {
    if (!itemIdStr) return
    setLoading(true)
    try {
      const n = await fetchNft(itemIdStr)
      setNft(n)
      const market = await fetchMarketItems()
      const rel = market
        .filter((x) => String(x.itemId) !== String(itemIdStr) && x.category === n?.category)
        .slice(0, 4)
      setRelated(rel)

      let remote = []
      try {
        const cr = await fetch(`/api/comments/${itemIdStr}`)
        const cj = await cr.json()
        if (cj.comments?.length) remote = cj.comments
      } catch {
        // ignore
      }
      const local = getLocalComments(itemIdStr)
      const merged =
        remote.length > 0
          ? remote.map((c) => ({
              userKey: c.userKey,
              text: c.text,
              createdAt: c.createdAt,
            }))
          : local
      setComments(merged)
    } catch (e) {
      console.error('NFT DETAILS ERROR:', e)
      setNft(null)
    } finally {
      setLoading(false)
    }
  }, [itemIdStr])

  useEffect(() => {
    load()
  }, [load])

  function handleAddComment(e) {
    e.preventDefault()
    if (!itemIdStr) return
    const text = commentText.trim()
    if (!text) return
    const list = addLocalComment(itemIdStr, { userKey, text })
    setComments(list)
    setCommentText('')
    toast.success('Comment added')
  }

  async function handleBuy() {
    if (!nft) return
    const tid = toast.loading('Processing purchase…')
    try {
      await buyNft(nft)
      toast.success('NFT purchased!', { id: tid })
      router.push('/my-nfts')
    } catch (error) {
      console.error('BUY NFT ERROR:', error)
      toast.error('Purchase failed', { id: tid })
    }
  }

  if (loading || !router.isReady) {
    return (
      <Layout title="NFT — MetaNFT">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <NFTCardSkeleton />
            <NFTCardSkeleton />
          </div>
        </div>
      </Layout>
    )
  }

  if (!nft) {
    return (
      <Layout title="Not found — MetaNFT">
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">NFT not found</h1>
          <Link href="/" className="mt-6 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
            Back home
          </Link>
        </div>
      </Layout>
    )
  }

  const listed = nft.listed !== false && !nft.sold
  const creator = nft.creatorName || nft.seller

  return (
    <Layout title={`${nft.name} — MetaNFT`}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={18} />
          Back to marketplace
        </Link>

        <section className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-white/5 shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={nft.image} alt={nft.name} className="aspect-square w-full object-cover" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <CategoryBadge category={nft.category} />
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-300">
                <Calendar size={14} />
                {nft.createdAt ? new Date(nft.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {nft.name}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">{nft.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Creator
                </p>
                <p className="mt-2 flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <User size={16} className="text-indigo-500" />
                  {creator}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Owner
                </p>
                <p className="mt-2 break-all text-sm text-slate-800 dark:text-slate-200">{nft.owner}</p>
              </div>
            </div>

            {nft.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {nft.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg bg-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-white/10 dark:text-slate-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-white to-slate-50 dark:from-white/10 dark:to-white/5 p-8">
              <p className="text-sm text-slate-500 dark:text-slate-400">Current price</p>
              <p className="mt-2 text-5xl font-black text-indigo-600 dark:text-indigo-400">{nft.price} ETH</p>
              <Button
                type="button"
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => {
                  if (!itemIdStr) return
                  toggleFavorite(itemIdStr, userKey)
                  setFav(isFavorite(itemIdStr, userKey))
                }}
              >
                {fav ? 'Remove from favorites' : 'Add to favorites'}
              </Button>
              {listed ? (
                <Button type="button" className="mt-8 w-full py-4 text-lg" onClick={handleBuy}>
                  Buy NFT
                </Button>
              ) : (
                <p className="mt-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                  This NFT is not currently listed for sale.
                </p>
              )}
            </div>

            <div className="mt-10 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/50 dark:bg-white/5 p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Comments</h2>
              <ul className="mt-4 max-h-60 space-y-3 overflow-y-auto">
                {comments.length === 0 ? (
                  <li className="text-sm text-slate-500 dark:text-slate-400">No comments yet.</li>
                ) : (
                  [...comments].reverse().map((c, i) => (
                    <li
                      key={i}
                      className="rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 px-3 py-2 text-sm"
                    >
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">{c.userKey}</span>
                      <p className="mt-1 text-slate-700 dark:text-slate-300">{c.text}</p>
                      {c.createdAt && (
                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(c.createdAt).toLocaleString()}
                        </p>
                      )}
                    </li>
                  ))
                )}
              </ul>
              <form onSubmit={handleAddComment} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  className="flex-1 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                  placeholder="Write a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button type="submit" variant="secondary">
                  Post
                </Button>
              </form>
            </div>

            <div className="mt-10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity</h2>
              <ul className="mt-4 space-y-3">
                {(nft.transactions || []).length === 0 ? (
                  <li className="text-sm text-slate-500 dark:text-slate-400">No on-app activity yet.</li>
                ) : (
                  [...(nft.transactions || [])]
                    .slice()
                    .reverse()
                    .map((tx, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 px-4 py-3 text-sm"
                      >
                        <span className="font-semibold capitalize text-indigo-600 dark:text-indigo-400">
                          {tx.type}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {' '}
                          · {tx.ts ? new Date(tx.ts).toLocaleString() : ''}
                        </span>
                        {tx.price != null && (
                          <span className="ml-2 text-slate-700 dark:text-slate-300">{tx.price} ETH</span>
                        )}
                      </li>
                    ))
                )}
              </ul>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-20 border-t border-slate-200/80 pt-12 dark:border-white/10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Related NFTs</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => (
                <Link
                  key={r.itemId}
                  href={`/nft/${r.itemId}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow transition hover:-translate-y-1"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.image}
                    alt={r.name}
                    className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{r.name}</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{r.price} ETH</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  )
}
