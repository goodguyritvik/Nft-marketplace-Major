import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: String,
    email: String,
    image: String,
    bio: { type: String, default: '' },
    walletAddress: { type: String, default: '' },
    favorites: [{ type: Number }],
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
