import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-500" size={22} />
              <span className="text-lg font-bold text-slate-900 dark:text-white">MetaNFT</span>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              A modern NFT marketplace demo built with Next.js, Solidity, and Tailwind CSS — optimized for smooth
              presentations and hybrid on-chain mode.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 text-sm">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Market</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Explore
                  </Link>
                </li>
                <li>
                  <Link href="/create-item" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Create
                  </Link>
                </li>
                <li>
                  <Link href="/my-nfts" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    My NFTs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Account</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li>
                  <Link href="/auth/signin" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Project</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Final-year demo — not financial advice.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-slate-200/60 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-500">
          © {new Date().getFullYear()} MetaNFT. Built for academic demonstration.
        </div>
      </div>
    </footer>
  )
}
