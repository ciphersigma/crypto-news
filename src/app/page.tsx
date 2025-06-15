'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const BlockchainHero = dynamic(() => import('../../components/BlockchainHero'), {
  ssr: false,
  loading: () => (
    <div className="hero-container">
      <div className="hero-content">
        <div className="hero-main">
          <div className="hero-inner">
            <div className="loading-text">Loading 3D Experience...</div>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    </div>
  )
});

interface Article {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  published_at: string;
  category: string;
  created_at: string;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchArticles, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch fresh RSS data first
      try {
        console.log('🔄 Fetching fresh RSS data...');
        const rssResponse = await fetch('/api/fetch-rss', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (rssResponse.ok) {
          const rssData = await rssResponse.json();
          console.log('✅ RSS fetch result:', rssData);
        }
      } catch (rssError) {
        console.log('⚠️ RSS fetch failed, using existing data:', rssError);
      }
      
      // Get articles from database
      console.log('📰 Fetching articles from database...');
      const response = await fetch('/api/articles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Articles API response:', data);
      
      if (data.success && Array.isArray(data.articles)) {
        setArticles(data.articles);
        setLastFetch(new Date());
        console.log(`✅ Loaded ${data.articles.length} articles`);
      } else {
        throw new Error('Invalid response format from articles API');
      }
      
    } catch (fetchError) {
      console.error('❌ Error fetching articles:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch articles');
      
      // If no articles loaded yet, show empty state
      if (articles.length === 0) {
        setArticles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchArticles();
  };

  const handleFetchRSS = async () => {
    try {
      setLoading(true);
      console.log('🔄 Manual RSS fetch triggered...');
      
      const response = await fetch('/api/fetch-rss', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('📡 RSS fetch result:', data);
      
      if (data.success) {
        // After RSS fetch, refresh articles
        await fetchArticles();
      } else {
        setError('RSS fetch failed: ' + data.error);
      }
    } catch (rssError) {
      console.error('❌ RSS fetch error:', rssError);
      setError('Failed to fetch RSS feeds');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BlockchainHero />
      
      {/* Articles Section */}
      <section className="page-section dark">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-4">
            <h2 className="section-title mb-0">
              Latest <span className="section-title-accent">Crypto News</span>
            </h2>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {lastFetch && (
                <span className="update-time">
                  Last updated: {lastFetch.toLocaleTimeString()}
                </span>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className={`refresh-btn ${loading ? 'btn-disabled' : ''}`}
                  title="Refresh articles from database"
                >
                  <span>{loading ? '🔄' : '🔄'}</span>
                  Refresh
                </button>
                
                <button
                  onClick={handleFetchRSS}
                  disabled={loading}
                  className={`refresh-btn ${loading ? 'btn-disabled' : ''}`}
                  title="Fetch latest news from RSS feeds"
                >
                  <span>📡</span>
                  Fetch RSS
                </button>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-8">
              <div className="text-red-400 font-medium">⚠️ Error</div>
              <div className="text-red-300 text-sm mt-1">{error}</div>
              <button 
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 text-sm mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Loading State */}
          {loading && articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="loading-text">📡 Fetching latest crypto news...</div>
              <div className="loading-spinner mx-auto mt-4"></div>
              <p className="text-gray-400 text-sm mt-4">
                This may take a moment while we gather the latest articles
              </p>
            </div>
          ) : articles.length > 0 ? (
            <>
              {/* Articles Grid */}
              <div className="articles-grid">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              
              {/* Load More Button */}
              {articles.length >= 12 && (
                <div className="text-center mt-12">
                  <button 
                    onClick={handleRefresh}
                    className="refresh-btn"
                    disabled={loading}
                  >
                    Load More Articles
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Articles Found</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                It looks like we don&apos;t have any articles yet. Try fetching the latest news from RSS feeds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleFetchRSS}
                  className="refresh-btn"
                  disabled={loading}
                >
                  <span>📡</span>
                  Fetch RSS Feeds
                </button>
                <button
                  onClick={handleRefresh}
                  className="refresh-btn"
                  disabled={loading}
                >
                  <span>🔄</span>
                  Check Database
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Live Stats */}
      <section className="page-section darker">
        <div className="section-container">
          <div className="stats-grid">
            <div className="hero-stat-card">
              <div className="hero-stat-number blue">
                {articles.length}
              </div>
              <div className="hero-stat-label">Live Articles</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number cyan">
                {new Set(articles.map(a => a.source)).size || 0}
              </div>
              <div className="hero-stat-label">News Sources</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number teal">
                {lastFetch ? '🟢' : '🔴'}
              </div>
              <div className="hero-stat-label">
                {lastFetch ? 'Live' : 'Offline'}
              </div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-number green">AI</div>
              <div className="hero-stat-label">Powered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-title">
            CryptoNews<span className="section-title-accent">3D</span>
          </div>
          <p className="footer-description">
            Real-time cryptocurrency news aggregation with AI-powered insights
          </p>
          <div className="footer-links">
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Contact</a>
            <a href="#" onClick={(e) => e.preventDefault()}>API</a>
          </div>
        </div>
      </footer>
    </>
  );
}

// Article Card Component
function ArticleCard({ article }: { article: Article }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryClass = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('bitcoin') || categoryLower.includes('btc')) return 'bitcoin';
    if (categoryLower.includes('ethereum') || categoryLower.includes('eth')) return 'ethereum';
    if (categoryLower.includes('defi') || categoryLower.includes('decentralized')) return 'defi';
    if (categoryLower.includes('nft') || categoryLower.includes('collectible')) return 'nft';
    return 'general';
  };

  const truncateTitle = (title: string, maxLength: number = 80) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + '...';
  };

  return (
    <article className="article-card">
      {/* Header */}
      <div className="article-header">
        <span className="article-source">{article.source}</span>
        <span className="article-date">
          {formatDate(article.published_at)}
        </span>
      </div>
      
      {/* Title */}
      <h3 className="article-title">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          title={article.title}
        >
          {truncateTitle(article.title)}
        </a>
      </h3>
      
      {/* Summary */}
      <p className="article-summary line-clamp-3">
        {article.summary || 'Click to read the full article for more details...'}
      </p>
      
      {/* Footer */}
      <div className="article-footer">
        <span className={`article-category ${getCategoryClass(article.category)}`}>
          {article.category.toUpperCase()}
        </span>
        
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="article-link"
        >
          Read More 
          <span className="article-link-arrow">→</span>
        </a>
      </div>
    </article>
  );
}