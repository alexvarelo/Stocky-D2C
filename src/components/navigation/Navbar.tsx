import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SearchButtonWithDialog } from '@/components/search/SearchButtonWithDialog';
import { StockyLogo } from '@/components/brand/StockyLogo';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  User,
  LayoutDashboard,
  Briefcase,
  Star,
  LineChart,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portfolios', label: 'Portfolios', icon: Briefcase },
  { href: '/watchlists', label: 'Watchlists', icon: Star },
  { href: '/market-research', label: 'Market Research', icon: LineChart },
  { href: '/discover', label: 'Discovery', icon: Compass },
];

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidenav-collapsed') === '1'
  );

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      localStorage.setItem('sidenav-collapsed', prev ? '0' : '1');
      return !prev;
    });
  };

  const handleSignOut = async () => {
    await signOut();
    await queryClient.clear();
    await queryClient.invalidateQueries();
    navigate('/auth');
  };

  const isActive = (href: string) =>
    href === '/' ? location.pathname === '/' || location.pathname === '/dashboard' : location.pathname.startsWith(href);

  const profileMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2.5 rounded-xl transition-colors hover:bg-muted w-full',
            collapsed ? 'justify-center p-2' : 'px-2.5 py-2'
          )}
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.full_name || 'User'} />
            <AvatarFallback className="text-xs">
              {userProfile?.full_name
                ? userProfile.full_name.charAt(0).toUpperCase()
                : userProfile?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-medium text-foreground truncate leading-tight">
                {userProfile?.full_name || 'Account'}
              </p>
              <p className="text-[11px] text-muted-foreground truncate leading-tight">
                {userProfile?.email}
              </p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={collapsed ? 'right' : 'top'} className="w-48">
        <DropdownMenuItem
          onClick={() => userProfile?.id && navigate(`/user/${userProfile.id}`)}
          disabled={!userProfile?.id}
        >
          <User className="mr-2 h-4 w-4" />
          <span>My Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col sticky top-0 h-screen shrink-0 z-30',
          'bg-card border-r border-border transition-[width] duration-200',
          collapsed ? 'w-[68px]' : 'w-[240px]'
        )}
      >
        {/* Brand + collapse */}
        <div className={cn('flex items-center h-16 shrink-0', collapsed ? 'justify-center px-2' : 'justify-between pl-4 pr-2')}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2.5">
              <StockyLogo variant="ink" size={30} />
              <span className="text-[15px] font-bold tracking-tight text-foreground">Stocky</span>
            </Link>
          )}
          <button
            onClick={toggleCollapsed}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Search */}
        <div className={cn('px-3 pb-3', collapsed && 'hidden')}>
          <div className="[&>button]:md:w-full [&>button]:lg:w-full">
            <SearchButtonWithDialog />
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                to={href}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl text-[13.5px] transition-colors',
                  collapsed ? 'justify-center h-10' : 'px-3 py-2.5',
                  active
                    ? 'bg-muted text-foreground font-semibold'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium'
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: theme + profile */}
        <div className="px-3 py-3 border-t border-border space-y-1">
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between px-1')}>
            {!collapsed && <span className="text-[11px] font-medium text-muted-foreground">Appearance</span>}
            <ThemeToggle />
          </div>
          {profileMenu}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-background/90 backdrop-blur-md border-b border-border flex items-center px-4 gap-3">
        <Link to="/" className="flex items-center gap-2">
          <StockyLogo variant="ink" size={28} />
          <span className="text-[15px] font-bold tracking-tight text-foreground">Stocky</span>
        </Link>
        <div className="flex-1" />
        <SearchButtonWithDialog />
        <ThemeToggle />
        {userProfile?.id && (
          <button onClick={() => navigate(`/user/${userProfile.id}`)}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name || 'User'} />
              <AvatarFallback className="text-xs">
                {userProfile.full_name
                  ? userProfile.full_name.charAt(0).toUpperCase()
                  : userProfile.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </header>
    </>
  );
};
