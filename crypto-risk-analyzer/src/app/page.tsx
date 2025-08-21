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

    try {
      // If the input doesn't look like an address, resolve it first
      if (!tokenInput.startsWith('0x')) {
        setIsResolving(true);
        const resolveResponse = await fetch(`/api/resolve-token?query=${encodeURIComponent(tokenInput)}`);
        const resolveData = await resolveResponse.json();

        if (!resolveResponse.ok) {
          throw new Error(resolveData.error || 'Could not find a token with that name.');
        }

        contractAddress = resolveData.contractAddress;
        chain = resolveData.blockchain;
        // Update the dropdown to the resolved chain
        setBlockchain(chain);
        setIsResolving(false);
      }

      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress, blockchain: chain }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred during analysis.');
      }

      const data: RiskReport = await response.json();
      setResults(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-10">
      <header className="w-full max-w-4xl text-center mb-10">
        <h1 className="text-5xl font-bold text-white mb-2">
          Crypto Risk Assessment
        </h1>
        <p className="text-lg text-gray-400">
          Analyze the risk of any cryptocurrency token.
        </p>
      </header>

      <main className="w-full max-w-2xl px-4 pb-10">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="tokenInput" className="block text-sm font-medium text-gray-300">
                Token Name or Contract Address
              </label>
              <input
                type="text"
                name="tokenInput"
                id="tokenInput"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-3"
                placeholder="e.g., 'Chainlink' or '0x...'"
                required
              />
            </div>

            <div>
              <label htmlFor="blockchain" className="block text-sm font-medium text-gray-300">
                Blockchain
              </label>
              <select
                id="blockchain"
                name="blockchain"
                value={blockchain}
                onChange={(e) => setBlockchain(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10 px-3"
              >
                <option value="ethereum">Ethereum</option>
                <option value="bsc">Binance Smart Chain</option>
                <option value="polygon">Polygon</option>
                <option value="avalanche">Avalanche</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
        </div>

        {isLoading && (
          <div className="text-center mt-10 flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-white mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg">
              {isResolving ? 'Resolving token...' : 'Analyzing... This may take a moment.'}
            </p>
          </div>
        )}

        {error && (
            <div className="mt-10 w-full max-w-2xl bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg">
                <p className="font-bold text-center">Error</p>
                <p className="text-center">{error}</p>
            </div>
        )}

        {results && !isLoading && <Results report={results} />}
      </main>
    </div>
  );
}
