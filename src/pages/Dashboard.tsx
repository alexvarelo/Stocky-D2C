import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Sparkles
} from "lucide-react";
import { useNeedsOnboarding } from "@/lib/onboarding";
import { UserOnboardingWizard } from "@/components/onboarding/UserOnboardingWizard";
import { DashboardPosts } from "@/components/dashboard/DashboardPosts";
import { CreatePost } from "@/components/social/CreatePost";
import { useQueryClient } from "@tanstack/react-query";
import { ArticlesSection } from "@/components/articles/ArticlesSection";
import { useNavigate } from "react-router-dom";
import {
  DashboardSkeleton,
} from "@/components/dashboard/DashboardSkeleton";
import { HoldingsDonutChart } from "@/components/charts/HoldingsDonutChart";
import { ActivityCalendar } from "@/components/profile/ActivityCalendar";

import { usePortfolios } from "@/api/portfolio/usePortfolios";
import { DashboardStatsGrid } from "@/components/dashboard/stats/DashboardStatsGrid";

const Dashboard = () => {
  const [commandOpen, setCommandOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data: portfolios, isLoading } = usePortfolios(user?.id);

  // Animation variants
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial overview and market insights
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column - Portfolio Overview & Insights (5/12) */}
        <div className="xl:col-span-5 space-y-8">
          {/* Stats Grid */}
          <DashboardStatsGrid portfolios={portfolios || []} />

          {/* Articles Section */}
          <motion.div variants={item} initial="hidden" animate="show">
            <ArticlesSection />
          </motion.div>

          {/* Portfolio Allocation */}
          <motion.div variants={item} initial="hidden" animate="show" className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Allocation</h2>
            <div className="h-[24rem] xl:h-[28rem]">
              <HoldingsDonutChart />
            </div>
          </motion.div>

          {/* Activity Calendar */}
          <motion.div variants={item} initial="hidden" animate="show" className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Activity</h2>
            <div>
              <ActivityCalendar userId={user?.id || ""} />
            </div>
          </motion.div>
        </div>

        {/* Right Column - Feed (7/12) */}
        <div className="xl:col-span-7 space-y-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={item}>
              <CreatePost
                onPostCreated={() => {
                  queryClient.invalidateQueries({ queryKey: ["posts"] });
                }}
              />
            </motion.div>
            <motion.div variants={item}>
              <DashboardPosts />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <UserOnboardingWizard />
    </motion.div>
  );
};

export default Dashboard;
