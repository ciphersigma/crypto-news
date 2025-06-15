import { NextResponse } from 'next/server';
import { fetchAllRSSFeeds } from '../../../../lib/rss-processor';

export async function POST() {
  try {
    console.log('📡 API: RSS fetch requested...');
    
    const result = await fetchAllRSSFeeds();
    
    return NextResponse.json({ 
      success: true, 
      message: `RSS fetch completed! Added ${result.newArticles} new articles from ${result.sources} sources`,
      newArticles: result.newArticles,
      errors: result.errors,
      sources: result.sources
    });
  } catch (error) {
    console.error('❌ RSS API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch RSS feeds',
        newArticles: 0
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'RSS fetcher ready. Use POST to fetch feeds.',
    status: 'ready',
    sources: 5
  });
}