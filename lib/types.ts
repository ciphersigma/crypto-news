export interface Article {
  id: number;
  title: string;
  summary: string | null;
  url: string;
  source: string;
  published_at: Date;
  category: string;
  content_hash?: string | null;
  created_at: Date;
}

export interface RSSSource {
  name: string;
  url: string;
  category: string;
}

export interface RSSItem {
  title?: string;
  link?: string;
  description?: string;
  content?: string;
  pubDate?: string;
  guid?: string;
  author?: string;
}

export interface RSSFeed {
  title?: string;
  description?: string;
  link?: string;
  items: RSSItem[];
}