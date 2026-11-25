import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { AvatarSelector } from '@/components/profile/AvatarSelector';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { LanguageSelect } from '@/components/i18n/LanguageSelect';

// Built per render language so validation messages follow the UI language.
const makeProfileFormSchema = (t: TFunction) =>
  z.object({
    full_name: z.string().min(2, { message: t('settings:validation.nameMin') }),
    username: z.string().min(2, { message: t('settings:validation.usernameMin') }),
    bio: z.string().max(160).optional(),
    website: z.string().url().or(z.literal('')).optional(),
  });

type ProfileFormValues = z.infer<ReturnType<typeof makeProfileFormSchema>>;

const SettingsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation('settings');
  const profileSchema = useMemo(() => makeProfileFormSchema(t), [t]);
  interface UserProfile {
    id: string;
    full_name: string;
    username: string;
    email: string;
    bio?: string;
    website?: string;
    avatar_url?: string;
    is_public?: boolean;
    is_verified?: boolean;
    created_at?: string;
    updated_at?: string;
  }

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: userProfile?.full_name || '',
      username: userProfile?.username || '',
      bio: userProfile?.bio || '',
      website: userProfile?.website || '',
    },
  });

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('users') // Using 'users' table instead of 'profiles'
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setUserProfile(data);
        setSelectedAvatar(data.avatar_url || null);
        form.reset({
          full_name: data.full_name || '',
          username: data.username || '',
          bio: data.bio || '',
          website: data.website || '',
        });
      }
    };

    fetchProfile();
  }, [user]);

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Update profile in database
      const updates = {
        id: user.id,
        full_name: data.full_name,
        username: data.username,
        bio: data.bio,
        website: data.website,
        avatar_url: selectedAvatar || userProfile?.avatar_url,
        updated_at: new Date().toISOString(),
        // Include required fields from the users table
        email: user.email || '',
        is_public: userProfile?.is_public ?? true,
        is_verified: userProfile?.is_verified ?? false,
        created_at: userProfile?.created_at || new Date().toISOString()
      };

      const { error } = await supabase
        .from('users')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      // Update local profile state
      setUserProfile(prev => ({
        ...prev,
        ...updates,
      } as any));

      toast({
        title: t('toast.updated'),
        description: t('toast.updatedDescription'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('common:status.error'),
        description: t('toast.error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
            <TabsTrigger value="preferences">{t('tabs.preferences')}</TabsTrigger>
            <TabsTrigger value="account" disabled>
              {t('tabs.account')}
            </TabsTrigger>
            <TabsTrigger value="notifications" disabled>
              {t('tabs.notifications')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('avatar.title')}</CardTitle>
                <CardDescription>
                  {t('avatar.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={selectedAvatar || userProfile?.avatar_url} 
                        alt={userProfile?.full_name || t('navigation:user')}
                      />
                      <AvatarFallback>
                        {(userProfile?.full_name || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {t('avatar.preview')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <AvatarSelector 
                      onSelect={handleAvatarSelect} 
                      currentAvatarUrl={userProfile?.avatar_url} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('profile.title')}</CardTitle>
                <CardDescription>
                  {t('profile.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="full_name" className="text-sm font-medium">
                        {t('profile.fullName')}
                      </label>
                      <Input
                        id="full_name"
                        placeholder="John Doe"
                        {...form.register('full_name')}
                      />
                      {form.formState.errors.full_name && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.full_name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">
                        {t('profile.username')}
                      </label>
                      <Input
                        id="username"
                        placeholder="johndoe"
                        {...form.register('username')}
                      />
                      {form.formState.errors.username && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      {t('profile.bio')}
                    </label>
                    <Textarea
                      id="bio"
                      placeholder={t('profile.bioPlaceholder')}
                      className="min-h-[100px]"
                      {...form.register('bio')}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('profile.bioHint')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="website" className="text-sm font-medium">
                      {t('profile.website')}
                    </label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://example.com"
                      {...form.register('website')}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {t('profile.submit')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('common:language.label')}</CardTitle>
                <CardDescription>{t('common:language.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageSelect id="language" className="w-full sm:w-64" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SettingsPage;
