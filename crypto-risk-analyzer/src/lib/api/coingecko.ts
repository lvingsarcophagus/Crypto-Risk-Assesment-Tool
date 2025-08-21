const COINGECKO_API_URL = 'https://pro-api.coingecko.com/api/v3';

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
 * Fetches detailed coin data from CoinGecko using a contract address.
 * @param assetPlatformId The ID of the platform (e.g., 'ethereum', 'binance-smart-chain').
 * @param contractAddress The token's contract address.
 * @returns The coin data from the CoinGecko API.
 */
export async function getCoinDataFromCoinGecko(
  assetPlatformId: string,
  contractAddress: string
): Promise<CoinGeckoData> {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    throw new Error('CoinGecko API key is not configured in .env.local');
  }

  const url = `${COINGECKO_API_URL}/coins/${assetPlatformId}/contract/${contractAddress}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-cg-pro-api-key': apiKey,
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
