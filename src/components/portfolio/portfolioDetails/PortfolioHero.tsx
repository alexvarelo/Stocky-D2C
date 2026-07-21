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
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { usePriceFlash, priceFlashClass } from "@/hooks/usePriceFlash";

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
            {/* Background Gradient Mesh - Subtle & Premium */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl opacity-20 dark:opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/30 via-transparent to-transparent blur-3xl" />
                <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-blue-500/20 via-transparent to-transparent blur-3xl" />
            </div>

            <div className="flex flex-col gap-6">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="text-muted-foreground hover:text-foreground transition-colors -ml-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <div className="flex items-center gap-2">
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
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                <div className="flex flex-col gap-4 md:gap-8">
                    {/* Top Row: Name & Valuation */}
                    <div className="flex justify-between items-start gap-4">
                        {/* Left: Name */}
                        <div className="space-y-2 flex-1 min-w-0">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl md:text-4xl font-bold tracking-tight truncate"
                            >
                                {name}
                            </motion.h1>
                            {description && (
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-muted-foreground text-sm md:text-lg leading-relaxed hidden md:block"
                                >
                                    {description}
                                </motion.p>
                            )}

                            {/* Desktop Metadata (Hidden on Mobile) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="hidden md:flex items-center gap-3 text-sm text-muted-foreground pt-2"
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
                        <div className="flex flex-col items-end shrink-0">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-baseline gap-1"
                            >
                                {isLoadingPrices ? (
                                    <Skeleton className="h-8 w-32 md:h-12 md:w-48" />
                                ) : (
                                    <span className={`text-2xl md:text-5xl font-bold tracking-tight rounded px-1 -mx-1 transition-colors duration-700 ${priceFlashClass(flash)}`}>
                                        {formatCurrency(totalValue)}
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
                            <div className="hidden md:flex flex-col items-end space-y-2 mt-2">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-3"
                                >
                                    {isLoadingPrices ? (
                                        <>
                                            <Skeleton className="h-7 w-32 rounded-full" />
                                            <Skeleton className="h-5 w-16" />
                                        </>
                                    ) : (
                                        <>
                                            <div className={`
                                                flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium
                                                ${isPositive
                                                    ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                                                    : "bg-red-500/10 text-red-500 dark:bg-red-500/20"}
                                            `}>
                                                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                                                <span>{isPositive ? "+" : ""}{formatCurrency(totalReturn)}</span>
                                                <span className="opacity-60">|</span>
                                                <span>{isPositive ? "+" : ""}{returnPercentage.toFixed(2)}%</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">All time</span>
                                        </>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="flex items-center gap-3"
                                >
                                    {isLoadingPrices ? (
                                        <Skeleton className="h-6 w-40" />
                                    ) : (
                                        <>
                                            <div className={`
                                                flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${isTodayPositive
                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-red-500/10 text-red-600 dark:text-red-400"}
                                            `}>
                                                {isTodayPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                                <span>{isTodayPositive ? "+" : ""}{formatCurrency(todayChange)}</span>
                                                <span className="opacity-60">|</span>
                                                <span>{isTodayPositive ? "+" : ""}{todayChangePercent.toFixed(2)}%</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">Today</span>
                                        </>
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
                            className="text-muted-foreground text-sm leading-relaxed md:hidden"
                        >
                            {description}
                        </motion.p>
                    )}

                    {/* Mobile Stats Row (Visible only on Mobile) */}
                    <div className="flex flex-wrap gap-3 md:hidden">
                        {/* All Time Return */}
                        <div className={`
                            flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                            ${isPositive
                                ? "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20"
                                : "bg-red-500/10 text-red-500 dark:bg-red-500/20"}
                        `}>
                            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span>{isPositive ? "+" : ""}{formatCurrency(totalReturn)}</span>
                            <span className="opacity-60">|</span>
                            <span>{isPositive ? "+" : ""}{returnPercentage.toFixed(2)}%</span>
                        </div>

                        {/* Today Return */}
                        <div className={`
                            flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                            ${isTodayPositive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400"}
                        `}>
                            {isTodayPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            <span>{isTodayPositive ? "+" : ""}{formatCurrency(todayChange)}</span>
                        </div>
                    </div>

                    {/* Mobile Metadata (Visible only on Mobile) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex md:hidden items-center gap-3 text-xs text-muted-foreground flex-wrap"
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
