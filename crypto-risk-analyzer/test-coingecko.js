// Simple test to check CoinGecko API
require('dotenv').config({ path: '.env.local' });

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

async function testCoinGecko() {
  const apiKey = process.env.COINGECKO_API_KEY;
  console.log('API Key found:', !!apiKey);
  console.log('API Key prefix:', apiKey ? apiKey.substring(0, 5) + '...' : 'none');

  if (!apiKey) {
    console.error('CoinGecko API key is not configured in .env.local');
    return;
  }

  try {
    // Test search endpoint
    const searchUrl = `${COINGECKO_API_URL}/search?query=bitcoin`;
    console.log('Testing search URL:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'x-cg-demo-api-key': apiKey,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return;
    }

    const data = await response.json();
    console.log('Search results:', JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Error testing CoinGecko API:', error);
  }
}

testCoinGecko();
