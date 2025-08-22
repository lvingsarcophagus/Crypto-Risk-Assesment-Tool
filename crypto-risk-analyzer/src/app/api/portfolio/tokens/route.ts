import { NextRequest, NextResponse } from 'next/server';

interface TokenBalance {
  token_address: string;
  symbol: string;
  name: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  possible_spam: boolean;
  verified_contract: boolean;
}

interface MoralisTokenResponse {
  token_address: string;
  symbol: string;
  name: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  possible_spam: boolean;
  verified_contract: boolean;
  usd_price?: number;
  usd_value?: number;
  portfolio_percentage?: number;
}

// Chain ID to Moralis chain mapping
const chainIdToMoralisChain: Record<number, string> = {
  1: 'eth',        // Ethereum Mainnet
  56: 'bsc',       // BSC
  137: 'polygon',  // Polygon
  43114: 'avalanche', // Avalanche
  250: 'fantom',   // Fantom
  42161: 'arbitrum', // Arbitrum
  10: 'optimism',  // Optimism
};

export async function POST(request: NextRequest) {
  try {
    const { address, chainId } = await request.json();

    if (!address || !chainId) {
      return NextResponse.json(
        { error: 'Address and chainId are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.MORALIS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Moralis API key not configured' },
        { status: 500 }
      );
    }

    const moralisChain = chainIdToMoralisChain[chainId];
    if (!moralisChain) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    // Fetch token balances from Moralis
    const moralisUrl = `https://deep-index.moralis.io/api/v2.2/${address}/erc20?chain=${moralisChain}&exclude_spam=true`;
    
    const moralisResponse = await fetch(moralisUrl, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    if (!moralisResponse.ok) {
      throw new Error(`Moralis API failed: ${moralisResponse.status}`);
    }

    const moralisData: MoralisTokenResponse[] = await moralisResponse.json();

    // Fetch ETH/native token balance
    const nativeBalanceUrl = `https://deep-index.moralis.io/api/v2.2/${address}/balance?chain=${moralisChain}`;
    const nativeResponse = await fetch(nativeBalanceUrl, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
    });

    let nativeBalance = '0';
    if (nativeResponse.ok) {
      const nativeData = await nativeResponse.json();
      nativeBalance = nativeData.balance || '0';
    }

    // Get native token info
    const nativeTokenInfo = getNativeTokenInfo(chainId);

    // Process tokens and add native token
    const tokens = [
      // Add native token first
      {
        address: 'native',
        symbol: nativeTokenInfo.symbol,
        name: nativeTokenInfo.name,
        decimals: 18,
        balance: nativeBalance,
        balanceFormatted: parseFloat(nativeBalance) / Math.pow(10, 18),
        logo: nativeTokenInfo.logo,
        verified_contract: true,
        possible_spam: false,
        usd_price: undefined as number | undefined,
        usd_value: undefined as number | undefined,
      },
      // Add ERC-20 tokens
      ...moralisData
        .filter(token => !token.possible_spam && token.verified_contract)
        .map(token => ({
          address: token.token_address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          balance: token.balance,
          balanceFormatted: parseFloat(token.balance) / Math.pow(10, token.decimals),
          logo: token.logo || token.thumbnail,
          verified_contract: token.verified_contract,
          possible_spam: token.possible_spam,
          usd_price: token.usd_price,
          usd_value: token.usd_value,
        }))
    ].filter(token => token.balanceFormatted > 0); // Only include tokens with balance

    // Calculate total portfolio value
    const totalValue = tokens.reduce((sum, token) => sum + (token.usd_value || 0), 0);

    return NextResponse.json({
      address,
      chainId,
      tokens,
      totalValue,
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('Portfolio tokens fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio tokens' },
      { status: 500 }
    );
  }
}

function getNativeTokenInfo(chainId: number) {
  const nativeTokens: Record<number, { symbol: string; name: string; logo?: string }> = {
    1: { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    56: { symbol: 'BNB', name: 'BNB Smart Chain', logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png' },
    137: { symbol: 'MATIC', name: 'Polygon', logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
    43114: { symbol: 'AVAX', name: 'Avalanche', logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png' },
    250: { symbol: 'FTM', name: 'Fantom', logo: 'https://cryptologos.cc/logos/fantom-ftm-logo.png' },
    42161: { symbol: 'ETH', name: 'Arbitrum ETH', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    10: { symbol: 'ETH', name: 'Optimism ETH', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  };

  return nativeTokens[chainId] || { symbol: 'UNKNOWN', name: 'Unknown Token' };
}
