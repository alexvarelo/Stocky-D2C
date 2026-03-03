import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import PostNotifications from "./components/notifications/PostNotifications";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth";
import Dashboard from "./pages/Dashboard";
import Portfolios from "./pages/Portfolios";
import { PortfolioDetail } from "./pages/PortfolioDetail";
import { InstrumentPage } from "./pages/InstrumentPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Navbar } from "@/components/navigation/Navbar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Watchlists from "./pages/Watchlists";
import WatchlistDetail from "./pages/WatchlistDetail";
import { UserProfile } from "./pages/UserProfile";
import EditProfilePage from "./pages/EditProfilePage";
import { inject } from "@vercel/analytics"
import { DashboardSkeleton } from "./components/dashboard/DashboardSkeleton";
import DiscoverPage from "./pages/Discover";
import MarketResearchPage from "./pages/MarketResearch";
import { ArticlePage } from "./pages/ArticlePage";
import { StockyChat } from "./components/dashboard/StockyChat";
import stockyLogo from "@/assets/stocky.png";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
// CreateEditWatchlist component has been replaced with dialogs

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes before data becomes stale
      gcTime: 30 * 60 * 1000, // 30 minutes before inactive data is garbage collected
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: 1, // Retry failed requests once
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/navigation/BottomNav";

// Main Layout Component
function MainLayout({ children }: { children: React.ReactNode }) {
  inject();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col w-full pb-16 md:pb-0 relative">
      <Navbar />
      <main className="flex-1 px-4 py-6 sm:px-2 md:px-6 md:py-4 max-w-[2000px] mx-auto w-full">
        {children}
      </main>
      <Footer />
      <BottomNav />

      {/* Premium Floating Action Button for Stocky */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-50 group flex items-center justify-center h-14 w-14 md:h-16 md:w-16"
      >
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{
            repeat: 2,
            duration: 2,
            ease: "easeInOut",
            repeatDelay: 0.5
          }}
          className="absolute inset-0 rounded-full bg-primary/20 group-hover:hidden"
        />
        <div className="relative h-full w-full rounded-full bg-gradient-to-br from-[#E2CBFF] via-[#393BB2] to-[#E2CBFF] p-[2px] shadow-2xl overflow-hidden shadow-primary/20">
          <div className="absolute inset-0 animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] transition-opacity" />
          <div className="relative h-full w-full rounded-full bg-white dark:bg-slate-950 flex items-center justify-center p-2.5 md:p-3 shadow-inner">
            <img src={stockyLogo} alt="Stocky" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Hover Label */}
        <div className="absolute -top-12 right-0 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl shadow-xl border border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
          <span className="text-xs font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-2 whitespace-nowrap">
            Ask Stocky <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
          </span>
        </div>
      </motion.button>

      <StockyChat open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <TooltipProvider>
            <PostNotifications />
            <Toaster />
            <Sonner position="top-right" richColors />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portfolios"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Portfolios />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portfolio/:portfolioId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PortfolioDetail />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                {/* Placeholder routes for future features */}
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-bold mb-4">
                            Transactions
                          </h2>
                          <p className="text-muted-foreground">
                            Coming soon...
                          </p>
                        </div>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/watchlist/:id"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <WatchlistDetail />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/article/:id"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <ArticlePage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/watchlists"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Watchlists />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/:userId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <UserProfile />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/accounts/edit"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <EditProfilePage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/discover"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DiscoverPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/market-research"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <MarketResearchPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/instrument/:ticker"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <InstrumentPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/following"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-bold mb-4">Following</h2>
                          <p className="text-muted-foreground">
                            Coming soon...
                          </p>
                        </div>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-bold mb-4">
                            Notifications
                          </h2>
                          <p className="text-muted-foreground">
                            Coming soon...
                          </p>
                        </div>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-bold mb-4">Settings</h2>
                          <p className="text-muted-foreground">
                            Coming soon...
                          </p>
                        </div>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/articles/:slug"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-bold mb-4">Article Detail</h2>
                          <p className="text-muted-foreground">
                            Coming soon...
                          </p>
                        </div>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
