import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Users, Heart, FolderOpen } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { FormProvider, useForm } from "react-hook-form";
import { PortfolioWizard } from "@/components/portfolio/portfolioWizard/PortfolioWizard";
import { useFollowedPortfolios } from "@/api/portfolio/useFollowedPortfolios";
import { usePortfolios } from "@/api/portfolio/usePortfolios";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Portfolios = () => {
  const { user } = useAuth();
  const { t } = useTranslation('portfolio');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [activeTab, setActiveTab] = useState("my-portfolios");

  const methods = useForm();

  const { data: followedPortfolios, isLoading: isLoadingFollowed } =
    useFollowedPortfolios();

  const { data: portfolios, isLoading } = usePortfolios(user?.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 sm:gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Animation variants
  const container: Record<string, any> = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item: Record<string, any> = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
    >
      <motion.div
        className="flex flex-col gap-6 sm:gap-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('list.title')}</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('list.subtitle')}
            </p>
          </div>
          <Button
            onClick={() => setShowCreateWizard(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('list.new')}
          </Button>
        </div>

        <Tabs
          defaultValue="my-portfolios"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto sm:mx-0">
            <TabsTrigger value="my-portfolios" className="text-xs sm:text-sm">
              <FolderOpen className="mr-2 h-4 w-4" />
              {t('list.tabs.mine')}
            </TabsTrigger>
            <TabsTrigger value="following" className="text-xs sm:text-sm">
              <Heart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {t('list.tabs.following')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-portfolios" className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))]">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : portfolios?.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader className="space-y-1 text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                  <CardTitle className="text-2xl">{t('list.empty.title')}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('list.empty.description')}
                  </CardDescription>
                  <Button
                    onClick={() => setShowCreateWizard(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('list.empty.cta')}
                  </Button>
                </CardHeader>
              </Card>
            ) : (
              <motion.div
                className="grid gap-4 sm:gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))]"
                variants={container}
              >
                {portfolios?.map((portfolio) => (
                  <motion.div key={portfolio.id} variants={item} className="h-full">
                    <PortfolioCard
                      {...portfolio}
                      user_id={user?.id}
                      showOwner={false}
                      isOwnPortfolio={true}
                      totalValue={portfolio.total_value}
                      totalReturnPercentage={portfolio.total_return_percentage}
                      totalCost={portfolio.total_cost}
                      todayChange={portfolio.today_change}
                      todayChangePercent={portfolio.today_change_percent}
                      unpricedTickers={portfolio.unpriced_tickers}
                      valuedAt={portfolio.valued_at}
                      currency={portfolio.currency}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            {isLoadingFollowed ? (
              <div className="grid gap-4 sm:gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))]">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : followedPortfolios?.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader className="space-y-1 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <CardTitle className="text-2xl">
                    {t('list.emptyFollowing.title')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('list.emptyFollowing.description')}
                  </CardDescription>
                  <Button variant="outline" className="mt-4">
                    <Link to="/discover">
                      <Users className="mr-2 h-4 w-4" />
                      {t('list.emptyFollowing.cta')}
                    </Link>
                  </Button>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4 sm:gap-5 grid-cols-[repeat(auto-fill,minmax(min(100%,19rem),1fr))]">
                {followedPortfolios?.map((portfolio) => (
                  <PortfolioCard
                    is_default={false}
                    key={portfolio.id}
                    user_id={portfolio.user_id}
                    {...portfolio}
                    showOwner={true}
                    isFollowing={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <FormProvider {...methods}>
        <PortfolioWizard
          open={showCreateWizard}
          onOpenChange={setShowCreateWizard}
        />
      </FormProvider>
    </motion.div>
  );
};

export default Portfolios;
