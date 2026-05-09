/**
 * Single facade: demo localStorage OR on-chain via ethers.
 */

import { ethers } from 'ethers'
import { getRuntimeMode, getRpcUrl } from './env'
import { nftaddress, nftmarketaddress } from '../config'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import {
  buyDemoNft,
  DEMO_DEFAULT_ADDRESS,
  fetchDemoMarketItems,
  fetchDemoMyNfts,
  fetchDemoNft,
  mintDemoNft,
  parseItemMetadata,
} from './demoStore'

const HARDHAT_DEFAULT_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

const API_TIMEOUT_MS = 8000

/** Client: true if user opted into chain in hybrid/live */
export function readUseChainFromStorage() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem('nft_use_chain') === 'true'
}

export function writeUseChainToStorage(value) {
  if (typeof window === 'undefined') return
  if (value) window.localStorage.setItem('nft_use_chain', 'true')
  else window.localStorage.removeItem('nft_use_chain')
}

export function shouldUseDemo() {
  const mode = getRuntimeMode()
  if (mode === 'demo') return true
  if (mode === 'live') return false
  // hybrid: opt-in to chain via localStorage
  return !readUseChainFromStorage()
}

function mapChainItem(i) {
  let metadata = parseItemMetadata(
    typeof i.tokenURI === 'string' ? i.tokenURI : ''
  )
  const listed =
    !i.sold &&
    String(i.owner || '').toLowerCase() ===
      `0x${'0'.repeat(40)}`.toLowerCase()
  return {
    itemId: Number(i.itemId),
    tokenId: Number(i.tokenId),
    nftContract: i.nftContract,
    price: ethers.formatUnits(i.price.toString(), 'ether'),
    seller: i.seller,
    owner: i.owner,
    sold: Boolean(i.sold),
    tokenURI: typeof i.tokenURI === 'string' ? i.tokenURI : '',
    createdAt: new Date().toISOString(),
    image: metadata.image,
    name: metadata.name,
    description: metadata.description,
    category: metadata.category,
    creatorName: metadata.creatorName,
    tags: metadata.tags || [],
    transactions: [],
    listed,
  }
}

function mergeNft(chainItem, mongoItem) {
  if (!mongoItem) return chainItem
  return {
    ...chainItem,
    name: mongoItem.name || chainItem.name,
    description: mongoItem.description || chainItem.description,
    image: mongoItem.image || chainItem.image,
    category: mongoItem.category || chainItem.category,
    creatorName: mongoItem.creatorName || mongoItem.mintedBy || chainItem.creatorName,
    tags: Array.isArray(mongoItem.tags) ? mongoItem.tags : chainItem.tags,
    transactions: Array.isArray(mongoItem.transactions)
      ? mongoItem.transactions
      : chainItem.transactions,
    createdAt: mongoItem.createdAt || chainItem.createdAt,
    txHash: mongoItem.txHash,
    network: mongoItem.network,
    lastSyncedAt: mongoItem.lastSyncedAt,
  }
}

