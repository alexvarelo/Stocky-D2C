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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border">
            <div className="flex items-center justify-around h-16 px-2 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-[64px]',
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
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
