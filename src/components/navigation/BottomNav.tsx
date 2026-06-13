import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Eye, Compass, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    icon: React.ElementType;
    path: string;
}

const navItems: NavItem[] = [
    { label: 'Home', icon: Home, path: '/dashboard' },
    { label: 'Portfolios', icon: Briefcase, path: '/portfolios' },
    { label: 'Watchlists', icon: Eye, path: '/watchlists' },
    { label: 'Discovery', icon: Compass, path: '/discover' },
    { label: 'Research', icon: TrendingUp, path: '/market-research' },
];

export function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#000000] border-t border-white/[0.08]">
            <div className="flex items-center justify-around h-16 px-2 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]',
                                active
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <div className="relative">
                                <Icon className={cn('h-5 w-5', active && 'scale-110')} />
                                {active && (
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </div>
                            <span className={cn(
                                'text-[10px] font-medium',
                                active && 'font-semibold'
                            )}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
