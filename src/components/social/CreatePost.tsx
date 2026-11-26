import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearchInstruments } from '@/api/instruments/useSearchInstruments';
import { cn } from '@/lib/utils';
import { useCreatePost } from '@/api/social';
import { MarkdownEditor } from './MarkdownEditor';
import { useAuth } from '@/lib/auth';
import { CreatePostDto } from '@/types/social';
import { MessageSquare, FolderOpen, X, Search } from 'lucide-react';
import { usePortfolios } from '@/api/portfolio/usePortfolios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CompanyLogo } from '@/components/stock/CompanyLogo';
import { useTranslation } from 'react-i18next';

type FormValues = {
  content: string;
  portfolioId?: string;
  ticker?: string;
};

interface CreatePostProps {
  onPostCreated?: () => void;
  className?: string;
}

export const CreatePost = ({ onPostCreated, className }: CreatePostProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const { data: portfolios = [], isLoading: isLoadingPortfolios } = usePortfolios(user?.id);
  const { mutate: createPost, isPending: isSubmitting } = useCreatePost();
  const { toast } = useToast();
  const { t } = useTranslation('social');
  
  const { 
    handleSubmit, 
    reset, 
    formState: { errors }, 
    setValue, 
    watch 
  } = useForm<FormValues>();
  
  const content = watch('content', '');
  const selectedPortfolioId = watch('portfolioId');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(true);
  const { data: searchResults, isLoading: isSearching } = useSearchInstruments(searchQuery, {
    enabled: showSearch && searchQuery.length >= 2
  });
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleSelectInstrument = (ticker: string) => {
    setValue('ticker', ticker, { shouldValidate: true });
    setShowSearch(false);
    setSearchQuery('');
  };

  const handleRemoveInstrument = () => {
    setValue('ticker', undefined, { shouldValidate: true });
  };
  
  const handleContentChange = (value: string) => {
    setValue('content', value, { shouldValidate: true });
  };

  const onSubmit = (data: FormValues) => {
    if (!user?.id) {
      toast({
        title: t('common:status.error'),
        description: t('create.toast.signedOut'),
        variant: 'destructive',
      });
      return;
    }

    const postData: CreatePostDto = {
      user_id: user.id,
      content: data.content,
      ticker: data.ticker,
      post_type: 'GENERAL',
      is_public: true,
      portfolio_id: data.portfolioId || null,
    };

    createPost(postData, {
      onSuccess: () => {
        reset();
        setIsExpanded(false);
        toast({
          title: t('create.toast.successTitle'),
          description: t('create.toast.success'),
        });
        onPostCreated?.();
      },
      onError: (error) => {
        toast({
          title: t('common:status.error'),
          description: error.message || t('create.toast.error'),
          variant: 'destructive',
        });
      }
    });
  };

  if (!isExpanded) {
    return (
      <div 
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground',
          'hover:bg-accent/50 cursor-pointer transition-colors',
          className
        )}
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex-1 text-muted-foreground ml-1">
          {t('create.prompt')}
        </div>
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card p-4 shadow-sm', className)}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          {/* Content Editor */}
          <MarkdownEditor
            value={content}
            onChange={handleContentChange}
            placeholder={t('create.placeholder')}
            className="min-h-[120px]"
          />
          
          {/* Link to Portfolio */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('create.linkPortfolio')}</Label>
            <Select 
              value={selectedPortfolioId || 'none'}
              onValueChange={(value) => setValue('portfolioId', value === 'none' ? undefined : value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('create.selectPortfolio')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('create.noPortfolio')}</SelectItem>
                {portfolios.map((portfolio) => (
                  <SelectItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name} {!portfolio.is_public && t('create.private')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Link to Instrument */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t('create.linkInstrument')}</Label>
            {watch('ticker') ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 text-sm rounded-md bg-accent flex items-center gap-1.5">
                  <CompanyLogo ticker={watch('ticker') || ''} size={18} />
                  {watch('ticker')}
                  <button
                    type="button"
                    onClick={handleRemoveInstrument}
                    aria-label={t('create.removeInstrument')}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('create.searchInstruments')}
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                />
              </div>
            )}
            
            {showSearch && (
              <div className="relative">
                {isSearching ? (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                    <div className="p-2 text-sm text-muted-foreground">{t('create.searching')}</div>
                  </div>
                ) : searchResults && searchResults.length > 0 && searchQuery.length >= 2 ? (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                    {searchResults.map((result) => (
                      <div
                        key={result.ticker}
                        className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                        onClick={() => handleSelectInstrument(result.ticker)}
                      >
                        <div className="flex items-center gap-2">
                          <CompanyLogo ticker={result.ticker} companyName={result.name} size={20} />
                          <div className="min-w-0">
                            <div className="font-medium">{result.ticker}</div>
                            <div className="text-xs text-muted-foreground truncate">{result.name}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                    <div className="p-2 text-sm text-muted-foreground">{t('create.noInstruments')}</div>
                  </div>
                ) : null}
              </div>
            )}
            </div>
        </div>
        
        {errors.content && (
          <p className="text-sm text-red-500">
            {errors.content.message}
          </p>
        )}
        
        <div className="flex justify-between items-center pt-2">
          <div className="text-sm text-muted-foreground">
            {t('create.characters', { count: content.length, max: 1000 })}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              type="button"
              variant="ghost" 
              size="sm" 
              onClick={() => {
                reset();
                setIsExpanded(false);
              }}
            >
              {t('common:actions.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !content.trim()}
              size="sm"
            >
              {isSubmitting ? t('create.posting') : t('create.post')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
