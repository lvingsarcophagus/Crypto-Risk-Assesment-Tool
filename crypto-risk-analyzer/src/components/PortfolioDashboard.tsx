import React, { useState, useEffect } from 'react';
import { useWalletConnection } from '@/hooks/useWalletConnection';

interface PortfolioRiskAnalysis {
  totalRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  diversificationScore: number;
  concentrationRisk: number;
  totalValue: number;
  tokenCount: number;
  topHoldings: Array<{
    symbol: string;
    percentage: number;
    riskScore: number;
    riskLevel: string;
  }>;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recommendations: string[];
}

export const PortfolioDashboard: React.FC = () => {
  const { wallet, tokens, isLoadingTokens, connectWallet, disconnectWallet } = useWalletConnection();
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioRiskAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const analyzePortfolio = async () => {
    if (!wallet || !tokens.length) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/portfolio/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokens,
          chainId: wallet.chainId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze portfolio');
      }

      const analysis = await response.json();
      setPortfolioAnalysis(analysis);
    } catch (error) {
      console.error('Portfolio analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (wallet && tokens.length > 0) {
      analyzePortfolio();
    }
  }, [wallet, tokens]);

  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'LOW': return 'text-green-400 bg-green-400/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/20';
      case 'HIGH': return 'text-orange-400 bg-orange-400/20';
      case 'CRITICAL': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!wallet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Portfolio Risk Analysis</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to analyze your cryptocurrency portfolio risk and get personalized recommendations.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => connectWallet('metamask')}
              className="w-full max-w-sm mx-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <img src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" alt="MetaMask" className="w-6 h-6" />
              Connect MetaMask
            </button>
            
            <div className="text-sm text-gray-500">
              Supported networks: Ethereum, BSC, Polygon, Arbitrum, Optimism, Avalanche, Fantom
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="text-blue-400 text-lg mb-2">🔒</div>
              <div className="font-medium text-white">Secure</div>
              <div>Read-only access to your wallet</div>
            </div>
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="text-green-400 text-lg mb-2">📊</div>
              <div className="font-medium text-white">Comprehensive</div>
              <div>Full portfolio risk analysis</div>
            </div>
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <div className="text-purple-400 text-lg mb-2">💡</div>
              <div className="font-medium text-white">Actionable</div>
              <div>Personalized recommendations</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Portfolio Dashboard</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </div>
              <div>Chain ID: {wallet.chainId}</div>
              <div>{tokens.length} tokens</div>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {isLoadingTokens ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-400">Loading your portfolio...</div>
        </div>
      ) : tokens.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center">
          <div className="text-gray-400 mb-4">No tokens found in your wallet on this network.</div>
          <div className="text-sm text-gray-500">Try switching to a different network or add some tokens to your wallet.</div>
        </div>
      ) : (
        <>
          {/* Portfolio Overview */}
          {portfolioAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <div className="text-sm text-gray-400 mb-2">Total Value</div>
                <div className="text-2xl font-bold text-white">
                  ${portfolioAnalysis.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <div className="text-sm text-gray-400 mb-2">Risk Level</div>
                <div className={`text-xl font-bold px-3 py-1 rounded-lg inline-block ${getRiskColor(portfolioAnalysis.riskLevel)}`}>
                  {portfolioAnalysis.riskLevel}
                </div>
                <div className="text-sm text-gray-400 mt-1">Score: {portfolioAnalysis.totalRiskScore}/100</div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <div className="text-sm text-gray-400 mb-2">Diversification</div>
                <div className={`text-2xl font-bold ${getScoreColor(portfolioAnalysis.diversificationScore)}`}>
                  {portfolioAnalysis.diversificationScore}/100
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <div className="text-sm text-gray-400 mb-2">Concentration Risk</div>
                <div className={`text-2xl font-bold ${getScoreColor(100 - portfolioAnalysis.concentrationRisk)}`}>
                  {portfolioAnalysis.concentrationRisk.toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* Risk Analysis */}
          {isAnalyzing ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
              <div className="text-gray-400">Analyzing portfolio risk...</div>
              <div className="text-sm text-gray-500 mt-2">This may take a few moments</div>
            </div>
          ) : portfolioAnalysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Holdings */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Top Holdings</h3>
                <div className="space-y-3">
                  {portfolioAnalysis.topHoldings.slice(0, 8).map((holding, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-lg font-medium text-white">{holding.symbol}</div>
                        <div className={`px-2 py-1 rounded text-xs ${getRiskColor(holding.riskLevel)}`}>
                          {holding.riskLevel}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{holding.percentage.toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">Risk: {holding.riskScore}/100</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Distribution */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-4">Risk Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400">Low Risk</span>
                    <span className="text-white font-medium">{portfolioAnalysis.riskDistribution.low}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${portfolioAnalysis.riskDistribution.low}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400">Medium Risk</span>
                    <span className="text-white font-medium">{portfolioAnalysis.riskDistribution.medium}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${portfolioAnalysis.riskDistribution.medium}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-orange-400">High Risk</span>
                    <span className="text-white font-medium">{portfolioAnalysis.riskDistribution.high}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-400 h-2 rounded-full" 
                      style={{ width: `${portfolioAnalysis.riskDistribution.high}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-red-400">Critical Risk</span>
                    <span className="text-white font-medium">{portfolioAnalysis.riskDistribution.critical}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-400 h-2 rounded-full" 
                      style={{ width: `${portfolioAnalysis.riskDistribution.critical}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Recommendations */}
          {portfolioAnalysis?.recommendations && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">Recommendations</h3>
              <div className="space-y-3">
                {portfolioAnalysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-blue-400 mt-0.5">💡</div>
                    <div className="text-gray-300">{recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio Tokens */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold text-white mb-4">Your Tokens ({tokens.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.map((token, index) => (
                <div key={index} className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    {token.logo && (
                      <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                    )}
                    <div>
                      <div className="text-white font-medium">{token.symbol}</div>
                      <div className="text-xs text-gray-400">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">{token.balanceFormatted.toFixed(4)}</div>
                    {token.usd_value && (
                      <div className="text-sm text-gray-400">${token.usd_value.toFixed(2)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="text-center">
            <button
              onClick={analyzePortfolio}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
