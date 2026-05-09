import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Sparkles, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import Button from './Button'
import { getRuntimeMode } from '../lib/env'
import {
  readUseChainFromStorage,
  shouldUseDemo,
  writeUseChainToStorage,
} from '../lib/marketplace'
import { notifyChainModeChanged, subscribeChainMode } from '../lib/chainMode'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [demo, setDemo] = useState(true)
  const [chainOn, setChainOn] = useState(false)
  const mode = typeof window !== 'undefined' ? getRuntimeMode() : 'demo'

  useEffect(() => {
    setDemo(shouldUseDemo())
    setChainOn(readUseChainFromStorage())
    return subscribeChainMode(() => {
      setDemo(shouldUseDemo())
      setChainOn(readUseChainFromStorage())
    })
  }, [])

  function toggleChain(e) {
    const on = e.target.checked
    writeUseChainToStorage(on)
    setChainOn(on)
    notifyChainModeChanged()
  }

  const showChainToggle = mode === 'hybrid'

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Sparkles className="text-indigo-500" size={28} />
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            MetaNFT
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Explore
          </Link>
          <Link href="/my-nfts" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            My NFTs
          </Link>
          <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Dashboard
          </Link>
          {session?.user?.name && (
            <Link href="/profile/me" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Profile
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {demo ? (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-200 border border-amber-500/30">
              Demo mode
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-200 border border-emerald-500/30">
              Chain
            </span>
          )}

          {showChainToggle && (
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={chainOn}
                onChange={toggleChain}
                className="rounded border-slate-400 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="hidden sm:inline">Blockchain</span>
            </label>
          )}

          <ThemeToggle />

          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-2">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-8 w-8 rounded-full border border-slate-200 dark:border-white/20"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                  <User size={16} />
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm" variant="secondary">
                Sign in
              </Button>
            </Link>
          )}

          <Link href="/create-item" className="hidden sm:block">
            <Button size="sm">Create NFT</Button>
          </Link>
        </div>
      </div>

      <div className="flex md:hidden border-t border-slate-200/60 dark:border-white/10 px-4 py-2 gap-4 text-sm justify-center">
        <Link href="/" className="text-slate-600 dark:text-slate-300">
          Explore
        </Link>
        <Link href="/my-nfts" className="text-slate-600 dark:text-slate-300">
          My NFTs
        </Link>
        <Link href="/create-item" className="text-indigo-600 font-semibold">
          Create
        </Link>
      </div>
    </nav>
  )
}
