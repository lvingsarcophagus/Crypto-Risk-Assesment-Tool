const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Import cache for performance optimization
import { apiCache } from '../cache';

export interface HistoricalPrice {
  timestamp: number;
  price: number;
}

export interface CoinGeckoHistoricalData {
  prices: [number, number][]; // [timestamp, price]
}

export interface CoinGeckoData {
  id: string;
  name: string;
  symbol: string;
  image?: {
    thumb: string;
    small: string;
    large: string;
  };
  description?: {
    en: string;
  };
  links?: {
    homepage: string[];
    repos_url: {
      github: string[];
    };
    subreddit_url: string;
  };
  market_cap_rank: number;
  developer_data?: {
    stars: number;
  };
  community_data?: {
    reddit_subscribers: number;
  };
  market_data?: {
    current_price?: { [currency: string]: number };
    price_change_percentage_24h: number;
    ath_change_percentage: { [currency: string]: number };
    market_cap: { [currency: string]: number };
    total_supply: number;
    max_supply: number | null;
    circulating_supply: number;
    fully_diluted_valuation: { [currency: string]: number };
    total_volume: { [currency: string]: number };
    price_change_percentage_7d: number;
  };
}

/**
 * Fetches detailed coin data from CoinGecko using a contract address or coin ID for native tokens.
 * @param assetPlatformId The ID of the platform (e.g., 'ethereum', 'binance-smart-chain').
 * @param contractAddress The token's contract address or 'native' for native tokens.
 * @param coinId Optional: The CoinGecko coin ID for native tokens.
 * @returns The coin data from the CoinGecko API.
 */
