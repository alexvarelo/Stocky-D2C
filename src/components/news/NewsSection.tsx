import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NewsArticle } from "@/api/financialDataApi.schemas";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

// Helper function to get the thumbnail URL
const getThumbnailUrl = (thumbnail: NewsArticle['thumbnail']): string | null => {
  if (!thumbnail) return null;
  if (typeof thumbnail === 'string') return thumbnail;
  
  // Handle the case where thumbnail is an object with resolutions
  const thumbnailObj = thumbnail as any; // Type assertion to access dynamic properties
  if (Array.isArray(thumbnailObj?.resolutions) && thumbnailObj.resolutions.length > 0) {
    return thumbnailObj.resolutions[0]?.url || null;
  }
  
  // Try to find any URL property in the thumbnail object
  for (const key in thumbnailObj) {
    if (typeof thumbnailObj[key] === 'string' && thumbnailObj[key].startsWith('http')) {
      return thumbnailObj[key];
    }
  }
  
  return null;
};

interface NewsSectionProps {
  news: NewsArticle[] | undefined;
  ticker: string;
  companyName?: string;
  isLoading?: boolean;
}

export function NewsSection({ news, ticker, companyName, isLoading = false }: NewsSectionProps) {
  // Sort news by published_at in descending order (newest first)
  const sortedNews = news
    ? [...news].sort((a, b) => {
        const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return dateB - dateA;
      })
    : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex gap-4">
                <Skeleton className="h-20 w-20 flex-shrink-0 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest News</CardTitle>
        <CardDescription>
          Recent news articles related to {companyName || ticker}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedNews.length > 0 ? (
          <div className="space-y-6">
            {sortedNews.map((article, index) => (
              <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex flex-col sm:flex-row gap-4">
                  {(() => {
                    const thumbnailUrl = getThumbnailUrl(article.thumbnail);
                    return thumbnailUrl ? (
                      <div className="w-full sm:w-40 h-40 flex-shrink-0 overflow-hidden rounded-md">
                        <a 
                          href={article.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block h-full"
                        >
                          <img
                            src={thumbnailUrl}
                            alt={article.title}
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              // Fallback to a placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                              target.alt = 'News thumbnail';
                            }}
                          />
                        </a>
                      </div>
                    ) : null;
                  })()}
                  <div className="flex-1">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-1">
                          <a 
                            href={article.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline flex items-start"
                          >
                            {article.title}
                            <ExternalLink className="ml-1 h-4 w-4 flex-shrink-0 mt-1" />
                          </a>
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                          {article.published_at && (
                            <span>
                              {new Date(article.published_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                          {article.publisher && (
                            <span>• {article.publisher}</span>
                          )}
                        </div>
                        {article.related_tickers && article.related_tickers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {article.related_tickers.map((ticker, i) => (
                              <span 
                                key={i} 
                                className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground inline-flex items-center gap-1"
                              >
                                <CompanyLogo ticker={ticker} size={14} />
                                {ticker}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No recent news available for {companyName || ticker}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
