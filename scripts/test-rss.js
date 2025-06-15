require('dotenv').config({ path: '.env.local' });

async function testRSSFetch() {
  console.log('🧪 Testing RSS fetch...');
  
  try {
    const response = await fetch('http://localhost:3000/api/fetch-rss', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ RSS Fetch Result:', data);
    
    if (data.newArticles > 0) {
      console.log(`🎉 Successfully fetched ${data.newArticles} new articles!`);
    } else {
      console.log('ℹ️ No new articles found (might be duplicates)');
    }
    
  } catch (error) {
    console.error('❌ RSS fetch failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Make sure your Next.js server is running (npm run dev)');
    }
  }
}

// Only run if this script is called directly
if (require.main === module) {
  testRSSFetch();
}

module.exports = { testRSSFetch };