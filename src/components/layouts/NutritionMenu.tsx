import { Plus, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number;
  unit: string;
}

interface Meal {
  id: string;
  name: string;
  calories: number;
  hasFood: boolean;
  foods: FoodItem[];
}

interface NutritionMenuProps {
  onAddFood?: (mealId: string) => void;
  onFinish?: () => void;
}

export default function NutritionMenu({ onAddFood, onFinish }: NutritionMenuProps) {
  const navigate = useNavigate();
  const [dailyCalories] = useState(1680);
  const [protein] = useState(109);
  const [carbs] = useState(168);
  const [fat] = useState(9);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const [meals, setMeals] = useState<Meal[]>([
    { 
      id: '1', 
      name: 'Breakfast', 
      calories: 420, 
      hasFood: true,
      foods: [
        {
          id: '1',
          name: 'Oatmeal with Banana',
          calories: 320,
          protein: 12,
          carbs: 58,
          fat: 6,
          amount: 150,
          unit: 'g'
        },
        {
          id: '2',
          name: 'Greek Yogurt',
          calories: 100,
          protein: 15,
          carbs: 8,
          fat: 2,
          amount: 150,
          unit: 'g'
        }
      ]
    },
    { id: '2', name: 'Lunch', calories: 560, hasFood: false, foods: [] },
    { id: '3', name: 'Dinner', calories: 480, hasFood: false, foods: [] },
    { id: '4', name: 'Snacks', calories: 220, hasFood: false, foods: [] }
  ]);

  const foodDatabase = [
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'Protein' },
    { name: 'Brown Rice', calories: 112, protein: 2.6, carbs: 23, fat: 0.9, category: 'Carbs' },
    { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: 'Vegetables' },
    { name: 'Salmon', calories: 208, protein: 22, carbs: 0, fat: 13, category: 'Protein' },
    { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'Carbs' },
    { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, category: 'Dairy' },
    { name: 'Almonds', calories: 576, protein: 21, carbs: 22, fat: 49, category: 'Nuts' },
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'Fruits' },
    { name: 'Oatmeal', calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, category: 'Grains' },
    { name: 'Eggs', calories: 155, protein: 13, carbs: 1.1, fat: 11, category: 'Protein' }
  ];

  const totalConsumed = meals.reduce((sum, meal) => sum + (meal.hasFood ? meal.calories : 0), 0);

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFood = (mealId: string) => {
    setSelectedMealId(mealId);
    setIsAddFoodOpen(true);
  };

  const addFoodToMeal = (food: any) => {
    const newFood: FoodItem = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      amount: 100,
      unit: 'g'
    };

    setMeals(prevMeals => 
      prevMeals.map(meal => 
        meal.id === selectedMealId 
          ? { 
              ...meal, 
              hasFood: true,
              foods: [...meal.foods, newFood],
              calories: meal.calories + food.calories
            }
          : meal
      )
    );
    
    setIsAddFoodOpen(false);
    setSearchTerm('');
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Protein': 'bg-red-100 text-red-800',
      'Carbs': 'bg-yellow-100 text-yellow-800',
      'Vegetables': 'bg-green-100 text-green-800',
      'Fruits': 'bg-orange-100 text-orange-800',
      'Dairy': 'bg-blue-100 text-blue-800',
      'Nuts': 'bg-purple-100 text-purple-800',
      'Grains': 'bg-amber-100 text-amber-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleFinish = () => {
    onFinish?.();
    navigate('/');
  };

  return (
    <div className="p-4 space-y-6">
      <Card className="p-4">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl">{dailyCalories}</p>
            <p className="text-xs text-muted-foreground">Goal</p>
          </div>
          <div>
            <p className="text-2xl">{protein}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div>
            <p className="text-2xl">{carbs}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="text-2xl">{fat}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {meals.map((meal) => (
          <Card key={meal.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3>{meal.name}</h3>
                  {meal.hasFood && (
                    <p className="text-sm text-muted-foreground">{meal.calories} cal</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {!meal.hasFood ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAddFood(meal.id)}
                    >
                      Add food
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        placeholder="Quantity"
                        className="w-20 h-8"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleAddFood(meal.id)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {meal.hasFood && meal.foods.length > 0 && (
                <div className="space-y-2">
                  {meal.foods.map((food) => (
                    <div key={food.id} className="flex items-center justify-between text-sm bg-muted/30 p-2 rounded">
                      <div>
                        <p>{food.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.amount}{food.unit} • {food.calories} cal
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <p>P: {food.protein}g</p>
                        <p>C: {food.carbs}g F: {food.fat}g</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Dialog open={isAddFoodOpen} onOpenChange={setIsAddFoodOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleAddFood('new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add food
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Food</DialogTitle>
              <DialogDescription>
                Search and select foods to add to your meal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search foods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredFoods.map((food, index) => (
                  <Card 
                    key={index} 
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => addFoodToMeal(food)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4>{food.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {food.calories} cal per 100g
                        </p>
                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                          <span>P: {food.protein}g</span>
                          <span>C: {food.carbs}g</span>
                          <span>F: {food.fat}g</span>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getCategoryColor(food.category)}`}>
                        {food.category}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          onClick={handleFinish}
          className="flex-1"
        >
          Finish
        </Button>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Calories remaining</p>
          <p className="text-xl">{dailyCalories - totalConsumed}</p>
        </div>
      </Card>
    </div>
  );
}