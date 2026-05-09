export const CHAIN_MODE_EVENT = 'nft-chain-mode'

export function notifyChainModeChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CHAIN_MODE_EVENT))
}

export function subscribeChainMode(callback) {
  if (typeof window === 'undefined') return () => {}
  const fn = () => callback()
  window.addEventListener(CHAIN_MODE_EVENT, fn)
  return () => window.removeEventListener(CHAIN_MODE_EVENT, fn)
}
