import Link from 'next/link'
import EmptyState from '../EmptyState'

export default function NFTSection({ title, items }) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{title}</h2>
      {!items?.length ? (
        <EmptyState title="Nothing here yet" description={`No NFTs in ${title.toLowerCase()}.`} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((nft) => (
            <Link
              key={nft.itemId}
              href={`/nft/${nft.itemId}`}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow transition hover:-translate-y-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={nft.image}
                alt={nft.name}
                className="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
              />
              <div className="p-4">
                <p className="font-bold text-slate-900 dark:text-white truncate">{nft.name}</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold">{nft.price} ETH</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
