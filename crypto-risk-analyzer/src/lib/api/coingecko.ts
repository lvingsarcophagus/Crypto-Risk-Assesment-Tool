const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

export interface CoinGeckoData {
  name: string;
  symbol: string;
  market_cap_rank: number;
  links: {
    repos_url: {
      github: string[];
    };
    subreddit_url: string;
  };
  developer_data?: {
    stars: number;
  };
  community_data?: {
    reddit_subscribers: number;
  };
  market_data?: {
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
): Promise<CoinGeckoData> {
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
      throw new Error(`CoinGecko API request failed with status ${response.status}: ${errorBody}`);
    }

    const data: CoinGeckoData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data from CoinGecko:', error);
    // Re-throwing the error to be handled by the caller
    throw error;
  }
}
