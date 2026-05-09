import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Layout from '../../components/Layout'
import ProfileHeader from '../../components/profile/ProfileHeader'
import NFTSection from '../../components/profile/NFTSection'
import { fetchDemoAllItems } from '../../lib/demoStore'
import { getFavoriteIds } from '../../lib/favoritesStore'
import { fetchMarketItems, fetchMyNfts, shouldUseDemo } from '../../lib/marketplace'
import clsx from 'clsx'

export default function ProfilePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { username: raw } = router.query
  const username = typeof raw === 'string' ? decodeURIComponent(raw) : ''
  const [tab, setTab] = useState('created')
  const [userStub, setUserStub] = useState(null)
  const [created, setCreated] = useState([])
  const [owned, setOwned] = useState([])
  const [favorites, setFavorites] = useState([])

  const isSelf = session?.user?.name === username

  const load = useCallback(async () => {
    if (!username) return
    try {
      const ur = await fetch(`/api/users/${encodeURIComponent(username)}`)
      const uj = await ur.json()
      setUserStub(uj.user || { username, name: username })
    } catch {
      setUserStub({ username, name: username })
    }

    let all = []
    if (shouldUseDemo()) {
      all = fetchDemoAllItems()
    } else {
      const [m, mine] = await Promise.all([fetchMarketItems(), fetchMyNfts()])
      const map = new Map()
      ;[...m, ...mine].forEach((x) => map.set(x.itemId, x))
      all = [...map.values()]
    }

    const uname = username.toLowerCase()
    setCreated(
      all.filter((n) => (n.creatorName || '').toLowerCase() === uname)
    )

    if (isSelf) {
      setOwned(await fetchMyNfts())
    } else {
      setOwned([])
    }

    const favIds = new Set(getFavoriteIds(username))
    setFavorites(all.filter((n) => favIds.has(n.itemId)))
  }, [username, isSelf])

  useEffect(() => {
    load()
  }, [load])

  const tabs = [
    { id: 'created', label: 'Created' },
    { id: 'owned', label: 'Owned' },
    { id: 'favorites', label: 'Favorites' },
  ]

  return (
    <Layout title={`${username || 'Profile'} — MetaNFT`}>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {username && <ProfileHeader username={username} userStub={userStub} />}

        <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={clsx(
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                tab === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'created' && <NFTSection title="Created NFTs" items={created} />}
        {tab === 'owned' && <NFTSection title="Owned NFTs" items={owned} />}
        {tab === 'favorites' && <NFTSection title="Favorite NFTs" items={favorites} />}
      </div>
    </Layout>
  )
}
