import { motion, Variants } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { DashboardPosts } from "@/components/dashboard/DashboardPosts";
import { CreatePost } from "@/components/social/CreatePost";
import { useQueryClient } from "@tanstack/react-query";
import {
  DashboardSkeleton,
} from "@/components/dashboard/DashboardSkeleton";
import { HoldingsDonutChart } from "@/components/charts/HoldingsDonutChart";
import { ThesisReviewReminder } from "@/components/thesis/ThesisReviewReminder";
import { ActivityCalendar } from "@/components/profile/ActivityCalendar";

import { usePortfolios } from "@/api/portfolio/usePortfolios";
import { MarketContextPanel } from "@/components/market/MarketContextPanel";
import { WealthHero } from "@/components/dashboard/wealth/WealthHero";
import { PortfolioBreakdownList } from "@/components/dashboard/wealth/PortfolioBreakdownList";

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: portfolios, isLoading } = usePortfolios(user?.id);

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen md:p-6 space-y-8"
    >
      <ThesisReviewReminder />

      {/* Total Wealth */}
      <WealthHero portfolios={portfolios || []} />

      <MarketContextPanel />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Column - Portfolios & Holdings (9/12) */}
        <div className="xl:col-span-9 space-y-8">
          <motion.div variants={item} initial="hidden" animate="show" className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Your Portfolios</h2>
            <PortfolioBreakdownList portfolios={portfolios || []} />
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show" className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Allocation</h2>
            <div className="h-[24rem] xl:h-[28rem]">
              <HoldingsDonutChart />
            </div>
          </motion.div>

          <motion.div variants={item} initial="hidden" animate="show" className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Activity</h2>
            <div>
              <ActivityCalendar userId={user?.id || ""} />
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Community Feed (3/12) */}
        <div className="xl:col-span-3 space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">From the community</h2>
          <motion.div variants={item} initial="hidden" animate="show">
            <CreatePost
              onPostCreated={() => {
                queryClient.invalidateQueries({ queryKey: ["posts"] });
              }}
            />
          </motion.div>
          <motion.div variants={item} initial="hidden" animate="show">
            <DashboardPosts pageSize={5} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
