"use client";

import React, { useState } from 'react';
import { RiskReport, RiskInput } from '@/lib/risk-assessment';
import { OptimizedImage } from './OptimizedImage';
import PriceChart from '../../components/PriceChart';

interface ResultsProps {
  report: RiskReport;
  input?: RiskInput;
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

export default React.memo(function Results({ report, input }: ResultsProps) {
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
                <OptimizedImage
                  src={report.tokenMetadata.image} 
                  alt={report.tokenMetadata.name || 'Token'} 
                  className="w-16 h-16 rounded-full border-2 border-white/20 object-cover"
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
              <h3 className="text-lg font-semibold text-white">Holder Analysis</h3>
              <p className="text-sm text-gray-400">Distribution & concentration</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Holders</span>
              <span className="text-white font-semibold">
                {report.holderData?.totalHolders ? report.holderData.totalHolders.toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Top 10 Holdings</span>
              <span className="text-white font-semibold">
                {report.holderData?.top10Percentage ? `${report.holderData.top10Percentage}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Concentration Risk</span>
              <span className={`font-semibold ${
                !report.holderData?.top10Percentage ? 'text-gray-400' :
                report.holderData.top10Percentage > 70 ? 'text-red-400' :
                report.holderData.top10Percentage > 50 ? 'text-orange-400' :
                report.holderData.top10Percentage > 30 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {!report.holderData?.top10Percentage ? 'N/A' :
                 report.holderData.top10Percentage > 70 ? 'Very High' :
                 report.holderData.top10Percentage > 50 ? 'High' :
                 report.holderData.top10Percentage > 30 ? 'Medium' :
                 'Low'}
              </span>
            </div>
          </div>
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

      {/* Price Chart Section */}
      {report.tokenMetadata && input && (
        <PriceChart
          symbol={report.tokenMetadata.symbol || 'Unknown'}
          assetPlatformId={input.blockchain}
          contractAddress={input.contractAddress}
          coinId={input.coinGeckoId}
          days={30}
          className="w-full"
        />
      )}

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
});
