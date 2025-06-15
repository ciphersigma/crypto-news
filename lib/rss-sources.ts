export interface RSSSource {
  name: string;
  url: string;
  category: string;
}

export const RSS_SOURCES: RSSSource[] = [
  {
    name: 'CoinDesk',
    url: 'https://feeds.feedburner.com/CoinDesk',
    category: 'general'
  },
  {
    name: 'CoinTelegraph',
    url: 'https://cointelegraph.com/rss',
    category: 'general'
  },
  {
    name: 'The Block',
    url: 'https://www.theblockcrypto.com/rss.xml',
    category: 'general'
  },
  {
    name: 'Decrypt',
    url: 'https://decrypt.co/feed',
    category: 'general'
  },
  {
    name: 'Bitcoin Magazine',
    url: 'https://bitcoinmagazine.com/feed',
    category: 'bitcoin'
  }
];