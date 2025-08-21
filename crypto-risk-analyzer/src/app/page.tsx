"use client";

import { useState, FormEvent } from 'react';
import Results from '@/app/components/Results';
import { RiskReport } from '@/lib/risk-assessment'; // Import the type

export default function Home() {
  const [tokenInput, setTokenInput] = useState('');
  const [blockchain, setBlockchain] = useState('ethereum');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RiskReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsResolving(false);
    setResults(null);
    setError(null);

    let contractAddress = tokenInput;
    let chain = blockchain;
    let coinGeckoId: string | undefined = undefined;
    let moralisAddress: string | null = null;
    let mobulaAddress: string | null = null;

    try {
      // If the input doesn't look like an address, resolve it first
      if (!tokenInput.startsWith('0x')) {
        setIsResolving(true);
        const resolveResponse = await fetch(`/api/resolve-token?query=${encodeURIComponent(tokenInput)}`);
        const resolveData = await resolveResponse.json();

        if (!resolveResponse.ok) {
          throw new Error(resolveData.error || 'Could not find a token with that name.');
        }

        // Store the coinGeckoId and API-specific addresses
        coinGeckoId = resolveData.coinGeckoId;
        moralisAddress = resolveData.moralisAddress || null;
        mobulaAddress = resolveData.mobulaAddress || null;

        // Handle different token types
        if (resolveData.isNative) {
          contractAddress = 'native';
        } else if (resolveData.contractAddress) {
          contractAddress = resolveData.contractAddress;
        } else {
          throw new Error(`No contract address found for ${resolveData.name || tokenInput}. This token may not be available for risk assessment.`);
        }

        // Map blockchain names to our dropdown values
        const blockchainMapping: { [key: string]: string } = {
          'ethereum': 'ethereum',
          'binance-smart-chain': 'bsc',
          'polygon-pos': 'polygon',
          'polygon': 'polygon',
          'avalanche': 'avalanche',
          'bitcoin': 'bitcoin',
          'solana': 'solana',
        };

        chain = blockchainMapping[resolveData.blockchain] || resolveData.blockchain;
        
        // Update the dropdown to the resolved chain if it's supported
        if (['ethereum', 'bsc', 'polygon', 'avalanche'].includes(chain)) {
          setBlockchain(chain);
        }
        
        setIsResolving(false);
        
        console.log(`Resolved token: ${resolveData.name} (${resolveData.symbol}) on ${chain} with address: ${contractAddress}`);
      }

      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contractAddress, 
          blockchain: chain, 
          coinGeckoId: coinGeckoId,
          moralisAddress: moralisAddress,
          mobulaAddress: mobulaAddress
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred during analysis.');
      }

      const data: RiskReport = await response.json();
      setResults(data);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-blue-900/20"></div>
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 flex flex-col items-center py-10 px-4">
        {/* Header */}
        <header className="w-full max-w-7xl text-center mb-10">
          <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Crypto Risk Analyzer
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Advanced cryptocurrency risk assessment powered by multiple APIs and machine learning algorithms
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Live Market Data</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="w-full max-w-7xl">
          {/* Input Section */}
          <div className="mb-10">
            <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="tokenInput" className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
                      Token Name or Contract Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="tokenInput"
                        id="tokenInput"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="w-full bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        placeholder="e.g., 'Ethereum', 'PEPE', or '0x...'"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="blockchain" className="block text-sm font-semibold text-gray-200 uppercase tracking-wide">
                      Blockchain Network
                    </label>
                    <select
                      id="blockchain"
                      name="blockchain"
                      value={blockchain}
                      onChange={(e) => setBlockchain(e.target.value)}
                      className="w-full bg-black/50 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    >
                      <option value="ethereum">Ethereum</option>
                      <option value="bsc">Binance Smart Chain (BNB)</option>
                      <option value="polygon">Polygon (MATIC)</option>
                      <option value="avalanche">Avalanche (AVAX)</option>
                      <option value="arbitrum">Arbitrum</option>
                      <option value="optimism">Optimism</option>
                      <option value="fantom">Fantom (FTM)</option>
                      <option value="solana">Solana (SOL)</option>
                      <option value="cardano">Cardano (ADA)</option>
                      <option value="cosmos">Cosmos (ATOM)</option>
                      <option value="terra">Terra Classic (LUNC)</option>
                      <option value="cronos">Cronos (CRO)</option>
                      <option value="near">NEAR Protocol</option>
                      <option value="harmony">Harmony (ONE)</option>
                      <option value="moonbeam">Moonbeam (GLMR)</option>
                      <option value="kava">Kava</option>
                      <option value="celo">Celo</option>
                      <option value="aurora">Aurora (NEAR)</option>
                      <option value="gnosis">Gnosis Chain (xDAI)</option>
                      <option value="base">Base (Coinbase)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{isResolving ? 'Resolving Token...' : 'Analyzing Risk...'}</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Analyze Risk</span>
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center mb-10">
              <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 border-b-purple-500 rounded-full animate-spin" style={{animationDirection: 'reverse'}}></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {isResolving ? 'Resolving Token...' : 'Analyzing Risk...'}
                    </h3>
                    <p className="text-gray-400">
                      {isResolving 
                        ? 'Searching CoinGecko database...' 
                        : 'Fetching data from multiple APIs and calculating risk metrics...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-10">
              <div className="bg-red-900/30 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-red-200 font-semibold">Analysis Failed</h3>
                    <p className="text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {results && !isLoading && (
            <Results 
              report={results} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
