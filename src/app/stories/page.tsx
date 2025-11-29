'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Clock, Star, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useGenerateStory, useRecentStories } from '@/lib/hooks/use-stories';
import { useUserProfile } from '@/store/user-profile';
import { useState } from 'react';
import { toast } from 'sonner';
import { LisaLoading } from '@/components/lisa';

export default function StoriesPage() {
  const profile = useUserProfile((state) => state.profile);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  
  // Fetch recent stories
  const { data: recentStoriesData, isLoading: loadingRecent } = useRecentStories(profile?.readingLevel);
  const recentStories = recentStoriesData?.stories || [];
  
  // Generate story mutation
  const { mutate: generateStory, isPending: isGenerating } = useGenerateStory();

  if (!profile) return null;

  const handleGenerateStory = () => {
    if (!profile.favoriteThemes || profile.favoriteThemes.length === 0) {
      toast.error('Please complete your profile with favorite themes first!');
      return;
    }

    const randomTheme = profile.favoriteThemes[Math.floor(Math.random() * profile.favoriteThemes.length)];

    generateStory(
      {
        theme: randomTheme,
        interests: profile.interests || [],
        readingLevel: profile.readingLevel,
        age: profile.age || 8,
        difficultyMultiplier: profile.difficultyMultiplier,
      },
      {
        onSuccess: (data) => {
          toast.success(`"${data.story.title}" is ready to read! 📚`);
          setGenerateDialogOpen(false);
          // Store the generated story ID in sessionStorage to navigate to it
          sessionStorage.setItem('newStoryId', data.story.id);
          window.location.href = '/reading';
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to generate story');
        },
      }
    );
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Story Library 📚
          </h1>
          <p className="text-lg text-gray-600">
            Pick a story that excites you!
          </p>
        </div>

        {/* Tabs for filtering */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Stories</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {loadingRecent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-purple-600" size={48} />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentStories.map((story: any, index: number) => (
                  <StoryCard key={story.id} story={story} index={index} />
                ))}
                
                {/* Generate New Story Card */}
                <GenerateStoryCard 
                  index={recentStories.length} 
                  onGenerate={() => setGenerateDialogOpen(true)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="new" className="mt-6">
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">New Stories Coming Soon!</h3>
              <p className="text-gray-600">Check back later for fresh adventures.</p>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Favorites Yet</h3>
              <p className="text-gray-600 mb-4">Start reading stories and mark your favorites!</p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Generate Story Dialog */}
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Your Story ✨</DialogTitle>
              <DialogDescription>
                Lisa will create a personalized story just for you!
              </DialogDescription>
            </DialogHeader>
            
            {isGenerating ? (
              <div className="py-8">
                <LisaLoading message="Creating your story..." />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-gray-800 mb-2">Your Story Will Include:</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>📚 Reading Level: <strong>{profile.readingLevel}</strong></li>
                    <li>🎨 Themes: <strong>{profile.favoriteThemes?.join(', ') || 'None selected'}</strong></li>
                    <li>💡 Interests: <strong>{profile.interests?.join(', ') || 'None selected'}</strong></li>
                    <li>⭐ Difficulty: <strong>{profile.difficultyMultiplier}x</strong></li>
                  </ul>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleGenerateStory}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={16} />
                      Generate Story
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

function StoryCard({ story, index }: { story: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className="p-6 hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
        <div className="flex items-start justify-between mb-4">
          <div className="text-5xl">{story.emoji}</div>
          <Badge variant="secondary">{story.readingLevel || story.level}</Badge>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
          {story.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 flex-1">
          {story.description || `A ${story.theme} story for you!`}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <BookOpen size={14} />
            {story.wordCount} words
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            ~{story.estimatedTime} min
          </span>
        </div>

        <Link href="/reading" className="w-full">
          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            Start Reading
            <BookOpen className="ml-2" size={16} />
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}

function GenerateStoryCard({ index, onGenerate }: { index: number; onGenerate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card 
        className="p-6 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center justify-center text-center group cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50"
        onClick={onGenerate}
      >
        <motion.div
          className="text-6xl mb-4"
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.5 }}
        >
          <Sparkles className="text-purple-500" size={64} />
        </motion.div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
          Create New Story
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Let Lisa generate a personalized story just for you!
        </p>

        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          Generate Story
          <Star className="ml-2" size={16} />
        </Button>
      </Card>
    </motion.div>
  );
}
