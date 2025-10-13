import { Home, Dumbbell, Apple, TrendingUp, User/*, Plus, BookOpen, Users */} from 'lucide-react';

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TopNavigation({ activeTab, onTabChange}: TopNavigationProps) {
  const userTabs = [
    { id: 'today', icon: Home, label: 'Today' },
    { id: 'session', icon: Dumbbell, label: 'Session' },
    { id: 'nutrition', icon: Apple, label: 'Nutrition' },
    { id: 'progress', icon: TrendingUp, label: 'Progress' },
    { id: 'account', icon: User, label: 'Account' },
  ];

  /*const trainerTabs = [
    { id: 'create-workout', icon: Plus, label: 'Workouts' },
    { id: 'create-meal', icon: BookOpen, label: 'Meals' },
    { id: 'clients', icon: Users, label: 'Clients' },
    { id: 'progress', icon: TrendingUp, label: 'Analytics' },
    { id: 'account', icon: User, label: 'Account' },
  ];*/

  const tabs = userTabs;

  return (
    <nav className="border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center gap-2 py-4 transition-colors ${
                  isActive 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}