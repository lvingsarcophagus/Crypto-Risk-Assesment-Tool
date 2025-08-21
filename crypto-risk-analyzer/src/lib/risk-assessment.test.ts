import { calculateRisk } from './risk-assessment';
import { getCoinDataFromCoinGecko } from './api/coingecko';
import { getTokenHoldersFromMoralis } from './api/moralis';
import { getMarketDataFromMobula } from './api/mobula';

// Mock the API client modules
jest.mock('./api/coingecko');
jest.mock('./api/moralis');
jest.mock('./api/mobula');

const mockedGetCoinData = getCoinDataFromCoinGecko as jest.Mock;
const mockedGetTokenHolders = getTokenHoldersFromMoralis as jest.Mock;
const mockedGetMarketData = getMarketDataFromMobula as jest.Mock;

describe('calculateRisk', () => {
  it('should calculate a risk score based on API data', async () => {
    // Provide mock data for all API clients
    mockedGetCoinData.mockResolvedValue({
      name: 'Test Token',
      symbol: 'TEST',
      market_cap_rank: 100,
      links: { repos_url: { github: [] }, subreddit_url: '' },
      market_data: {
        price_change_percentage_24h: 10,
        ath_change_percentage: { usd: -50 },
        market_cap: { usd: 100000000 },
        total_supply: 1000000,
        max_supply: 1000000,
        circulating_supply: 500000,
        fully_diluted_valuation: { usd: 200000000 },
        total_volume: { usd: 10000000 },
        price_change_percentage_7d: 5,
      },
    });
    mockedGetTokenHolders.mockResolvedValue({
      total: 5000,
      result: [{ balance: '100000' }], // Mock top holders
    });
    mockedGetMarketData.mockResolvedValue({
      // Mock Mobula data if needed, otherwise leave empty
    });

    const input = {
      contractAddress: '0x123',
      blockchain: 'ethereum',
    };

    const report = await calculateRisk(input);

    expect(report.totalScore).toBeGreaterThan(0);
    expect(report.riskLevel).toBeDefined();
    expect(report.factors.length).toBe(6);
  });

  it('should handle missing API data gracefully', async () => {
    // Mock APIs to return null or empty data
    mockedGetCoinData.mockResolvedValue(null);
    mockedGetTokenHolders.mockResolvedValue(null);
    mockedGetMarketData.mockResolvedValue(null);

    const input = {
      contractAddress: '0x123',
      blockchain: 'ethereum',
    };

    const report = await calculateRisk(input);

    // Even with no data, it should produce a report with high risk scores
    expect(report.totalScore).toBeGreaterThan(50);
    expect(report.riskLevel).not.toBe('LOW');
  });
});
