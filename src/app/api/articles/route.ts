import { NextResponse } from 'next/server';
import { getLatestArticles } from '../../../../lib/database';

export async function GET() {
  try {
    const articles = await getLatestArticles(12);
    
    return NextResponse.json({ 
      success: true,
      articles: articles,
      count: articles.length
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}