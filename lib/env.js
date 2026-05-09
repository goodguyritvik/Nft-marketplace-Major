/**
 * Server + client env helpers. Client only sees NEXT_PUBLIC_*.
 */

function readPublic(key, fallback = '') {
  if (typeof process === 'undefined' || !process.env) return fallback
  return process.env[key] ?? fallback
}

/** @returns {'demo'|'hybrid'|'live'} */
export function getRuntimeMode() {
  const m = readPublic('NEXT_PUBLIC_RUNTIME_MODE', 'demo').toLowerCase()
  if (m === 'live' || m === 'hybrid') return m
  return 'demo'
}

export function hasMongo() {
  return Boolean(
    typeof process !== 'undefined' && process.env && process.env.MONGODB_URI
  )
}

export function hasCloudinary() {
  return Boolean(
    typeof process !== 'undefined' &&
      process.env &&
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

export function hasGoogleAuth() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.NEXTAUTH_SECRET
  )
}

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY)
}

export function hasWalletRpc() {
  return Boolean(readPublic('NEXT_PUBLIC_RPC_URL', ''))
}

export function getRpcUrl() {
  return readPublic('NEXT_PUBLIC_RPC_URL', 'http://127.0.0.1:8545')
}

export function getNftAddress() {
  return readPublic('NEXT_PUBLIC_NFT_ADDRESS', '')
}

export function getMarketAddress() {
  return readPublic('NEXT_PUBLIC_MARKET_ADDRESS', '')
}