export async function getCoinDataFromCoinGecko(
  assetPlatformId: string,
  contractAddress: string,
  coinId?: string
): Promise<CoinGeckoData | null> {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    throw new Error('CoinGecko API key is not configured in .env.local');
  }

  let url: string;
  
  // Handle native tokens using coin ID
  if (contractAddress === 'native' && coinId) {
    url = `${COINGECKO_API_URL}/coins/${coinId}`;
  } else if (contractAddress === 'native') {
    // Map blockchain to coin ID for native tokens
    const nativeTokenIds: { [key: string]: string } = {
      'ethereum': 'ethereum',
      'bsc': 'binancecoin',
      'binance-smart-chain': 'binancecoin', 
      'polygon': 'matic-network',
      'avalanche': 'avalanche-2',
      'bitcoin': 'bitcoin',
      'solana': 'solana',
      'arbitrum': 'ethereum', // Arbitrum uses ETH as native token
      'optimism': 'ethereum', // Optimism uses ETH as native token
      'fantom': 'fantom',
      'cardano': 'cardano',
      'cosmos': 'cosmos',
      'terra': 'terra-luna-2',
      'cronos': 'crypto-com-chain',
      'near': 'near',
      'harmony': 'harmony',
      'moonbeam': 'moonbeam',
      'kava': 'kava',
      'celo': 'celo',
      'aurora': 'ethereum', // Aurora uses ETH as native token
      'gnosis': 'gnosis',
      'base': 'ethereum' // Base uses ETH as native token
    };
    
    const nativeCoinId = nativeTokenIds[assetPlatformId];
    if (!nativeCoinId) {
      throw new Error(`Native token not supported for blockchain: ${assetPlatformId}`);
    }
    
    url = `${COINGECKO_API_URL}/coins/${nativeCoinId}`;
  } else {
    // Handle ERC-20 and other contract-based tokens
    url = `${COINGECKO_API_URL}/coins/${assetPlatformId}/contract/${contractAddress}`;
  }

  // Create cache key from URL
  const cacheKey = `coingecko:${url}`;
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey) as CoinGeckoData | null;
  if (cachedData) {
    console.log('Returning cached CoinGecko data');
    return cachedData;
  }

  try {
    console.log(`Fetching CoinGecko data from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': apiKey,
      },
    });

    if (!response.ok) {
      // It's helpful to log the error response body for debugging
      const errorBody = await response.text();
      
      // If it's a 404, the coin is not found on CoinGecko
      if (response.status === 404) {
        console.log(`Coin not found on CoinGecko: ${url}`);
        // Return null instead of throwing error so risk assessment can continue with partial data
        return null;
      }
      
      throw new Error(`CoinGecko API request failed with status ${response.status}: ${errorBody}`);
    }

    const data: CoinGeckoData = await response.json();
    
    // Cache the successful response
    apiCache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Error fetching data from CoinGecko:', error);
    // Re-throwing the error to be handled by the caller
    throw error;
  }
}

/**
 * Fetches historical price data from CoinGecko API for a specific coin.
 * @param assetPlatformId The blockchain platform (e.g., 'ethereum', 'bsc').
 * @param contractAddress The contract address of the token or 'native' for native tokens.
 * @param coinId Optional coin ID for native tokens.
 * @param days Number of days of historical data to fetch (default: 30).
 * @returns Array of historical price data points.
 */
export async function getCoinHistoricalData(
  assetPlatformId: string,
  contractAddress: string,
  coinId?: string,
  days: number = 30
): Promise<HistoricalPrice[] | null> {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    throw new Error('CoinGecko API key is not configured in .env.local');
  }

  let coinIdToUse: string;
  
  // Handle native tokens using coin ID
  if (contractAddress === 'native' && coinId) {
    coinIdToUse = coinId;
  } else if (contractAddress === 'native') {
    // Map blockchain to coin ID for native tokens
    const nativeTokenIds: { [key: string]: string } = {
      'ethereum': 'ethereum',
      'bsc': 'binancecoin',
      'binance-smart-chain': 'binancecoin', 
      'polygon': 'matic-network',
      'avalanche': 'avalanche-2',
      'bitcoin': 'bitcoin',
      'solana': 'solana',
      'arbitrum': 'ethereum',
      'optimism': 'ethereum',
      'fantom': 'fantom',
      'cardano': 'cardano',
      'cosmos': 'cosmos',
      'terra': 'terra-luna-2',
      'cronos': 'crypto-com-chain',
      'near': 'near',
      'harmony': 'harmony',
      'moonbeam': 'moonbeam',
      'kava': 'kava',
      'celo': 'celo',
      'aurora': 'ethereum',
      'gnosis': 'gnosis',
      'base': 'ethereum'
    };
    
    const nativeCoinId = nativeTokenIds[assetPlatformId];
    if (!nativeCoinId) {
      console.warn(`Native token not supported for blockchain: ${assetPlatformId}`);
      return null;
    }
    
    coinIdToUse = nativeCoinId;
  } else {
    // For contract tokens, we need to get the coin ID first
    try {
      const coinData = await getCoinDataFromCoinGecko(assetPlatformId, contractAddress, coinId);
      if (!coinData || !coinData.id) {
        console.warn(`Could not find coin ID for ${contractAddress} on ${assetPlatformId}`);
        return null;
      }
      coinIdToUse = coinData.id;
    } catch (error) {
      console.error('Error getting coin data for historical prices:', error);
      return null;
    }
  }

  const url = `${COINGECKO_API_URL}/coins/${coinIdToUse}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
  const cacheKey = `coingecko:historical:${coinIdToUse}:${days}`;
  
  // Check cache first (cache for 1 hour since historical data doesn't change frequently)
  const cachedData = apiCache.get(cacheKey) as HistoricalPrice[] | null;
  if (cachedData) {
    console.log('Returning cached historical data');
    return cachedData;
  }

  try {
    console.log(`Fetching historical data from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': apiKey,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Historical data not found for coin: ${coinIdToUse}`);
        return null;
      }
      
      const errorBody = await response.text();
      throw new Error(`CoinGecko historical API request failed with status ${response.status}: ${errorBody}`);
    }

    const data: CoinGeckoHistoricalData = await response.json();
    
    const historicalPrices: HistoricalPrice[] = data.prices.map(([timestamp, price]) => ({
      timestamp,
      price
    }));
    
    // Cache for 1 hour
    apiCache.set(cacheKey, historicalPrices);
    
    return historicalPrices;
  } catch (error) {
    console.error('Error fetching historical data from CoinGecko:', error);
    return null;
  }
}
