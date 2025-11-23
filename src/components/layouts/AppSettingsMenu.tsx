import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Moon, Sun, Scale } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useTheme } from '@/contexts/ThemeProvider';
import { RootState, AppDispatch } from '@/redux/store';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/redux/features/authSlice';
import { useState, useEffect } from 'react';

export default function AppSettingsMenu() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [localWeightUnit, setLocalWeightUnit] = useState<'kg' | 'lbs'>('kg');

  // Sincronizar com Redux quando user muda
  useEffect(() => {
    if (user?.weight_unit) {
      setLocalWeightUnit(user.weight_unit);
    }
  }, [user?.weight_unit]);

  const handleChangeWeightUnit = async (newUnit: 'kg' | 'lbs') => {
    if (!user?.id || isUpdating || localWeightUnit === newUnit) return;

    setIsUpdating(true);
    
    // Atualizar localmente primeiro para feedback imediato
    setLocalWeightUnit(newUnit);

    try {
      const { error } = await supabase
        .from('users')
        .update({ weight_unit: newUnit })
        .eq('id', user.id);

      if (error) throw error;

      // Atualizar Redux
      await dispatch(getSession()).unwrap();
      
      setDialogMessage(`Weight unit changed to ${newUnit.toUpperCase()} successfully!`);
      setIsError(false);
      setIsSuccessDialogOpen(true);
    } catch (error: any) {
      console.error('Error updating weight unit:', error);
      // Reverter mudança local se houver erro
      setLocalWeightUnit(user?.weight_unit || 'kg');
      setDialogMessage('Error updating weight unit. Please try again.');
      setIsError(true);
      setIsSuccessDialogOpen(true);
    } finally {
      setIsUpdating(false);
    }
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

        {/* Units Section */}
        <Card className="p-6">
          <h3 className="font-medium mb-4">Units</h3>
          
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Scale className="w-5 h-5 text-primary mt-1" />
              <div className="flex-1">
                <p className="font-medium mb-3">Weight Unit</p>
                <div className="flex gap-2">
                  <Button
                    variant={localWeightUnit === 'kg' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => handleChangeWeightUnit('kg')}
                    disabled={isUpdating}
                  >
                    Kilograms (kg)
                  </Button>
                  <Button
                    variant={localWeightUnit === 'lbs' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => handleChangeWeightUnit('lbs')}
                    disabled={isUpdating}
                  >
                    Pounds (lbs)
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {isUpdating ? 'Updating...' : `Currently using ${localWeightUnit === 'kg' ? 'Kilograms' : 'Pounds'}`}
                </p>
              </div>
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

      {/* Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isError ? 'Error' : 'Success'}
            </DialogTitle>
            <DialogDescription>
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsSuccessDialogOpen(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}