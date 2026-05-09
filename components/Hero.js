import Link from 'next/link'
import { motion } from 'framer-motion'
import Button from './Button'

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/25" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-500/25" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Web3 Marketplace
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            Discover, collect &amp; sell rare digital assets
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            A polished NFT marketplace experience with demo mode for stress-free presentations, optional blockchain
            mode, and a modern responsive UI.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/create-item">
              <Button size="lg">Start creating</Button>
            </Link>
            <Link href="#trending">
              <Button size="lg" variant="secondary">
                Explore NFTs
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <div className="w-full max-w-[380px] rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?q=80&w=1200&auto=format&fit=crop"
                alt="Featured"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cosmic Artifact</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Demo collection</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">From</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">0.05 ETH</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
