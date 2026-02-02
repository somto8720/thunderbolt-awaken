import { type Transaction, CHAIN_CONFIGS } from './types';

const config = CHAIN_CONFIGS.base;

// Basescan API (free tier, no key needed for basic calls)
const BASESCAN_API = 'https://api.basescan.org/api';

interface BasescanTx {
    hash: string;
    blockNumber: string;
    timeStamp: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    isError: string;
    txreceipt_status: string;
    functionName: string;
}

export async function fetchBaseTransactions(
    address: string,
    limit: number = 50
): Promise<Transaction[]> {
    // Validate address
    if (!config.addressRegex.test(address)) {
        throw new Error('Invalid Base address format. Must be 0x followed by 40 hex characters.');
    }

    const url = new URL(BASESCAN_API);
    url.searchParams.set('module', 'account');
    url.searchParams.set('action', 'txlist');
    url.searchParams.set('address', address);
    url.searchParams.set('startblock', '0');
    url.searchParams.set('endblock', '99999999');
    url.searchParams.set('page', '1');
    url.searchParams.set('offset', String(Math.min(limit, 100)));
    url.searchParams.set('sort', 'desc');

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status === '0' && data.message !== 'No transactions found') {
        throw new Error(data.result || 'Failed to fetch transactions');
    }

    const txList: BasescanTx[] = data.result || [];

    return txList.map((tx) => {
        const gasUsed = BigInt(tx.gasUsed || '0');
        const gasPrice = BigInt(tx.gasPrice || '0');
        const fee = Number(gasUsed * gasPrice) / 1e18;
        const value = Number(BigInt(tx.value)) / 1e18;

        let type = 'Transfer';
        if (tx.functionName) {
            const fnName = tx.functionName.split('(')[0];
            type = fnName.charAt(0).toUpperCase() + fnName.slice(1);
        } else if (tx.to === '' || !tx.to) {
            type = 'Contract Creation';
        }

        return {
            hash: tx.hash,
            blockTime: parseInt(tx.timeStamp) || null,
            block: parseInt(tx.blockNumber) || 0,
            success: tx.isError === '0' && tx.txreceipt_status === '1',
            fee,
            from: tx.from,
            to: tx.to || '',
            value,
            type,
            nativeSymbol: config.nativeSymbol,
        };
    });
}
