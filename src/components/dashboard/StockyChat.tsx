import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
    Loader2,
    Plus,
    PanelLeftClose,
    Copy,
    RotateCcw,
    Trash2,
    AlertCircle,
    CheckCircle,
    Wrench,
    ArrowUpRight,
    History,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { StockyLogo } from "@/components/brand/StockyLogo";
import { useTheme } from "@/contexts/ThemeContext";
import { StockCard } from "@/components/chat/visuals/StockCard";
import { StockChart } from "@/components/chat/visuals/StockChart";
import { VoiceInputButton } from "@/components/chat/VoiceInputButton";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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

interface ChartSeries {
    currency?: string;
    data: Array<{ date: string; price: number }>;
}

interface QuoteData {
    symbol?: string;
    name?: string;
    current_price?: number;
    change?: number;
    change_percent?: number;
    currency?: string;
}

interface HistoryPoint {
    date?: string;
    close?: number;
    price?: number;
}

interface HistoryResult {
    symbol?: string;
    currency?: string;
    data?: HistoryPoint[];
}

interface VisualToolData {
    charts: Record<string, ChartSeries>;
    quotes: Record<string, QuoteData>;
}

type ChatSSEEvent =
    | { type: 'content'; chunk: string }
    | { type: 'tool_start'; tool_name: string }
    | { type: 'tool_result'; tool_name: string; tool_data?: HistoryResult | QuoteData }
    | { type: 'done'; conversation_id?: string }
    | { type: 'error'; message?: string };

// Backend historical result ({date: ISO, close, ...}) → StockChart series ({date, price})
function normalizeHistoryResult(result: HistoryResult): ChartSeries {
    const data = (Array.isArray(result?.data) ? result.data : [])
        .filter((d) => typeof d?.close === 'number' || typeof d?.price === 'number')
        .map((d) => ({
            date: typeof d.date === 'string' ? d.date.slice(0, 10) : '',
            price: (typeof d.close === 'number' ? d.close : d.price) as number,
        }));
    return { currency: result?.currency || 'USD', data };
}

// Skeleton shown while a visual block is still streaming or its data hasn't arrived
function VisualPlaceholder({ label }: { label?: string }) {
    return (
        <div className="w-full h-24 my-3 rounded-2xl border border-border bg-muted/50 animate-pulse flex items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium">
                {label ? `Preparing ${label}…` : 'Preparing visual…'}
            </span>
        </div>
    );
}

const PREDEFINED_PROMPTS = [
    { label: "Portfolio performance", icon: "chart" },
    { label: "Top holdings breakdown", icon: "target" },
    { label: "Sector and currency exposure", icon: "lightbulb" },
    { label: "Market news summary", icon: "news" },
];

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
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity mt-1">
            <button
                className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={handleCopy}
                title="Copy"
                aria-label={copied ? "Copied" : "Copy message"}
            >
                {copied ? (
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                ) : (
                    <Copy className="w-3.5 h-3.5" />
                )}
            </button>
            {message.status !== "sending" && message.role === "assistant" && (
                <button
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    title="Regenerate"
                    aria-label="Regenerate response"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                </button>
            )}
            <button
                className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-danger hover:bg-danger-light transition-colors"
                onClick={onDelete}
                title="Delete"
                aria-label="Delete message"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

