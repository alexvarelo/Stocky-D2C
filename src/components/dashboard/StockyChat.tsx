import React, { useState, useEffect, useRef } from "react";
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
    History,
    ChevronDown,
    ChevronUp,
    Terminal,
    Plus,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import stockyLogo from "@/assets/stocky.png";

interface Message {
    id: string;
    role: "user" | "assistant" | "tool";
    content: string;
    tool_name?: string;
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
    "Analyze my current portfolio performance",
    "What's the market sentiment for NVDA?",
    "Show me my largest holdings",
    "How can I diversify my portfolio further?",
];

function ToolResponse({ content, toolName }: { content: string; toolName?: string }) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    let jsonContent: unknown = null;
    try {
        jsonContent = JSON.parse(content);
    } catch {
        jsonContent = content;
    }

    return (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden mb-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-100 transition-colors text-slate-600"
            >
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-mono font-medium">
                        {toolName || "Tool Output"}
                    </span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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

export function StockyChat({ open, onOpenChange }: StockyChatProps) {
    const { user } = useAuth();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchConversations = React.useCallback(async () => {
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

    const loadConversation = React.useCallback(async (id: string) => {
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
                        tool_name: toolCalls?.[0]?.function?.name || undefined
                    };
                }));
            }
        } catch (err) {
            console.error("Error loading conversation:", err);
        } finally {
            setIsLoading(false);
            if (window.innerWidth < 1024) setIsHistoryOpen(false);
        }
    }, [user]);

    const loadLastConversation = React.useCallback(async () => {
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

    // Load conversations list on open
    useEffect(() => {
        if (open && user) {
            fetchConversations();
        }
    }, [open, user, fetchConversations]);

    useEffect(() => {
        if (open && user && !conversationId) {
            loadLastConversation();
        }
    }, [open, user, loadLastConversation]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || !user || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: text,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Invoke the edge function
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

            // Update state with assistant response and conversation ID
            if (data) {
                if (data.conversationId && !conversationId) {
                    setConversationId(data.conversationId);
                }

                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: data.response || "No response received.",
                };

                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (err) {
            console.error("Chat error:", err);
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Sorry, I encountered an error processing your request. Please try again later.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setConversationId(null);
        setMessages([]);
        if (window.innerWidth < 1024) setIsHistoryOpen(false);
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
                            <span className="font-semibold">New Chat</span>
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
                                            conversations.map((conv) => (
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
                                            ))
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
                                                Ask me anything about your portfolios, market trends, or insights.
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
                                    <div className="space-y-10 pb-8">
                                        {messages.map((message) => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={cn(
                                                    "flex w-full",
                                                    message.role === "user" ? "justify-end" : "justify-start"
                                                )}
                                            >
                                                {message.role === "user" ? (
                                                    <div className="max-w-[85%] bg-muted/40 text-foreground px-5 py-3 rounded-[24px] text-base font-medium leading-relaxed">
                                                        {message.content}
                                                    </div>
                                                ) : message.role === "tool" ? (
                                                    <div className="w-full flex flex-col gap-2">
                                                        <ToolResponse
                                                            content={message.content}
                                                            toolName={message.tool_name}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full flex gap-4">
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
                                                                        code: ({ inline, ...props }: { inline?: boolean; children?: React.ReactNode }) =>
                                                                            inline ? (
                                                                                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                                                                            ) : (
                                                                                <pre className="bg-slate-900 text-slate-100 p-6 rounded-2xl overflow-x-auto my-6 overflow-wrap-anywhere whitespace-pre-wrap font-mono text-sm leading-relaxed border border-slate-800 shadow-sm">
                                                                                    <code {...props} />
                                                                                </pre>
                                                                            ),
                                                                        blockquote: ({ ...props }) => <blockquote className="border-l-4 border-primary/20 pl-4 italic my-6 text-muted-foreground" {...props} />,
                                                                        hr: ({ ...props }) => <hr className="my-8 border-border/50" {...props} />,
                                                                        a: ({ ...props }) => <a className="text-blue-600 hover:text-blue-800 underline transition-colors" {...props} />,
                                                                    }}
                                                                >
                                                                    {message.content}
                                                                </ReactMarkdown>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
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
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-primary/40" />
                                                    <span className="text-sm text-muted-foreground font-medium italic">Stocky is typing...</span>
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
                                        placeholder="Reply to Stocky..."
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
                                    className="h-14 w-14 rounded-2xl shrink-0 shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
                                >
                                    <Send className="w-6 h-6" />
                                </Button>
                            </form>
                            <div className="max-w-4xl mx-auto mt-4 px-6 flex justify-between items-center text-[10px] text-muted-foreground/60 font-medium">
                                <span>AI response for informational purposes only.</span>
                                <div className="flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Stocky Financial Intelligence</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
