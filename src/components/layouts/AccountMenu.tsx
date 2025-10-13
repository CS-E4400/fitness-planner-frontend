import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useNavigate } from 'react-router-dom';

interface AccountMenuProps {
  onSignOut: () => void;
}

export default function AccountMenu({ onSignOut }: AccountMenuProps) {
  const navigate = useNavigate();

  const userInfo = {
    name: 'Sarah Johnson',
    title: 'Fitness Enthusiast',
    initials: 'SJ'
  };
  
  const handleViewWorkoutPlan = () => {
    navigate('/session');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src="" />
          <AvatarFallback>
            {userInfo.initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{userInfo.name}</h2>
          <p className="text-sm text-muted-foreground">
            {userInfo.title}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">My Plans</h3>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Workout Plan</p>
              <p className="text-sm text-muted-foreground">Upper Body Focus</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleViewWorkoutPlan}
            >
              View
            </Button>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Meal Plan</p>
              <p className="text-sm text-muted-foreground">High Protein Diet</p>
            </div>
            <Button variant="ghost" size="sm">View</Button>
          </div>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium">Settings</h3>
        <Card className="p-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            <User className="w-4 h-4 mr-3" />
            Profile Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-3" />
            App Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="w-4 h-4 mr-3" />
            Help & Support
          </Button>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground pt-4">
        Fitness Planner v1.0.0
      </div>
    </div>
  );
}