async function safeApiFetch(url, options = {}) {
  if (typeof fetch === 'undefined') return null
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timeout = controller
    ? setTimeout(() => controller.abort(), API_TIMEOUT_MS)
    : null
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller?.signal,
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

async function fetchMongoNftsByIds(itemIds = []) {
  const ids = [...new Set(itemIds.map((n) => Number(n)).filter((n) => Number.isFinite(n)))]
  if (ids.length === 0) return []
  const payload = await safeApiFetch('/api/nfts', {
    method: 'POST',
    body: JSON.stringify({ itemIds: ids }),
  })
  return Array.isArray(payload?.nfts) ? payload.nfts : []
}

async function fetchMongoNftByItemId(itemId) {
  const payload = await safeApiFetch(`/api/nfts/${itemId}`)
  return payload?.nft || null
}

async function upsertMongoNft(itemId, body) {
  return safeApiFetch(`/api/nfts/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

async function getChainSigner() {
  const rpc = getRpcUrl()
  const provider = new ethers.JsonRpcProvider(rpc)
  const pk =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_DEMO_PRIVATE_KEY
      ? process.env.NEXT_PUBLIC_DEMO_PRIVATE_KEY
      : HARDHAT_DEFAULT_KEY
  return new ethers.Wallet(pk, provider)
}

export async function fetchMarketItems() {
  if (shouldUseDemo()) return fetchDemoMarketItems()
  try {
    const provider = new ethers.JsonRpcProvider(getRpcUrl())
    const contract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    )
    const data = await contract.fetchMarketItems()
    const chainItems = data.map(mapChainItem)
    const mongoItems = await fetchMongoNftsByIds(chainItems.map((i) => i.itemId))
    const byItemId = new Map(mongoItems.map((m) => [Number(m.itemId), m]))
    return chainItems.map((item) => mergeNft(item, byItemId.get(item.itemId)))
  } catch (e) {
    console.warn('Chain fetch failed, falling back to demo', e)
    return fetchDemoMarketItems()
  }
}

export async function fetchMyNfts(address) {
  const addr = address || DEMO_DEFAULT_ADDRESS
  if (shouldUseDemo()) return fetchDemoMyNfts(addr)
  try {
    const provider = new ethers.JsonRpcProvider(getRpcUrl())
    const contract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    )
    const data = await contract.fetchMarketItems()
    const lower = addr.toLowerCase()
    const filtered = data.filter(
      (item) =>
        String(item.owner).toLowerCase() === lower ||
        String(item.seller).toLowerCase() === lower
    )
    const chainItems = filtered.map(mapChainItem)
    const mongoItems = await fetchMongoNftsByIds(chainItems.map((i) => i.itemId))
    const byItemId = new Map(mongoItems.map((m) => [Number(m.itemId), m]))
    return chainItems.map((item) => mergeNft(item, byItemId.get(item.itemId)))
  } catch (e) {
    console.warn('Chain my-nfts failed, demo fallback', e)
    return fetchDemoMyNfts(addr)
  }
}

export async function fetchNft(itemId) {
  if (shouldUseDemo()) return fetchDemoNft(itemId)
  try {
    const provider = new ethers.JsonRpcProvider(getRpcUrl())
    const contract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    )
    const data = await contract.fetchMarketItems()
    const selected = data.find((item) => Number(item.itemId) === Number(itemId))
    if (!selected) return null
    const chainItem = mapChainItem(selected)
    const mongoNft = await fetchMongoNftByItemId(itemId)
    return mergeNft(chainItem, mongoNft)
  } catch (e) {
    console.warn('Chain nft detail failed, demo fallback', e)
    return fetchDemoNft(itemId)
  }
}

export async function mintNft({
  name,
  description,
  image,
  price,
  category,
  creatorName,
  tags = [],
}) {
  // #region agent log
  fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run1',hypothesisId:'H1',location:'lib/marketplace.js:mintNft:entry',message:'mintNft entered',data:{runtimeMode:getRuntimeMode(),hasWindow:typeof window!=='undefined',useChainStorage:typeof window!=='undefined'?window.localStorage.getItem('nft_use_chain'):null,price:String(price)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  if (shouldUseDemo()) {
    return mintDemoNft({
      name,
      description,
      image,
      price,
      category,
      creatorName,
      tags,
    })
  }
  let wallet
  let provider
  let nonce
  try {
    wallet = await getChainSigner()
    provider = wallet.provider
    nonce = await provider.getTransactionCount(wallet.address)
    // #region agent log
    fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run1',hypothesisId:'H2',location:'lib/marketplace.js:mintNft:signerReady',message:'signer/provider ready',data:{walletAddress:wallet?.address||null,hasProvider:Boolean(provider),nonce},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run1',hypothesisId:'H2',location:'lib/marketplace.js:mintNft:signerError',message:'signer/provider setup failed',data:{errorMessage:e?.message||String(e)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw e
  }

  const nftContract = new ethers.Contract(nftaddress, NFT.abi, wallet)
  const metadata = JSON.stringify({
    name,
    description,
    image,
    category,
    creatorName: creatorName || wallet.address.slice(0, 8),
    tags,
  })

  let tx
  let receipt
  try {
    // #region agent log
    fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run1',hypothesisId:'H3',location:'lib/marketplace.js:mintNft:beforeCreateToken',message:'about to call createToken',data:{metadataLength:metadata.length,nonce},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    tx = await nftContract.createToken(metadata, { nonce })
    receipt = await tx.wait()
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run1',hypothesisId:'H3',location:'lib/marketplace.js:mintNft:createTokenError',message:'createToken failed',data:{errorMessage:e?.message||String(e),errorCode:e?.code||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw e
  }
  const nftAddr = (await nftContract.getAddress()).toLowerCase()
  let tokenId
  for (const log of receipt.logs) {
    if (!log.address || log.address.toLowerCase() !== nftAddr) continue
    try {
      const parsed = nftContract.interface.parseLog({
        topics: [...log.topics],
        data: log.data,
      })
      if (parsed?.name === 'NFTMinted' && parsed.args?.tokenId != null) {
        tokenId = Number(parsed.args.tokenId)
        break
      }
      if (parsed?.name === 'Transfer' && parsed.args?.tokenId != null) {
        tokenId = Number(parsed.args.tokenId)
        break
      }
    } catch {
      // not this log
    }
  }
  if (tokenId == null) throw new Error('Could not parse tokenId from mint receipt')

  try {
    // #region agent log
    fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run1',hypothesisId:'H4',location:'lib/marketplace.js:mintNft:beforeApprove',message:'about to call approve',data:{tokenId,approveNonce:nonce+1,market:nftmarketaddress},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    tx = await nftContract.approve(nftmarketaddress, tokenId, { nonce: nonce + 1 })
    await tx.wait()
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run1',hypothesisId:'H4',location:'lib/marketplace.js:mintNft:approveError',message:'approve failed',data:{errorMessage:e?.message||String(e),errorCode:e?.code||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw e
  }

  const priceFormatted = ethers.parseUnits(String(price).trim(), 'ether')
  const marketContract = new ethers.Contract(
    nftmarketaddress,
    Market.abi,
    wallet
  )
  let listReceipt
  try {
    // #region agent log
    fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run1',hypothesisId:'H4',location:'lib/marketplace.js:mintNft:beforeCreateMarketItem',message:'about to call createMarketItem',data:{tokenId,priceEth:String(price),marketNonce:nonce+2},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    tx = await marketContract.createMarketItem(
      nftaddress,
      tokenId,
      priceFormatted,
      { nonce: nonce + 2 }
    )
    listReceipt = await tx.wait()
    // #region agent log
    fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run1',hypothesisId:'H4',location:'lib/marketplace.js:mintNft:chainFlowSuccess',message:'all chain tx calls completed',data:{tokenId,listTxHash:listReceipt?.hash||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:7535/ingest/ce4ec685-bcd2-4d44-bba8-434c988c88e6',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bb3c11'},body:JSON.stringify({sessionId:'bb3c11',runId:'run1',hypothesisId:'H4',location:'lib/marketplace.js:mintNft:createMarketItemError',message:'createMarketItem failed',data:{errorMessage:e?.message||String(e),errorCode:e?.code||null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw e
  }

  const providerContract = new ethers.Contract(
    nftmarketaddress,
    Market.abi,
    provider
  )
  const listedData = await providerContract.fetchMarketItems()
  const listedItem = listedData.find((item) => Number(item.tokenId) === Number(tokenId))
  if (!listedItem) throw new Error('Minted NFT not found in market listings')

  const chainItem = mapChainItem(listedItem)
  const persistPayload = {
    itemId: chainItem.itemId,
    tokenId,
    nftContract: nftaddress,
    txHash: listReceipt?.hash || receipt?.hash || '',
    network: (await provider.getNetwork()).name || String((await provider.getNetwork()).chainId),
    mintedBy: wallet.address.toLowerCase(),
    name,
    description,
    image,
    category,
    creatorName: creatorName || wallet.address.slice(0, 8),
    tags,
    price: String(price).trim(),
    seller: chainItem.seller?.toLowerCase?.() || chainItem.seller,
    owner: chainItem.owner?.toLowerCase?.() || chainItem.owner,
    sold: chainItem.sold,
    listed: chainItem.listed,
    tokenURI: metadata,
    createdAt: chainItem.createdAt,
    lastSyncedAt: new Date().toISOString(),
  }

  const persisted = await upsertMongoNft(chainItem.itemId, persistPayload)
  if (!persisted?.ok) {
    return {
      ...chainItem,
      syncWarning:
        'Blockchain mint/list succeeded, but MongoDB sync failed. NFT will still exist on chain.',
    }
  }
  return mergeNft(chainItem, persisted.nft)
}

export async function buyNft(nft) {
  if (shouldUseDemo()) {
    return buyDemoNft(nft.itemId, DEMO_DEFAULT_ADDRESS)
  }
  const wallet = await getChainSigner()
  const contract = new ethers.Contract(
    nftmarketaddress,
    Market.abi,
    wallet
  )
  const price = ethers.parseUnits(String(nft.price).trim(), 'ether')
  const tx = await contract.createMarketSale(nftaddress, nft.itemId, {
    value: price,
  })
  const receipt = await tx.wait()
  await upsertMongoNft(nft.itemId, {
    sold: true,
    listed: false,
    owner: wallet.address.toLowerCase(),
    lastSyncedAt: new Date().toISOString(),
    txHash: receipt?.hash || '',
  })
  return fetchNft(nft.itemId)
}
