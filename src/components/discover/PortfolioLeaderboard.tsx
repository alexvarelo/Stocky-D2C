import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Loader2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTopPortfolios } from '@/api/portfolio/useTopPortfolios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CompanyLogo } from '@/components/stock/CompanyLogo';

const getTrophyIcon = (rank: number) => {
    switch (rank) {
        case 1:
            return <Trophy className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
        case 2:
            return <Trophy className="h-5 w-5 text-gray-400 fill-gray-400" />;
        case 3:
            return <Trophy className="h-5 w-5 text-orange-400 fill-orange-400" />;
        default:
            return <span className="text-muted-foreground font-medium">#{rank}</span>;
    }
};

const ITEMS_PER_PAGE = 10;

export const PortfolioLeaderboard: React.FC = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const { data, isLoading, error } = useTopPortfolios({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
    });

    const portfolios = data?.portfolios || [];
    const totalCount = data?.totalCount || 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500">Failed to load leaderboard</p>
            </div>
        );
    }

    if (!portfolios || portfolios.length === 0) {
        return (
            <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No portfolios to display yet</p>
            </div>
        );
    }

    // Pagination logic
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return (
        <div className="relative min-h-screen">
            {/* Page-wide Animated Background Blur */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Light Blue Gradient Orbs */}
                <motion.div
                    className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-3xl"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/20 to-blue-400/20 blur-3xl"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-sky-400/15 to-blue-500/15 blur-3xl"
                    animate={{
                        scale: [1, 1.15, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-12 max-w-7xl mx-auto px-4 py-8">
                {/* Hero Content - Two Columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                    {/* Left: Text Content */}
                    <div className="space-y-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
                                Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">portfolios</span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                                Discover the best performing portfolios from our community. Follow their strategies and learn from the best.
                            </p>
                        </motion.div>
                    </div>
                    {/* Right: Featured Top Portfolio Card */}
                    {portfolios.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        >
                            <Link to={`/portfolio/${portfolios[0].id}`}>
                                <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-2 border-slate-200 dark:border-slate-700 max-w-sm mx-auto">
                                    {/* Trophy Badge */}
                                    <div className="absolute top-3 right-3 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg z-10">
                                        <Trophy className="h-3 w-3 fill-white" />
                                        #1
                                    </div>

                                    <CardContent className="p-5 pt-6 space-y-3">
                                        {/* Large Centered Profile Image */}
                                        <div className="flex flex-col items-center text-center space-y-2">
                                            <Avatar className="h-20 w-20 border-4 border-slate-200 dark:border-slate-700 shadow-xl">
                                                <AvatarImage src={portfolios[0].user.avatar_url || ''} />
                                                <AvatarFallback className="text-2xl font-bold">
                                                    {portfolios[0].user.full_name?.[0] || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight">
                                                    {portfolios[0].user.full_name || portfolios[0].user.username}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    @{portfolios[0].user.username}
                                                </p>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1.5 italic">
                                                    "{portfolios[0].name}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Portfolio Value - Centered */}
                                        <div className="text-center space-y-1 py-2">
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                Portfolio Valuation
                                            </p>
                                            <p className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                                                ${portfolios[0].total_value.toLocaleString()}
                                            </p>
                                            <div className="flex items-center justify-center gap-1 pt-0.5">
                                                <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    +{portfolios[0].total_return_percentage.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Top Holding */}
                                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 text-center uppercase tracking-wider">
                                                Top Holding ({portfolios[0].top_holding_allocation ? `${portfolios[0].top_holding_allocation.toFixed(0)}%` : '0%'})
                                            </p>
                                            <div className="flex items-center justify-center gap-2">
                                                <CompanyLogo
                                                    ticker={portfolios[0].top_holding_ticker || ''}
                                                    size={32}
                                                    className="shadow-md"
                                                />
                                                <div className="text-left">
                                                    <p className="font-bold text-sm text-slate-900 dark:text-slate-50 leading-none">
                                                        {portfolios[0].top_holding_ticker || 'No holdings'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                                        {portfolios[0].holdings_count} {portfolios[0].holdings_count === 1 ? 'holding' : 'holdings'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    )}
                </div>

                {/* Full Rankings Section */}
                <div className="space-y-6">

                    {/* Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="rounded-xl border bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden shadow-lg max-w-6xl mx-auto"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">Rank</TableHead>
                                    <TableHead className="hidden sm:table-cell">Author</TableHead>
                                    <TableHead>Portfolio</TableHead>
                                    <TableHead className="hidden lg:table-cell">Description</TableHead>
                                    <TableHead className="hidden md:table-cell text-right">Holdings</TableHead>
                                    <TableHead className="hidden sm:table-cell text-right">Valuation</TableHead>
                                    <TableHead className="text-right">Performance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {portfolios.map((portfolio, index) => {
                                    const rank = startIndex + index + 1;
                                    const isPositive = portfolio.total_return_percentage >= 0;

                                    return (
                                        <motion.tr
                                            key={portfolio.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center justify-center">
                                                    {getTrophyIcon(rank)}
                                                </div>
                                            </TableCell>

                                            <TableCell className="hidden sm:table-cell">
                                                <Link
                                                    to={`/user/${portfolio.user_id}`}
                                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                                >
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={portfolio.user.avatar_url || ''} />
                                                        <AvatarFallback className="text-xs">
                                                            {portfolio.user.full_name?.[0] || 'U'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">
                                                            {portfolio.user.full_name || portfolio.user.username}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            @{portfolio.user.username}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </TableCell>

                                            <TableCell>
                                                <Link
                                                    to={`/portfolio/${portfolio.id}`}
                                                    className="hover:underline"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{portfolio.name}</span>
                                                        {/* Show author on mobile only */}
                                                        <span className="text-xs text-muted-foreground sm:hidden">
                                                            @{portfolio.user.username}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </TableCell>

                                            <TableCell className="hidden lg:table-cell max-w-xs">
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {portfolio.description || '—'}
                                                </p>
                                            </TableCell>

                                            <TableCell className="hidden md:table-cell text-right">
                                                <span className="text-sm font-medium">
                                                    {portfolio.holdings_count}
                                                </span>
                                            </TableCell>

                                            <TableCell className="hidden sm:table-cell text-right font-medium">
                                                ${portfolio.total_value.toLocaleString()}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <div
                                                    className={cn(
                                                        'flex items-center justify-end gap-1 font-bold',
                                                        isPositive
                                                            ? 'text-green-600 dark:text-green-400'
                                                            : 'text-red-600 dark:text-red-400'
                                                    )}
                                                >
                                                    {isPositive ? (
                                                        <TrendingUp className="h-4 w-4" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4" />
                                                    )}
                                                    <span className="hidden sm:inline">{isPositive ? '+' : ''}</span>
                                                    {portfolio.total_return_percentage.toFixed(2)}%
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </motion.div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(endIndex, totalCount)} of {totalCount} portfolios
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
