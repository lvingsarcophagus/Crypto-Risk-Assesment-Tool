import { NextResponse } from 'next/server';
import { resolveTokenAddresses, getAddressForMoralis, getAddressForMobula } from '@/lib/token-resolver';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Type definitions for CoinGecko API responses
interface CoinGeckoCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number;
}

interface CoinGeckoSearchResponse {
  coins: CoinGeckoCoin[];
}

// This function will be called by the new API route
async function searchCoinGecko(query: string) {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (!apiKey) {
    throw new Error('CoinGecko API key is not configured in .env.local');
  }

  const url = `${COINGECKO_API_URL}/search?query=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      'x-cg-demo-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`CoinGecko API Error: ${response.status} - ${errorText}`);
    throw new Error(`CoinGecko search failed with status ${response.status}: ${errorText}`);
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

    // Check if the query looks like a contract address
    const isEthereumAddress = /^0x[a-fA-F0-9]{40}$/.test(query);
    const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(query);
    
    if (isEthereumAddress) {
      console.log(`Direct Ethereum contract address provided: ${query}`);
      return NextResponse.json({
        name: `Token at ${query.slice(0, 8)}...`,
        symbol: 'UNKNOWN',
        coinGeckoId: null,
        blockchain: 'ethereum',
        contractAddress: query,
        isNative: false,
        moralisAddress: query,
        mobulaAddress: query,
      });
    }
    
    if (isSolanaAddress) {
      console.log(`Direct Solana contract address provided: ${query}`);
      return NextResponse.json({
        name: `Token at ${query.slice(0, 8)}...`,
        symbol: 'UNKNOWN',
        coinGeckoId: null,
        blockchain: 'solana',
        contractAddress: query,
        isNative: false,
        moralisAddress: query,
        mobulaAddress: query,
      });
    }

    console.log(`Searching for token: ${query}`);
    const searchResults = await searchCoinGecko(query);
    console.log(`Search results:`, searchResults);

    // Find the best matching result - prioritize exact matches and higher market cap rank
    let bestResult: CoinGeckoCoin | null = null;
    const queryLower = query.toLowerCase();

    if (searchResults.coins && searchResults.coins.length > 0) {
      // First try to find exact symbol match
      bestResult = searchResults.coins.find((coin: CoinGeckoCoin) => 
        coin.symbol?.toLowerCase() === queryLower || 
        coin.name?.toLowerCase() === queryLower
      ) || null;

      // If no exact match, try partial matches
      if (!bestResult) {
        bestResult = searchResults.coins.find((coin: CoinGeckoCoin) =>
          coin.symbol?.toLowerCase().includes(queryLower) ||
          coin.name?.toLowerCase().includes(queryLower)
        ) || null;
      }

      // If still no match, just take the first result (highest ranked)
      if (!bestResult) {
        bestResult = searchResults.coins[0];
      }
    }

    if (bestResult) {
      console.log(`Found best result:`, bestResult);
      
      // Fetch detailed coin data
      const coinDetailsUrl = `${COINGECKO_API_URL}/coins/${bestResult.id}`;
      console.log(`Fetching details from: ${coinDetailsUrl}`);
      
      const coinDetailsResponse = await fetch(coinDetailsUrl, {
        headers: {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY!,
        },
      });
      
      if (!coinDetailsResponse.ok) {
        throw new Error(`Failed to fetch details for coin ${bestResult.id}`);
      }
      
      const coinDetails = await coinDetailsResponse.json();
      console.log(`Coin details platforms:`, coinDetails.platforms);

      // Handle different token types
      const result = {
        name: coinDetails.name,
        symbol: coinDetails.symbol,
        coinGeckoId: coinDetails.id,
        blockchain: '',
        contractAddress: '',
        isNative: false,
        moralisAddress: null as string | null,
        mobulaAddress: null as string | null,
      };

      // Check if it's a native token (like BTC, ETH, BNB, etc.)
      const nativeTokens: { [key: string]: string } = {
        'bitcoin': 'bitcoin',
        'ethereum': 'ethereum', 
        'binancecoin': 'binance-smart-chain',
        'matic-network': 'polygon',
        'avalanche-2': 'avalanche',
        'cardano': 'cardano',
        'solana': 'solana',
      };

      if (nativeTokens[coinDetails.id]) {
        result.blockchain = nativeTokens[coinDetails.id];
        result.contractAddress = 'native';
        result.isNative = true;

        // Use our token resolver to get API-specific addresses
        const tokenInfo = resolveTokenAddresses(result.blockchain, coinDetails.id);
        if (tokenInfo) {
          result.moralisAddress = getAddressForMoralis(tokenInfo);
          result.mobulaAddress = getAddressForMobula(tokenInfo);
        }
      } else {
        // Look for contract addresses in platforms
        const platforms = coinDetails.platforms || {};
        const platformEntries = Object.entries(platforms).filter(([platform, address]) => 
          platform && address && address !== ''
        );

        if (platformEntries.length > 0) {
          // Prefer Ethereum, then BSC, then others
          const preferredOrder = ['ethereum', 'binance-smart-chain', 'polygon-pos', 'avalanche'];
          let selectedPlatform = platformEntries[0]; // default to first

          for (const preferred of preferredOrder) {
            const found = platformEntries.find(([platform]) => platform === preferred);
            if (found) {
              selectedPlatform = found;
              break;
            }
          }

          const [blockchain, contractAddress] = selectedPlatform;
          result.blockchain = blockchain;
          result.contractAddress = contractAddress as string;
          result.isNative = false;

          // For contract tokens, use the same address for all APIs
          result.moralisAddress = contractAddress as string;
          result.mobulaAddress = contractAddress as string;
        } else {
          // No contract address found, but we can still return the token info
          result.blockchain = 'unknown';
          result.contractAddress = '';
          result.isNative = false;
          result.moralisAddress = null;
          result.mobulaAddress = null;
        }
      }

      console.log(`Returning result:`, result);
      return NextResponse.json(result);
    }

    console.log(`No matching token found for query: ${query}`);
    return NextResponse.json({ error: 'Token not found' }, { status: 404 });

  } catch (error: unknown) {
    console.error('Error in resolve-token API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
