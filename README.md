# 🚀 Crypto Risk Assessment Tool

A comprehensive cryptocurrency risk analysis platform built with Next.js 15, featuring advanced portfolio management, real-time market data, and AI-powered risk assessment algorithms.

## ✨ Features

### 🔍 **Token Risk Analysis**
- **Multi-blockchain Support**: Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Fantom, Solana
- **Comprehensive Risk Scoring**: 100-point risk assessment system
- **Real-time Market Data**: Live pricing, volume, and market cap data
- **Holder Analysis**: Token distribution and concentration risk metrics
- **Smart Contract Verification**: Automated security checks

### 📊 **Portfolio Management**
- **Wallet Integration**: Connect MetaMask and other Web3 wallets
- **Multi-chain Portfolio**: Track assets across multiple blockchains
- **Portfolio Analytics**: Advanced risk analysis and diversification metrics
- **Performance Tracking**: Real-time portfolio value and performance metrics
- **Risk Recommendations**: AI-powered portfolio optimization suggestions

### 📈 **Advanced Analytics**
- **Historical Price Charts**: 30-day price history with interactive Chart.js visualizations
- **Risk Factor Breakdown**: Detailed analysis of liquidity, volatility, and holder concentration
- **Market Sentiment**: Integration with multiple data sources for comprehensive analysis
- **Real-time Updates**: Live data refresh with caching for optimal performance

### 🎨 **Modern UI/UX**
- **Dark Theme**: Modern glass morphism design with gradient effects
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Interactive Components**: Smooth animations and transitions
- **Accessibility**: WCAG compliant design patterns

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **Charts**: Chart.js + react-chartjs-2
- **Web3**: MetaMask integration with ethereum object detection
- **APIs**: CoinGecko, Moralis, Mobula APIs
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint with custom configuration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MetaMask or compatible Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lvingsarcophagus/Crypto-Risk-Assesment-Tool.git
   cd crypto-risk-analyzer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   COINGECKO_API_KEY=your_coingecko_api_key
   MORALIS_API_KEY=your_moralis_api_key
   MOBULA_API_KEY=your_mobula_api_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
crypto-risk-analyzer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── assess/        # Risk assessment endpoint
│   │   │   ├── portfolio/     # Portfolio management APIs
│   │   │   └── resolve-token/ # Token resolution service
│   │   ├── components/        # React components
│   │   │   └── Results.tsx    # Risk analysis results display
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main application page
│   ├── components/            # Reusable components
│   │   ├── PortfolioDashboard.tsx
│   │   ├── PriceChart.tsx     # Historical price charts
│   │   └── OptimizedImage.tsx
│   ├── hooks/                 # Custom React hooks
│   │   └── useWalletConnection.ts
│   └── lib/                   # Utility libraries
│       ├── api/               # API integrations
│       │   ├── coingecko.ts   # CoinGecko API client
│       │   ├── moralis.ts     # Moralis API client
│       │   └── mobula.ts      # Mobula API client
│       ├── cache.ts           # API response caching
│       ├── risk-assessment.ts # Risk calculation algorithms
│       └── token-resolver.ts  # Token resolution logic
├── public/                    # Static assets
├── jest.config.js            # Jest testing configuration
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔧 API Endpoints

### Risk Assessment
- `POST /api/assess` - Analyze token risk
  ```json
  {
    "contractAddress": "0x...",
    "blockchain": "ethereum",
    "coinGeckoId": "optional"
  }
  ```

### Portfolio Management
- `POST /api/portfolio/tokens` - Fetch wallet tokens
- `POST /api/portfolio/analyze` - Analyze portfolio risk

### Token Resolution
- `GET /api/resolve-token?query=tokenName` - Resolve token by name/symbol

## 🎯 Usage Examples

### Analyze a Token
1. Enter a token contract address or search by name
2. Select the blockchain network
3. Click "Analyze Risk" to get comprehensive assessment
4. View detailed metrics, charts, and recommendations

### Connect Wallet
1. Click "Connect Wallet" in the Portfolio tab
2. Approve MetaMask connection
3. View your multi-chain portfolio automatically
4. Get personalized risk analysis and recommendations

### View Price History
- Historical price charts appear automatically after token analysis
- Interactive tooltips show exact prices and dates
- 30-day price trend with percentage change indicators

## 🧪 Testing

Run the test suite:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

## 🏗️ Building for Production

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start the production server**
   ```bash
   pnpm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CoinGecko](https://coingecko.com) for market data API
- [Moralis](https://moralis.io) for Web3 infrastructure
- [Chart.js](https://chartjs.org) for interactive charts
- [Tailwind CSS](https://tailwindcss.com) for styling framework

## 📞 Support

For support, email [your-email@example.com](mailto:your-email@example.com) or open an issue on GitHub.

---

**Built with ❤️ for the crypto community**
