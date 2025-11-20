import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Camera } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/redux/features/authSlice';

export default function ProfileSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const email = user?.email || '';

  const initials = name
    .split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async () => {
    if (!user?.id || !name.trim()) {
      setDialogMessage('Name cannot be empty');
      setIsError(true);
      setIsSuccessDialogOpen(true);
      return;
    }

    setIsSaving(true);

    try {
      // Verifica se já existe outro usuário com esse nome
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('name', name.trim())
        .neq('id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingUser) {
        setDialogMessage('This name is already taken. Please choose another one.');
        setIsError(true);
        setIsSuccessDialogOpen(true);
        setIsSaving(false);
        return;
      }

      // Atualiza o nome na tabela users
      const { error: updateError } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Atualiza a sessão no Redux
      await dispatch(getSession());

      setIsEditing(false);
      setDialogMessage('Profile updated successfully!');
      setIsError(false);
      setIsSuccessDialogOpen(true);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setDialogMessage(error.message || 'Error updating profile. Please try again.');
      setIsError(true);
      setIsSuccessDialogOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = () => {
    // Aqui você implementaria o upload de imagem
    console.log('Change avatar clicked');
    setDialogMessage('Avatar upload not yet implemented');
    setIsError(false);
    setIsSuccessDialogOpen(true);
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
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="text-2xl">
                  {initials || '??'}
                </AvatarFallback>
              </Avatar>
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
                <p className="text-xs text-muted-foreground">
                  Your name must be unique
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={email}
                  disabled
                  type="email"
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name || '');
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={isSaving || !name.trim()}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
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