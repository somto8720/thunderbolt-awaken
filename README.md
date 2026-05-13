# Thunderbolt Awaken

Verified by Xen Agentic Payroll

**Live Demo**: [https://tx-ledger-sigma.vercel.app](https://tx-ledger-sigma.vercel.app)

A modern, open-source multi-chain transaction explorer supporting **Solana**, **Monad**, and **Base** blockchains.

![Solana](https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white)
![Monad](https://img.shields.io/badge/Monad-8B5CF6?style=for-the-badge)
![Base](https://img.shields.io/badge/Base-0052FF?style=for-the-badge)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)

## Features

- **Multi-Chain Support** - Switch between Solana, Monad, and Base
- **Transaction Table** - View hash, date, type, addresses, values, fees, and status
- **CSV Export** - Download transactions in CSV format for tax reporting
- **Block Explorer Links** - Click any hash or address to view on the respective explorer
- **Modern UI** - Beautiful dark theme with liquid background effects
- **Fast** - Built with Vite for lightning-fast development and builds

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/somto8720/thunderbolt-awaken.git
cd thunderbolt-awaken

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Supported Chains

| Chain | Network | Explorer |
|-------|---------|----------|
| Solana | Mainnet | [Solscan](https://solscan.io) |
| Monad | Testnet | [Monad Explorer](https://testnet.monadexplorer.com) |
| Base | Mainnet | [Basescan](https://basescan.org) |

## CSV Export Format

The exported CSV includes these columns:

| Column | Description |
|--------|-------------|
| Date | ISO 8601 timestamp |
| Type | Transaction type |
| From | Sender address |
| To | Recipient address |
| Value | Amount in native token |
| Fee | Transaction fee |
| Status | Success or Failed |
| Hash | Transaction hash/signature |
| Block | Block number/slot |

## Tech Stack

- **Framework**: Vite + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **APIs**: Solana RPC, Basescan API, Monad RPC

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
