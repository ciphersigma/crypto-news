import Parser from 'rss-parser';
import { saveArticle } from './database';
import { RSS_SOURCES } from './rss-sources';
import crypto from 'crypto';
import type { RSSItem, RSSFeed } from './types';

// Create parser with custom fields
const parser = new Parser({
  customFields: {
    item: ['description', 'content', 'pubDate']
  }
}) as Parser<RSSFeed, RSSItem>;

export async function fetchAllRSSFeeds() {
  console.log('🔄 Starting RSS fetch...');
  let totalNewArticles = 0;

  for (const source of RSS_SOURCES) {
    try {
      console.log(`📡 Fetching from ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      if (!feed.items || feed.items.length === 0) {
        console.log(`⚠️ No items found in ${source.name} feed`);
        continue;
      }

      for (const item of feed.items.slice(0, 10)) { // Latest 10 articles
        if (!item.link || !item.title) {
          console.log('⚠️ Skipping item without title or link');
          continue;
        }

        const articleData = {
          title: cleanTitle(item.title),
          summary: cleanSummary(item.description || item.content || ''),
          url: item.link,
          source: source.name,
          published_at: new Date(item.pubDate || new Date()),
          category: categorizeArticle(item.title, source.category),
          content_hash: generateContentHash(item.title + item.link)
        };

        const saved = await saveArticle(articleData);
        if (saved) {
          totalNewArticles++;
          console.log(`✅ Saved: ${articleData.title.slice(0, 50)}...`);
        }
      }
    } catch (error) {
      console.error(`❌ Error fetching ${source.name}:`, error);
    }
  }

  console.log(`🎉 RSS fetch complete! Added ${totalNewArticles} new articles`);
  return totalNewArticles;
}

function cleanTitle(title: string): string {
  return title
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 500);
}

function cleanSummary(summary: string): string {
  if (!summary) return 'Click to read the full article...';
  
  return summary
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300) + (summary.length > 300 ? '...' : '');
}

function categorizeArticle(title: string, defaultCategory: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('bitcoin') || titleLower.includes('btc')) return 'bitcoin';
  if (titleLower.includes('ethereum') || titleLower.includes('eth')) return 'ethereum';
  if (titleLower.includes('defi') || titleLower.includes('decentralized')) return 'defi';
  if (titleLower.includes('nft') || titleLower.includes('collectible')) return 'nft';
  if (titleLower.includes('regulation') || titleLower.includes('legal')) return 'regulation';
  if (titleLower.includes('solana') || titleLower.includes('sol')) return 'solana';
  if (titleLower.includes('cardano') || titleLower.includes('ada')) return 'cardano';
  
  return defaultCategory;
}

function generateContentHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex');
}