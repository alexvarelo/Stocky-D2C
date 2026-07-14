import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransactionDrawer } from "@/components/transactions";
import { Plus, Edit, Share2, BarChart2, Users, MoreVertical, Heart, HeartOff, Download } from "lucide-react";
import { usePortfolioFollows } from "@/api/portfolio/usePortfolioFollows";
import { PortfolioHolding } from "@/api/portfolio/portfolio";

interface PortfolioActionsProps {
  portfolioId: string;
  isOwner: boolean;
  isPublic: boolean;
  followersCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onAISummary: () => void;
  onExport: () => void;
  holdings: PortfolioHolding[];
}

export const PortfolioActions = ({
  portfolioId,
  isOwner,
  isPublic,
  followersCount,
  onEdit,
  onDelete,
  onAISummary,
  onExport,
  holdings = [],
}: PortfolioActionsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    isFollowing, 
    toggleFollow, 
    isLoading: isFollowLoading 
  } = usePortfolioFollows(portfolioId);

  const handleFollowToggle = async () => {
    try {
      await toggleFollow();
      toast({
        title: isFollowing ? "Unfollowed portfolio" : "Following portfolio",
        description: isFollowing 
          ? "You've unfollowed this portfolio" 
          : "You're now following this portfolio",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isOwner) {
    return (
      <div className="flex items-center gap-2">
        {/* AI Button */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/40 relative overflow-hidden group"
          onClick={onAISummary}
        >
          <div className="relative h-4 w-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow opacity-70 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0.5 bg-background rounded-full"></div>
            </div>
          </div>
          <span className="hidden sm:inline">AI Summary</span>
        </Button>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <TransactionDrawer
              portfolioId={portfolioId}
              onTransactionAdded={() => {
                queryClient.invalidateQueries({
                  queryKey: ["portfolio", portfolioId],
                });
                queryClient.invalidateQueries({
                  queryKey: ["portfolioTransactions", portfolioId],
                });
              }}
              holdings={holdings}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="mr-2 h-4 w-4" />
                <span>New Transaction</span>
              </DropdownMenuItem>
            </TransactionDrawer>

            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit Portfolio</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              <span>Export as Receipt</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              <span>Share</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem>
              <BarChart2 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </DropdownMenuItem>
            
            {isPublic && (
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                <span>{followersCount} Followers</span>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              <MoreVertical className="mr-2 h-4 w-4" />
              <span>Delete Portfolio</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Non-owner actions
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant={isFollowing ? "outline" : "default"} 
        size="sm" 
        className="gap-1 sm:gap-2"
        onClick={handleFollowToggle}
        disabled={isFollowLoading}
      >
        {isFollowing ? (
          <>
            <HeartOff className="h-4 w-4" />
            <span className="hidden sm:inline">Unfollow</span>
          </>
        ) : (
          <>
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Follow</span>
          </>
        )}
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </DropdownMenuItem>
          {isPublic && (
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              <span>{followersCount} Followers</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
