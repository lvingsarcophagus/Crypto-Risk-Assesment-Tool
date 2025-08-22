"use client";

import React, { useState } from 'react';
import { RiskReport } from '@/lib/risk-assessment';

interface ResultsProps {
  report: RiskReport;
}

const getRiskColor = (level: RiskReport['riskLevel']) => {
  switch (level) {
    case 'LOW':
      return 'text-green-400 border-green-400/30';
    case 'MEDIUM':
      return 'text-yellow-400 border-yellow-400/30';
    case 'HIGH':
      return 'text-orange-400 border-orange-400/30';
    case 'CRITICAL':
      return 'text-red-400 border-red-400/30';
    default:
      return 'text-gray-400 border-gray-400/30';
  }
};

const getRiskBgGradient = (level: RiskReport['riskLevel']) => {
  switch (level) {
    case 'LOW':
      return 'from-green-900/20 to-green-800/10';
    case 'MEDIUM':
      return 'from-yellow-900/20 to-yellow-800/10';
    case 'HIGH':
      return 'from-orange-900/20 to-orange-800/10';
    case 'CRITICAL':
      return 'from-red-900/20 to-red-800/10';
    default:
      return 'from-gray-900/20 to-gray-800/10';
  }
};

const getRiskSummary = (level: RiskReport['riskLevel']) => {
  switch (level) {
    case 'LOW':
      return 'Relatively safer investment with solid fundamentals.';
    case 'MEDIUM':
      return 'Moderate caution required. Some risk factors are present.';
    case 'HIGH':
      return 'Significant risk factors present. High caution is advised.';
    case 'CRITICAL':
      return 'Extreme caution required. Potential for total loss.';
    default:
      return 'Risk level could not be determined.';
  }
};

