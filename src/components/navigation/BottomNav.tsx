import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Eye, Compass, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface NavItem {
    key: 'home' | 'portfolios' | 'watchlists' | 'academy' | 'discover';
    icon: React.ElementType;
    path: string;
}

const navItems: NavItem[] = [
    { key: 'home', icon: Home, path: '/dashboard' },
    { key: 'portfolios', icon: Briefcase, path: '/portfolios' },
    { key: 'watchlists', icon: Eye, path: '/watchlists' },
    { key: 'academy', icon: GraduationCap, path: '/learn' },
    { key: 'discover', icon: Compass, path: '/discover' },
];

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation('navigation');

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav aria-label={t('mainNav')} className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border">
            <div className="flex items-center justify-around h-16 px-2 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-xl transition-colors min-w-[60px]',
                                active
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                            <span className={cn(
                                'text-[10px]',
                                active ? 'font-semibold' : 'font-medium'
                            )}>
                                {t(`links.${item.key}`)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
