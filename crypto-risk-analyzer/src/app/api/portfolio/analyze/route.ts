import { NextRequest, NextResponse } from 'next/server';
import { calculateRisk, RiskReport } from '@/lib/risk-assessment';

// Portfolio analysis types
interface PortfolioAnalysis {
  symbol: string;
  percentage: number;
  riskScore: number;
  riskLevel: string;
  error?: boolean;
  contractAddress?: string;
  balance?: number;
  usdValue?: number;
  riskReport?: RiskReport;
}

interface PortfolioToken {
  address: string;
  symbol: string;
  name: string;
  balanceFormatted: number;
  usd_value?: number;
}

interface PortfolioRiskAnalysis {
  totalRiskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  diversificationScore: number;
  concentrationRisk: number;
  totalValue: number;
  tokenCount: number;
  topHoldings: Array<{
    symbol: string;
    percentage: number;
    riskScore: number;
    riskLevel: string;
  }>;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { tokens, chainId } = await request.json();

    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json(
        { error: 'Valid tokens array is required' },
        { status: 400 }
      );
    }

    // Calculate total portfolio value
    const totalValue = tokens.reduce((sum: number, token: PortfolioToken) => 
      sum + (token.usd_value || 0), 0
    );

    if (totalValue === 0) {
      return NextResponse.json(
        { error: 'Portfolio has no USD value' },
        { status: 400 }
      );
    }

    // Analyze each token's risk
    const tokenRiskAnalyses = await Promise.allSettled(
      tokens.map(async (token: PortfolioToken) => {
        try {
          // Skip native tokens or tokens without addresses for detailed analysis
          if (token.address === 'native' || !token.address.startsWith('0x')) {
            return {
              symbol: token.symbol,
              percentage: ((token.usd_value || 0) / totalValue) * 100,
              riskScore: 30, // Assume native tokens have low-medium risk
              riskLevel: 'MEDIUM',
              error: false,
            };
          }

          const riskReport = await calculateRisk({
            contractAddress: token.address,
            blockchain: getBlockchainFromChainId(chainId),
            coinGeckoId: undefined,
            moralisAddress: token.address,
            mobulaAddress: null,
          });

          return {
            symbol: token.symbol,
            percentage: ((token.usd_value || 0) / totalValue) * 100,
            riskScore: riskReport.totalScore,
            riskLevel: riskReport.riskLevel,
            error: false,
          };
        } catch (error) {
          console.error(`Error analyzing ${token.symbol}:`, error);
          return {
            symbol: token.symbol,
            percentage: ((token.usd_value || 0) / totalValue) * 100,
            riskScore: 50, // Default medium risk for failed analyses
            riskLevel: 'MEDIUM',
            error: true,
          };
        }
      })
    );

    // Process results
    const validAnalyses = tokenRiskAnalyses
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);

    // Calculate portfolio-wide metrics
    const weightedRiskScore = validAnalyses.reduce((sum, analysis) => 
      sum + (analysis.riskScore * analysis.percentage / 100), 0
    );

    // Calculate diversification score
    const diversificationScore = calculateDiversificationScore(validAnalyses);

    // Calculate concentration risk
    const concentrationRisk = calculateConcentrationRisk(validAnalyses);

    // Determine overall risk level
    let portfolioRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (weightedRiskScore >= 80) portfolioRiskLevel = 'CRITICAL';
    else if (weightedRiskScore >= 60) portfolioRiskLevel = 'HIGH';
    else if (weightedRiskScore >= 40) portfolioRiskLevel = 'MEDIUM';

    // Calculate risk distribution
    const riskDistribution = calculateRiskDistribution(validAnalyses);

    // Generate recommendations
    const recommendations = generateRecommendations(
      validAnalyses,
      diversificationScore,
      concentrationRisk,
      portfolioRiskLevel
    );

    // Get top holdings (by percentage)
    const topHoldings = validAnalyses
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10);

    const portfolioAnalysis: PortfolioRiskAnalysis = {
      totalRiskScore: Math.round(weightedRiskScore),
      riskLevel: portfolioRiskLevel,
      diversificationScore: Math.round(diversificationScore),
      concentrationRisk: Math.round(concentrationRisk),
      totalValue,
      tokenCount: tokens.length,
      topHoldings,
      riskDistribution,
      recommendations,
    };

    return NextResponse.json(portfolioAnalysis);

  } catch (error) {
    console.error('Portfolio risk analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze portfolio risk' },
      { status: 500 }
    );
  }
}

