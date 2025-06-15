import { Pool } from 'pg';
import type { Article } from './types';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function getLatestArticles(limit = 20): Promise<Article[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM articles ORDER BY published_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getArticlesByCategory(category: string, limit = 20): Promise<Article[]> {
  try {
    const result = await pool.query(
      'SELECT * FROM articles WHERE category = $1 ORDER BY published_at DESC LIMIT $2',
      [category, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return [];
  }
}

export async function saveArticle(article: Omit<Article, 'id' | 'created_at'>): Promise<boolean> {
  try {
    const result = await pool.query(
      `INSERT INTO articles (title, summary, url, source, published_at, category, content_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (url) DO NOTHING
       RETURNING id`,
      [
        article.title,
        article.summary,
        article.url,
        article.source,
        article.published_at,
        article.category,
        article.content_hash
      ]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error saving article:', error);
    return false;
  }
}

export async function searchArticles(query: string, limit = 20): Promise<Article[]> {
  try {
    const result = await pool.query(
      `SELECT * FROM articles 
       WHERE title ILIKE $1 OR summary ILIKE $1 
       ORDER BY published_at DESC LIMIT $2`,
      [`%${query}%`, limit]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching articles:', error);
    return [];
  }
}