// Token address resolver for different APIs and chains
// This module handles the mapping between native tokens, wrapped tokens, and contract addresses

export interface TokenAddressInfo {
  coinGeckoId: string;
  symbol: string;
  name: string;
  isNative: boolean;
  nativeAddress?: string; // For native tokens like ETH, BTC
  wrappedAddress?: string; // For wrapped versions like WETH, WBTC
  contractAddress?: string; // For ERC-20 tokens
  moralisChain?: string; // Chain ID for Moralis API
  mobulaBlockchain?: string; // Blockchain name for Mobula API
}

// Comprehensive mapping of tokens across different chains
const TOKEN_ADDRESS_MAP: { [key: string]: { [tokenId: string]: TokenAddressInfo } } = {
  ethereum: {
    'ethereum': {
      coinGeckoId: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      isNative: true,
      nativeAddress: 'native',
      wrappedAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
      moralisChain: 'eth',
      mobulaBlockchain: 'Ethereum'
    },
    'wrapped-bitcoin': {
      coinGeckoId: 'wrapped-bitcoin',
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      isNative: false,
      contractAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      moralisChain: 'eth',
      mobulaBlockchain: 'Ethereum'
    },
    'usd-coin': {
      coinGeckoId: 'usd-coin',
      symbol: 'USDC',
      name: 'USD Coin',
      isNative: false,
      contractAddress: '0xA0b86a33E6471e9af0bAfa659Ff01E89BE5Df1Dc',
      moralisChain: 'eth',
      mobulaBlockchain: 'Ethereum'
    },
    'chainlink': {
      coinGeckoId: 'chainlink',
      symbol: 'LINK',
      name: 'Chainlink',
      isNative: false,
      contractAddress: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      moralisChain: 'eth',
      mobulaBlockchain: 'Ethereum'
    }
  },
  bsc: {
    'binancecoin': {
      coinGeckoId: 'binancecoin',
      symbol: 'BNB',
      name: 'BNB',
      isNative: true,
      nativeAddress: 'native',
      wrappedAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
      moralisChain: 'bsc',
      mobulaBlockchain: 'BSC'
    }
  },
  polygon: {
    'matic-network': {
      coinGeckoId: 'matic-network',
      symbol: 'MATIC',
      name: 'Polygon',
      isNative: true,
      nativeAddress: 'native',
      wrappedAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WMATIC
      moralisChain: 'polygon',
      mobulaBlockchain: 'Polygon'
    }
  },
  avalanche: {
    'avalanche-2': {
      coinGeckoId: 'avalanche-2',
      symbol: 'AVAX',
      name: 'Avalanche',
      isNative: true,
      nativeAddress: 'native',
      wrappedAddress: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7', // WAVAX
      moralisChain: 'avalanche',
      mobulaBlockchain: 'Avalanche'
    }
  },
  arbitrum: {
    'ethereum': {
      coinGeckoId: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      isNative: true,
      nativeAddress: 'native',
      wrappedAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH on Arbitrum
      moralisChain: 'arbitrum',
      mobulaBlockchain: 'Arbitrum'
    }
  },
  optimism: {
    'ethereum': {
      coinGeckoId: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      isNative: true,
      nativeAddress: 'native',
      wrappedAddress: '0x4200000000000000000000000000000000000006', // WETH on Optimism
      moralisChain: 'optimism',
      mobulaBlockchain: 'Optimism'
    }
  },
  fantom: {
    'fantom': {
      coinGeckoId: 'fantom',
      symbol: 'FTM',
      name: 'Fantom',
      isNative: true,
      nativeAddress: 'native',
      wrappedAddress: '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83', // WFTM
      moralisChain: 'fantom',
      mobulaBlockchain: 'Fantom'
    }
  },
  solana: {
    'solana': {
      coinGeckoId: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      isNative: true,
      nativeAddress: 'native',
      moralisChain: 'solana',
      mobulaBlockchain: 'Solana'
    }
  },
  cardano: {
    'cardano': {
      coinGeckoId: 'cardano',
      symbol: 'ADA',
      name: 'Cardano',
      isNative: true,
      nativeAddress: 'native',
      moralisChain: 'cardano',
      mobulaBlockchain: 'Cardano'
    }
  },
  base: {
    'ethereum': {
      coinGeckoId: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      isNative: true,
      nativeAddress: 'native',
      wrappedAddress: '0x4200000000000000000000000000000000000006', // WETH on Base
      moralisChain: 'base',
      mobulaBlockchain: 'Base'
    }
  }
};

