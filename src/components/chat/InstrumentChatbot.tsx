import { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { StockCard } from "@/components/chat/visuals/StockCard";
import { StockChart } from "@/components/chat/visuals/StockChart";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InstrumentChatbotProps {
  ticker: string;
  isOpen: boolean;
  onClose: () => void;
  portfolios: Array<{ id: string; name: string }>;
}

export function InstrumentChatbot({ ticker, isOpen, portfolios }: InstrumentChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your AI assistant for ${ticker}. Ask me anything about this stock or request actions like adding it to your portfolio.`,
          timestamp: new Date(),
        },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, ticker]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get the current session
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('https://tonbljcxqunrriecgpup.supabase.co/functions/v1/TickerChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: input,
          ticker,
          ...(selectedPortfolio && { portfolioId: selectedPortfolio }),
          history: messages
            .filter((m) => m.role === 'assistant' || m.role === 'user')
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to get response from AI');
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response || "I'm sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <ScrollArea className="flex-1 overflow-y-auto w-full">
        <div className="w-full px-6 py-4">
          <div className="max-w-6xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'w-full',
                  message.role === 'user' ? 'flex justify-end' : 'block',
                  'px-2'
                )}
              >
                <div className={cn(
                  message.role === 'user' ? 'flex justify-end' : 'w-full',
                  message.role === 'user' ? 'max-w-4xl' : 'max-w-5xl',
                  message.role === 'user' && 'ml-auto'
                )}>
                  <div className={cn(
                    'prose dark:prose-invert prose-sm',
                    'break-words',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 inline-flex max-w-full'
                      : 'text-foreground w-full',
                    message.role !== 'user' && 'prose-p:my-2 prose-li:my-1',
                  )}>
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          a: ({ ...props }) => (
                            <a
                              {...props}
                              className="text-blue-500 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                          code: ({ className, children, ...props }) => {
                            // [\w-] so hyphenated languages like stock-chart match
                            const match = /language-([\w-]+)/.exec(className || '');

                            if (match && match[1] === 'stock-card') {
                              try {
                                const data = JSON.parse(String(children).replace(/\n$/, ''));
                                return <StockCard {...data} />;
                              } catch (e) {
                                console.error('Failed to parse stock card data', e);
                              }
                            }

                            if (match && match[1] === 'stock-chart') {
                              try {
                                const data = JSON.parse(String(children).replace(/\n$/, ''));
                                return <StockChart {...data} />;
                              } catch (e) {
                                console.error('Failed to parse stock chart data', e);
                              }
                            }

                            return match ? (
                              <div className="my-3 rounded-md overflow-hidden">
                                <pre className="p-4 bg-gray-900 text-sm overflow-x-auto">
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                </pre>
                              </div>
                            ) : (
                              <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                {children}
                              </code>
                            );
                          },
                          ul: ({ ...props }) => (
                            <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
                          ),
                          ol: ({ ...props }) => (
                            <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
                          ),
                          blockquote: ({ ...props }) => (
                            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-3 text-gray-600 dark:text-gray-400" {...props} />
                          ),
                          p: ({ ...props }) => (
                            <p className="my-3 leading-relaxed" {...props} />
                          ),
                          h1: ({ ...props }) => (
                            <h1 className="text-2xl font-bold my-4" {...props} />
                          ),
                          h2: ({ ...props }) => (
                            <h2 className="text-xl font-semibold my-3" {...props} />
                          ),
                          h3: ({ ...props }) => (
                            <h3 className="text-lg font-medium my-3" {...props} />
                          ),
                          table: ({ ...props }) => (
                            <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 my-6 shadow-sm">
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300" {...props} />
                              </div>
                            </div>
                          ),
                          thead: ({ ...props }) => <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50" {...props} />,
                          tbody: ({ ...props }) => <tbody className="divide-y divide-slate-200 dark:divide-slate-800" {...props} />,
                          th: ({ ...props }) => <th className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap" {...props} />,
                          td: ({ ...props }) => <td className="px-4 py-3" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                  <div className={cn(
                    'text-xs text-muted-foreground mt-1',
                    message.role === 'user' ? 'text-right' : 'text-left'
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="sticky bottom-0">
        <div className="w-full px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="relative flex flex-col gap-3">
              {portfolios.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPortfolio}
                    onChange={(e) => setSelectedPortfolio(e.target.value)}
                    className="text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select portfolio</option>
                    {portfolios.map((portfolio) => (
                      <option key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedPortfolio ? 'Will be used for portfolio actions' : 'Select a portfolio for actions'}
                  </div>
                </div>
              )}
              <form
                onSubmit={handleSendMessage}
                className="relative flex items-center w-full rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Message Stocky AI about ${ticker}...`}
                  className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "absolute right-2 p-1.5 rounded-md",
                    !input.trim() || isLoading
                      ? "text-gray-400 dark:text-gray-600"
                      : "text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700"
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                </button>
              </form>
              <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                Stocky AI can make mistakes. Consider checking important information.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
