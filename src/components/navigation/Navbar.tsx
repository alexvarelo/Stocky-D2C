import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SearchButtonWithDialog } from '@/components/search/SearchButtonWithDialog';
import { NavLinks } from './NavLinks';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    await signOut();
    // Clear all cached queries
    await queryClient.clear();
    // Invalidate all queries to ensure fresh data on next login
    await queryClient.invalidateQueries();
    navigate('/auth');
  };

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/portfolios", label: "Portfolios" },
    { href: "/watchlists", label: "Watchlists" },
    { href: "/market-research", label: "Market Research" },
    { href: "/discover", label: "Discovery" },
  ];

  return (
    <header className="bg-[#000000] sticky top-0 z-30 border-b border-white/[0.08]">
      <div className="flex h-16 items-center px-4 gap-4 max-w-[2000px] mx-auto">
        {/* User Profile Picture - Clickable */}
        <div className="flex items-center gap-2">
          {userProfile?.id ? (
            <button
              onClick={() => navigate(`/user/${userProfile.id}`)}
              className="rounded-full hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name || 'User'} />
                <AvatarFallback>
                  {userProfile.full_name
                    ? userProfile.full_name.charAt(0).toUpperCase()
                    : userProfile.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLinks links={navLinks} currentPath={location.pathname} />
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Search button - visible on all screen sizes */}
          <div className="block">
            <SearchButtonWithDialog />
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-white/70 hover:text-white hover:bg-white/10">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => userProfile?.username && navigate(`/${userProfile.username}`)}
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
        </div>
      </div>
    </header>
  );
};
