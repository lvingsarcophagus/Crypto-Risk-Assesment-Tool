const MORALIS_API_URL = 'https://deep-index.moralis.io/api/v2.2';

// Basic types for the Moralis response.
// These can be expanded later for more detail.
export interface TokenHolder {
  owner_address: string;
  balance: string;
  percentage_relative_to_total_supply: number;
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

    const rawResponse: any = await response.json();

    // Validate the structure of the Moralis API response
    if (rawResponse && typeof rawResponse === 'object' && 'result' in rawResponse) {
      // The Moralis v2.2 API returns the main data directly
      // Let's ensure the nested properties exist before returning
      const resultData = rawResponse.result;
      if (resultData && typeof resultData.total === 'number' && Array.isArray(resultData.result)) {
         return {
           total: resultData.total,
           result: resultData.result,
         };
      }
      // Handle cases where the structure inside 'result' is different
      if (rawResponse.total !== undefined && Array.isArray(rawResponse.result)) {
        return {
            total: rawResponse.total,
            result: rawResponse.result
        };
      }
    }

    // If the structure is not as expected, throw an error
    throw new Error('Unexpected response structure from Moralis API.');

  } catch (error) {
    console.error('Error fetching token holders from Moralis:', error);
    throw error;
  }
}
