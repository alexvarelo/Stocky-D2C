import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { StockyLogo } from '@/components/brand/StockyLogo';
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MIN_PASSWORD_LENGTH = 8;

const ResetPassword = () => {
  const { user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => navigate('/', { replace: true }), 2000);
      return () => clearTimeout(timeout);
    }
  }, [success, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (passwords.password.length < MIN_PASSWORD_LENGTH) {
      setError(t('validation.passwordMin', { count: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (passwords.password !== passwords.confirmPassword) {
      setError(t('validation.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await updatePassword(passwords.password);
      if (!updateError) {
        setSuccess(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <StockyLogo variant="ink" size={72} animated className="drop-shadow-xl" />
        </div>

        {!user ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h2 className="text-2xl font-bold tracking-tight">{t('reset.expiredTitle')}</h2>
            <p className="text-muted-foreground">
              {t('reset.expiredBody')}
            </p>
            <Button asChild className="w-full h-12">
              <Link to="/auth">{t('forgot.back')}</Link>
            </Button>
          </motion.div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{t('reset.doneTitle')}</h2>
            <p className="text-muted-foreground">{t('onboarding:done.subtitle')}</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">{t('reset.title')}</h2>
              <p className="text-muted-foreground">{t('reset.subtitle')}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={t('reset.newPassword')}
                  aria-label={t('reset.newPassword')}
                  value={passwords.password}
                  onChange={(e) => setPasswords(prev => ({ ...prev, password: e.target.value }))}
                  required
                  autoFocus
                  className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={t('reset.confirmPassword')}
                  aria-label={t('reset.confirmPassword')}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="h-12 bg-muted/30 border-muted-foreground/20 focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
                {error && <p className="text-xs text-destructive ml-1">{error}</p>}
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t('reset.submit')}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