export function StockyChat({ open, onOpenChange }: StockyChatProps) {
    const { user } = useAuth();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [isNewChat, setIsNewChat] = useState(false);
    const [streamingToolName, setStreamingToolName] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const toolDataRef = useRef<VisualToolData>({ charts: {}, quotes: {} });
    const voiceBaseTextRef = useRef("");

    const resizeInput = (value: string) => {
        setInput(value);
        if (inputRef.current) {
            inputRef.current.style.height = 'inherit';
            inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 160)}px`;
        }
    };

    const { isSupported: isVoiceSupported, isListening: isVoiceListening, toggle: toggleVoice } = useSpeechRecognition({
        onResult: (transcript) => {
            resizeInput(voiceBaseTextRef.current ? `${voiceBaseTextRef.current} ${transcript}` : transcript);
        },
        onError: (error) => {
            if (error === 'no-speech' || error === 'aborted') return;
            console.error('Voice input error:', error);
            const messages: Record<string, string> = {
                'not-allowed': "Microphone access denied — check your browser's site permissions",
                'service-not-allowed': "Microphone access denied — check your browser's site permissions",
                'audio-capture': "No microphone found — check it's connected and enabled",
                'network': "Voice recognition needs an internet connection",
            };
            toast.error(messages[error] || `Voice input failed (${error}), please try again`);
        }
    });

    const handleToggleVoice = () => {
        if (!isVoiceListening) voiceBaseTextRef.current = input;
        toggleVoice();
    };

    // Collect tool results so visual blocks can render from real data
    const ingestToolData = useCallback((td: HistoryResult | QuoteData | Record<string, unknown>) => {
        if (!td || typeof td !== 'object' || !('symbol' in td) || !td.symbol) return;
        const sym = String(td.symbol).toUpperCase();
        if ('data' in td && Array.isArray(td.data)) {
            const series = normalizeHistoryResult(td as HistoryResult);
            if (series.data.length > 0) toolDataRef.current.charts[sym] = series;
        } else if ('current_price' in td && typeof td.current_price === 'number') {
            toolDataRef.current.quotes[sym] = td as QuoteData;
        }
    }, []);

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
            setIsNewChat(false);
            setConversationId(id);
            const { data: msgs, error: msgsError } = await supabase
                .from("chat_messages")
                .select("*")
                .eq("conversation_id", id)
                .order("created_at", { ascending: true });

            if (msgsError) throw msgsError;

            if (msgs) {
                // Rebuild visual tool data before rendering so charts in history work
                msgs.forEach(m => {
                    if (m.role === 'tool' && m.content) {
                        try {
                            ingestToolData(JSON.parse(m.content));
                        } catch { /* not JSON, ignore */ }
                    }
                });

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
    }, [user, ingestToolData]);

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
        if (open && user && !conversationId && !isNewChat) {
            loadLastConversation();
        }
    }, [open, user, loadLastConversation, conversationId, isNewChat]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSend = useCallback(async (text: string = input, isRetry = false) => {
        if (!text.trim() || !user || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: text,
            status: "sent",
            timestamp: new Date().toISOString()
        };

        if (!isRetry) {
            setMessages((prev) => [...prev, userMessage]);
            setInput("");
            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
            }
        }

        setIsLoading(true);
        setStreamingToolName(null);

        const assistantMsgId = crypto.randomUUID();

        setMessages((prev) => [...prev, {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            status: "sending",
            timestamp: new Date().toISOString()
        }]);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated");

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const response = await fetch(`${supabaseUrl}/functions/v1/stockfolio-chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'X-Platform-Origin': window.location.origin,
                    'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                },
                body: JSON.stringify({
                    message: text,
                    conversation_id: conversationId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const jsonStr = line.slice(6).trim();
                    if (!jsonStr) continue;

                    let event: ChatSSEEvent;
                    try {
                        event = JSON.parse(jsonStr);
                    } catch {
                        continue;
                    }

                    switch (event.type) {
                        case 'content':
                            setStreamingToolName(null);
                            setMessages((prev) => prev.map(m =>
                                m.id === assistantMsgId
                                    ? { ...m, content: m.content + event.chunk, status: "sending" }
                                    : m
                            ));
                            break;

                        case 'tool_start':
                            setStreamingToolName(event.tool_name);
                            break;

                        case 'tool_result':
                            setStreamingToolName(null);
                            if (event.tool_data) ingestToolData(event.tool_data);
                            break;

                        case 'done':
                            if (event.conversation_id && !conversationId) {
                                setConversationId(event.conversation_id);
                                setIsNewChat(false);
                                fetchConversations();
                            }
                            setMessages((prev) => prev.map(m =>
                                m.id === assistantMsgId
                                    ? { ...m, status: "sent" }
                                    : m
                            ));
                            break;

                        case 'error':
                            setMessages((prev) => prev.map(m =>
                                m.id === assistantMsgId
                                    ? { ...m, content: event.message || "An error occurred", status: "error", error: event.message }
                                    : m
                            ));
                            break;
                    }
                }
            }
        } catch (err) {
            console.error("Chat error:", err);
            setMessages((prev) => prev.map(m =>
                m.id === assistantMsgId
                    ? {
                        ...m,
                        content: `Error: ${err instanceof Error ? err.message : "Unknown error occurred"}`,
                        status: "error",
                        error: err instanceof Error ? err.message : "Unknown error"
                    }
                    : m
            ));
            toast.error("Failed to get response. You can retry.");
        } finally {
            setIsLoading(false);
            setStreamingToolName(null);
        }
    }, [input, user, isLoading, conversationId, fetchConversations, ingestToolData]);

    const handleRegenerate = useCallback(async (messageId: string) => {
        const messageIdx = messages.findIndex(m => m.id === messageId);
        if (messageIdx === -1 || messageIdx === 0) return;

        const userMessageIdx = messageIdx - 1;
        const userMessage = messages[userMessageIdx];

        if (userMessage?.role !== "user") return;

        setRegeneratingId(messageId);
        setMessages((prev) => prev.filter(m => m.id !== messageId));
        await handleSend(userMessage.content, true);
        setRegeneratingId(null);
    }, [messages, handleSend]);

    const handleDelete = useCallback((messageId: string) => {
        setMessages((prev) => prev.filter(m => m.id !== messageId));
    }, []);

    const startNewChat = () => {
        setIsNewChat(true);
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
                hideCloseButton
                className="w-full sm:max-w-2xl p-0 flex flex-col bg-background border-l border-border"
            >
                {/* Header */}
                <SheetHeader className="px-5 py-4 border-b border-border shrink-0 bg-card">
                    <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <button
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                aria-label={isHistoryOpen ? "Hide conversation history" : "Show conversation history"}
                                aria-expanded={isHistoryOpen}
                                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                {isHistoryOpen ? <PanelLeftClose className="w-4 h-4" /> : <History className="w-4 h-4" />}
                            </button>
                            <StockyLogo variant={isDark ? "paper" : "ink"} size={32} className="shadow-sm rounded-lg shrink-0" />
                            <div className="min-w-0">
                                <SheetTitle className="text-[16px] font-semibold text-foreground leading-tight">
                                    Stocky
                                </SheetTitle>
                                <SheetDescription className="text-[13px] text-muted-foreground leading-tight">
                                    AI assistant · not investment advice
                                </SheetDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                onClick={startNewChat}
                                className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground bg-muted hover:bg-muted/70 hover:text-foreground transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New
                            </button>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <X className="w-4 h-4" />
                                <span className="sr-only">Close</span>
                            </button>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 flex overflow-hidden relative">
                    {/* History Sidebar */}
                    <AnimatePresence>
                        {isHistoryOpen && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 240, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="h-full border-r border-border bg-card flex flex-col shrink-0"
                            >
                                <div className="p-3 flex-1 overflow-y-auto">
                                    <div className="space-y-0.5">
                                        <p className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground px-2.5 mb-2">History</p>
                                        {conversations.length === 0 ? (
                                            <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                                                No conversations yet
                                            </div>
                                        ) : (
                                            conversations.map((conv) => (
                                                <button
                                                    key={conv.id}
                                                    onClick={() => loadConversation(conv.id)}
                                                    className={cn(
                                                        "w-full text-left px-2.5 py-2 rounded-xl text-[13px] transition-all",
                                                        conversationId === conv.id
                                                            ? "bg-muted text-foreground font-medium"
                                                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                                    )}
                                                >
                                                    <span className="line-clamp-1 block">
                                                        {conv.title || "New Conversation"}
                                                    </span>
                                                    <span className="text-[13px] text-muted-foreground mt-0.5 block">
                                                        {new Date(conv.updated_at || "").toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <ScrollArea className="flex-1 overflow-y-auto">
                            <div className="px-5 py-6">
                                {messages.length === 0 ? (
                                    /* Empty State */
                                    <div className="flex flex-col justify-end min-h-[calc(100vh-280px)]">
                                        <div className="space-y-6">
            <div>
                                                <h2 className="text-[32px] font-bold text-foreground leading-tight tracking-tight">
                                                    What do you<br />need?
                                                </h2>
                                            </div>
                                            <p className="text-[13px] text-muted-foreground leading-relaxed max-w-md">
                                                Stocky is an AI. It can explain markets and your portfolio data, but it
                                                doesn't give personal buy or sell recommendations and can make mistakes.{" "}
                                                <Link
                                                    to="/legal/disclaimer"
                                                    onClick={() => onOpenChange(false)}
                                                    className="underline underline-offset-2 hover:text-foreground"
                                                >
                                                    Learn more
                                                </Link>
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {PREDEFINED_PROMPTS.map((prompt) => (
                                                    <button
                                                        key={prompt.label}
                                                        onClick={() => handleSend(prompt.label)}
                                                        className="px-4 py-2.5 bg-card border border-border rounded-2xl text-[13px] text-muted-foreground font-medium hover:bg-muted hover:border-border transition-all hover:shadow-sm active:scale-[0.98]"
                                                    >
                                                        {prompt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Messages */
                                    <div className="space-y-4 pb-4" role="log" aria-live="polite" aria-busy={isLoading}>
                                        {messages
                                            .filter((m) => m.role !== "tool")
                                            // An assistant message starts as an empty "sending" placeholder
                                            // until the first chunk arrives - render the loading indicator
                                            // instead of an empty bubble for that gap.
                                            .filter((m) => !(m.role === "assistant" && m.status === "sending" && !m.content))
                                            .map((message) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className={cn(
                                                    "flex w-full group",
                                                    message.role === "user" ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                {message.role === "user" ? (
                                                    <div className="max-w-[85%]">
                                                        <div className="bg-foreground text-background px-4 py-2.5 rounded-2xl rounded-br-md text-[14px] leading-relaxed">
                                                            {message.content}
                                                        </div>
                                                    </div>
                                                ) : message.status === "error" ? (
                                                    <div className="w-full max-w-[90%]">
                                                        <div className="bg-danger-light border border-danger/20 rounded-2xl p-4">
                                                            <div className="flex gap-2.5">
                                                                <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                                                                <div className="flex-1">
                                                                    <p className="text-[13px] text-danger mb-2">{message.error || message.content}</p>
                                                                    <button
                                                                        className="text-[13px] font-medium text-danger hover:opacity-80 flex items-center gap-1 transition-opacity"
                                                                        onClick={() => handleRegenerate(message.id)}
                                                                        disabled={regeneratingId === message.id}
                                                                    >
                                                                        {regeneratingId === message.id ? (
                                                                            <><Loader2 className="w-3 h-3 animate-spin" /> Retrying...</>
                                                                        ) : (
                                                                            <><RotateCcw className="w-3 h-3" /> Try again</>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Assistant message */
                                                    <div className="w-full max-w-[90%]">
                                                        <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                                            <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-strong:font-semibold">
                                                                <ReactMarkdown
                                                                    components={{
                                                                        h1: ({ ...props }) => <h1 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props} />,
                                                                        h2: ({ ...props }) => <h2 className="text-base font-bold mt-3 mb-1.5 text-foreground" {...props} />,
                                                                        h3: ({ ...props }) => <h3 className="text-sm font-bold mt-2.5 mb-1 text-foreground" {...props} />,
                                                                        p: ({ ...props }) => <p className="mb-2.5 text-[14px] text-muted-foreground leading-relaxed last:mb-0" {...props} />,
                                                                        ul: ({ ...props }) => <ul className="list-disc pl-4 mb-3 space-y-1" {...props} />,
                                                                        ol: ({ ...props }) => <ol className="list-decimal pl-4 mb-3 space-y-1" {...props} />,
                                                                        li: ({ ...props }) => <li className="text-[14px] text-muted-foreground leading-relaxed" {...props} />,
                                                                        code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
                                                                            // [\w-] so hyphenated languages like stock-chart match
                                                                            const match = /language-([\w-]+)/.exec(className || '');
                                                                            const isStreaming = message.status === "sending";

                                                                            if (!inline && match && match[1] === 'stock-card') {
                                                                                try {
                                                                                    const parsed = JSON.parse(String(children).replace(/\n$/, ''));
                                                                                    const sym = String(parsed.symbol || '').toUpperCase();
                                                                                    const quote = toolDataRef.current.quotes[sym];
                                                                                    const price = parsed.price ?? quote?.current_price;
                                                                                    if (typeof price === 'number') {
                                                                                        return <StockCard
                                                                                            symbol={sym}
                                                                                            name={parsed.name ?? quote?.name ?? undefined}
                                                                                            price={price}
                                                                                            change={parsed.change ?? quote?.change ?? 0}
                                                                                            changePercent={parsed.changePercent ?? quote?.change_percent ?? 0}
                                                                                            currency={parsed.currency ?? quote?.currency ?? 'USD'}
                                                                                        />;
                                                                                    }
                                                                                    return <VisualPlaceholder label={sym ? `${sym} quote` : 'quote'} />;
                                                                                } catch {
                                                                                    // Incomplete JSON while streaming — show skeleton, not raw text
                                                                                    return isStreaming ? <VisualPlaceholder label="quote" /> : null;
                                                                                }
                                                                            }

                                                                            if (!inline && match && match[1] === 'stock-chart') {
                                                                                try {
                                                                                    const parsed = JSON.parse(String(children).replace(/\n$/, ''));
                                                                                    const sym = String(parsed.symbol || '').toUpperCase();
                                                                                    // Prefer inline data if the model sent it; else use collected tool data
                                                                                    const series: ChartSeries | undefined =
                                                                                        Array.isArray(parsed.data) && parsed.data.length > 0
                                                                                            ? normalizeHistoryResult(parsed)
                                                                                            : toolDataRef.current.charts[sym];
                                                                                    if (series && series.data.length > 0) {
                                                                                        return <StockChart symbol={sym} data={series.data} currency={series.currency} />;
                                                                                    }
                                                                                    return <VisualPlaceholder label={sym ? `${sym} chart` : 'chart'} />;
                                                                                } catch {
                                                                                    return isStreaming ? <VisualPlaceholder label="chart" /> : null;
                                                                                }
                                                                            }

                                                                            return inline ? (
                                                                                <code className="bg-muted text-foreground px-1.5 py-0.5 rounded-md text-[13px] font-mono" {...props}>
                                                                                    {children}
                                                                                </code>
                                                                            ) : (
                                                                                <pre className="bg-foreground text-background p-4 rounded-xl overflow-x-auto my-3 whitespace-pre-wrap font-mono text-[13px] leading-relaxed">
                                                                                    <code className={className} {...props}>
                                                                                        {children}
                                                                                    </code>
                                                                                </pre>
                                                                            );
                                                                        },
                                                                        blockquote: ({ ...props }) => <blockquote className="border-l-2 border-border pl-3 my-3 text-muted-foreground italic" {...props} />,
                                                                        hr: ({ ...props }) => <hr className="my-4 border-border" {...props} />,
                                                                        a: ({ ...props }) => (
                                                                            <a className="text-[#376cd5] hover:text-[#3a40c4] no-underline hover:underline transition-colors inline-flex items-center gap-0.5" {...props}>
                                                                                {props.children}
                                                                                <ArrowUpRight className="w-3 h-3 inline" />
                                                                            </a>
                                                                        ),
                                                                        table: ({ ...props }) => (
                                                                            <div className="w-full overflow-hidden rounded-xl border border-border my-3">
                                                                                <div className="overflow-x-auto">
                                                                                    <table className="w-full text-[13px] text-left text-muted-foreground" {...props} />
                                                                                </div>
                                                                            </div>
                                                                        ),
                                                                        thead: ({ ...props }) => <thead className="text-[13px] text-muted-foreground uppercase bg-muted/50" {...props} />,
                                                                        tbody: ({ ...props }) => <tbody className="divide-y divide-border" {...props} />,
                                                                        th: ({ ...props }) => <th className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap" {...props} />,
                                                                        td: ({ ...props }) => <td className="px-3 py-2" {...props} />,
                                                                    }}
                                                                >
                                                                    {message.content}
                                                                </ReactMarkdown>
                                                                {message.status === "sending" && (
                                                                    <span className="inline-block w-1.5 h-4 bg-primary rounded-full animate-pulse ml-0.5 -mb-0.5" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <MessageActions
                                                            message={message}
                                                            onRegenerate={() => handleRegenerate(message.id)}
                                                            onDelete={() => handleDelete(message.id)}
                                                            isRegenerating={regeneratingId === message.id}
                                                        />
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}

                                        {/* Loading / Tool indicator */}
                                        {isLoading && !messages.some(m => m.status === "sending" && m.content) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <div className="bg-primary/5 border border-primary/15 rounded-2xl rounded-bl-md px-5 py-4 max-w-[85%] shadow-sm">
                                                    <div className="flex items-center gap-2.5">
                                                        {streamingToolName ? (
                                                            <>
                                                                <Wrench className="w-4 h-4 text-primary animate-[spin_2s_linear_infinite]" />
                                                                <span className="text-[13px] text-primary font-medium">
                                                                    {streamingToolName.replace(/_/g, ' ')}...
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                                                <span className="text-[13px] text-primary font-medium">Working...</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                        <div ref={scrollRef} />
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-4 shrink-0">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="relative"
                            >
                                <div className="bg-card border border-border rounded-2xl shadow-sm transition-all focus-within:border-ring focus-within:shadow-md">
                                    <label htmlFor="stocky-input" className="sr-only">Message Stocky</label>
                                    <textarea
                                        id="stocky-input"
                                        ref={inputRef}
                                        placeholder="Ask for anything..."
                                        value={input}
                                        onChange={(e) => resizeInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        disabled={isLoading}
                                        className="w-full bg-transparent border-none focus:ring-0 text-[14px] text-foreground placeholder:text-muted-foreground px-4 pt-3.5 pb-12 min-h-[52px] resize-none max-h-[160px] outline-none"
                                        rows={1}
                                    />
                                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1">
                                        <VoiceInputButton
                                            isListening={isVoiceListening}
                                            isSupported={isVoiceSupported}
                                            onToggle={handleToggleVoice}
                                        />
                                        <button
                                            type="submit"
                                            aria-label="Send message"
                                            disabled={isLoading || !input.trim()}
                                            className={cn(
                                                "h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                                                input.trim() && !isLoading
                                                    ? "bg-foreground text-background hover:opacity-90 shadow-sm active:scale-95"
                                                    : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <ArrowUpRight className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <p className="mt-2 text-center text-[11px] text-muted-foreground">
                                AI-generated responses. Not investment advice.
                            </p>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
