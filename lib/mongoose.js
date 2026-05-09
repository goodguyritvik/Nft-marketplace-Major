import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (MONGODB_URI && !MONGODB_URI.startsWith('mongodb')) {
  console.warn('MONGODB_URI does not look like a Mongo connection string')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectMongo() {
  if (!MONGODB_URI) return null
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    })
  }
  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }
  return cached.conn
}

export function isMongoConfigured() {
  return Boolean(MONGODB_URI)
}
