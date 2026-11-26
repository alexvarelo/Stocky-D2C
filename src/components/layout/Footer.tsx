import { Link } from 'react-router-dom';
import { Mail, BarChart3, Code } from 'lucide-react';
import { StockyLogo } from '@/components/brand/StockyLogo';
import { useTranslation } from 'react-i18next';

const LEGAL_LINKS = [
    { to: '/legal/terms', key: 'terms' },
    { to: '/legal/privacy', key: 'privacy' },
    { to: '/legal/disclaimer', key: 'disclaimer' },
] as const;

export const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="w-full border-t border-border bg-background py-8 mt-auto text-muted-foreground">
            <div className="container mx-auto px-6 md:px-12 flex flex-col gap-6 text-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <StockyLogo variant="mark" size={26} className="text-foreground" />
                        <span className="font-semibold text-foreground">Stocky</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{t('footer.marketData')}</span>
                        </div>
                        <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            <a href="mailto:stockyfolio@gmail.com">
                                stockyfolio@gmail.com
                            </a>
                        </div>
                        <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                            <Code className="h-3.5 w-3.5" aria-hidden="true" />
                            <a href="https://stockfolio-api-229460767991.europe-west1.run.app/" target="_blank" rel="noopener noreferrer">
                                {t('footer.api')}
                                <span className="sr-only"> {t('a11y.opensNewTab')}</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-3 border-t border-border/60 pt-5 text-xs">
                    <p className="text-center md:text-left max-w-xl">
                        {t('footer.notice')}
                    </p>
                    <nav aria-label={t('footer.legal')} className="flex items-center gap-4">
                        {LEGAL_LINKS.map((link) => (
                            <Link key={link.to} to={link.to} className="hover:text-foreground transition-colors">
                                {t(`footer.links.${link.key}`)}
                            </Link>
                        ))}
                        <span>© {new Date().getFullYear()} Stockfolio</span>
                    </nav>
                </div>
            </div>
        </footer>
    );
};
