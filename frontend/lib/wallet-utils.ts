// Utility functions for wallet detection and handling

export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // Check for MetaMask
    return !!(window as any).ethereum?.isMetaMask
  } catch (error) {
    console.warn('Error checking MetaMask installation:', error)
    return false
  }
}

export function isWalletInstalled(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    // Check for any Ethereum provider
    return !!(window as any).ethereum
  } catch (error) {
    console.warn('Error checking wallet installation:', error)
    return false
  }
}

export function getInstalledWallets(): string[] {
  if (typeof window === 'undefined') return []
  
  try {
    const wallets: string[] = []
    const ethereum = (window as any).ethereum
    
    if (ethereum) {
      if (ethereum.isMetaMask) wallets.push('MetaMask')
      if (ethereum.isCoinbaseWallet) wallets.push('Coinbase Wallet')
      if (ethereum.isRabby) wallets.push('Rabby')
      if (ethereum.isOkxWallet) wallets.push('OKX Wallet')
      
      // Generic provider if none of the above
      if (wallets.length === 0) wallets.push('Ethereum Wallet')
    }
    
    return wallets
  } catch (error) {
    console.warn('Error getting installed wallets:', error)
    return []
  }
}

export function getMetaMaskDownloadUrl(): string {
  return 'https://metamask.io/download/'
}

export function handleWalletError(error: any): string {
  if (error?.code === 4001) {
    return 'Connection rejected by user'
  }
  if (error?.code === -32002) {
    return 'Connection request already pending'
  }
  if (error?.message?.includes('MetaMask')) {
    return 'MetaMask error: ' + error.message
  }
  if (error?.message?.includes('wallet')) {
    return 'Wallet error: ' + error.message
  }
  return error?.message || 'Unknown wallet error'
}
