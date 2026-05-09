import mongoose from 'mongoose'

const NftSchema = new mongoose.Schema(
  {
    itemId: { type: Number, required: true, index: true },
    tokenId: { type: Number, index: true },
    nftContract: String,
    txHash: String,
    network: { type: String, default: '' },
    mintedBy: String,
    name: String,
    description: String,
    image: String,
    category: { type: String, default: 'Art' },
    price: String,
    creatorName: String,
    owner: String,
    seller: String,
    sold: { type: Boolean, default: false },
    listed: { type: Boolean, default: true },
    tokenURI: String,
    tags: [{ type: String }],
    transactions: { type: Array, default: [] },
    createdAt: String,
    lastSyncedAt: String,
  },
  { timestamps: true }
)

NftSchema.index({ itemId: 1 }, { unique: true })
NftSchema.index({ tokenId: 1 })
NftSchema.index({ updatedAt: -1 })
NftSchema.index({ category: 1, updatedAt: -1 })

export default mongoose.models.Nft || mongoose.model('Nft', NftSchema)
