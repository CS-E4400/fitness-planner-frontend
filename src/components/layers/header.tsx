interface HeaderProps {
  activeTab: string;
  userRole: 'user';
}

export default function Header({ activeTab }: HeaderProps) {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  const getHeaderContent = () => {
    switch (activeTab) {
      case 'today':
        return {
          title: dateStr,
          subtitle: "You've got this! 💪"
        };
      case 'session':
        return {
          title: 'Workout Session',
          subtitle: 'Track your progress'
        };
      case 'nutrition':
        return {
          title: 'Nutrition',
          subtitle: 'Fuel your body right'
        };
      case 'progress':
        return {
          title: 'Progress',
          subtitle: 'See how far you\'ve come'
        };
      case 'account':
        return {
          title: 'Account',
          subtitle: 'Manage your profile'
        };
      default:
        return {
          title: dateStr,
          subtitle: "Welcome back!"
        };
    }
  };

  const content = getHeaderContent();

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-1">
          <h1 className="text-2xl tracking-tight text-foreground">{content.title}</h1>
          <p className="text-sm text-muted-foreground">{content.subtitle}</p>
        </div>
      </div>
    </div>
  );
}