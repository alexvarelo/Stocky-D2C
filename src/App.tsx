import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import PostNotifications from "./components/notifications/PostNotifications";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Navbar } from "@/components/navigation/Navbar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { inject } from "@vercel/analytics"
import { DashboardSkeleton } from "./components/dashboard/DashboardSkeleton";
import { StockyChat } from "./components/dashboard/StockyChat";
import { StockyLogo } from "@/components/brand/StockyLogo";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/navigation/BottomNav";

import { motion } from "framer-motion";
import { lazy, Suspense, useState } from "react";

// Pages load on demand so the first visit doesn't download every route.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Portfolios = lazy(() => import("./pages/Portfolios"));
const PortfolioDetail = lazy(() => import("./pages/PortfolioDetail"));
const InstrumentPage = lazy(() => import("./pages/InstrumentPage").then((m) => ({ default: m.InstrumentPage })));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Watchlists = lazy(() => import("./pages/Watchlists"));
const WatchlistDetail = lazy(() => import("./pages/WatchlistDetail"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const EditProfilePage = lazy(() => import("./pages/EditProfilePage"));
const SettingsPage = lazy(() => import("./pages/Settings"));
const DiscoverPage = lazy(() => import("./pages/Discover"));
const MarketResearchPage = lazy(() => import("./pages/MarketResearch"));
const ArticlePage = lazy(() => import("./pages/ArticlePage").then((m) => ({ default: m.ArticlePage })));
const LegalPage = lazy(() => import("./pages/legal/LegalPage").then((m) => ({ default: m.LegalPage })));

function PageFallback() {
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center">
      <span className="sr-only">Loading</span>
      <span aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  );
}

// Once per page load. It used to run inside MainLayout on every render.
inject();

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
  const { user, loading, userProfile, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || (user && profileLoading)) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!userProfile && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Shared shell for every signed-in page. Rendered once as a layout route, so
// navigating between pages keeps the navbar and the open chat mounted.
function MainLayout() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex w-full relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <Navbar />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 pt-14 md:pt-0">
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-6 sm:px-2 md:px-6 md:py-4 max-w-[2000px] mx-auto w-full focus:outline-none"
        >
          {/* Keyed by path so one broken page doesn't leave the error up after navigating away. */}
          <ErrorBoundary key={location.pathname}>
            <Suspense fallback={<PageFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>

      <BottomNav />

      {/* Stocky FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(true)}
        aria-label="Open Stocky, the AI assistant"
        aria-haspopup="dialog"
        className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-50 rounded-2xl shadow-lg shadow-gray-900/20 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <StockyLogo variant="ink" size={52} className="block" />
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
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  {/* Public, so they can be read before signing up. */}
                  <Route path="/legal/:doc" element={<LegalPage />} />
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/portfolios" element={<Portfolios />} />
                    <Route path="/portfolio/:portfolioId" element={<PortfolioDetail />} />
                    <Route path="/watchlists" element={<Watchlists />} />
                    <Route path="/watchlist/:id" element={<WatchlistDetail />} />
                    <Route path="/article/:id" element={<ArticlePage />} />
                    <Route path="/user/:userId" element={<UserProfile />} />
                    <Route path="/accounts/edit" element={<EditProfilePage />} />
                    <Route path="/discover" element={<DiscoverPage />} />
                    <Route path="/market-research" element={<MarketResearchPage />} />
                    <Route path="/instrument/:ticker" element={<InstrumentPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
