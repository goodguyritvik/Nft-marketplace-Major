import NFTCard from './NFTCard'
import { NFTCardSkeleton } from './Skeleton'

export default function NFTGrid({
  nfts,
  loading,
  onBuy,
  onToggleLike,
  isLiked,
  likeCount,
  userKey,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <NFTCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {nfts.map((nft) => (
        <NFTCard
          key={nft.itemId}
          nft={nft}
          onBuy={onBuy}
          onToggleLike={onToggleLike}
          liked={isLiked?.(nft.itemId)}
          likeCount={likeCount?.(nft.itemId)}
          userKey={userKey}
        />
      ))}
    </div>
  )
}