const JsonViewer = ({ data, title }: { data: unknown; title: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left font-medium text-gray-200 hover:bg-white/5 transition-colors flex items-center justify-between"
      >
        <span>{title}</span>
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="border-t border-white/10">
          <pre className="p-4 text-xs text-gray-300 overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default function Results({ report }: ResultsProps) {
  const riskColor = getRiskColor(report.riskLevel);
  const riskBgGradient = getRiskBgGradient(report.riskLevel);
  const riskSummary = getRiskSummary(report.riskLevel);

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Token Information Header */}
      {report.tokenMetadata && (
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center space-x-4">
            {report.tokenMetadata.image && (
              <div className="flex-shrink-0">
                <img 
                  src={report.tokenMetadata.image} 
                  alt={report.tokenMetadata.name || 'Token'} 
                  className="w-16 h-16 rounded-full border-2 border-white/20"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-grow">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white">
                  {report.tokenMetadata.name || 'Unknown Token'}
                </h1>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {report.tokenMetadata.symbol || 'N/A'}
                </span>
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {report.tokenMetadata.blockchain || 'Unknown'}
                </span>
              </div>
              {report.tokenMetadata.description && (
                <p className="text-gray-400 mt-2 text-sm line-clamp-2">
                  {report.tokenMetadata.description.length > 150 
                    ? `${report.tokenMetadata.description.substring(0, 150)}...` 
                    : report.tokenMetadata.description}
                </p>
              )}
              {report.tokenMetadata.homepage && (
                <a 
                  href={report.tokenMetadata.homepage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-block"
                >
                  Official Website →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Risk Assessment Card */}
      <div className={`bg-gradient-to-br ${riskBgGradient} backdrop-blur-xl border ${riskColor.split(' ')[1]} rounded-3xl p-8 shadow-2xl`}>
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Risk Analysis Complete</h2>
          <div className="flex items-center justify-center space-x-4">
            <div className={`text-7xl font-bold ${riskColor.split(' ')[0]}`}>
              {report.totalScore}
            </div>
            <div className="text-left">
              <div className={`text-3xl font-bold ${riskColor.split(' ')[0]}`}>
                {report.riskLevel}
              </div>
              <div className="text-xl text-gray-300">RISK LEVEL</div>
            </div>
          </div>
          <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">{riskSummary}</p>
        </div>

        {/* Risk Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Risk Score</span>
            <span>{report.totalScore}/100</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-3">
            <div 
              className={`h-3 rounded-full bg-gradient-to-r ${
                report.totalScore <= 25 ? 'from-green-500 to-green-400' :
                report.totalScore <= 50 ? 'from-yellow-500 to-yellow-400' :
                report.totalScore <= 75 ? 'from-orange-500 to-orange-400' :
                'from-red-500 to-red-400'
              }`}
              style={{ width: `${report.totalScore}%` }}
            ></div>
          </div>
        </div>

        {/* Risk Factors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.factors.map((factor) => (
            <div key={factor.name} className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white text-sm">{factor.name}</h4>
                <span className={`text-lg font-bold ${
                  factor.score <= 25 ? 'text-green-400' :
                  factor.score <= 50 ? 'text-yellow-400' :
                  factor.score <= 75 ? 'text-orange-400' :
                  'text-red-400'
                }`}>
                  {factor.score}
                </span>
              </div>
              {factor.details && (
                <p className="text-xs text-gray-400">{factor.details}</p>
              )}
              <div className="mt-2">
                <div className="w-full bg-black/30 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${
                      factor.score <= 25 ? 'bg-green-400' :
                      factor.score <= 50 ? 'bg-yellow-400' :
                      factor.score <= 75 ? 'bg-orange-400' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Data Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Information */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Market Data</h3>
              <p className="text-sm text-gray-400">Current pricing & volume</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Price</span>
              <span className="text-white font-semibold">
                {report.marketData?.price ? `$${report.marketData.price.toLocaleString()}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">24h Volume</span>
              <span className="text-white font-semibold">
                {report.marketData?.volume24h ? `$${report.marketData.volume24h.toLocaleString()}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Market Cap</span>
              <span className="text-white font-semibold">
                {report.marketData?.marketCap ? `$${report.marketData.marketCap.toLocaleString()}` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Holder Analysis */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Top Token Holders ({report.holderAnalysis?.topHolders?.length || 0} analyzed)
              </h3>
              <p className="text-sm text-gray-400">Distribution & concentration analysis</p>
            </div>
          </div>
          
          {/* Enhanced Holder Distribution Summary */}
          {report.holderAnalysis?.topHolders && report.holderAnalysis.topHolders.length > 0 ? (
            <>
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Top Holder</div>
                  <div className="text-lg font-bold text-white">
                    {report.holderAnalysis.topHolders[0]?.percentage_relative_to_total_supply 
                      ? `${(report.holderAnalysis.topHolders[0].percentage_relative_to_total_supply * 100).toFixed(2)}%`
                      : 'N/A'}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Top 5 Combined</div>
                  <div className="text-lg font-bold text-white">
                    {report.holderAnalysis.topHolders.slice(0, 5).reduce((acc: number, holder: any) => 
                      acc + ((holder.percentage_relative_to_total_supply || 0) * 100), 0
                    ).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Distribution</div>
                  <div className="text-lg font-bold text-white">
                    {report.holderAnalysis.topHolders.slice(0, 5).reduce((acc: number, holder: any) => 
                      acc + ((holder.percentage_relative_to_total_supply || 0) * 100), 0
                    ) > 50 ? 'Concentrated' : 'Distributed'}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Total Holders</div>
                  <div className="text-lg font-bold text-white">
                    {report.holderAnalysis.totalHolders?.toLocaleString() || 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {report.holderAnalysis.topHolders.slice(0, 15).map((holder: any, index: number) => {
                  const percentage = holder.percentage_relative_to_total_supply 
                    ? holder.percentage_relative_to_total_supply * 100 
                    : 0;
                  const isWhale = percentage > 5;
                  const isLarge = percentage > 1;
                  
                  return (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-xl transition-all hover:bg-white/10 ${
                      isWhale ? 'bg-red-500/10 border border-red-500/20' : 
                      isLarge ? 'bg-yellow-500/10 border border-yellow-500/20' : 
                      'bg-white/5 border border-white/10'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          isWhale ? 'bg-red-500/20 text-red-300' : 
                          isLarge ? 'bg-yellow-500/20 text-yellow-300' : 
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-sm text-gray-300 font-mono">
                            {holder.owner_address?.slice(0, 12)}...{holder.owner_address?.slice(-8)}
                          </div>
                          {holder.owner_address_label && (
                            <div className="text-xs text-blue-400 mt-1">
                              {holder.owner_address_label}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-white">
                          {holder.balance_formatted ? 
                            holder.balance_formatted.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2
                            }) : '0'} tokens
                        </div>
                        <div className={`text-sm font-medium ${
                          isWhale ? 'text-red-400' : isLarge ? 'text-yellow-400' : 'text-gray-400'
                        }`}>
                          {percentage.toFixed(3)}% of supply
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <div className="text-2xl mb-2">📊</div>
              <div>No detailed holder data available for this token</div>
              <div className="text-sm mt-2">
                {report.holderData?.totalHolders ? 
                  `Total estimated holders: ${report.holderData.totalHolders.toLocaleString()}` : 
                  'Using basic holder metrics'
                }
              </div>
            </div>
          )}
        </div>

        {/* Additional Metrics */}
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Technical Metrics</h3>
              <p className="text-sm text-gray-400">Advanced indicators</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Risk Score</span>
              <span className={`font-semibold ${riskColor.split(' ')[0]}`}>
                {report.totalScore}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Analysis Date</span>
              <span className="text-white font-semibold">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Data Sources</span>
              <span className="text-white font-semibold">
                {report.dataSources?.length || 'Multiple'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw API Data Section */}
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white">Raw API Data</h3>
            <p className="text-gray-400">Complete response data from all sources</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {report.marketData && (
            <JsonViewer data={report.marketData} title="Market Data (CoinGecko/Mobula)" />
          )}
          {report.holderData && (
            <JsonViewer data={report.holderData} title="Holder Analysis (Moralis)" />
          )}
          {report.factors && (
            <JsonViewer data={report.factors} title="Risk Factor Calculations" />
          )}
          <JsonViewer data={report} title="Complete Risk Assessment Report" />
        </div>
      </div>
    </div>
  );
}
