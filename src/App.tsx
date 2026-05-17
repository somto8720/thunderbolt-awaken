import React, { useState } from 'react';
import { type Chain, type Transaction, CHAIN_CONFIGS } from './api/types';
import { fetchSolanaTransactions } from './api/solana';
import { fetchBaseTransactions } from './api/base';
import { fetchMonadTransactions } from './api/monad';

// Chain icons
const SolanaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
    <defs>
      <linearGradient id="solGrad" x1="0" y1="0" x2="128" y2="128">
        <stop stopColor="#9945FF" />
        <stop offset="1" stopColor="#14F195" />
      </linearGradient>
    </defs>
    <circle cx="64" cy="64" r="60" fill="url(#solGrad)" />
    <path d="M98 44L64 78L30 44" stroke="white" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 84L64 50L98 84" stroke="white" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const MonadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
    <circle cx="64" cy="64" r="60" fill="#8B5CF6" />
    <text x="64" y="80" textAnchor="middle" fill="white" fontSize="48" fontWeight="bold">M</text>
  </svg>
);

const BaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 128 128" fill="none">
    <circle cx="64" cy="64" r="60" fill="#0052FF" />
    <circle cx="64" cy="64" r="32" fill="white" />
    <circle cx="64" cy="64" r="16" fill="#0052FF" />
  </svg>
);

const chainIcons: Record<Chain, React.ReactNode> = {
  solana: <SolanaIcon />,
  monad: <MonadIcon />,
  base: <BaseIcon />,
};

function App() {
  const [chain, setChain] = useState<Chain>('solana');
  const [address, setAddress] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const config = CHAIN_CONFIGS[chain];

  const fetchTransactions = async () => {
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      let txs: Transaction[];
      switch (chain) {
        case 'solana':
          txs = await fetchSolanaTransactions(address, 50);
          break;
        case 'base':
          txs = await fetchBaseTransactions(address, 50);
          break;
        case 'monad':
          txs = await fetchMonadTransactions(address, 50);
          break;
        default:
          txs = [];
      }
      setTransactions(txs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };

  const truncate = (str: string, len: number = 8) => {
    if (!str) return 'N/A';
    if (str.length <= len * 2) return str;
    return `${str.slice(0, len)}...${str.slice(-len)}`;
  };

  const downloadCSV = () => {
    if (transactions.length === 0) return;

    const headers = [
      'Date',
      'Type',
      'From',
      'To',
      `Value (${config.nativeSymbol})`,
      `Fee (${config.nativeSymbol})`,
      'Status',
      'Hash',
      'Block',
    ];

    const rows = transactions.map((tx) => [
      tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : '',
      tx.type,
      tx.from,
      tx.to,
      tx.value.toFixed(9),
      tx.fee.toFixed(9),
      tx.success ? 'Success' : 'Failed',
      tx.hash,
      tx.block.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${chain}-transactions-${address.slice(0, 8)}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleChainChange = (newChain: Chain) => {
    setChain(newChain);
    setAddress('');
    setTransactions([]);
    setError('');
    setSearched(false);
  };

  return (
    <>
      <div className="liquid-bg" />

      <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-green-400 bg-clip-text text-transparent">
            Thunderbolt Awaken
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            Multi-chain transaction explorer for Solana, Monad & Base
          </p>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto">
          {/* Chain selector */}
          <div className="flex chain-tabs justify-center gap-3 mb-8">
            {(['solana', 'monad', 'base'] as Chain[]).map((c) => (
              <button
                key={c}
                onClick={() => handleChainChange(c)}
                className={`chain-tab flex items-center gap-2 ${chain === c ? `active ${c}` : ''}`}
              >
                {chainIcons[c]}
                {CHAIN_CONFIGS[c].name}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 search-box">
              <input
                type="text"
                placeholder={`Enter ${config.name} wallet address...`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTransactions()}
                className="custom-input flex-1"
              />
              <button
                onClick={fetchTransactions}
                disabled={loading}
                className={`btn-primary ${chain}`}
              >
                {loading ? (
                  <>
                    <span className={`spinner !w-5 !h-5 !border-2 ${chain}`} />
                    Loading...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    View Transactions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-message mb-8">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Results */}
          {searched && !loading && !error && (
            <>
              {transactions.length > 0 ? (
                <>
                  {/* Stats and CSV download */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className={`stats-badge ${chain}`}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {transactions.length} transactions found
                    </div>
                    <button onClick={downloadCSV} className="btn-secondary">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download CSV
                    </button>
                  </div>

                  {/* Transaction table */}
                  <div className="tx-table-container">
                    <table className={`tx-table ${chain}`}>
                      <thead>
                        <tr>
                          <th>Hash</th>
                          <th>Date</th>
                          <th>Type</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Value ({config.nativeSymbol})</th>
                          <th>Fee ({config.nativeSymbol})</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <tr key={tx.hash}>
                            <td>
                              <a
                                href={`${config.explorerUrl}${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hash-link"
                                title={tx.hash}
                              >
                                {truncate(tx.hash)}
                              </a>
                            </td>
                            <td>{formatDate(tx.blockTime)}</td>
                            <td>{tx.type}</td>
                            <td>
                              <a
                                href={`${config.addressExplorerUrl}${tx.from}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hash-link"
                              >
                                {truncate(tx.from)}
                              </a>
                            </td>
                            <td>
                              {tx.to ? (
                                <a
                                  href={`${config.addressExplorerUrl}${tx.to}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hash-link"
                                >
                                  {truncate(tx.to)}
                                </a>
                              ) : (
                                <span className="text-[var(--text-muted)]">-</span>
                              )}
                            </td>
                            <td>{tx.value > 0 ? tx.value.toFixed(6) : '-'}</td>
                            <td>{tx.fee > 0 ? tx.fee.toFixed(6) : '-'}</td>
                            <td>
                              <span className={tx.success ? 'status-success' : 'status-error'}>
                                {tx.success ? 'Success' : 'Failed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="glass-card empty-state">
                  <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg">No transactions found for this address</p>
                </div>
              )}
            </>
          )}

          {/* Loading state */}
          {loading && (
            <div className="glass-card flex flex-col items-center justify-center py-16">
              <div className={`spinner ${chain} mb-4`} />
              <p className="text-[var(--text-secondary)]">Fetching transactions from {config.name}...</p>
            </div>
          )}

          {/* Initial state */}
          {!searched && !loading && (
            <div className="glass-card text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                {chainIcons[chain]}
              </div>
              <h2 className="text-2xl font-semibold mb-3">
                Enter a {config.name} Wallet Address
              </h2>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                View transaction history for any {config.name} wallet. Download as CSV for tax reporting or analysis.
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center py-12 mt-12 text-[var(--text-muted)] text-sm border-t border-[var(--border-color)]">
          <p>
            Open source on{' '}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              GitHub
            </a>
            {' '}- Built with React & Vite
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;
