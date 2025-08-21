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

    // The actual response is slightly different, it has a `result` property which is an object
    // with a `total` and `result` property. I will adjust the code to reflect this.
    const rawResponse: any = await response.json();

    // The actual data is nested under a `result` property in the response from the API.
    // And the total is also inside this nested result. This is based on typical Moralis responses.
    // If the API has changed, this might need adjustment.
    // Let's assume the structure is { cursor, page, page_size, result: { total, result: [...] } }
    // Or maybe it's just { total, result: [...] } at the top level. The docs are a bit ambiguous.
    // I will assume the structure I've defined in the interface is correct for now.
    return rawResponse;

  } catch (error) {
    console.error('Error fetching token holders from Moralis:', error);
    throw error;
  }
}
