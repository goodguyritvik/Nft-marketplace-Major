import mongoose from 'mongoose'

const LikeSchema = new mongoose.Schema(
  {
    itemId: { type: Number, required: true, index: true },
    userKey: { type: String, required: true, index: true },
  },
  { timestamps: true }
)

LikeSchema.index({ itemId: 1, userKey: 1 }, { unique: true })

export default mongoose.models.Like || mongoose.model('Like', LikeSchema)
