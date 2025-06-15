// Load environment variables
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

console.log('🚀 Starting database test...');

// Check if DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found!');
  console.log('Create .env.local file with:');
  console.log('DATABASE_URL=your_supabase_connection_string');
  process.exit(1);
}

console.log('✅ DATABASE_URL found');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testDatabase() {
  try {
    // Test basic connection
    console.log('🔌 Testing connection...');
    const result = await pool.query('SELECT NOW() as time, version() as version');
    console.log('✅ Connected successfully!');
    console.log('Server time:', result.rows[0].time);
    
    // Check if articles table exists
    console.log('📋 Checking articles table...');
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'articles'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Articles table missing!');
      console.log('Go to Supabase SQL Editor and run:');
      console.log(`
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  summary TEXT,
  url VARCHAR(1000) UNIQUE NOT NULL,
  source VARCHAR(100),
  published_at TIMESTAMP,
  category VARCHAR(50) DEFAULT 'general',
  content_hash VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW()
);
      `);
      await pool.end();
      return;
    }
    
    console.log('✅ Articles table exists');
    
    // Count articles
    const count = await pool.query('SELECT COUNT(*) as total FROM articles');
    console.log(`📰 Total articles: ${count.rows[0].total}`);
    
    if (count.rows[0].total === '0') {
      console.log('⚠️  No articles found. Adding test data...');
      
      await pool.query(`
        INSERT INTO articles (title, summary, url, source, published_at, category) VALUES
        ('Bitcoin Hits $100K', 'Bitcoin reaches new milestone', 'https://example.com/btc1', 'CoinDesk', NOW(), 'bitcoin'),
        ('Ethereum Upgrade Success', 'Latest upgrade improves performance', 'https://example.com/eth1', 'CoinTelegraph', NOW(), 'ethereum'),
        ('DeFi TVL Grows', 'Total value locked increases', 'https://example.com/defi1', 'The Block', NOW(), 'defi')
      `);
      
      console.log('✅ Test articles added!');
    }
    
    // Show recent articles
    const articles = await pool.query('SELECT title, source, published_at FROM articles ORDER BY published_at DESC LIMIT 3');
    console.log('📋 Recent articles:');
    articles.rows.forEach((article, i) => {
      console.log(`  ${i + 1}. ${article.title} (${article.source})`);
    });
    
    await pool.end();
    console.log('🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('💥 Database test failed:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('💡 Check your Supabase password in DATABASE_URL');
    } else if (error.message.includes('connect')) {
      console.log('💡 Check your Supabase project URL and ensure it\'s running');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testDatabase();