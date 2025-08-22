"use client";

import { useState, FormEvent, useCallback } from 'react';
import Results from '@/app/components/Results';
import { PortfolioDashboard } from '@/components/PortfolioDashboard';
import { RiskReport, RiskInput } from '@/lib/risk-assessment';

type TabType = 'analyzer' | 'portfolio';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('analyzer');
  const [tokenInput, setTokenInput] = useState('');
  const [blockchain, setBlockchain] = useState('ethereum');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<RiskReport | null>(null);
  const [currentInput, setCurrentInput] = useState<RiskInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const handleSubmit = useCallback(async (e: FormEvent) => {
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
      // Check if input looks like a contract address
      const isEthereumAddress = /^0x[a-fA-F0-9]{40}$/.test(tokenInput);
      const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(tokenInput);
      
      // If the input doesn't look like an address, resolve it first
      if (!isEthereumAddress && !isSolanaAddress) {
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
          'arbitrum-one': 'arbitrum',
          'optimistic-ethereum': 'optimism',
          'fantom': 'fantom',
          'solana': 'solana',
          'bitcoin': 'bitcoin',
        };

        chain = blockchainMapping[resolveData.blockchain] || resolveData.blockchain;
        
        // Update the dropdown to the resolved chain if it's supported
        if (['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'avalanche', 'fantom', 'solana'].includes(chain)) {
          setBlockchain(chain);
        }
        if (['ethereum', 'bsc', 'polygon', 'avalanche'].includes(chain)) {
          setBlockchain(chain);
        }
        
        setIsResolving(false);
        
        console.log(`Resolved token: ${resolveData.name} (${resolveData.symbol}) on ${chain} with address: ${contractAddress}`);
      } else {
        // Handle direct contract address input
        if (isEthereumAddress) {
          contractAddress = tokenInput;
          chain = 'ethereum'; // Default to Ethereum for 0x addresses
          // Update blockchain dropdown if it's different
          if (blockchain !== 'ethereum') {
            setBlockchain('ethereum');
          }
        } else if (isSolanaAddress) {
          contractAddress = tokenInput;
          chain = 'solana'; // Set to Solana for Solana addresses
          // Update blockchain dropdown if it's different
          if (blockchain !== 'solana') {
            setBlockchain('solana');
          }
        }
        
        console.log(`Direct contract address: ${contractAddress} on ${chain}`);
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
      
      // Store the current input data for the chart
      const inputData: RiskInput = {
        contractAddress, 
        blockchain: chain, 
        coinGeckoId: coinGeckoId,
        moralisAddress: moralisAddress,
        mobulaAddress: mobulaAddress
      };
      setCurrentInput(inputData);
      setResults(data);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsResolving(false);
    }
  }, [tokenInput, blockchain]);

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
              Advanced cryptocurrency risk assessment and portfolio analysis
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Live Market Data</span>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="w-full max-w-7xl mb-8">
          <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('analyzer')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'analyzer'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Token Analyzer
                </div>
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'portfolio'
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                  Portfolio Dashboard
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="w-full max-w-7xl">
          {activeTab === 'analyzer' ? (
            <>
              {/* Token Analyzer Content */}
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
                            placeholder="e.g., 'Bitcoin', 'PEPE', or '0x...'"
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
                          <option value="bsc">Binance Smart Chain</option>
                          <option value="polygon">Polygon</option>
                          <option value="arbitrum">Arbitrum</option>
                          <option value="optimism">Optimism</option>
                          <option value="avalanche">Avalanche</option>
                          <option value="fantom">Fantom</option>
                          <option value="solana">Solana</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !tokenInput.trim()}
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

                  {error && (
                    <div className="mt-6 p-4 bg-red-900/30 backdrop-blur-xl border border-red-500/30 rounded-xl shadow-2xl">
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
                  )}
                </div>
              </div>

              {results && (
                <Results report={results} input={currentInput || undefined} />
              )}
            </>
          ) : (
            <>
              {/* Portfolio Dashboard Content */}
              <PortfolioDashboard />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
