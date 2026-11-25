import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIcon, User, ArrowRight } from 'lucide-react';
import { format } from '@/lib/dateFormat';
import { Link } from 'react-router-dom';
import type { Article } from '@/api/articles/useArticles';

interface ArticleCardProps {
  article: Article;
  className?: string;
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  const getTypeVariant = (type: Article['article_type']) => {
    switch (type) {
      case 'TICKER_ANALYSIS': return 'default';
      case 'NEWS_SUMMARY': return 'secondary';
      case 'MARKET_OVERVIEW': return 'outline';
      default: return 'default';
    }
  };

  const formattedDate = format(new Date(article.created_at), 'MMM d, yyyy');
  const typeVariant = getTypeVariant(article.article_type);

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <Badge variant={typeVariant} className="capitalize">
            {article.article_type.toLowerCase().replace('_', ' ')}
          </Badge>
          {article.is_premium && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Premium
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg leading-tight mt-2">
          <Link to={`/article/${article.id}`} className="hover:underline">
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        {article.summary && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {article.summary}
          </p>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <div className="w-full">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{article.author || 'Unknown'}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          <Link to={`/article/${article.id}`} className="block w-full">
            <Button variant="outline" className="w-full flex items-center justify-center">
              Read more
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
