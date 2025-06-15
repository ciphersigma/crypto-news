import { NextResponse } from 'next/server';
import { getLatestArticles } from '../../../../lib/database';

export async function GET() {
  try {
    console.log('📰 API: Fetching articles from database...');
    
    const articles = await getLatestArticles(12);
    console.log(`📊 API: Found ${articles.length} articles in database`);
    
    return NextResponse.json({ 
      success: true,
      articles: articles,
      count: articles.length
    });
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch articles',
        articles: []
      },
      { status: 500 }
    );
  }
}