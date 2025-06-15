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
  summary: string;
  url: string;
  source: string;
  published_at: string;
  category: string;
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Fetch articles on component mount
  useEffect(() => {
    fetchArticles();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchArticles, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from RSS first
      try {
        await fetch('/api/fetch-rss', { method: 'POST' });
      } catch (error) {
        console.log('RSS fetch failed, using existing data');
      }
      
      // Get articles from database
      const response = await fetch('/api/articles');
      const data = await response.json();
      
      if (data.success && data.articles) {
        setArticles(data.articles);
      }
      setLastFetch(new Date());
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchArticles();
  };

  return (
    <>
      {/* Your awesome 3D Hero */}
      <BlockchainHero />
      
      {/* Articles Section */}
      <section className="page-section dark">
        <div className="section-container">
          <div className="flex justify-between items-center mb-12">
            <h2 className="section-title">
              Latest <span className="section-title-accent">Crypto News</span>
            </h2>
            
            <div className="flex items-center gap-4">
              {lastFetch && (
                <span className="update-time">
                  Updated: {lastFetch.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className={`refresh-btn ${loading ? 'btn-disabled' : ''}`}
              >
                <span>{loading ? '🔄' : '🔄'}</span>
                Refresh
              </button>
            </div>
          </div>
          
          {loading && articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="loading-text">📡 Fetching latest news...</div>
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="articles-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
          
          {articles.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="loading-text">No articles found</p>
              <button
                onClick={handleRefresh}
                className="refresh-btn mt-4"
              >
                Fetch News
              </button>
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
                {new Set(articles.map(a => a.source)).size}
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
              <div className="hero-stat-label">Summaries</div>
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
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
            <a href="#">API</a>
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
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getCategoryClass = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('bitcoin')) return 'bitcoin';
    if (categoryLower.includes('ethereum')) return 'ethereum';
    if (categoryLower.includes('defi')) return 'defi';
    if (categoryLower.includes('nft')) return 'nft';
    return 'general';
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
        >
          {article.title}
        </a>
      </h3>
      
      {/* Summary */}
      <p className="article-summary line-clamp-3">
        {article.summary || 'Click to read the full article...'}
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