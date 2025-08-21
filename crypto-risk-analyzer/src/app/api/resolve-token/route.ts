import { NextResponse } from 'next/server';

const COINGECKO_API_URL = 'https://pro-api.coingecko.com/api/v3';

// This function will be called by the new API route
async function searchCoinGecko(query: string) {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    throw new Error('CoinGecko API key is not configured in .env.local');
  }

  const url = `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      'x-cg-pro-api-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko search failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const searchResults = await searchCoinGecko(query);

    // Find the first result that has a contract address
    const firstResult = searchResults.coins?.find((coin: any) => coin.id);

    if (firstResult) {
      // We need to fetch the full coin data to get the contract address
      const coinDetailsUrl = `${COINGECKO_API_URL}/coins/${firstResult.id}`;
       const coinDetailsResponse = await fetch(coinDetailsUrl, {
        headers: {
            'x-cg-pro-api-key': process.env.COINGECKO_API_KEY!,
        },
      });
      if (!coinDetailsResponse.ok) {
        throw new Error(`Failed to fetch details for coin ${firstResult.id}`);
      }
      const coinDetails = await coinDetailsResponse.json();

      // Find the first available platform and contract address
      const platform = coinDetails.platforms && Object.entries(coinDetails.platforms).find(([p, a]) => p && a);

      if (platform) {
        const [blockchain, contractAddress] = platform;
        return NextResponse.json({
            blockchain,
            contractAddress,
            name: coinDetails.name,
            symbol: coinDetails.symbol,
        });
      }
    }

    return NextResponse.json({ error: 'Token not found' }, { status: 404 });

  } catch (error: any) {
    console.error('Error in resolve-token API route:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred' }, { status: 500 });
  }
}
