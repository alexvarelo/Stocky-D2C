import { useState } from 'react';
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { StockyLogo } from '@/components/brand/StockyLogo';
import { TrendingUp, Shield, Globe, ArrowRight, ArrowLeft, Loader2, MailCheck } from 'lucide-react';

const MIN_PASSWORD_LENGTH = 8;

type AuthMode = 'signin' | 'signup' | 'forgot';

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A11.99 11.99 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.63H1.26A11.99 11.99 0 0 0 0 12c0 1.94.46 3.77 1.26 5.37l4.01-3.09Z" />
    <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.63l4.01 3.09C6.22 6.88 8.87 4.77 12 4.77Z" />
  </svg>
);

const Auth = () => {
  const { user, loading, signIn, signUp, resetPassword, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [resetSent, setResetSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: ''
  });
  const [formErrors, setFormErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(formData.email, formData.password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof formErrors = {};
    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Must be at least ${MIN_PASSWORD_LENGTH} characters long`;
    }
    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.fullName, formData.username);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await resetPassword(formData.email);
      if (!error) {
        setResetSent(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const enterForgotMode = () => {
    setFormErrors({});
    setResetSent(false);
    setMode('forgot');
  };

  const backToSignIn = () => {
    setResetSent(false);
    setMode('signin');
    setActiveTab('signin');
  };

  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-background overflow-hidden">
      {/* Left Panel - Branding (Desktop) — Revolut dark canvas */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#000000] text-white overflow-hidden">
        {/* Subtle cobalt ambient glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#494fdf]/15 blur-[140px]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <div className="flex items-center gap-3">
            <StockyLogo variant="paper" size={40} animated />
            <span className="text-xl font-semibold tracking-tight">Stocky</span>
          </div>

          <div className="space-y-10 max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-[56px] font-medium leading-[1.0] tracking-[-0.8px] mb-6">
                The future of<br />social investing
              </h1>
              <p className="text-lg text-white/70 leading-relaxed font-normal" style={{ letterSpacing: '-0.09px' }}>
                Join a global community of investors. Track portfolios, share insights, and grow your wealth with professional-grade tools.
              </p>
            </motion.div>

            <div className="space-y-5">
              <FeatureRow icon={TrendingUp} title="Advanced Analytics" description="Performance, allocation and dividends in one place" delay={0.2} />
              <FeatureRow icon={Globe} title="Global Markets" description="Track stocks and ETFs from US and European exchanges" delay={0.3} />
              <FeatureRow icon={Shield} title="Private by Default" description="Your portfolios stay private unless you choose to share them" delay={0.4} />
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/30">
            <span>© {new Date().getFullYear()} Stockfolio</span>
            <Link to="/legal/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link to="/legal/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8 space-y-4">
            <StockyLogo variant="ink" size={96} animated className="drop-shadow-xl" />
            <h2 className="text-3xl font-bold">Stocky</h2>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'forgot' ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <button
                  type="button"
                  onClick={backToSignIn}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </button>

                {resetSent ? (
                  <div className="text-center lg:text-left space-y-4 py-4">
                    <div className="mx-auto lg:mx-0 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <MailCheck className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
                      <p className="text-muted-foreground">
                        We've sent a password reset link to <span className="font-medium text-foreground">{formData.email}</span>. Follow the link to choose a new password.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full h-12" onClick={backToSignIn}>
                      Back to sign in
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="text-center lg:text-left space-y-2">
                      <h2 className="text-3xl font-bold tracking-tight">Reset your password</h2>
                      <p className="text-muted-foreground">
                        Enter the email linked to your account and we'll send you a reset link.
                      </p>
                    </div>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <Input
                        type="email"
                        name="email"
                        aria-label="Email address"
                                autoComplete="email"
                                placeholder="Email address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        autoFocus
                        className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send reset link'}
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center lg:text-left space-y-2 mb-10">
                  <h2 className="text-3xl font-bold tracking-tight">
                    {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
                  </h2>
                  <p className="text-muted-foreground">
                    {activeTab === 'signin'
                      ? 'Enter your details to access your portfolio.'
                      : 'Start your investment journey in seconds.'}
                  </p>
                </div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-full">
                    <TabsTrigger value="signin" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Sign Up</TabsTrigger>
                  </TabsList>

                  <div className="relative min-h-[320px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TabsContent value="signin" className="mt-0 space-y-6">
                          <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-2">
                              <Input
                                type="email"
                                name="email"
                                aria-label="Email address"
                                autoComplete="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <Input
                                type="password"
                                name="password"
                                aria-label="Password"
                                autoComplete="current-password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                              />
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="link"
                                  onClick={enterForgotMode}
                                  className="px-0 h-auto text-xs text-muted-foreground hover:text-primary"
                                >
                                  Forgot password?
                                </Button>
                              </div>
                            </div>
                            <Button
                              type="submit"
                              className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
                              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                          </form>
                        </TabsContent>

                        <TabsContent value="signup" className="mt-0 space-y-6">
                          <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Input
                                  type="text"
                                  name="fullName"
                                  aria-label="Full name"
                                  autoComplete="name"
                                  placeholder="Full Name"
                                  value={formData.fullName}
                                  onChange={handleInputChange}
                                  required
                                  className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                />
                              </div>
                              <div className="space-y-2">
                                <Input
                                  type="text"
                                  name="username"
                                  aria-label="Username"
                                  autoComplete="username"
                                  placeholder="Username"
                                  value={formData.username}
                                  onChange={handleInputChange}
                                  required
                                  className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Input
                                type="email"
                                name="email"
                                aria-label="Email address"
                                autoComplete="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <Input
                                type="password"
                                name="password"
                                aria-label="Create a password"
                                autoComplete="new-password"
                                aria-describedby="signup-password-hint"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                aria-invalid={!!formErrors.password}
                                className={`h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all ${formErrors.password ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                              />
                              <p id="signup-password-hint" className={`text-xs ml-1 ${formErrors.password ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {formErrors.password || `Must be at least ${MIN_PASSWORD_LENGTH} characters long`}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Input
                                type="password"
                                name="confirmPassword"
                                aria-label="Confirm password"
                                autoComplete="new-password"
                                aria-describedby={formErrors.confirmPassword ? "signup-confirm-error" : undefined}
                                placeholder="Confirm password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                aria-invalid={!!formErrors.confirmPassword}
                                className={`h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all ${formErrors.confirmPassword ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                              />
                              {formErrors.confirmPassword && (
                                <p id="signup-confirm-error" role="alert" className="text-xs text-destructive ml-1">{formErrors.confirmPassword}</p>
                              )}
                            </div>
                            <Button
                              type="submit"
                              className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                              disabled={isLoading}
                            >
                              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Account'}
                              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                            <p className="text-xs text-center text-muted-foreground">
                              By creating an account you agree to the{' '}
                              <Link to="/legal/terms" className="underline underline-offset-2 hover:text-foreground">Terms</Link>{' '}
                              and{' '}
                              <Link to="/legal/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>.
                            </p>
                          </form>
                        </TabsContent>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </Tabs>

                <div className="flex items-center gap-3 my-6">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full h-12 text-base font-medium"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="h-4 w-4 mr-2" />
                  )}
                  Continue with Google
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const FeatureRow = ({ icon: Icon, title, description, delay }: { icon: React.ElementType, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className="flex items-start gap-4"
  >
    <div className="mt-1 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
      <Icon className="h-5 w-5 text-blue-400" />
    </div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-sm text-zinc-400">{description}</p>
    </div>
  </motion.div>
);

export default Auth;
