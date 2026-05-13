import { type Transaction, CHAIN_CONFIGS } from './types';

const config = CHAIN_CONFIGS.monad;

// Note: Monad is currently testnet only. Using EVM-compatible approach.
export async function fetchMonadTransactions(
    address: string,
    limit: number = 50
): Promise<Transaction[]> {
    // Validate address (EVM format)
    if (!config.addressRegex.test(address)) {
        throw new Error('Invalid Monad address format. Must be 0x followed by 40 hex characters.');
    }

    // For Monad testnet, we'll use a similar approach to other EVM chains
    // Currently getting recent blocks and filtering for address
    // In production, you'd use Monad's indexer API when available

    try {
        // Get current block number
        const blockResponse = await fetch(config.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_blockNumber',
                params: [],
            }),
        });

        const blockData = await blockResponse.json();

        if (blockData.error) {
            throw new Error(blockData.error.message || 'Failed to get block number');
        }

        const currentBlock = parseInt(blockData.result, 16);

        // Get transaction count for address
        const txCountResponse = await fetch(config.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getTransactionCount',
                params: [address, 'latest'],
            }),
        });

        const txCountData = await txCountResponse.json();
        const txCount = parseInt(txCountData.result || '0x0', 16);

        if (txCount === 0 || limit <= 0) {
            return [];
        }

        // For demo purposes, we'll create placeholder transactions
        // In a real implementation, you would use Monad's transaction indexer API
        // which provides historical transaction data

        // Try to get the balance to at least show some activity indicator
        const balanceResponse = await fetch(config.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_getBalance',
                params: [address, 'latest'],
            }),
        });

        const balanceData = await balanceResponse.json();
        const balance = parseInt(balanceData.result || '0x0', 16) / 1e18;

        // Return info message if we can't fetch full history
        // The Monad explorer API would be needed for full transaction history
        const transactions: Transaction[] = [];

        // We'll show a placeholder indicating the account exists but full history requires indexer
        if (txCount > 0) {
            transactions.push({
                hash: '0x' + '0'.repeat(64),
                blockTime: Math.floor(Date.now() / 1000),
                block: currentBlock,
                success: true,
                fee: 0,
                from: address,
                to: '',
                value: balance,
                type: `Account has ${txCount} transactions (indexer required for full history)`,
                nativeSymbol: config.nativeSymbol,
            });
        }

        return transactions;

    } catch (error) {
        // If RPC fails, Monad testnet might be unavailable
        console.error('Monad RPC error:', error);
        throw new Error('Monad testnet RPC is currently unavailable. Please try again later.');
    }
}
