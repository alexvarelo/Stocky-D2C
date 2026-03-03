import { format } from "date-fns";
import { CalendarIcon, User, Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Article } from "@/api/articles/useArticles";
import { TypingAnimation } from "../ui/typing-animation";
import { CompanyLogo } from "@/components/stock/CompanyLogo";

interface ArticleContentProps {
  article: Article;
}

interface ContentSection {
  title: string;
  content: string;
}

export function ArticleContent({ article }: ArticleContentProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const getReadTime = (content: any) => {
    // Calculate read time based on word count (average reading speed: 200 words per minute)
    const wordCount = JSON.stringify(content).split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    return `${minutes} min read`;
  };

  return (
    <article className="prose prose-lg max-w-none dark:prose-invert">
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-sm font-normal">
            {article.article_type.replace("_", " ")}
          </Badge>
          {article.is_premium && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 text-sm"
            >
              Premium
            </Badge>
          )}
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl mb-6">
          {article.title}
        </h1>

        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{article.author || "Unknown Author"}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <time dateTime={article.created_at}>
              {formatDate(article.created_at)}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{getReadTime(article.content)}</span>
          </div>
        </div>

        {article.summary && (
          <div className="relative bg-muted/30 dark:bg-muted/10 p-6 rounded-xl mb-10 border border-border/50 dark:border-border/30 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/70 rounded-l-full"></div>
            <div className="pl-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h.01a1 1 0 100-2H10V9.9a1 1 0 10-1 0V10z" clipRule="evenodd" />
                </svg>
                <h3 className="text-base font-semibold text-foreground">
                  Key Takeaways
                </h3>
              </div>
              <TypingAnimation 
                typeSpeed={20}
                deleteSpeed={10}
                pauseDelay={300}
                cursorStyle="block"
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {article.summary}
              </TypingAnimation>
            </div>
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none dark:prose-invert">
        {article.content.sections?.map((section, index) => (
          <section key={index} className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {section.title}
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-6">
                {section.content}
              </p>
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-12 pt-8 border-t border-border">
        {article.tickers && article.tickers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Related Tickers</h3>
            <div className="flex flex-wrap gap-2">
              {article.tickers.map((ticker) => (
                <Badge
                  key={ticker}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 inline-flex items-center gap-1"
                >
                  <CompanyLogo ticker={ticker} size={14} />
                  ${ticker}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="px-3 py-1 rounded-full"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {article.view_count.toLocaleString()} views
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </footer>
    </article>
  );
}
