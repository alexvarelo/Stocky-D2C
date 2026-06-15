import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
    Send,
    Sparkles,
    Loader2,
    MessageSquare,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    Terminal,
    Plus,
    PanelLeftClose,
    PanelLeftOpen,
    Copy,
    RotateCcw,
    Trash2,
    AlertCircle,
    CheckCircle,
    Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import stockyLogo from "@/assets/stocky.png";
import { StockCard } from "@/components/chat/visuals/StockCard";
import { StockChart } from "@/components/chat/visuals/StockChart";
import { toast } from "sonner";

interface Message {
    id: string;
    role: "user" | "assistant" | "tool";
    content: string;
    tool_name?: string;
    status?: "sending" | "sent" | "error";
    timestamp?: string;
    error?: string;
}

interface Conversation {
    id: string;
    title: string | null;
    updated_at: string | null;
}

interface StockyChatProps {
    open: boolean;
    onOpenChange: (_open: boolean) => void;
}

const PREDEFINED_PROMPTS = [
    "📊 Analyze my portfolio performance",
    "🎯 What are my top holdings?",
    "💡 Suggest portfolio diversification",
    "📈 Show market sentiment for tech stocks",
];

// Tool Response Component with improved UX
function ToolResponse({ content, toolName }: { content: string; toolName?: string }) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    let jsonContent: unknown = null;
    try {
        jsonContent = JSON.parse(content);
    } catch {
        jsonContent = content;
    }

    const handleCopy = () => {
        const text = typeof jsonContent === 'string' ? jsonContent : JSON.stringify(jsonContent, null, 2);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-100 transition-colors text-slate-600 group"
            >
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-mono font-medium">
                        {toolName || "Tool Output"}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy();
                        }}
                    >
                        {copied ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                            <Copy className="w-3 h-3" />
                        )}
                    </Button>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-4 pb-4 border-t border-slate-200">
                            <pre className="mt-2 text-[11px] font-mono leading-relaxed overflow-x-auto p-3 bg-slate-900 text-slate-100 rounded-lg">
                                {typeof jsonContent === 'string'
                                    ? jsonContent
                                    : JSON.stringify(jsonContent, null, 2)}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Message Actions Component
function MessageActions({
    message,
    onRegenerate,
    onDelete,
    isRegenerating
}: {
    message: Message;
    onRegenerate: () => void;
    onDelete: () => void;
    isRegenerating: boolean;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (message.role === "user") return null;

    return (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={handleCopy}
                title="Copy message"
            >
                {copied ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                ) : (
                    <Copy className="w-3.5 h-3.5" />
                )}
            </Button>
            {message.status !== "sending" && message.role === "assistant" && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    title="Regenerate response"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </Button>
            )}
            <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={onDelete}
                title="Delete message"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </Button>
        </div>
    );
}

