'use client'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

// Define custom chains
const xsollaSepolia = {
    id: 555272,
    name: 'Xsolla Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://zkrpc.xsollazk.com'] },
        public: { http: ['https://zkrpc.xsollazk.com'] },
    },
    blockExplorers: {
        default: { name: 'Xsolla Explorer', url: 'https://x.la/explorer/' },
    },
    testnet: true,
    iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png', // ETH icon as fallback
} as const

const neonDevnet = {
    id: 245022926,
    name: 'Neon Devnet',
    nativeCurrency: { name: 'Neon', symbol: 'NEON', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://devnet.neonevm.org'] },
        public: { http: ['https://devnet.neonevm.org'] },
    },
    blockExplorers: {
        default: { name: 'Neon Scan', url: 'https://devnet.neonscan.org' },
    },
    testnet: true,
    iconUrl: 'https://neonevm.org/favicon.ico',
} as const

const polkadorPaseo = {
    id: 420420421,
    name: 'Polkadot Paseo',
    nativeCurrency: { name: 'Paseo', symbol: 'PASEO', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://testnet-passet-hub-eth-rpc.polkadot.io'] },
        public: { http: ['https://testnet-passet-hub-eth-rpc.polkadot.io'] },
    },
    blockExplorers: {
        default: { name: 'Polkador Paseo Explorer', url: 'https://blockscout-passet-hub.parity-testnet.parity.io' },
    },
    testnet: true,
    iconUrl: 'https://polkadot.network/favicon.ico',
} as const

// Get WalletConnect project ID - this is required for network switching to work properly
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
    console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Network switching may not work properly. Get a project ID from https://cloud.walletconnect.com/')
}

// Wagmi config
const config = getDefaultConfig({
    appName: 'XSollaTetris',
    projectId: projectId || '2f2b7b5a2b0f4a8b8c9d0e1f2g3h4i5j', // Fallback project ID
    chains: [
        xsollaSepolia,
        neonDevnet,
        polkadorPaseo,
    ],
    ssr: true,
    // Enable multi-injected provider discovery to support MetaMask and other injected wallets
    multiInjectedProviderDiscovery: true,
})

const queryClient = new QueryClient()

interface Web3ProviderProps {
    children: React.ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
    const [mounted, setMounted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return <>{children}</>
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-4">
                    <h2 className="text-lg font-semibold mb-2">Web3 Connection Error</h2>
                    <p className="text-sm text-muted-foreground mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    try {
        return (
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider
                        showRecentTransactions={true}
                        coolMode={true}
                        modalSize="compact"
                        initialChain={xsollaSepolia}
                        appInfo={{
                            appName: 'XSollaTetris',
                            learnMoreUrl: 'https://example.com',
                        }}
                    >
                        {children}
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        )
    } catch (err) {
        console.error('Web3Provider error:', err)
        if (!error) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred')
        }
        return null
    }
}
