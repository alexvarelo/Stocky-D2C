import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { AwardIcon, AwardIconDefs, type AwardIconId } from "./AwardIcons";
import { useTranslation } from "react-i18next";
import { formatDecimal } from "@/lib/formatters";

interface PortfolioAwardsProps {
    returnPercentage: number;
    holdingsCount: number;
    /** Times the portfolio hit its monthly return goal. No tracking source yet — defaults to 0. */
    monthlyGoalHits?: number;
    /** Consecutive days the user opened the app. No tracking source yet — defaults to 0. */
    loginStreakDays?: number;
    /** Consecutive days the user reviewed this portfolio. No tracking source yet — defaults to 0. */
    reviewStreakDays?: number;
    className?: string;
}

interface Award {
    id: string;
    iconId: AwardIconId;
    title: string;
    description: string;
    isUnlocked: boolean;
    progress: number;
    targetValue: string;
    currentValue: string;
}

export const PortfolioAwards = ({
    returnPercentage,
    holdingsCount,
    monthlyGoalHits = 0,
    loginStreakDays = 0,
    reviewStreakDays = 0,
    className = ""
}: PortfolioAwardsProps) => {
    const { t } = useTranslation("portfolio");

    const awards: Award[] = [
        {
            id: "bullseye",
            iconId: "bullseye",
            title: t("awards.bullseye.title"),
            description: t("awards.bullseye.description"),
            isUnlocked: monthlyGoalHits >= 3,
            progress: Math.min(100, Math.max(0, (monthlyGoalHits / 3) * 100)),
            targetValue: t("awards.hits", { count: 3 }),
            currentValue: t("awards.hits", { count: monthlyGoalHits })
        },
        {
            id: "club100",
            iconId: "club100",
            title: t("awards.club100.title"),
            description: t("awards.club100.description"),
            isUnlocked: returnPercentage >= 100,
            progress: Math.min(100, Math.max(0, (returnPercentage / 100) * 100)),
            targetValue: "100%",
            currentValue: `${formatDecimal(returnPercentage, 1)}%`
        },
        {
            id: "onFire",
            iconId: "onFire",
            title: t("awards.onFire.title"),
            description: t("awards.onFire.description"),
            isUnlocked: loginStreakDays >= 7,
            progress: Math.min(100, Math.max(0, (loginStreakDays / 7) * 100)),
            targetValue: t("awards.days", { count: 7 }),
            currentValue: t("awards.days", { count: loginStreakDays })
        },
        {
            id: "diversified",
            iconId: "diversified",
            title: t("awards.diversified.title"),
            description: t("awards.diversified.description"),
            isUnlocked: holdingsCount >= 5,
            progress: Math.min(100, Math.max(0, (holdingsCount / 5) * 100)),
            targetValue: t("awards.assets", { count: 5 }),
            currentValue: t("awards.assets", { count: holdingsCount })
        },
        {
            id: "disciplined",
            iconId: "disciplined",
            title: t("awards.disciplined.title"),
            description: t("awards.disciplined.description"),
            isUnlocked: reviewStreakDays >= 30,
            progress: Math.min(100, Math.max(0, (reviewStreakDays / 30) * 100)),
            targetValue: t("awards.days", { count: 30 }),
            currentValue: t("awards.days", { count: reviewStreakDays })
        }
    ];

    // Sort awards: Unlocked first, then by id
    const sortedAwards = [...awards].sort((a, b) => {
        if (a.isUnlocked === b.isUnlocked) return 0;
        return a.isUnlocked ? -1 : 1;
    });

    return (
        <div className={`flex flex-col gap-6 ${className}`}>
            <AwardIconDefs />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t("awards.title")}</h2>
                    <p className="text-sm text-muted-foreground">{t("awards.subtitle")}</p>
                </div>
                <div className="self-start sm:self-auto px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold border border-primary/20">
                    {t("awards.unlockedCount", { count: awards.filter(a => a.isUnlocked).length, total: awards.length })}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {sortedAwards.map((award, index) => (
                    <motion.div
                        key={award.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                            relative group overflow-hidden rounded-3xl border p-6 h-full transition-all duration-500 flex flex-col justify-between
                            ${award.isUnlocked
                                ? "bg-card/50 hover:bg-card/80 border-white/10 hover:border-white/20 hover:shadow-2xl"
                                : "bg-card/20 border-white/5 opacity-70 grayscale hover:opacity-100 hover:grayscale-0"}
                        `}
                    >
                        <div>
                            <div className="relative z-10 flex items-start justify-between mb-4">
                                <div className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                                    <AwardIcon id={award.iconId} unlocked={award.isUnlocked} size={64} />
                                </div>

                                {award.isUnlocked ? (
                                    <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-[#3FB6F0]/10 text-[#1C8CC7] text-[10px] sm:text-xs font-bold border border-[#3FB6F0]/20">
                                        {t("awards.unlocked")}
                                    </div>
                                ) : (
                                    <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-muted/50 text-muted-foreground text-[10px] sm:text-xs font-bold border border-white/5 flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {t("awards.locked")}
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 mb-4">
                                <h3 className={`text-lg font-bold mb-1 group-hover:text-primary transition-colors duration-300 ${award.isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                                    {award.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {award.description}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative z-10 space-y-2 mt-auto">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">{t("awards.progress")}</span>
                                <span className={award.isUnlocked ? "text-[#1C8CC7]" : "text-muted-foreground"}>
                                    {award.isUnlocked ? t("awards.completed") : `${award.currentValue} / ${award.targetValue}`}
                                </span>
                            </div>
                            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${award.progress}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: award.isUnlocked ? "#3FB6F0" : "hsl(var(--primary) / 0.5)" }}
                                />
                            </div>
                        </div>

                        {/* Shine Effect on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
