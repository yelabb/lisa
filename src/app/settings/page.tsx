'use client';

import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useUserProfile } from '@/store/user-profile';
import { motion } from 'framer-motion';
import { User, Palette, BookOpen, LogOut, Trash2, Save } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const profile = useUserProfile((state) => state.profile);
  const updateProfile = useUserProfile((state) => state.updateProfile);
  const resetProfile = useUserProfile((state) => state.resetProfile);

  const [name, setName] = useState(profile?.name || '');
  const [fontSize, setFontSize] = useState(16);
  const [dyslexicMode, setDyslexicMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  if (!profile) return null;

  const handleSaveProfile = () => {
    if (name.trim()) {
      updateProfile({ name });
      toast.success('Profile updated! 🎉', {
        description: 'Your changes have been saved.',
      });
    } else {
      toast.error('Name cannot be empty');
    }
  };

  const handleLogout = () => {
    router.push('/');
    toast.info('See you next time! 👋');
  };

  const handleReset = () => {
    if (confirm('Are you sure? This will delete all your progress!')) {
      resetProfile();
      router.push('/onboarding');
      toast.success('Progress reset. Let\'s start fresh! 🌟');
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Settings ⚙️
          </h1>
          <p className="text-lg text-gray-600">
            Customize your reading experience
          </p>
        </div>

        {/* Profile Settings */}
        <SettingsSection
          icon={<User className="text-purple-600" />}
          title="Profile"
          description="Update your personal information"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-2"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="text-6xl">
                {profile.avatarEmoji || '👤'}
              </div>
              <div className="flex-1">
                <Label>Avatar</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {profile.avatarEmoji ? 'Your current avatar' : 'Choose an avatar in onboarding'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Age</Label>
                <div className="text-2xl font-bold text-purple-600 mt-1">
                  {profile.age || '—'}
                </div>
              </div>
              <div>
                <Label>Reading Level</Label>
                <div className="text-2xl font-bold text-pink-600 mt-1 capitalize">
                  {profile.readingLevel || '—'}
                </div>
              </div>
            </div>

            <Button onClick={handleSaveProfile} className="w-full">
              <Save className="mr-2" size={16} />
              Save Profile Changes
            </Button>
          </div>
        </SettingsSection>

        {/* Theme Settings */}
        <SettingsSection
          icon={<Palette className="text-pink-600" />}
          title="Theme Preferences"
          description="Choose your favorite colors and themes"
        >
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Favorite Themes</Label>
              <div className="flex flex-wrap gap-2">
                {profile.favoriteThemes?.map((theme) => (
                  <div
                    key={theme}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium text-gray-800 border-2 border-purple-200"
                  >
                    {theme}
                  </div>
                )) || (
                  <p className="text-sm text-gray-600">No themes selected yet</p>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Interests</Label>
              <div className="flex flex-wrap gap-2">
                {profile.interests?.map((interest) => (
                  <div
                    key={interest}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-gray-800 border-2 border-blue-200"
                  >
                    {interest}
                  </div>
                )) || (
                  <p className="text-sm text-gray-600">No interests selected yet</p>
                )}
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Reading Settings */}
        <SettingsSection
          icon={<BookOpen className="text-blue-600" />}
          title="Reading Preferences"
          description="Adjust settings to make reading easier"
        >
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <Label>Font Size</Label>
                <span className="text-sm font-medium text-gray-600">{fontSize}px</span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-gray-600 mt-2" style={{ fontSize: `${fontSize}px` }}>
                Preview: The quick brown fox jumps over the lazy dog.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Dyslexic-Friendly Font</Label>
                <p className="text-sm text-gray-600">
                  Use an easier-to-read font designed for dyslexia
                </p>
              </div>
              <Switch
                checked={dyslexicMode}
                onCheckedChange={setDyslexicMode}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Reduce Motion</Label>
                <p className="text-sm text-gray-600">
                  Minimize animations for a calmer experience
                </p>
              </div>
              <Switch
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Account Actions */}
        <Card className="p-6 border-2 border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Account Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" size={16} />
              Back to Home
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              onClick={handleReset}
            >
              <Trash2 className="mr-2" size={16} />
              Reset All Progress
            </Button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              <strong>⚠️ Warning:</strong> Resetting will permanently delete all your stories, progress, and achievements. This cannot be undone!
            </p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6 border-2 border-gray-200">
        <div className="flex items-start gap-3 mb-6">
          <div className="mt-1">{icon}</div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        {children}
      </Card>
    </motion.div>
  );
}
