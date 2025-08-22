import { getCoinDataFromCoinGecko, CoinGeckoData } from './api/coingecko';
import { getTokenHoldersFromMoralis, MoralisTokenHoldersResponse, TokenHolder } from './api/moralis';
import { getMarketDataFromMobula } from './api/mobula';
import { resolveTokenAddresses } from './token-resolver';

// --- Helper Functions ---

/**
 * Maps blockchain names to Moralis chain identifiers
 */
function getBlockchainToMoralisMapping(blockchain: string): string {
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

// --- Data Structures ---

export interface RiskInput {
  contractAddress: string;
  blockchain: string; // e.g., 'ethereum'
  coinGeckoId?: string; // Optional: for native tokens
  moralisAddress?: string | null; // Specific address for Moralis API
  mobulaAddress?: string | null; // Specific address for Mobula API
}

export interface RiskFactor {
  name: string;
  score: number;
  details?: string;
}

export interface RiskReport {
  totalScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  tokenMetadata?: {
    id?: string;
    name?: string;
    symbol?: string;
    image?: string;
    description?: string;
    homepage?: string;
    blockchain?: string;
  };
  marketData?: {
    price?: number;
    volume24h?: number;
    marketCap?: number;
    priceChange24h?: number;
    [key: string]: unknown;
  };
  holderData?: {
    totalHolders?: number;
    top10Percentage?: number;
    holderDistribution?: unknown[];
    [key: string]: unknown;
  };
  holderAnalysis?: {
    topHolders?: Array<{
      owner_address: string;
      balance: string;
      percentage_relative_to_total_supply?: number;
      [key: string]: unknown;
    }>;
    totalHolders?: number;
    concentrationRisk?: number;
    [key: string]: unknown;
  };
  dataSources?: string[];
  rawData?: {
    coinGecko?: unknown;
    moralis?: unknown;
    mobula?: unknown;
  };
}

// --- Main Calculation Function ---

export async function calculateRisk(input: RiskInput): Promise<RiskReport> {
  // 1. Fetch data from all APIs with appropriate addresses
  // CoinGecko can use either coinGeckoId (for native) or contract address
  let coingeckoData = null;
  try {
    coingeckoData = await getCoinDataFromCoinGecko(input.blockchain, input.contractAddress, input.coinGeckoId);
  } catch (error) {
    console.warn('CoinGecko API failed, continuing with limited data:', error);
    // We'll continue with partial data instead of failing completely
  }
  
  // Moralis needs contract addresses - skip if not available
  let moralisData = null;
  if (input.moralisAddress) {
    try {
      // Get the token info to determine proper chain name for Moralis
      const tokenInfo = resolveTokenAddresses(input.blockchain, input.coinGeckoId || '');
      const moralisChain = tokenInfo?.moralisChain || getBlockchainToMoralisMapping(input.blockchain);
      
      console.log(`Debug: input.blockchain="${input.blockchain}", moralisChain="${moralisChain}", input.moralisAddress="${input.moralisAddress}"`);
      
      moralisData = await getTokenHoldersFromMoralis(moralisChain, input.moralisAddress);
    } catch (error) {
      console.warn('Moralis API failed, continuing without holder data:', error);
    }
  }
  
  // Mobula can handle various address types - skip if not available for now
  // TODO: Integrate Mobula data into risk calculations
  if (input.mobulaAddress) {
    try {
      await getMarketDataFromMobula(input.blockchain, input.mobulaAddress);
      // Will integrate this data in future iterations
    } catch (error) {
      console.warn('Mobula API failed, continuing without additional market data:', error);
    }
  }

  // 2. Calculate score for each factor
  const marketMetrics = calculateMarketMetricsRisk(coingeckoData);
  const walletConcentration = calculateWalletConcentrationRisk(moralisData, coingeckoData);
  const tokenomics = calculateTokenomicsRisk(coingeckoData);
  const communityAndDev = calculateCommunityAndDevRisk(coingeckoData);
  const tradingBehavior = calculateTradingBehaviorRisk(coingeckoData);
  const nameHeuristics = calculateNameHeuristicsRisk(coingeckoData);

  const factors: RiskFactor[] = [
    marketMetrics,
    walletConcentration,
    tokenomics,
    communityAndDev,
    tradingBehavior,
    nameHeuristics,
  ];

  // 3. Apply weights and calculate final score
  const totalScore =
    marketMetrics.score * 0.235 +
    walletConcentration.score * 0.235 +
    tokenomics.score * 0.118 +
    communityAndDev.score * 0.177 +
    tradingBehavior.score * 0.118 +
    nameHeuristics.score * 0.117;

  // 4. Determine risk level
  let riskLevel: RiskReport['riskLevel'] = 'LOW';
  if (totalScore >= 80) {
    riskLevel = 'CRITICAL';
  } else if (totalScore >= 60) {
    riskLevel = 'HIGH';
  } else if (totalScore >= 40) {
    riskLevel = 'MEDIUM';
  }

  return {
    totalScore: Math.round(totalScore),
    riskLevel,
    factors,
    tokenMetadata: {
      id: coingeckoData?.id,
      name: coingeckoData?.name,
      symbol: coingeckoData?.symbol?.toUpperCase(),
      image: coingeckoData?.image?.large || coingeckoData?.image?.small || coingeckoData?.image?.thumb,
      description: coingeckoData?.description?.en ? 
        coingeckoData.description.en.replace(/<[^>]*>/g, '').substring(0, 500) : undefined,
      homepage: coingeckoData?.links?.homepage?.[0],
      blockchain: input.blockchain,
    },
    marketData: {
      price: coingeckoData?.market_data?.current_price?.usd || 
        (coingeckoData?.market_data?.market_cap?.usd ? 
          Object.values(coingeckoData.market_data.market_cap)[0] as number : undefined),
      volume24h: coingeckoData?.market_data?.total_volume ? 
        Object.values(coingeckoData.market_data.total_volume)[0] as number : undefined,
      marketCap: coingeckoData?.market_data?.market_cap ? 
        Object.values(coingeckoData.market_data.market_cap)[0] as number : undefined,
      priceChange24h: coingeckoData?.market_data?.price_change_percentage_24h,
    },
    holderData: moralisData ? {
      totalHolders: moralisData.result?.length || 0,
      top10Percentage: calculateTop10Percentage(moralisData),
      holderDistribution: moralisData.result?.slice(0, 10) || [],
    } : undefined,
    holderAnalysis: moralisData ? {
      topHolders: moralisData.result?.map(holder => ({
        ...holder,
        percentage_relative_to_total_supply: coingeckoData?.market_data?.total_supply ? 
          (parseFloat(holder.balance) / coingeckoData.market_data.total_supply) : undefined
      })) || [],
      totalHolders: moralisData.total || moralisData.result?.length || 0,
      concentrationRisk: calculateTop10Percentage(moralisData) || 0,
    } : undefined,
    dataSources: [
      'CoinGecko',
      ...(moralisData ? ['Moralis'] : []),
    ],
    rawData: {
      coinGecko: coingeckoData,
      moralis: moralisData,
      mobula: undefined,
    },
  };
}

// Helper function to calculate top 10 percentage
function calculateTop10Percentage(moralisData: MoralisTokenHoldersResponse): number | undefined {
  if (!moralisData.result || moralisData.result.length === 0) return undefined;
  
  const totalSupply = moralisData.result.reduce((sum: number, holder: TokenHolder) => 
    sum + parseFloat(holder.balance), 0);
  if (totalSupply === 0) return undefined;
  
  const top10Supply = moralisData.result
    .slice(0, Math.min(10, moralisData.result.length))
    .reduce((sum: number, holder: TokenHolder) => sum + parseFloat(holder.balance), 0);
  
  return Math.round((top10Supply / totalSupply) * 100);
}


// --- Scoring Functions (Placeholders) ---

function calculateMarketMetricsRisk(coingeckoData: CoinGeckoData | null): RiskFactor {
  let score = 50; // Base score
  const findings: string[] = [];

  // Use CoinGecko data primarily, but could fall back to Mobula if needed.
  const data = coingeckoData;

  if (!data || !data.market_data) {
    // If no market data is available, return a high risk score.
    return { name: 'Market Metrics', score: 80, details: "No market data available - unable to assess market metrics." };
  }

  // 1. Market Cap Ranking
  const rank = data.market_cap_rank;
  if (rank) {
    if (rank > 2000) { score += 35; findings.push("Rank > 2000 (+35)"); }
    else if (rank > 1000) { score += 25; findings.push("Rank > 1000 (+25)"); }
    else if (rank > 500) { score += 15; findings.push("Rank > 500 (+15)"); }
    else if (rank > 100) { score += 5; findings.push("Rank > 100 (+5)"); }
    else if (rank > 50) { score -= 5; findings.push("Rank 51-100 (-5)"); }
    else { score -= 15; findings.push("Rank <= 50 (-15)"); }
  } else {
    score += 10; // Penalty if rank is not available
    findings.push("Market cap rank not available (+10)");
  }

  // 2. Volatility (24h price change)
  const priceChange24h = data.market_data.price_change_percentage_24h;
  if (priceChange24h !== undefined) {
    const absChange = Math.abs(priceChange24h);
    if (absChange > 50) { score += 30; findings.push("24h change > 50% (+30)"); }
    else if (absChange > 30) { score += 20; findings.push("24h change > 30% (+20)"); }
    else if (absChange > 15) { score += 10; findings.push("24h change > 15% (+10)"); }
    else if (absChange > 5) { score += 3; findings.push("24h change > 5% (+3)"); }
    else { score -= 5; findings.push("24h change <= 5% (-5)"); }
  }

  // 3. All-Time High (ATH) Distance
  const athChange = data.market_data.ath_change_percentage?.usd;
  if (athChange !== undefined) {
    if (athChange < -95) { score += 25; findings.push("95% below ATH (+25)"); }
    else if (athChange < -80) { score += 15; findings.push("80% below ATH (+15)"); }
    else if (athChange < -50) { score += 8; findings.push("50% below ATH (+8)"); }
    else if (athChange > -10) { score -= 5; findings.push("Near ATH (-5)"); }
  }

  // 4. Market Cap Size
  const marketCap = data.market_data.market_cap?.usd;
  if (marketCap !== undefined) {
    if (marketCap < 1_000_000) { score += 20; findings.push("Market cap < $1M (+20)"); }
    else if (marketCap < 10_000_000) { score += 10; findings.push("Market cap < $10M (+10)"); }
    else if (marketCap > 1_000_000_000) { score -= 10; findings.push("Market cap > $1B (-10)"); }
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(score, 100));

  return { name: 'Market Metrics', score: finalScore, details: findings.join(', ') };
}

function calculateWalletConcentrationRisk(
  moralisData: MoralisTokenHoldersResponse | null,
  coingeckoData: CoinGeckoData | null
): RiskFactor {
  let score = 30; // Base score
  const findings: string[] = [];

  if (!moralisData || !moralisData.result || !coingeckoData || !coingeckoData.market_data) {
    return { name: 'Wallet Concentration', score: 70, details: "Holder or supply data not available - unable to assess concentration risk." };
  }

  // 1. Top 10 Holders Concentration
  const totalSupply = coingeckoData.market_data.total_supply;
  if (totalSupply && moralisData.result.length >= 10) {
    const top10Holders = moralisData.result.slice(0, 10);
    // Moralis API returns balance pre-formatted to token decimals.
    const top10Balance = top10Holders.reduce((sum, holder) => sum + parseFloat(holder.balance), 0);

    const top10Percentage = (top10Balance / totalSupply) * 100;

    if (top10Percentage > 70) { score += 40; findings.push("Top 10 hold > 70% (+40)"); }
    else if (top10Percentage > 50) { score += 25; findings.push("Top 10 hold > 50% (+25)"); }
    else if (top10Percentage > 30) { score += 15; findings.push("Top 10 hold > 30% (+15)"); }
    else { score -= 5; findings.push("Top 10 hold <= 30% (-5)"); }
  } else {
    score += 20; // Penalty if we can't calculate this
    findings.push("Could not determine top 10 holder concentration (+20)");
  }

  // 2. Total Holders Analysis
  const totalHolders = moralisData.total;
  if (totalHolders) {
    if (totalHolders < 100) { score += 30; findings.push("< 100 holders (+30)"); }
    else if (totalHolders < 1000) { score += 20; findings.push("< 1000 holders (+20)"); }
    else if (totalHolders > 100_000) { score -= 10; findings.push("> 100k holders (-10)"); }
  }

  const finalScore = Math.max(0, Math.min(score, 100));
  return { name: 'Wallet Concentration', score: finalScore, details: findings.join(', ') };
}

function calculateTokenomicsRisk(coingeckoData: CoinGeckoData | null): RiskFactor {
  if (!coingeckoData || !coingeckoData.market_data) {
    return { name: 'Tokenomics', score: 70, details: "Tokenomics data not available - unable to assess supply mechanics." };
  }

  let score = 30; // Base score
  const findings: string[] = [];

  const data = coingeckoData.market_data;

  // 1. Supply Analysis
  if (data.max_supply === null) {
    score += 25;
    findings.push("No maximum supply (+25)");
  }

  if (data.circulating_supply && data.total_supply && data.total_supply > 0) {
    const circulationRatio = data.circulating_supply / data.total_supply;
    if (circulationRatio < 0.5) {
      score += 15;
      findings.push(`Low circulation ratio (${(circulationRatio * 100).toFixed(1)}%) (+15)`);
    }
  }

  // 2. Valuation Analysis
  const marketCap = data.market_cap?.usd;
  const fdv = data.fully_diluted_valuation?.usd;

  if (marketCap && fdv && marketCap > 0) {
    const fdvRatio = fdv / marketCap;
    if (fdvRatio > 5) {
      score += 20;
      findings.push(`FDV is >5x market cap (+20)`);
    } else if (fdvRatio > 3) {
      score += 10;
      findings.push(`FDV is >3x market cap (+10)`);
    }
  }

  const finalScore = Math.max(0, Math.min(score, 100));
  return { name: 'Tokenomics', score: finalScore, details: findings.join(', ') };
}

function calculateCommunityAndDevRisk(coingeckoData: CoinGeckoData | null): RiskFactor {
  if (!coingeckoData) {
    return { name: 'Community & Developer Activity', score: 80, details: "Community & dev data not available - unable to assess project activity." };
  }

  let score = 20; // Base score
  const findings: string[] = [];

  const links = coingeckoData.links;
  const devData = coingeckoData.developer_data;
  const communityData = coingeckoData.community_data;

  if (!links) {
    return { name: 'Community & Developer Activity', score: 80, details: "Community & dev data not available." };
  }

  // 1. GitHub Activity
  if (!links.repos_url?.github || links.repos_url.github.length === 0) {
    score += 40;
    findings.push("No GitHub repository found (+40)");
  } else {
    // Note: Commit data for the last 4 weeks is not available from CoinGecko API.
    // This check is omitted. A more advanced implementation would require a GitHub API client.
    if (devData && devData.stars !== undefined) {
      if (devData.stars < 100) {
        score += 15;
        findings.push(`Low GitHub star count (${devData.stars}) (+15)`);
      }
    }
  }

  // 2. Social Media (Reddit)
  if (!links.subreddit_url) {
    score += 20;
    findings.push("No Reddit community link found (+20)");
  } else {
    if (communityData && communityData.reddit_subscribers) {
      if (communityData.reddit_subscribers < 1000) {
        score += 10;
        findings.push(`Low Reddit engagement (${communityData.reddit_subscribers} subscribers) (+10)`);
      } else if (communityData.reddit_subscribers > 50000) {
        score -= 10;
        findings.push(`Active Reddit community (${communityData.reddit_subscribers} subscribers) (-10)`);
      }
    } else {
        score += 10;
        findings.push("Could not determine Reddit engagement (+10)");
    }
  }

  const finalScore = Math.max(0, Math.min(score, 100));
  return { name: 'Community & Developer Activity', score: finalScore, details: findings.join(', ') };
}

function calculateTradingBehaviorRisk(coingeckoData: CoinGeckoData | null): RiskFactor {
  if (!coingeckoData || !coingeckoData.market_data) {
    return { name: 'Trading Behavior', score: 70, details: "Trading data not available - unable to assess market behavior." };
  }

  let score = 30; // Base score
  const findings: string[] = [];

  const data = coingeckoData.market_data;

  if (!data.total_volume?.usd || !data.market_cap?.usd) {
    return { name: 'Trading Behavior', score: 70, details: "Trading data not available." };
  }

  // 1. Volume Analysis
  const volume = data.total_volume.usd;
  const marketCap = data.market_cap.usd;

  if (marketCap > 0) {
    const volumeToMarketCapRatio = volume / marketCap;
    if (volumeToMarketCapRatio < 0.01) {
      score += 25;
      findings.push(`Very low volume/MCap ratio (${(volumeToMarketCapRatio * 100).toFixed(2)}%) (+25)`);
    } else if (volumeToMarketCapRatio > 0.2) {
      score -= 10;
      findings.push(`High volume/MCap ratio (${(volumeToMarketCapRatio * 100).toFixed(2)}%) (-10)`);
    }
  }
  // Note: "Declining volume" check is omitted due to data limitations.

  // 2. Volatility Patterns
  const priceChange7d = data.price_change_percentage_7d;
  if (priceChange7d !== undefined) {
    if (Math.abs(priceChange7d) > 100) {
      score += 20;
      findings.push(`Extreme 7-day volatility (${priceChange7d.toFixed(1)}%) (+20)`);
    } else if (Math.abs(priceChange7d) < 10) {
      score -= 5;
      findings.push(`Stable 7-day volatility (${priceChange7d.toFixed(1)}%) (-5)`);
    }
  }

  const finalScore = Math.max(0, Math.min(score, 100));
  return { name: 'Trading Behavior', score: finalScore, details: findings.join(', ') };
}

function calculateNameHeuristicsRisk(coingeckoData: CoinGeckoData | null): RiskFactor {
  if (!coingeckoData || !coingeckoData.name || !coingeckoData.symbol) {
    return { name: 'Name/Symbol Heuristics', score: 10, details: "Name or symbol not available - unable to assess naming patterns." };
  }

  let score = 0; // No base score for this one
  const findings: string[] = [];

  const name = coingeckoData.name.toLowerCase();
  const symbol = coingeckoData.symbol.toLowerCase();

  const suspiciousWords = [
    "safe", "moon", "rocket", "doge", "shib", "inu", "baby", "mini", "max"
  ];

  suspiciousWords.forEach(word => {
    if (name.includes(word) || symbol.includes(word)) {
      score += 15;
      findings.push(`Contains suspicious word "${word}" (+15)`);
    }
  });

  // Check for excessive numbers in symbol
  if (/\d{3,}/.test(symbol)) { // 3 or more consecutive numbers
    score += 10;
    findings.push("Symbol contains excessive numbers (+10)");
  }

  // Check for special characters in symbol (excluding letters and numbers)
  if (/[^a-z0-9]/i.test(symbol)) {
    score += 10;
    findings.push("Symbol contains special characters (+10)");
  }

  const finalScore = Math.max(0, Math.min(score, 100));
  return { name: 'Name/Symbol Heuristics', score: finalScore, details: findings.join(', ') };
}