/**
 * Resolves token address information for different APIs
 */
export function resolveTokenAddresses(
  blockchain: string,
  coinGeckoId: string,
  contractAddress?: string
): TokenAddressInfo | null {
  // First check if we have a predefined mapping
  const chainMap = TOKEN_ADDRESS_MAP[blockchain];
  if (chainMap && chainMap[coinGeckoId]) {
    return chainMap[coinGeckoId];
  }

  // If not predefined but we have a contract address, create a basic mapping
  if (contractAddress && contractAddress !== 'native') {
    return {
      coinGeckoId,
      symbol: '', // Will be filled by caller
      name: '', // Will be filled by caller
      isNative: false,
      contractAddress,
      moralisChain: mapBlockchainToMoralisChain(blockchain),
      mobulaBlockchain: mapBlockchainToMobulaName(blockchain)
    };
  }

  return null;
}

/**
 * Gets the appropriate contract address for Moralis API
 */
export function getAddressForMoralis(tokenInfo: TokenAddressInfo): string | null {
  if (tokenInfo.isNative && tokenInfo.wrappedAddress) {
    // For native tokens, use wrapped version for Moralis
    return tokenInfo.wrappedAddress;
  }
  
  if (tokenInfo.contractAddress) {
    return tokenInfo.contractAddress;
  }

  return null;
}

/**
 * Gets the appropriate address for Mobula API
 */
export function getAddressForMobula(tokenInfo: TokenAddressInfo): string | null {
  if (tokenInfo.isNative && tokenInfo.wrappedAddress) {
    // For native tokens, try wrapped version first
    return tokenInfo.wrappedAddress;
  }
  
  if (tokenInfo.contractAddress) {
    return tokenInfo.contractAddress;
  }

  // For native tokens without wrapped version, try using coinGeckoId
  if (tokenInfo.isNative) {
    return tokenInfo.coinGeckoId;
  }

  return null;
}

/**
 * Maps blockchain names to Moralis chain identifiers
 */
function mapBlockchainToMoralisChain(blockchain: string): string {
  const mapping: { [key: string]: string } = {
    'ethereum': 'eth',
    'bsc': 'bsc',
    'binance-smart-chain': 'bsc',
    'polygon': 'polygon',
    'polygon-pos': 'polygon',
    'avalanche': 'avalanche',
    'arbitrum': 'arbitrum',
    'optimism': 'optimism',
    'fantom': 'fantom',
    'solana': 'solana',
    'cardano': 'cardano',
    'cosmos': 'cosmos',
    'terra': 'terra',
    'cronos': 'cronos',
    'near': 'near',
    'harmony': 'harmony',
    'moonbeam': 'moonbeam',
    'kava': 'kava',
    'celo': 'celo',
    'aurora': 'aurora',
    'gnosis': 'gnosis',
    'base': 'base'
  };
  
  return mapping[blockchain] || blockchain;
}

/**
 * Maps blockchain names to Mobula blockchain names
 */
function mapBlockchainToMobulaName(blockchain: string): string {
  const mapping: { [key: string]: string } = {
    'ethereum': 'Ethereum',
    'bsc': 'BSC',
    'binance-smart-chain': 'BSC',
    'polygon': 'Polygon',
    'polygon-pos': 'Polygon',
    'avalanche': 'Avalanche',
    'arbitrum': 'Arbitrum',
    'optimism': 'Optimism',
    'fantom': 'Fantom',
    'solana': 'Solana',
    'cardano': 'Cardano',
    'cosmos': 'Cosmos',
    'terra': 'Terra',
    'cronos': 'Cronos',
    'near': 'Near',
    'harmony': 'Harmony',
    'moonbeam': 'Moonbeam',
    'kava': 'Kava',
    'celo': 'Celo',
    'aurora': 'Aurora',
    'gnosis': 'Gnosis',
    'base': 'Base'
  };
  
  return mapping[blockchain] || blockchain;
}

/**
 * Checks if a token should skip certain APIs
 */
export function shouldSkipMoralis(tokenInfo: TokenAddressInfo): boolean {
  // Skip Moralis for native tokens that don't have wrapped versions
  return tokenInfo.isNative && !tokenInfo.wrappedAddress;
}

export function shouldSkipMobula(): boolean {
  // Mobula might handle some native tokens, so be less restrictive
  return false;
}
