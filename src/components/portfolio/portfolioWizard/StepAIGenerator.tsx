import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowRight, Send, Bot, User, BrainCircuit, CheckCircle2 } from "lucide-react";
import { usePortfolioGenerator, GeneratedPortfolioResponse } from "@/api/portfolio/usePortfolioGenerator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StepAIGeneratorProps {
    onGenerate: (_data: GeneratedPortfolioResponse) => void;
    onSkip: () => void;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    missingInfo?: string[];
}

type ViewState = "initial" | "generating" | "chat";

export function StepAIGenerator({ onGenerate, onSkip }: StepAIGeneratorProps) {
    const [view, setView] = useState<ViewState>("initial");
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const { mutate: generatePortfolio, isPending } = usePortfolioGenerator();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleInitialGenerate = () => {
        if (!prompt.trim()) return;

        setView("generating");
        const userMessage: Message = { role: "user", content: prompt };
        setMessages([userMessage]);

        // Small delay to show animation before starting request
        setTimeout(() => {
            generatePortfolio(
                { prompt },
                {
                    onSuccess: (data) => {
                        if (data.success) {
                            // Success!
                            onGenerate(data);
                        } else {
                            // Needs more info -> Switch to Chat
                            const aiMessage: Message = {
                                role: "assistant",
                                content: data.message,
                                missingInfo: data.missing_info,
                            };
                            setMessages((prev) => [...prev, aiMessage]);
                            setView("chat");
                            setPrompt(""); // Clear prompt for chat input
                        }
                    },
                    onError: (error) => {
                        // Error -> Switch to Chat to show error
                        const errorMessage: Message = {
                            role: "assistant",
                            content: error.message || "Something went wrong. Please try again.",
                        };
                        setMessages((prev) => [...prev, errorMessage]);
                        setView("chat");
                        setPrompt("");
                    },
                }
            );
        }, 1500);
    };

    const handleChatSubmit = () => {
        if (!prompt.trim()) return;

        const userMessage: Message = { role: "user", content: prompt };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setPrompt("");

        const fullContextPrompt = newMessages.map(m =>
            `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}${m.missingInfo ? ` (Missing: ${m.missingInfo.join(', ')})` : ''}`
        ).join('\n\n');

        generatePortfolio(
            { prompt: fullContextPrompt },
            {
                onSuccess: (data) => {
                    if (data.success) {
                        onGenerate(data);
                    } else {
                        const aiMessage: Message = {
                            role: "assistant",
                            content: data.message,
                            missingInfo: data.missing_info,
                        };
                        setMessages((prev) => [...prev, aiMessage]);
                    }
                },
                onError: (error) => {
                    const errorMessage: Message = {
                        role: "assistant",
                        content: error.message || "Something went wrong. Please try again.",
                    };
                    setMessages((prev) => [...prev, errorMessage]);
                },
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (view === "initial") handleInitialGenerate();
            else handleChatSubmit();
        }
    };

    return (
        <div className="h-[500px] relative overflow-hidden">
            <AnimatePresence mode="wait">

                {/* INITIAL VIEW */}
                {view === "initial" && (
                    <motion.div
                        key="initial"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                            <div className="bg-primary/10 p-6 rounded-full relative">
                                <Sparkles className="h-10 w-10 text-primary" />
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h3 className="text-2xl font-bold tracking-tight">Describe your portfolio</h3>
                                <p className="text-muted-foreground text-lg">
                                    Tell me what you hold, in plain words, and I'll set it up for you.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    AI-assisted data entry. Stocky records the holdings you name; it doesn't pick investments for you.
                                </p>
                            </div>

                            <div className="w-full max-w-lg space-y-4">
                                <Textarea
                                    aria-label="Describe your portfolio"
                                    placeholder="E.g., 'Long term: 12 shares of AAPL at $180, 30 VWCE at €105 and 0.5 BTC'"
                                    className="min-h-[120px] resize-none text-base p-4 bg-muted/30 border-primary/20 focus:border-primary/50 transition-all"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                />
                                <Button
                                    size="lg"
                                    className="w-full gap-2 text-base font-semibold shadow-lg shadow-primary/20"
                                    onClick={handleInitialGenerate}
                                    disabled={!prompt.trim()}
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Generate Portfolio
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-center pb-4">
                            <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
                                Skip to Manual Creation <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* GENERATING ANIMATION VIEW */}
                {view === "generating" && (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center text-center p-8 space-y-8"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-t-2 border-primary/50"
                            />
                            <div className="bg-primary/5 p-8 rounded-full">
                                <BrainCircuit className="h-16 w-16 text-primary animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Analyzing Market Data...</h3>
                            <p className="text-muted-foreground">Constructing your optimal portfolio based on current trends.</p>
                        </div>

                        <div className="flex gap-2">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.2, repeat: Infinity, repeatType: "reverse", duration: 1 }}
                                    className="w-3 h-3 bg-primary rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* CHAT VIEW (For missing info / errors) */}
                {view === "chat" && (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="h-full flex flex-col"
                    >
                        <div className="flex-1 overflow-hidden relative rounded-lg border bg-muted/30 mb-4">
                            <ScrollArea className="h-full p-4">
                                <div className="space-y-4 pb-4">
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "flex gap-3 max-w-[85%]",
                                                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
                                            )}>
                                                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                                            </div>
                                            <div className={cn(
                                                "rounded-2xl p-4 text-sm shadow-sm",
                                                msg.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                                    : "bg-card border rounded-tl-none"
                                            )}>
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                {msg.missingInfo && msg.missingInfo.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-border/50">
                                                        <p className="font-semibold mb-2 text-xs uppercase tracking-wider opacity-70 flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3" /> Required Information:
                                                        </p>
                                                        <ul className="space-y-1.5">
                                                            {msg.missingInfo.map((info, i) => (
                                                                <li key={i} className="flex items-start gap-2 text-xs bg-black/5 dark:bg-white/5 p-2 rounded">
                                                                    <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                                    {info}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isPending && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex gap-3 max-w-[85%]"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-card border flex items-center justify-center shrink-0">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="bg-card border shadow-sm rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">Thinking...</span>
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>
                        </div>

                        <div className="flex gap-2">
                            <Textarea
                                aria-label="Your reply"
                                placeholder="Type your reply..."
                                className="min-h-[50px] max-h-[150px] resize-none"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isPending}
                                autoFocus
                            />
                            <Button
                                onClick={handleChatSubmit}
                                disabled={!prompt.trim() || isPending}
                                className="h-auto px-4"
                                aria-label="Send reply"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
