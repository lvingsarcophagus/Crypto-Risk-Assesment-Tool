const MOBULA_API_URL = 'https://production-api.mobula.io/api/1';

// Placeholder for the detailed type. Will be fleshed out later.
export type MobulaMarketData = any;

/**
 * Fetches market data from the Mobula API.
 * @param blockchain The blockchain name or ID (e.g., 'Ethereum', '1').
 * @param asset The contract address of the token.
 * @returns Market data from the Mobula API.
 */
export async function getMarketDataFromMobula(
  blockchain: string,
  asset: string
): Promise<MobulaMarketData> {
  const apiKey = process.env.MOBULA_API_KEY;
  if (!apiKey) {
    throw new Error('Mobula API key is not configured in .env.local');
  }

  const url = `${MOBULA_API_URL}/market/data?blockchain=${blockchain}&asset=${asset}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Mobula API request failed with status ${response.status}: ${errorBody}`);
    }

    const responseData = await response.json();

    // The actual data is nested under a `data` property in the response
    if (responseData && responseData.data) {
      return responseData.data;
    }

    // If the structure is not as expected, throw an error
    throw new Error('Unexpected response structure from Mobula API.');
  } catch (error) {
    console.error('Error fetching market data from Mobula:', error);
    throw error;
  }
}
