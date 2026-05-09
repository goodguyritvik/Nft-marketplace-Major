import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema(
  {
    itemId: { type: Number, required: true, index: true },
    userKey: { type: String, required: true },
    text: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
)

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema)
