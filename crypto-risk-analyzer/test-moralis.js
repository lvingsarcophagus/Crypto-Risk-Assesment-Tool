const MORALIS_API_URL = 'https://deep-index.moralis.io/api/v2.2';
const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjAzYjFmNDE5LWYzNzctNGViYy1iMDBlLWNjMzkwZDMyZDg0NSIsIm9yZ0lkIjoiNDYzMTM5IiwidXNlcklkIjoiNDc2NDc3IiwidHlwZUlkIjoiNDY3YTdmZWEtMjNhMC00YTk2LWJjMDMtOTdkMGZmZjA4OGE0IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NTQyOTY4NjcsImV4cCI6NDkxMDA1Njg2N30.VI6Os_kRESLz-97lDBlsk9qdN4-Pnn3rW2HR5ObiUD0';

async function testMoralisAPI() {
  // Test with USDC token on Ethereum
  const tokenAddress = '0xA0b86a33E6417c8E28b978E05FCf3aE7CEe13E9F'; // USDC
  const chain = 'eth';
  
  const url = `${MORALIS_API_URL}/erc20/${tokenAddress}/owners?chain=${chain}&limit=10`;
  
  console.log('Testing Moralis API with URL:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-API-Key': MORALIS_API_KEY,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorBody = await response.text();
      console.log('Error response:', errorBody);
      return;
    }

    const rawResponse = await response.json();
    console.log('Raw Moralis Response Structure:');
    console.log(JSON.stringify(rawResponse, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testMoralisAPI();
