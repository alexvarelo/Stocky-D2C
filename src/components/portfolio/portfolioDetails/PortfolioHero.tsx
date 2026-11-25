import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MoreHorizontal, TrendingUp, TrendingDown, Edit, Trash2, Sparkles, UserPlus, UserMinus, Download } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/formatters";
import { motion } from "framer-motion";
import { usePriceFlash, priceFlashClass } from "@/hooks/usePriceFlash";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

interface PortfolioHeroProps {
    portfolioId: string;
    name: string;
    description?: string;
    isPublic?: boolean;
    followersCount?: number;
    createdAt?: string;
    totalValue: number;
    totalReturn: number;
    returnPercentage: number;
    currency?: string;
    todayChange?: number;
    todayChangePercent?: number;
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onAISummary: () => void;
    onExport?: () => void;
    isOwner: boolean;
    isFollowing?: boolean;
    onToggleFollow?: () => void;
    isLoading?: boolean;
    isLoadingPrices?: boolean;
    isLive?: boolean;
}

export const PortfolioHero = ({
    portfolioId: _portfolioId,
    name,
    description,
    isPublic,
    followersCount,
    createdAt,
    totalValue,
    totalReturn,
    returnPercentage,
    currency = "USD",
    todayChange = 0,
    todayChangePercent = 0,
    onBack,
    onEdit,
    onDelete,
    onAISummary,
    onExport,
    isOwner,
    isFollowing = false,
    onToggleFollow,
    isLoading = false,
    isLoadingPrices = false,
    isLive = false,
}: PortfolioHeroProps) => {
    const isPositive = totalReturn >= 0;
    const isTodayPositive = todayChange >= 0;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const flash = usePriceFlash(isLive ? totalValue : undefined);
    const animatedValue = useAnimatedNumber(totalValue);

    const handleEdit = () => {
        setDropdownOpen(false);
        onEdit();
    };

    const handleDelete = () => {
        setDropdownOpen(false);
        onDelete();
    };

    if (isLoading) {
        return (
            <div className="relative w-full mb-8">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-9 w-20" />
                        <div className="flex items-center gap-2">
                            {!isOwner && <Skeleton className="h-9 w-24" />}
                            <Skeleton className="h-9 w-28 hidden sm:flex" />
                            {isOwner && <Skeleton className="h-8 w-8" />}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="space-y-4 max-w-2xl w-full">
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-64" />
                                <Skeleton className="h-6 w-full max-w-md" />
                            </div>
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        </div>
                        <div className="flex flex-col items-start md:items-end space-y-2 min-w-[200px]">
                            <Skeleton className="h-12 w-48" />
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-7 w-32 rounded-full" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <Skeleton className="h-6 w-40" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full mb-8">

            <div className="flex flex-col gap-4 md:gap-6">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground transition-colors sm:h-9 sm:w-auto sm:px-3"
                    >
                        <ArrowLeft className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {!isOwner && onToggleFollow && (
                            <Button
                                variant={isFollowing ? "outline" : "default"}
                                size="sm"
                                onClick={onToggleFollow}
                                className={isFollowing
                                    ? "gap-2"
                                    : "gap-2 bg-primary hover:bg-primary/90"}
                            >
                                {isFollowing ? (
                                    <>
                                        <UserMinus className="h-4 w-4" />
                                        Unfollow
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        Follow
                                    </>
                                )}
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAISummary}
                            className="hidden sm:flex gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                        >
                            <Sparkles className="h-4 w-4" />
                            AI Insights
                        </Button>

                        {isOwner && (
                            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={handleEdit}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Portfolio
                                    </DropdownMenuItem>
                                    {onExport && (
                                        <DropdownMenuItem onClick={() => { setDropdownOpen(false); onExport(); }}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Receipt
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

                {/* Main Hero Content */}
                {/* Main Hero Content */}
                <div className="flex flex-col gap-4 lg:gap-8">
                    {/* Top Row: Name & Valuation */}
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                        {/* Left: Name */}
                        <div className="space-y-2 flex-1 min-w-0">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl lg:text-4xl font-bold leading-tight tracking-tight break-words"
                            >
                                {name}
                            </motion.h1>
                            {description && (
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-muted-foreground text-sm lg:text-lg leading-relaxed hidden lg:block"
                                >
                                    {description}
                                </motion.p>
                            )}

                            {/* Desktop Metadata (Hidden on Mobile) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="hidden lg:flex flex-wrap items-center gap-3 text-sm text-muted-foreground pt-2"
                            >
                                {isPublic !== undefined && (
                                    <div className={`
                                        px-2.5 py-0.5 rounded-full text-xs font-semibold border
                                        ${isPublic
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                                            : 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400'}
                                    `}>
                                        {isPublic ? 'Public' : 'Private'}
                                    </div>
                                )}
                                {followersCount !== undefined && (
                                    <>
                                        <div className="w-1 h-1 rounded-full bg-border" />
                                        <div>{followersCount} {followersCount === 1 ? 'follower' : 'followers'}</div>
                                    </>
                                )}
                                {createdAt && (
                                    <>
                                        <div className="w-1 h-1 rounded-full bg-border" />
                                        <div>Created {new Date(createdAt).toLocaleDateString()}</div>
                                    </>
                                )}
                            </motion.div>
                        </div>

                        {/* Right: Valuation */}
                        <div className="flex flex-col items-start lg:items-end lg:shrink-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-baseline gap-1"
                            >
                                {isLoadingPrices ? (
                                    <Skeleton className="h-8 w-32 lg:h-12 lg:w-48" />
                                ) : (
                                    <span className={`text-3xl lg:text-5xl font-bold tracking-tight rounded px-1 -mx-1 tabular-nums transition-colors duration-700 ${priceFlashClass(flash)}`}>
                                        {formatCurrency(animatedValue, currency)}
                                    </span>
                                )}
                                {isLive && !isLoadingPrices && (
                                    <span
                                        className="relative flex h-2 w-2 ml-1"
                                        title="Live price"
                                    >
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                    </span>
                                )}
                            </motion.div>

                            {/* Desktop Stats (Hidden on Mobile) */}
                            <div className="hidden lg:flex flex-col items-end space-y-1.5 mt-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {isLoadingPrices ? (
                                        <Skeleton className="h-6 w-48" />
                                    ) : (
                                        <div className="flex flex-wrap items-center gap-1.5 text-sm">
                                            {isPositive ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-danger" />}
                                            <span className={`font-semibold tabular-nums ${isPositive ? "text-success" : "text-danger"}`}>
                                                {isPositive ? "+" : ""}{formatCurrency(totalReturn, currency)}
                                            </span>
                                            <span className="text-muted-foreground/50">|</span>
                                            <span className={`font-semibold tabular-nums ${isPositive ? "text-success" : "text-danger"}`}>
                                                {isPositive ? "+" : ""}{returnPercentage.toFixed(2)}%
                                            </span>
                                            <span className="text-muted-foreground">All time</span>
                                        </div>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                >
                                    {isLoadingPrices ? (
                                        <Skeleton className="h-5 w-40" />
                                    ) : (
                                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground/90">
                                            {isTodayPositive ? <TrendingUp className="h-3.5 w-3.5 text-success" /> : <TrendingDown className="h-3.5 w-3.5 text-danger" />}
                                            <span className={`font-medium tabular-nums ${isTodayPositive ? "text-success" : "text-danger"}`}>
                                                {isTodayPositive ? "+" : ""}{formatCurrency(todayChange, currency)}
                                            </span>
                                            <span className="text-muted-foreground/50">|</span>
                                            <span className={`font-medium tabular-nums ${isTodayPositive ? "text-success" : "text-danger"}`}>
                                                {isTodayPositive ? "+" : ""}{todayChangePercent.toFixed(2)}%
                                            </span>
                                            <span>Today</span>
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Description (Visible only on Mobile) */}
                    {description && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground text-sm leading-relaxed lg:hidden"
                        >
                            {description}
                        </motion.p>
                    )}

                    {/* Mobile Stats Row (Visible only on Mobile) */}
                    <div className="flex flex-col gap-1 lg:hidden">
                        <div className="flex flex-wrap items-center gap-1.5 text-sm">
                            {isPositive ? <TrendingUp className="h-3.5 w-3.5 text-success" /> : <TrendingDown className="h-3.5 w-3.5 text-danger" />}
                            <span className={`font-semibold tabular-nums ${isPositive ? "text-success" : "text-danger"}`}>
                                {isPositive ? "+" : ""}{formatCurrency(totalReturn, currency)}
                            </span>
                            <span className="text-muted-foreground/50">|</span>
                            <span className={`font-semibold tabular-nums ${isPositive ? "text-success" : "text-danger"}`}>
                                {isPositive ? "+" : ""}{returnPercentage.toFixed(2)}%
                            </span>
                            <span className="text-muted-foreground">All time</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground/90">
                            {isTodayPositive ? <TrendingUp className="h-3 w-3 text-success" /> : <TrendingDown className="h-3 w-3 text-danger" />}
                            <span className={`font-medium tabular-nums ${isTodayPositive ? "text-success" : "text-danger"}`}>
                                {isTodayPositive ? "+" : ""}{formatCurrency(todayChange, currency)}
                            </span>
                            <span className="text-muted-foreground/50">|</span>
                            <span className={`font-medium tabular-nums ${isTodayPositive ? "text-success" : "text-danger"}`}>
                                {isTodayPositive ? "+" : ""}{todayChangePercent.toFixed(2)}%
                            </span>
                            <span>Today</span>
                        </div>
                    </div>

                    {/* Mobile Metadata (Visible only on Mobile) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex lg:hidden items-center gap-3 text-xs text-muted-foreground flex-wrap"
                    >
                        {isPublic !== undefined && (
                            <div className={`
                                px-2.5 py-0.5 rounded-full text-xs font-semibold border
                                ${isPublic
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400'
                                    : 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400'}
                            `}>
                                {isPublic ? 'Public' : 'Private'}
                            </div>
                        )}
                        {followersCount !== undefined && (
                            <>
                                <div className="w-1 h-1 rounded-full bg-border" />
                                <div>{followersCount} {followersCount === 1 ? 'follower' : 'followers'}</div>
                            </>
                        )}
                        {createdAt && (
                            <>
                                <div className="w-1 h-1 rounded-full bg-border" />
                                <div>Created {new Date(createdAt).toLocaleDateString()}</div>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
