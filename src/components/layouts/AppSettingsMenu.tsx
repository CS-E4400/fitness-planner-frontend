import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { useTheme } from '@/contexts/ThemeProvider';

export default function AppSettingsMenu() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
          <h1 className="text-2xl font-semibold">App Settings</h1>
        </div>

        {/* Appearance Section */}
        <Card className="p-6">
          <h3 className="font-medium mb-4">Appearance</h3>
          
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
        </Card>

        {/* Info Card */}
        <Card className="p-6 bg-muted/50">
          <div className="space-y-2">
            <h3 className="font-medium">About</h3>
            <p className="text-sm text-muted-foreground">
              Fitness Planner helps you track your workouts, nutrition, and progress all in one place.
            </p>
            <div className="pt-4 text-xs text-muted-foreground">
              Version 1.0.0
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}