function getBlockchainFromChainId(chainId: number): string {
  const chainMapping: Record<number, string> = {
    1: 'ethereum',
    56: 'bsc',
    137: 'polygon',
    43114: 'avalanche',
    250: 'fantom',
    42161: 'arbitrum',
    10: 'optimism',
  };
  return chainMapping[chainId] || 'ethereum';
}

function calculateDiversificationScore(analyses: PortfolioAnalysis[]): number {
  if (analyses.length <= 1) return 0;
  if (analyses.length >= 20) return 100;
  
  // Simple diversification score based on number of tokens and distribution
  const numberOfTokens = analyses.length;
  const maxPercentage = Math.max(...analyses.map(a => a.percentage));
  
  // Score based on number of tokens (0-50 points)
  const countScore = Math.min((numberOfTokens / 20) * 50, 50);
  
  // Score based on distribution (0-50 points)
  const distributionScore = Math.max(0, 50 - (maxPercentage - 20));
  
  return Math.min(countScore + distributionScore, 100);
}

function calculateConcentrationRisk(analyses: PortfolioAnalysis[]): number {
  const sortedByPercentage = analyses.sort((a, b) => b.percentage - a.percentage);
  
  // Top 3 holdings concentration
  const top3Concentration = sortedByPercentage
    .slice(0, 3)
    .reduce((sum, analysis) => sum + analysis.percentage, 0);
  
  // Higher concentration = higher risk
  return Math.min(top3Concentration, 100);
}

function calculateRiskDistribution(analyses: PortfolioAnalysis[]) {
  const total = analyses.length;
  const riskCounts = analyses.reduce((acc, analysis) => {
    const level = analysis.riskLevel.toLowerCase();
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    low: Math.round(((riskCounts.low || 0) / total) * 100),
    medium: Math.round(((riskCounts.medium || 0) / total) * 100),
    high: Math.round(((riskCounts.high || 0) / total) * 100),
    critical: Math.round(((riskCounts.critical || 0) / total) * 100),
  };
}

function generateRecommendations(
  analyses: PortfolioAnalysis[],
  diversificationScore: number,
  concentrationRisk: number,
  riskLevel: string
): string[] {
  const recommendations: string[] = [];

  // Diversification recommendations
  if (diversificationScore < 30) {
    recommendations.push('Consider diversifying into more tokens to reduce portfolio risk');
  }
  if (analyses.length < 5) {
    recommendations.push('Your portfolio has very few tokens. Consider adding 5-10 different assets');
  }

  // Concentration recommendations
  if (concentrationRisk > 70) {
    recommendations.push('High concentration risk detected. Consider rebalancing your top holdings');
  }

  // Risk level recommendations
  if (riskLevel === 'CRITICAL') {
    recommendations.push('Portfolio has critical risk level. Consider reducing exposure to high-risk tokens');
  } else if (riskLevel === 'HIGH') {
    recommendations.push('Portfolio has high risk. Review and consider reducing risky positions');
  }

  // High-risk token recommendations
  const highRiskTokens = analyses.filter(a => 
    (a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL') && a.percentage > 10
  );
  if (highRiskTokens.length > 0) {
    recommendations.push(`Consider reducing exposure to high-risk tokens: ${highRiskTokens.map(t => t.symbol).join(', ')}`);
  }

  // Default recommendation if portfolio is healthy
  if (recommendations.length === 0) {
    recommendations.push('Portfolio appears well-balanced. Continue monitoring market conditions');
  }

  return recommendations;
}
