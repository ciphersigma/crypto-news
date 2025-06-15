import { NextRequest, NextResponse } from 'next/server';
import { fetchAllRSSFeeds } from '../../../../lib/rss-processor';

export async function POST(request: NextRequest) {
  try {
    const newArticles = await fetchAllRSSFeeds();
    
    return NextResponse.json({ 
      success: true, 
      message: `Fetched ${newArticles} new articles`,
      newArticles 
    });
  } catch (error) {
    console.error('RSS fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch RSS feeds' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'RSS fetcher ready. Use POST to fetch feeds.' 
  });
}