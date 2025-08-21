// Test script for token resolution
async function testTokenResolution() {
  const tests = ['ethereum', 'bitcoin', 'chainlink', 'usdc'];
  
  for (const token of tests) {
    try {
      console.log(`\n=== Testing token: ${token} ===`);
      const response = await fetch(`http://localhost:3000/api/resolve-token?query=${token}`);
      const data = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Error testing ${token}:`, error);
    }
  }
}

testTokenResolution();
