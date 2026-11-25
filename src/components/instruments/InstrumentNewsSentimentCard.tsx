import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Newspaper, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getLocale } from "@/lib/locale";

interface InstrumentNewsSentimentCardProps {
    ticker: string;
}

interface Article {
    source: {
        id: string | null;
        name: string;
    };
    author: string | null;
    title: string;
    description: string;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string;
}

interface NewsSentimentResponse {
    sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
    narrative: string;
    key_topics: string[];
    article_count: number;
    raw_articles: Article[];
}

export const InstrumentNewsSentimentCard = ({ ticker }: InstrumentNewsSentimentCardProps) => {
    const [showArticles, setShowArticles] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const { data, isLoading, error } = useQuery({
        queryKey: ["news-sentiment", ticker],
        queryFn: async () => {
            const { data, error } = await supabase.functions.invoke("analyze-ticker-news", {
                body: {
                    ticker,
                    limit: 20 // Request more articles if supported
                },
            });

            if (error) throw error;
            return data as NewsSentimentResponse;
        },
        retry: 1,
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>News Sentiment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return null;
    }

    // Sort articles by date descending
    const sortedArticles = data.raw_articles?.slice().sort((a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    ) || [];

    const getSentimentConfig = (sentiment: string) => {
        switch (sentiment) {
            case "BULLISH":
                return {
                    color: "text-green-600 dark:text-green-400",
                    bg: "bg-green-100 dark:bg-green-900/30",
                    icon: TrendingUp,
                    label: "Bullish",
                };
            case "BEARISH":
                return {
                    color: "text-red-600 dark:text-red-400",
                    bg: "bg-red-100 dark:bg-red-900/30",
                    icon: TrendingDown,
                    label: "Bearish",
                };
            default:
                return {
                    color: "text-slate-600 dark:text-slate-400",
                    bg: "bg-slate-100 dark:bg-slate-800",
                    icon: Minus,
                    label: "Neutral",
                };
        }
    };

    const config = getSentimentConfig(data.sentiment);
    const Icon = config.icon;

    return (
        <div className="relative group overflow-hidden rounded-xl p-[1px]">
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <Card className="relative h-full w-full overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/90 shadow-sm rounded-xl">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Newspaper className="h-5 w-5 text-purple-400" />
                            News Sentiment
                        </CardTitle>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
                            <Icon className="h-4 w-4" />
                            {config.label}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {data.narrative}
                    </p>

                    {data.key_topics && data.key_topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {data.key_topics.map((topic) => (
                                <Badge key={topic} variant="secondary" className="text-xs font-normal">
                                    {topic}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <div className="pt-2 border-t space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Source: News API</span>
                            <div className="flex items-center gap-2">
                                <span>Based on {data.article_count} articles</span>
                                {sortedArticles.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2 text-xs"
                                        onClick={() => setShowArticles(!showArticles)}
                                    >
                                        {showArticles ? "Hide Articles" : "Show Articles"}
                                        {showArticles ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {showArticles && sortedArticles.length > 0 && (
                            <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                {sortedArticles.map((article, index) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedArticle(article)}
                                        className="block group cursor-pointer"
                                    >
                                        <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-xs border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-colors flex gap-3 items-start">
                                            <Avatar className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-700 flex-shrink-0">
                                                <AvatarImage src={article.urlToImage || undefined} alt={article.source.name} className="object-cover" />
                                                <AvatarFallback className="text-[10px]">{article.source.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-blue-500 transition-colors mb-1">
                                                    {article.title}
                                                </h4>
                                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                                    <span className="truncate mr-2">{article.source.name}</span>
                                                    <span className="flex-shrink-0">{new Date(article.publishedAt).toLocaleDateString(getLocale())}</span>
                                                </div>
                                            </div>
                                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-4 border-b flex-shrink-0 flex flex-row items-center justify-between space-y-0">
                        <DialogTitle className="line-clamp-1 mr-4 text-base">
                            {selectedArticle?.title}
                        </DialogTitle>
                        {selectedArticle && (
                            <Button variant="ghost" size="icon" onClick={() => setSelectedArticle(null)}>
                                <span className="sr-only">Close</span>
                            </Button>
                        )}
                    </DialogHeader>
                    <div className="flex-1 w-full bg-white dark:bg-slate-950 overflow-y-auto">
                        {selectedArticle && (
                            <div className="max-w-3xl mx-auto p-6 space-y-6">
                                {selectedArticle.urlToImage && (
                                    <div className="rounded-xl overflow-hidden shadow-sm aspect-video w-full relative">
                                        <img
                                            src={selectedArticle.urlToImage}
                                            alt={selectedArticle.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 leading-tight">
                                        {selectedArticle.title}
                                    </h1>

                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={selectedArticle.urlToImage || undefined} />
                                                <AvatarFallback>{selectedArticle.source.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                {selectedArticle.source.name}
                                            </span>
                                        </div>
                                        <span>•</span>
                                        <span>{new Date(selectedArticle.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                                        {selectedArticle.author && (
                                            <>
                                                <span>•</span>
                                                <span>By {selectedArticle.author}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                        <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                                            {selectedArticle.description}
                                        </p>
                                        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                                            {selectedArticle.content?.replace(/\[\+\d+ chars\]$/, '')}
                                        </p>
                                    </div>

                                    <div className="pt-8 flex justify-center">
                                        <a
                                            href={selectedArticle.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={buttonVariants({ size: "lg", className: "gap-2 px-8" })}
                                        >
                                            Read Full Article at {selectedArticle.source.name}
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