export function StockyChat({ open, onOpenChange }: StockyChatProps) {
    const { user } = useAuth();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from("chat_conversations")
                .select("id, title, updated_at")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false });

            if (error) throw error;
            if (data) setConversations(data);
        } catch (err) {
            console.error("Error fetching conversations:", err);
        }
    }, [user]);

    const loadConversation = useCallback(async (id: string) => {
        if (!user) return;
        setIsLoading(true);
        try {
            setConversationId(id);
            const { data: msgs, error: msgsError } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("conversation_id", id)
                .order("created_at", { ascending: true });

            if (msgsError) throw msgsError;

            if (msgs) {
                setMessages(msgs.map(m => {
                    const toolCalls = m.tool_calls as Array<{ function?: { name?: string } }> | null;
                    return {
                        id: m.id,
                        role: m.role as "user" | "assistant" | "tool",
                        content: m.content || "",
                        tool_name: toolCalls?.[0]?.function?.name || undefined,
                        timestamp: m.created_at
                    };
                }));
            }
        } catch (err) {
            console.error("Error loading conversation:", err);
            toast.error("Failed to load conversation");
        } finally {
            setIsLoading(false);
            if (window.innerWidth < 1024) setIsHistoryOpen(false);
        }
    }, [user]);

    const loadLastConversation = useCallback(async () => {
        if (!user) return;

        try {
            const { data: convs, error: convError } = await supabase
                .from("chat_conversations")
                .select("id")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false })
                .limit(1);

            if (convError) throw convError;

            if (convs && convs.length > 0) {
                loadConversation(convs[0].id);
            }
        } catch (err) {
            console.error("Error loading chat history:", err);
        }
    }, [user, loadConversation]);

    useEffect(() => {
        if (open && user) {
            fetchConversations();
        }
    }, [open, user, fetchConversations]);

    useEffect(() => {
        if (open && user && !conversationId) {
            loadLastConversation();
        }
    }, [open, user, loadLastConversation, conversationId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    // Enhanced handleSend with error recovery
    const handleSend = useCallback(async (text: string = input, isRetry = false) => {
        if (!text.trim() || !user || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: text,
            status: "sent",
            timestamp: new Date().toISOString()
        };

        // If not a retry, add user message and clear input
        if (!isRetry) {
            setMessages((prev) => [...prev, userMessage]);
            setInput("");
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
            }
        }

        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke("stockfolio-chatbot", {
                body: {
                    message: text,
                    conversation_id: conversationId
                },
                headers: {
                    "X-Platform-Origin": window.location.origin
                }
            });

            if (error) throw error;

            if (data) {
                if (data.conversationId && !conversationId) {
                    setConversationId(data.conversationId);
                    // Refresh conversations list
                    fetchConversations();
                }

                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: data.response || "No response received.",
                    status: "sent",
                    timestamp: new Date().toISOString()
                };

                setMessages((prev) => [...prev, assistantMessage]);
                toast.success("Response received");
            }
        } catch (err) {
            console.error("Chat error:", err);

            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `Error: ${err instanceof Error ? err.message : "Unknown error occurred"}`,
                status: "error",
                error: err instanceof Error ? err.message : "Unknown error",
                timestamp: new Date().toISOString()
            };

            setMessages((prev) => [...prev, errorMessage]);
            toast.error("Failed to get response. You can retry.");
        } finally {
            setIsLoading(false);
        }
    }, [input, user, isLoading, conversationId, fetchConversations]);

    // Message regeneration
    const handleRegenerate = useCallback(async (messageId: string) => {
        const messageIdx = messages.findIndex(m => m.id === messageId);
        if (messageIdx === -1 || messageIdx === 0) return;

        // Find the user message that prompted this response
        const userMessageIdx = messageIdx - 1;
        const userMessage = messages[userMessageIdx];

        if (userMessage?.role !== "user") return;

        setRegeneratingId(messageId);

        // Remove the old assistant message
        setMessages((prev) => prev.filter(m => m.id !== messageId));

        // Resend the user message
        await handleSend(userMessage.content, true);

        setRegeneratingId(null);
    }, [messages, handleSend]);

    // Delete message
    const handleDelete = useCallback((messageId: string) => {
        setMessages((prev) => prev.filter(m => m.id !== messageId));
    }, []);

    const startNewChat = () => {
        setConversationId(null);
        setMessages([]);
        if (window.innerWidth < 1024) setIsHistoryOpen(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-4xl p-0 flex flex-col bg-white border-l border-border/50"
            >
                <SheetHeader className="p-6 border-b border-border/50 shrink-0">
                    <div className="flex items-center justify-between mx-auto w-full">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                className="h-9 w-9 text-muted-foreground mr-1"
                            >
                                {isHistoryOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                            </Button>
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center p-2">
                                <img src={stockyLogo} alt="Stocky" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                                    Stocky
                                    <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                                </SheetTitle>
                                <SheetDescription className="text-sm">Your AI Financial Partner</SheetDescription>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={startNewChat}
                            className="rounded-full gap-2 px-4 border-primary/20 text-primary hover:bg-primary/5"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-semibold">New</span>
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* History Sidebar */}
                    <AnimatePresence>
                        {isHistoryOpen && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 280, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="h-full border-r border-border/50 bg-slate-50/50 flex flex-col shrink-0"
                            >
                                <div className="p-4 flex-1 overflow-y-auto">
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 px-3 mb-2">Previous Chats</h4>
                                        {conversations.length === 0 ? (
                                            <div className="px-3 py-8 text-center text-xs text-muted-foreground italic">
                                                No history yet
                                            </div>
                                        ) : (
                                            <>
                                                {conversations.map((conv) => (
                                                    <button
                                                        key={conv.id}
                                                        onClick={() => loadConversation(conv.id)}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all group relative",
                                                            conversationId === conv.id
                                                                ? "bg-white shadow-sm ring-1 ring-border/50 font-medium text-primary"
                                                                : "hover:bg-muted/50 text-muted-foreground"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <MessageSquare className={cn("w-3.5 h-3.5 shrink-0", conversationId === conv.id ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground")} />
                                                            <span className="truncate flex-1">
                                                                {conv.title || "New Conversation"}
                                                            </span>
                                                        </div>
                                                        <div className="text-[9px] mt-1 text-muted-foreground/60 pl-5 font-normal">
                                                            {new Date(conv.updated_at || "").toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Chat Content Container */}
                    <div className="flex-1 flex flex-col min-w-0 bg-white">
                        {/* Messages Area */}
                        <ScrollArea className="flex-1 overflow-y-auto">
                            <div className="max-w-3xl mx-auto px-6 py-12">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
                                        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
                                            <MessageSquare className="w-10 h-10 text-primary/40" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-semibold">How can I assist you today?</h3>
                                            <p className="text-muted-foreground max-w-sm mx-auto">
                                                Ask me about your portfolio, market analysis, or investment strategy.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                                            {PREDEFINED_PROMPTS.map((prompt) => (
                                                <Button
                                                    key={prompt}
                                                    variant="outline"
                                                    className="justify-start h-auto py-4 px-6 text-left font-normal border-border hover:bg-muted/50 transition-all group rounded-xl"
                                                    onClick={() => handleSend(prompt)}
                                                >
                                                    <span className="flex-1">{prompt}</span>
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 pb-8">
                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={cn(
                                                    "flex w-full group",
                                                    message.role === "user" ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                <div className="flex gap-3 w-full max-w-2xl">
                                                    {message.role !== "user" && (
                                                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center p-1.5 shrink-0 mt-1">
                                                            <img src={stockyLogo} alt="Stocky" className="w-full h-full object-contain" />
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        {message.role === "user" ? (
                                                            <div className="ml-auto max-w-fit">
                                                                <div className="bg-primary text-white px-5 py-3 rounded-[24px] text-base font-medium leading-relaxed break-words">
                                                                    {message.content}
                                                                </div>
                                                            </div>
                                                        ) : message.status === "error" ? (
                                                            <div className="w-full">
                                                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                                                    <div className="flex gap-3">
                                                                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-semibold text-red-900 mb-2">Something went wrong</p>
                                                                            <p className="text-sm text-red-700 mb-3">{message.error || message.content}</p>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="border-red-200 text-red-600 hover:bg-red-50"
                                                                                onClick={() => handleRegenerate(message.id)}
                                                                                disabled={regeneratingId === message.id}
                                                                            >
                                                                                {regeneratingId === message.id ? (
                                                                                    <>
                                                                                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                                                                        Retrying...
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <RotateCcw className="w-3 h-3 mr-2" />
                                                                                        Retry
                                                                                    </>
                                                                                )}
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : message.role === "tool" ? (
                                                            <div className="w-full flex flex-col gap-2">
                                                                <ToolResponse
                                                                    content={message.content}
                                                                    toolName={message.tool_name}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full flex gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-gray-700 prose-p:leading-[1.7] prose-li:text-gray-700 prose-strong:text-foreground prose-strong:font-bold prose-code:text-foreground">
                                                                        <ReactMarkdown
                                                                            components={{
                                                                                h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4" {...props} />,
                                                                                h2: ({ ...props }) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
                                                                                h3: ({ ...props }) => <h3 className="text-lg font-bold mt-5 mb-2" {...props} />,
                                                                                p: ({ ...props }) => <p className="mb-4 text-[17px]" {...props} />,
                                                                                ul: ({ ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
                                                                                ol: ({ ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-2" {...props} />,
                                                                                li: ({ ...props }) => <li className="text-[17px]" {...props} />,
                                                                                code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
                                                                                    const match = /language-(\w+)/.exec(className || '');

                                                                                    if (!inline && match && match[1] === 'stock-card') {
                                                                                        try {
                                                                                            const data = JSON.parse(String(children).replace(/\n$/, ''));
                                                                                            return <StockCard {...data} />;
                                                                                        } catch (e) {
                                                                                            console.error('Failed to parse stock card data', e);
                                                                                        }
                                                                                    }

                                                                                    if (!inline && match && match[1] === 'stock-chart') {
                                                                                        try {
                                                                                            const data = JSON.parse(String(children).replace(/\n$/, ''));
                                                                                            return <StockChart {...data} />;
                                                                                        } catch (e) {
                                                                                            console.error('Failed to parse stock chart data', e);
                                                                                        }
                                                                                    }

                                                                                    return inline ? (
                                                                                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                                                                            {children}
                                                                                        </code>
                                                                                    ) : (
                                                                                        <pre className="bg-slate-900 text-slate-100 p-6 rounded-2xl overflow-x-auto my-6 overflow-wrap-anywhere whitespace-pre-wrap font-mono text-sm leading-relaxed border border-slate-800 shadow-sm">
                                                                                            <code className={className} {...props}>
                                                                                                {children}
                                                                                            </code>
                                                                                        </pre>
                                                                                    );
                                                                                },
                                                                                blockquote: ({ ...props }) => <blockquote className="border-l-4 border-primary/20 pl-4 italic my-6 text-muted-foreground" {...props} />,
                                                                                hr: ({ ...props }) => <hr className="my-8 border-border/50" {...props} />,
                                                                                a: ({ ...props }) => <a className="text-blue-600 hover:text-blue-800 underline transition-colors" {...props} />,
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
                                                                    </div>
                                                                    {message.timestamp && (
                                                                        <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground/60">
                                                                            <Clock className="w-3 h-3" />
                                                                            {new Date(message.timestamp).toLocaleTimeString()}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <MessageActions
                                                                    message={message}
                                                                    onRegenerate={() => handleRegenerate(message.id)}
                                                                    onDelete={() => handleDelete(message.id)}
                                                                    isRegenerating={regeneratingId === message.id}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {isLoading && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex gap-4 pt-4"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center p-1.5 shrink-0">
                                                    <img src={stockyLogo} alt="Stocky" className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                                                        <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                                                        <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground font-medium">Thinking...</span>
                                                </div>
                                            </motion.div>
                                        )}
                                        <div ref={scrollRef} />
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t border-border/50 shrink-0 bg-white shadow-sm">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex gap-3 max-w-4xl mx-auto items-end px-2"
                            >
                                <div className="flex-1 relative bg-muted/30 rounded-2xl border border-border/40 transition-all focus-within:border-primary/20 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/5">
                                    <textarea
                                        ref={inputRef}
                                        placeholder="Ask Stocky anything..."
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            e.target.style.height = 'inherit';
                                            e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        disabled={isLoading}
                                        className="w-full bg-transparent border-none focus:ring-0 text-base px-5 py-[1.125rem] min-h-[56px] resize-none max-h-[200px]"
                                        rows={1}
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isLoading || !input.trim()}
                                    className="h-14 w-14 rounded-2xl shrink-0 shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <Send className="w-6 h-6" />
                                    )}
                                </Button>
                            </form>
                            <div className="max-w-4xl mx-auto mt-4 px-6 flex justify-between items-center text-[10px] text-muted-foreground/60 font-medium">
                                <span>AI response for informational purposes only.</span>
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Stocky v2</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
