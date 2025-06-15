interface ArticleCardProps {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
}

export default function ArticleCard({ title, summary, source, publishedAt, url }: ArticleCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
      <div className="flex justify-between items-start mb-3">
        <span className="text-blue-400 text-sm font-medium">{source}</span>
        <span className="text-gray-400 text-sm">{publishedAt}</span>
      </div>
      
      <h3 className="text-white text-xl font-bold mb-3 leading-tight hover:text-blue-400 transition-colors">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </h3>
      
      <p className="text-gray-300 leading-relaxed">
        {summary}
      </p>
      
      <div className="mt-4 flex justify-between items-center">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
        >
          Read More →
        </a>
      </div>
    </div>
  );
}