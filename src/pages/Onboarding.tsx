import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StockyLogo } from '@/components/brand/StockyLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { TERMS_VERSION } from '@/pages/legal/legalContent';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, TrendingUp } from 'lucide-react';

type Step = 'welcome' | 'identity' | 'personalize' | 'done';
const FORM_STEPS: Step[] = ['identity', 'personalize'];

const Onboarding = () => {
  const { user, userProfile, profileLoading, refetchUserProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('welcome');
  const [submitting, setSubmitting] = useState(false);
  const [fields, setFields] = useState({
    username: '',
    fullName: '',
    bio: '',
    avatarUrl: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; fullName?: string; terms?: string }>({});

  // Already onboarded — nothing to do here.
  useEffect(() => {
    if (!profileLoading && userProfile) {
      navigate('/dashboard', { replace: true });
    }
  }, [profileLoading, userProfile, navigate]);

  // Prefill from OAuth / signup metadata once we know who's asking.
  useEffect(() => {
    if (!user) return;
    setFields(prev => ({
      username: prev.username || user.user_metadata?.username || '',
      fullName: prev.fullName || user.user_metadata?.full_name || user.user_metadata?.name || '',
      bio: prev.bio,
      avatarUrl: prev.avatarUrl || user.user_metadata?.avatar_url || '',
    }));
  }, [user]);

  const firstName = (fields.fullName || user?.email || '').split(/[\s@]/)[0];

  const updateField = (name: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields(prev => ({ ...prev, [name]: e.target.value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const goToIdentity = () => setStep('identity');

  const validateIdentity = () => {
    const next: typeof errors = {};
    if (fields.username.trim().length < 3) next.username = 'Username must be at least 3 characters';
    if (!fields.fullName.trim()) next.fullName = 'Full name is required';
    if (!acceptedTerms) next.terms = 'Please accept the Terms and Privacy Policy to continue';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goToPersonalize = () => {
    if (validateIdentity()) setStep('personalize');
  };

  const finishOnboarding = async (skip: boolean) => {
    if (!user) return;
    if (!skip && !validateIdentity()) {
      setStep('identity');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('users').insert({
        id: user.id,
        email: user.email || '',
        username: fields.username,
        full_name: fields.fullName,
        bio: fields.bio || null,
        website: null,
        avatar_url: fields.avatarUrl || null,
        terms_accepted_at: new Date().toISOString(),
        terms_version: TERMS_VERSION,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      await refetchUserProfile();
      setStep('done');
      setTimeout(() => navigate('/dashboard', { replace: true }), 1600);
    } catch (error) {
      toast({
        title: 'Something went wrong',
        description: error instanceof Error ? error.message : 'Failed to save your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentIndex = FORM_STEPS.indexOf(step);

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden flex flex-col">
      {/* Ambient cobalt glow, echoes the sign-in canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[#494fdf]/20 blur-[150px]"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#494fdf]/10 blur-[150px]"
        />
      </div>

      {/* Progress — only meaningful during the form steps */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-8 sm:px-10">
        <div className="flex items-center gap-2.5">
          <StockyLogo variant="paper" size={28} />
          <span className="text-sm font-semibold tracking-tight text-white/70">Stocky</span>
        </div>

        {currentIndex >= 0 && (
          <div className="flex items-center gap-1.5">
            {FORM_STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-6 bg-white' : i < currentIndex ? 'w-1.5 bg-white' : 'w-1.5 bg-white/25'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                className="text-center space-y-8"
              >
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
                  className="flex justify-center"
                >
                  <StockyLogo variant="paper" size={88} animated />
                </motion.div>

                <div className="space-y-3">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-4xl font-medium leading-[1.05] tracking-[-0.4px]"
                  >
                    Welcome to Stocky,<br />{firstName}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="text-white/60 text-base leading-relaxed max-w-sm mx-auto"
                  >
                    Let's set up your profile — it takes less than a minute and gets you straight to the market.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.4 }}
                >
                  <Button onClick={goToIdentity} size="xl" className="w-full sm:w-auto px-10">
                    Let's get started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            )}

            {step === 'identity' && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-medium tracking-tight">Tell us about you</h2>
                  <p className="text-white/60 text-sm">This is how the community will find and recognize you.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Input
                      aria-label="Full name"
                      autoComplete="name"
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? 'onboarding-fullname-error' : undefined}
                      placeholder="Full name"
                      value={fields.fullName}
                      onChange={updateField('fullName')}
                      autoFocus
                      className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#494fdf] focus:ring-1 focus:ring-[#494fdf]/40"
                    />
                    {errors.fullName && <p id="onboarding-fullname-error" role="alert" className="text-xs text-[#ff6b7d] ml-1">{errors.fullName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Input
                      aria-label="Username"
                      autoComplete="username"
                      aria-invalid={!!errors.username}
                      aria-describedby={errors.username ? 'onboarding-username-error' : undefined}
                      placeholder="Username"
                      value={fields.username}
                      onChange={updateField('username')}
                      className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#494fdf] focus:ring-1 focus:ring-[#494fdf]/40"
                    />
                    {errors.username && <p id="onboarding-username-error" role="alert" className="text-xs text-[#ff6b7d] ml-1">{errors.username}</p>}
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="accept-terms"
                        checked={acceptedTerms}
                        onCheckedChange={(checked) => {
                          setAcceptedTerms(checked === true);
                          if (checked) setErrors(prev => ({ ...prev, terms: undefined }));
                        }}
                        aria-invalid={!!errors.terms}
                        aria-describedby={errors.terms ? 'onboarding-terms-error' : undefined}
                        className="mt-0.5 border-white/40 data-[state=checked]:bg-[#494fdf] data-[state=checked]:border-[#494fdf]"
                      />
                      <label htmlFor="accept-terms" className="text-sm text-white/70 leading-relaxed">
                        I'm 18 or older and I accept the{' '}
                        <Link to="/legal/terms" target="_blank" className="underline underline-offset-2 hover:text-white">Terms</Link>{' '}
                        and{' '}
                        <Link to="/legal/privacy" target="_blank" className="underline underline-offset-2 hover:text-white">Privacy Policy</Link>.
                        I understand Stockfolio doesn't give investment advice.
                      </label>
                    </div>
                    {errors.terms && <p id="onboarding-terms-error" role="alert" className="text-xs text-[#ff6b7d] ml-1">{errors.terms}</p>}
                  </div>
                </div>

                <Button onClick={goToPersonalize} size="xl" className="w-full">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 'personalize' && (
              <motion.div
                key="personalize"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-medium tracking-tight">Make it yours</h2>
                  <p className="text-white/60 text-sm">Optional — add a photo and a short bio, or skip for now.</p>
                </div>

                <div className="flex justify-center">
                  <Avatar className="h-20 w-20 border border-white/10">
                    <AvatarImage src={fields.avatarUrl || undefined} alt={fields.fullName} />
                    <AvatarFallback className="bg-white/10 text-white text-lg">
                      {(fields.fullName || user.email || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-4">
                  <Input
                    aria-label="Avatar URL (optional)"
                    type="url"
                    placeholder="Avatar URL (optional)"
                    value={fields.avatarUrl}
                    onChange={updateField('avatarUrl')}
                    className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#494fdf] focus:ring-1 focus:ring-[#494fdf]/40"
                  />
                  <Input
                    aria-label="Short bio (optional)"
                    placeholder="Short bio (optional)"
                    value={fields.bio}
                    onChange={updateField('bio')}
                    maxLength={200}
                    className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#494fdf] focus:ring-1 focus:ring-[#494fdf]/40"
                  />
                </div>

                <div className="space-y-3">
                  <Button onClick={() => finishOnboarding(false)} size="xl" className="w-full" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                      <>
                        Finish
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => finishOnboarding(true)}
                    disabled={submitting}
                    className="w-full text-center text-sm text-white/50 hover:text-white/80 transition-colors py-1"
                  >
                    Skip for now
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('identity')}
                  className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
                className="text-center space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 200 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#494fdf]/20"
                >
                  <CheckCircle2 className="h-8 w-8 text-[#8b8ff2]" />
                </motion.div>
                <h2 className="text-2xl font-medium tracking-tight">You're all set, {firstName}</h2>
                <p className="text-white/60 text-sm flex items-center justify-center gap-1.5">
                  <TrendingUp className="h-4 w-4" />
                  Taking you to your portfolio...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
