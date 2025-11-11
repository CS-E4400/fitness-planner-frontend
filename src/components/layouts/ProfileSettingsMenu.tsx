import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { useTheme } from '@/contexts/ThemeProvider';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [name, setName] = useState(user?.name || 'Sarah Johnson');
  const [email, setEmail] = useState(user?.email || 'sarah.j@example.com');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isEditing, setIsEditing] = useState(false);

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar no backend
    setIsEditing(false);
    console.log('Saving profile:', { name, email, avatarUrl });
  };

  const handleAvatarChange = () => {
    // Aqui você implementaria o upload de imagem
    console.log('Change avatar clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/account')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Profile Settings</h1>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarUrl} alt={name} />
                  <AvatarFallback className="text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                  onClick={handleAvatarChange}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Click to change profile picture
              </p>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Personal Information</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                  type="email"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-4">
              <h3 className="font-medium">Appearance</h3>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === 'light' ? (
                      <Sun className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <Moon className="w-5 h-5 text-blue-500" />
                    )}
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">
                        {theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}