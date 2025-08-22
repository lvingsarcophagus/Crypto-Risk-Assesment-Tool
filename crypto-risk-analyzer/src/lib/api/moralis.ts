const MORALIS_API_URL = 'https://deep-index.moralis.io/api/v2.2';

// Import cache for performance optimization
import { apiCache } from '../cache';

// Basic types for the Moralis response.
export interface TokenHolder {
  owner_address: string;
  balance: string;
  balance_formatted: number;
  percentage_relative_to_total_supply: number;
  is_contract: boolean;
  owner_address_label?: string;
  entity?: string;
  entity_logo?: string;
  usd_value?: number;
}

export interface MoralisTokenHoldersResponse {
  total: number;
  result: TokenHolder[];
}

/**
 * Fetches token holder data from the Moralis API.
 * @param chain The chain to query (e.g., 'eth', 'bsc').
 * @param tokenAddress The token's contract address.
 * @returns An object containing the total number of holders and a list of the top 100 holders.
 */
export async function getTokenHoldersFromMoralis(
  chain: string,
  tokenAddress: string
): Promise<MoralisTokenHoldersResponse> {
  const apiKey = process.env.MORALIS_API_KEY;
  if (!apiKey) {
    throw new Error('Moralis API key is not configured in .env.local');
  }

  // We fetch the top 100 holders to analyze concentration.
  const url = `${MORALIS_API_URL}/erc20/${tokenAddress}/owners?chain=${chain}&limit=100`;

  // Create cache key
  const cacheKey = `moralis:${chain}:${tokenAddress}`;
  
  // Check cache first
  const cachedData = apiCache.get(cacheKey) as MoralisTokenHoldersResponse | null;
  if (cachedData) {
    console.log('Returning cached Moralis data');
    return cachedData;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Moralis API request failed with status ${response.status}: ${errorBody}`);
    }

    const rawResponse: unknown = await response.json();
    
    // Debug: Log the actual response structure
    console.log('Moralis API Response Structure:', JSON.stringify(rawResponse, null, 2));

    // Handle the actual Moralis API v2.2 response structure
    if (rawResponse && typeof rawResponse === 'object' && rawResponse !== null) {
      const responseObj = rawResponse as Record<string, unknown>;
      
      // Check for the expected structure: { result: [...], page_size: number, etc. }
      if (Array.isArray(responseObj.result)) {
        const holders = responseObj.result as Array<unknown>;
        
        // Validate that holders have the expected structure
        const validHolders = holders.filter(holder => 
          holder && 
          typeof holder === 'object' && 
          holder !== null &&
          'owner_address' in holder &&
          'balance' in holder
        );

        console.log(`Found ${validHolders.length} valid holders out of ${holders.length} total`);
        
        const result = {
          total: validHolders.length,
          result: validHolders as TokenHolder[],
        };
        
        // Cache the successful response
        apiCache.set(cacheKey, result);
        
        return result;
      }
      
      // Handle empty response or error cases
      if (responseObj.message) {
        console.log('Moralis API returned message:', responseObj.message);
      }
    }

    // Return empty result if no valid data found
    console.log('No valid holder data found in Moralis response');
    return {
      total: 0,
      result: [],
    };

  } catch (error) {
    console.error('Error fetching token holders from Moralis:', error);
    throw error;
  }
}
