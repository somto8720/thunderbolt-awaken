import { type Transaction, CHAIN_CONFIGS } from './types';

const config = CHAIN_CONFIGS.solana;

interface SignatureInfo {
    signature: string;
    slot: number;
    err: unknown | null;
    blockTime: number | null;
}

interface TransactionMeta {
    err: unknown | null;
    fee: number;
    preBalances: number[];
    postBalances: number[];
}

export async function fetchSolanaTransactions(
    address: string,
    limit: number = 50
): Promise<Transaction[]> {
    // Validate address
    if (!config.addressRegex.test(address)) {
        throw new Error('Invalid Solana address format');
    }

    // Get transaction signatures
    const sigResponse = await fetch(config.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getSignaturesForAddress',
            params: [address, { limit: Math.min(limit, 100) }],
        }),
    });

    const sigData = await sigResponse.json();

    if (sigData.error) {
        throw new Error(sigData.error.message || 'Failed to fetch signatures');
    }

    const signatures: SignatureInfo[] = sigData.result || [];

    if (signatures.length === 0) {
        return [];
    }

    // Fetch transaction details in batches
    const transactions: Transaction[] = [];
    const batchSize = 10;

    for (let i = 0; i < signatures.length; i += batchSize) {
        const batch = signatures.slice(i, i + batchSize);

        const batchPromises = batch.map(async (sig) => {
            try {
                const txResponse = await fetch(config.rpcUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'getTransaction',
                        params: [sig.signature, { encoding: 'json', maxSupportedTransactionVersion: 0 }],
                    }),
                });

                const txData = await txResponse.json();

                if (txData.result) {
                    const tx = txData.result;
                    const meta: TransactionMeta | null = tx.meta;
                    const message = tx.transaction?.message;

                    let value = 0;
                    let from = '';
                    let to = '';
                    let type = 'Unknown';

                    if (meta && message) {
                        const accountKeys = message.accountKeys || message.staticAccountKeys || [];
                        const preBalances = meta.preBalances || [];
                        const postBalances = meta.postBalances || [];

                        from = typeof accountKeys[0] === 'string'
                            ? accountKeys[0]
                            : (accountKeys[0]?.pubkey || '');

                        for (let j = 0; j < accountKeys.length; j++) {
                            const change = (postBalances[j] || 0) - (preBalances[j] || 0);
                            const accountKey = typeof accountKeys[j] === 'string'
                                ? accountKeys[j]
                                : (accountKeys[j]?.pubkey || '');

                            if (change > 0 && accountKey !== from) {
                                to = accountKey;
                                value = change / 1e9;
                                type = 'Transfer';
                                break;
                            }
                        }

                        if (!to && message.instructions?.length > 0) {
                            type = 'Program Interaction';
                            value = Math.abs((preBalances[0] || 0) - (postBalances[0] || 0) - (meta.fee || 0)) / 1e9;
                        }
                    }

                    return {
                        hash: sig.signature,
                        blockTime: sig.blockTime,
                        block: sig.slot,
                        success: !sig.err,
                        fee: (meta?.fee || 0) / 1e9,
                        from,
                        to,
                        value,
                        type,
                        nativeSymbol: config.nativeSymbol,
                    };
                }
            } catch (err) {
                console.error(`Error fetching tx ${sig.signature}:`, err);
            }

            return {
                hash: sig.signature,
                blockTime: sig.blockTime,
                block: sig.slot,
                success: !sig.err,
                fee: 0,
                from: '',
                to: '',
                value: 0,
                type: 'Unknown',
                nativeSymbol: config.nativeSymbol,
            };
        });

        const results = await Promise.all(batchPromises);
        transactions.push(...results);
    }

    return transactions;
}
