// Common transaction type used across all chains
export interface Transaction {
    hash: string;
    blockTime: number | null;
    block: number;
    success: boolean;
    fee: number;
    from: string;
    to: string;
    value: number;
    type: string;
    nativeSymbol: string;
}

export type Chain = 'solana' | 'monad' | 'base';

export interface ChainConfig {
    id: Chain;
    name: string;
    nativeSymbol: string;
    explorerUrl: string;
    addressExplorerUrl: string;
    rpcUrl: string;
    addressRegex: RegExp;
}

export const CHAIN_CONFIGS: Record<Chain, ChainConfig> = {
    solana: {
        id: 'solana',
        name: 'Solana',
        nativeSymbol: 'SOL',
        explorerUrl: 'https://solscan.io/tx/',
        addressExplorerUrl: 'https://solscan.io/account/',
        rpcUrl: 'https://api.mainnet-beta.solana.com',
        addressRegex: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    },
    monad: {
        id: 'monad',
        name: 'Monad',
        nativeSymbol: 'MON',
        explorerUrl: 'https://testnet.monadexplorer.com/tx/',
        addressExplorerUrl: 'https://testnet.monadexplorer.com/address/',
        rpcUrl: 'https://testnet-rpc.monad.xyz',
        addressRegex: /^0x[a-fA-F0-9]{40}$/,
    },
    base: {
        id: 'base',
        name: 'Base',
        nativeSymbol: 'ETH',
        explorerUrl: 'https://basescan.org/tx/',
        addressExplorerUrl: 'https://basescan.org/address/',
        rpcUrl: 'https://mainnet.base.org',
        addressRegex: /^0x[a-fA-F0-9]{40}$/,
    },
};
