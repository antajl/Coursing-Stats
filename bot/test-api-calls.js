// Test API calls that the bot makes
const BASE_API_URL = 'https://coursing-stats.ru/data/v1';

console.log('=== Testing Bot API Calls ===\n');

async function testAPI(endpoint, description) {
  try {
    console.log(`Testing: ${description}`);
    console.log(`URL: ${BASE_API_URL}${endpoint}`);
    
    const start = Date.now();
    const response = await fetch(`${BASE_API_URL}${endpoint}`);
    const duration = Date.now() - start;
    
    console.log(`Status: ${response.status}`);
    console.log(`Duration: ${duration}ms`);
    
    if (response.ok) {
      const text = await response.text();
      console.log(`Response length: ${text.length} chars`);
      
      try {
        const data = JSON.parse(text);
        console.log(`✅ JSON parsed successfully`);
        
        if (Array.isArray(data)) {
          console.log(`Array length: ${data.length}`);
        } else if (data.items) {
          console.log(`Items count: ${data.items.length}`);
        } else if (data.dog) {
          console.log(`Has dog data: yes`);
        }
      } catch (e) {
        console.log(`⚠️  JSON parse failed: ${e.message}`);
      }
      
      if (duration > 5000) {
        console.log(`⚠️  SLOW RESPONSE (>5s)`);
      }
      
      console.log('✅ Test passed\n');
      return true;
    } else {
      console.log(`❌ HTTP error: ${response.status}\n`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}\n`);
    return false;
  }
}

async function runTests() {
  const tests = [
    { endpoint: '/indexes/dogs-index.json', description: 'Dogs index' },
    { endpoint: '/indexes/top-placement-2026.json', description: 'Top placement 2026' },
    { endpoint: '/indexes/top-score-2026.json', description: 'Top score 2026' },
    { endpoint: '/calendar/2026.json', description: 'Calendar 2026' },
    { endpoint: '/donino/speed_records.json', description: 'Donino speed records' },
    { endpoint: '/donino/coursing_records.json', description: 'Donino coursing records' },
    { endpoint: '/shows/indexes/dog-ranking-2026.json', description: 'Shows ranking 2026' },
    { endpoint: '/indexes/judges-summary.json', description: 'Judges summary' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testAPI(test.endpoint, test.description);
    if (result) passed++;
    else failed++;
  }
  
  console.log('=== Summary ===');
  console.log(`Passed: ${passed}/${tests.length}`);
  console.log(`Failed: ${failed}/${tests.length}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Some API calls failed - this might cause bot buttons to hang');
  } else {
    console.log('\n✅ All API calls successful - bot should work correctly');
  }
}

runTests().catch(console.error);