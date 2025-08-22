'use client';

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { HistoricalPrice, getCoinHistoricalData } from '../lib/api/coingecko';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  symbol: string;
  assetPlatformId: string;
  contractAddress: string;
  coinId?: string;
  days?: number;
  className?: string;
}

export default function PriceChart({
  symbol,
  assetPlatformId,
  contractAddress,
  coinId,
  days = 30,
  className = ''
}: PriceChartProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalPrice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getCoinHistoricalData(assetPlatformId, contractAddress, coinId, days);
        
        if (!data || data.length === 0) {
          setError('No historical data available for this token');
        } else {
          setHistoricalData(data);
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError('Failed to load historical price data');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [assetPlatformId, contractAddress, coinId, days]);

  if (loading) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-300">Loading price chart...</span>
        </div>
      </div>
    );
  }

  if (error || !historicalData) {
    return (
      <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64 flex-col">
          <div className="text-gray-400 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium">Chart Unavailable</p>
            <p className="text-sm mt-2">{error || 'Historical price data not available'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: historicalData.map(point => {
      const date = new Date(point.timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: `${symbol.toUpperCase()} Price (USD)`,
        data: historicalData.map(point => point.price),
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)', // blue-500 with low opacity
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBorderColor: 'white',
        pointHoverBorderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)', // gray-400
          font: {
            size: 12,
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.95)', // gray-900 with opacity
        titleColor: 'rgb(243, 244, 246)', // gray-100
        bodyColor: 'rgb(209, 213, 219)', // gray-300
        borderColor: 'rgb(75, 85, 99)', // gray-600
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            const value = context.parsed.y;
            return `$${value.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: value < 1 ? 6 : 2
            })}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)', // gray-600 with opacity
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // gray-400
          font: {
            size: 11,
          },
          maxTicksLimit: 8,
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.3)', // gray-600 with opacity
          drawBorder: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)', // gray-400
          font: {
            size: 11,
          },
          callback: function(value: string | number) {
            const numValue = parseFloat(value.toString());
            return `$${numValue.toLocaleString('en-US', {
              minimumFractionDigits: 0,
              maximumFractionDigits: numValue < 1 ? 6 : 2,
              notation: numValue >= 1000000 ? 'compact' : 'standard'
            })}`;
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 6,
      }
    }
  };

  // Calculate price change
  const firstPrice = historicalData[0]?.price || 0;
  const lastPrice = historicalData[historicalData.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            {symbol.toUpperCase()} Price Chart
          </h3>
          <p className="text-sm text-gray-400">
            Last {days} days
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            ${lastPrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: lastPrice < 1 ? 6 : 2
            })}
          </div>
          <div className={`text-sm font-medium ${priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChangePercent >= 0 ? '+' : ''}
            {priceChangePercent.toFixed(2)}% ({days}d)
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
