import { Plus, Search, X, Save, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useGetMealTemplatesQuery, useCreateMealTemplateMutation, useDeleteMealTemplateMutation } from '@/redux/api/mealTemplatesApi';
import { useGetFoodsQuery } from '@/redux/api/foodsApi';
import { useCreateMealMutation, useDeleteMealsMutation } from '@/redux/api/mealsApi';
import { MealTemplate, Meal, FoodItem, FoodFromDB } from '@/types';

const categoryColors: Record<string, string> = {
  Protein: "bg-red-200 text-red-800",
  Vegetables: "bg-green-200 text-green-800",
  Fruit: "bg-orange-200 text-orange-800",
  Carbs: "bg-yellow-200 text-yellow-800",
  'Whole Grains': "bg-amber-200 text-amber-800",
  Dairy: "bg-blue-200 text-blue-800",
  Legumes: "bg-purple-200 text-purple-800",
  'Healthy Fats': "bg-lime-200 text-lime-800",
  Dessert: "bg-pink-200 text-pink-800",
  Sweetener: "bg-yellow-100 text-yellow-900",
};

interface NutritionMenuProps {
  onAddFood: (food: any) => void;
  onFinish?: () => void;
}

export default function NutritionMenu({ onAddFood, onFinish }: NutritionMenuProps) {
  // Suppress unused variable warning
  void onAddFood;
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // RTK Query Hooks
  const { data: rawPublicTemplates, isLoading: isLoadingPublic } = useGetMealTemplatesQuery({ public: true });
  const { data: rawUserTemplates, isLoading: isLoadingUser } = useGetMealTemplatesQuery({ public: false }, { skip: !user });
  const [createTemplate] = useCreateMealTemplateMutation();
  const [deleteTemplate] = useDeleteMealTemplateMutation();

  const { data: foodDatabase = [], isLoading: isLoadingFoods } = useGetFoodsQuery();
  const [createMeal] = useCreateMealMutation();
  const [deleteMeals] = useDeleteMealsMutation();

  const [dailyCalories, setDailyCalories] = useState(1680);
  const [proteinGoal, setProteinGoal] = useState(109);
  const [carbsGoal, setCarbsGoal] = useState(168);
  const [fatGoal, setFatGoal] = useState(9);
  const [isEditingGoals, setIsEditingGoals] = useState(false);

  // Temporary values for editing
  const [tempProtein, setTempProtein] = useState(proteinGoal.toString());
  const [tempCarbs, setTempCarbs] = useState(carbsGoal.toString());
  const [tempFat, setTempFat] = useState(fatGoal.toString());

  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [, setIsEditing] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  const [meals, setMeals] = useState<Meal[]>([
    { id: '1', name: 'Breakfast', calories: 0, hasFood: false, foods: [] },
    { id: '2', name: 'Lunch', calories: 0, hasFood: false, foods: [] },
    { id: '3', name: 'Dinner', calories: 0, hasFood: false, foods: [] },
    { id: '4', name: 'Snacks', calories: 0, hasFood: false, foods: [] }
  ]);

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Format templates helper
  const formatTemplates = (data: any[]): MealTemplate[] => {
    return data.map(template => {
      const meals: Meal[] = [
        { id: '1', name: 'Breakfast', calories: 0, hasFood: false, foods: [] },
        { id: '2', name: 'Lunch', calories: 0, hasFood: false, foods: [] },
        { id: '3', name: 'Dinner', calories: 0, hasFood: false, foods: [] },
        { id: '4', name: 'Snacks', calories: 0, hasFood: false, foods: [] }
      ];

      template.template_meals?.forEach((tm: any) => {
        const mealIndex = meals.findIndex(m => m.name === tm.meal_type);
        if (mealIndex === -1) return;

        const foods: FoodItem[] = (tm.template_meal_foods?.map((tmf: any) => {
          const food = tmf.food;
          if (!food) return null;

          const measurementType = food.measurement_type || 'weight';

          let baseCalories, baseProtein, baseCarbs, baseFat;
          let currentCalories, currentProtein, currentCarbs, currentFat;

          if (measurementType === 'unit') {
            baseCalories = food.calories || 0;
            baseProtein = food.protein || 0;
            baseCarbs = food.carbs || 0;
            baseFat = food.fat || 0;

            currentCalories = baseCalories * tmf.amount;
            currentProtein = baseProtein * tmf.amount;
            currentCarbs = baseCarbs * tmf.amount;
            currentFat = baseFat * tmf.amount;
          } else {
            const baseFactor = 100 / food.serving_size;
            baseCalories = (food.calories || 0) * baseFactor;
            baseProtein = (food.protein || 0) * baseFactor;
            baseCarbs = (food.carbs || 0) * baseFactor;
            baseFat = (food.fat || 0) * baseFactor;

            const currentFactor = tmf.amount / 100;
            currentCalories = baseCalories * currentFactor;
            currentProtein = baseProtein * currentFactor;
            currentCarbs = baseCarbs * currentFactor;
            currentFat = baseFat * currentFactor;
          }

          return {
            id: tmf.id,
            food_id: food.id,
            name: food.name,
            category: food.category,
            amount: tmf.amount,
            unit: measurementType === 'unit' ? 'unit' : 'g',
            measurementType: measurementType,
            calories: Math.round(currentCalories),
            protein: parseFloat(currentProtein.toFixed(1)),
            carbs: parseFloat(currentCarbs.toFixed(1)),
            fat: parseFloat(currentFat.toFixed(1)),
            baseCalories,
            baseProtein,
            baseCarbs,
            baseFat
          };
        }) || []).filter((item: any) => item !== null);

        const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
        meals[mealIndex] = {
          ...meals[mealIndex],
          id: tm.id,
          hasFood: foods.length > 0,
          foods,
          calories: totalCalories
        };
      });

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        is_public: template.is_public,
        meals
      };
    });
  };

  const publicTemplates = useMemo(() => formatTemplates(rawPublicTemplates || []), [rawPublicTemplates]);
  const userTemplates = useMemo(() => formatTemplates(rawUserTemplates || []), [rawUserTemplates]);
  const isLoadingTemplates = isLoadingPublic || isLoadingUser;

  // Calculate calories automatically
  const calculateCalories = (protein: number, carbs: number, fat: number): number => {
    return Math.round((protein * 4) + (carbs * 4) + (fat * 9));
  };

  const calculatedCalories = calculateCalories(
    parseFloat(tempProtein) || 0,
    parseFloat(tempCarbs) || 0,
    parseFloat(tempFat) || 0
  );

  const handleStartEditingGoals = () => {
    setTempProtein(proteinGoal.toString());
    setTempCarbs(carbsGoal.toString());
    setTempFat(fatGoal.toString());
    setIsEditingGoals(true);
  };

  const handleSaveGoals = () => {
    const protein = parseFloat(tempProtein) || 0;
    const carbs = parseFloat(tempCarbs) || 0;
    const fat = parseFloat(tempFat) || 0;
    const calories = calculateCalories(protein, carbs, fat);

    setDailyCalories(calories);
    setProteinGoal(protein);
    setCarbsGoal(carbs);
    setFatGoal(fat);
    setIsEditingGoals(false);
  };

  const handleCancelEditGoals = () => {
    setTempProtein(proteinGoal.toString());
    setTempCarbs(carbsGoal.toString());
    setTempFat(fatGoal.toString());
    setIsEditingGoals(false);
  };






  const loadTemplate = (template: MealTemplate) => {
    setMeals(template.meals.map(meal => ({ ...meal })));

    const templateTotals = template.meals.reduce(
      (acc, meal) => {
        meal.foods.forEach(food => {
          acc.calories += food.calories;
          acc.protein += food.protein;
          acc.carbs += food.carbs;
          acc.fat += food.fat;
        });
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    setDailyCalories(Math.round(templateTotals.calories));
    setProteinGoal(Math.round(templateTotals.protein));
    setCarbsGoal(Math.round(templateTotals.carbs));
    setFatGoal(Math.round(templateTotals.fat));

    setActiveTab('create');
    setIsEditing(false);
  };

  const totals = meals.reduce(
    (acc, meal) => {
      meal.foods.forEach(food => {
        acc.calories += food.calories;
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fat += food.fat;
      });
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFood = (mealId: string) => {
    setSelectedMealId(mealId);
    setIsAddFoodOpen(true);
  };

  const addFoodToMeal = (food: FoodFromDB) => {
    const measurementType = food.measurement_type || 'weight';
    const initialAmount = measurementType === 'unit' ? 1 : 100;

    let baseCalories, baseProtein, baseCarbs, baseFat;
    let currentCalories, currentProtein, currentCarbs, currentFat;

    if (measurementType === 'unit') {
      baseCalories = food.calories || 0;
      baseProtein = food.protein || 0;
      baseCarbs = food.carbs || 0;
      baseFat = food.fat || 0;

      currentCalories = baseCalories;
      currentProtein = baseProtein;
      currentCarbs = baseCarbs;
      currentFat = baseFat;
    } else {
      const baseFactor = 100 / food.serving_size;
      baseCalories = (food.calories || 0) * baseFactor;
      baseProtein = (food.protein || 0) * baseFactor;
      baseCarbs = (food.carbs || 0) * baseFactor;
      baseFat = (food.fat || 0) * baseFactor;

      currentCalories = baseCalories;
      currentProtein = baseProtein;
      currentCarbs = baseCarbs;
      currentFat = baseFat;
    }

    const newFood: FoodItem = {
      id: `temp_${Date.now()}`,
      food_id: food.id,
      name: food.name,
      category: food.category,
      amount: initialAmount,
      unit: measurementType === 'unit' ? 'unit' : 'g',
      measurementType: measurementType,
      calories: Math.round(currentCalories),
      protein: parseFloat(currentProtein.toFixed(1)),
      carbs: parseFloat(currentCarbs.toFixed(1)),
      fat: parseFloat(currentFat.toFixed(1)),
      baseCalories,
      baseProtein,
      baseCarbs,
      baseFat
    };

    setMeals(prevMeals =>
      prevMeals.map(meal => {
        if (meal.id === selectedMealId || meal.name === selectedMealId) {
          return {
            ...meal,
            hasFood: true,
            foods: [...meal.foods, newFood],
            calories: meal.calories + newFood.calories
          };
        }
        return meal;
      })
    );

    setIsAddFoodOpen(false);
    setSearchTerm('');
  };

  const handleRemoveFood = (mealId: string, foodId: string) => {
    setMeals(prevMeals =>
      prevMeals.map(meal => {
        if (meal.id !== mealId) return meal;

        const updatedFoods = meal.foods.filter(f => f.id !== foodId);
        const updatedCalories = updatedFoods.reduce((sum, f) => sum + f.calories, 0);

        return {
          ...meal,
          foods: updatedFoods,
          hasFood: updatedFoods.length > 0,
          calories: updatedCalories
        };
      })
    );
  };

  const handleAmountChange = (mealId: string, foodId: string, newAmount: number) => {
    if (isNaN(newAmount) || newAmount <= 0) return;

    setMeals(prevMeals =>
      prevMeals.map(meal => {
        if (meal.id !== mealId) return meal;

        const updatedFoods = meal.foods.map(food => {
          if (food.id !== foodId) return food;

          let factor;
          if (food.measurementType === 'unit') {
            factor = newAmount;
          } else {
            factor = newAmount / 100;
          }

          return {
            ...food,
            amount: newAmount,
            calories: Math.round(food.baseCalories * factor),
            protein: parseFloat((food.baseProtein * factor).toFixed(1)),
            carbs: parseFloat((food.baseCarbs * factor).toFixed(1)),
            fat: parseFloat((food.baseFat * factor).toFixed(1))
          };
        });

        const updatedCalories = updatedFoods.reduce((sum, f) => sum + f.calories, 0);
        return { ...meal, foods: updatedFoods, calories: updatedCalories };
      })
    );
  };

  const handleSaveTemplate = async () => {
    if (!user?.id || !templateName.trim()) return;

    try {
      await createTemplate({
        name: templateName,
        description: templateDescription,
        is_public: false,
        meals: meals.filter(m => m.hasFood).map(m => ({
          meal_type: m.name,
          foods: m.foods.map(f => ({
            food_id: f.food_id,
            amount: f.amount
          }))
        }))
      }).unwrap();

      setIsSaveDialogOpen(false);
      setTemplateName('');
      setTemplateDescription('');


      setSuccessMessage('Template saved successfully!');
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error saving template:', error);
      setSuccessMessage('Error saving template. Please try again.');
      setIsSuccessDialogOpen(true);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate(templateToDelete).unwrap();

      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);


      setSuccessMessage('Template deleted successfully!');
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error deleting template:', error);
      setSuccessMessage('Error deleting template. Please try again.');
      setIsSuccessDialogOpen(true);
    }
  };

  const handleFinish = async () => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Delete existing meals for today
      await deleteMeals({ date: today }).unwrap();

      // Create new meals
      for (const meal of meals) {
        if (!meal.hasFood) continue;

        await createMeal({
          meal_type: meal.name,
          date: today,
          is_final: true,
          foods: meal.foods.map(f => ({
            food_id: f.food_id,
            amount: f.amount
          }))
        }).unwrap();
      }

      setSuccessMessage('Meal logged successfully!');
      setIsSuccessDialogOpen(true);

      setTimeout(() => {
        onFinish?.();
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error finishing meal:', error);
      setSuccessMessage('Error saving meal. Please try again.');
      setIsSuccessDialogOpen(true);
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-200 text-gray-800';
    return categoryColors[category] || 'bg-gray-200 text-gray-800';
  };

  const getUnitLabel = (food: FoodItem) => {
    if (food.measurementType === 'unit') {
      return food.amount === 1 ? 'unit' : 'units';
    }
    return food.unit;
  };

  const renderRemaining = (goal: number, consumed: number, label: string, unit = '') => {
    const remaining = goal - consumed;
    const isNegative = remaining < 0;
    return (
      <div>
        <p className="text-sm text-muted-foreground">{label} remaining</p>
        <p className={`text-xl ${isNegative ? 'text-red-500 font-semibold' : ''}`}>
          {isNegative ? `-${Math.abs(remaining).toFixed(1)}` : remaining.toFixed(1)}{unit}
        </p>
      </div>
    );
  };

  const renderMealEditor = () => (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Daily Goals</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={isEditingGoals ? handleSaveGoals : handleStartEditingGoals}
          >
            {isEditingGoals ? 'Save' : <Edit2 className="w-4 h-4" />}
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl">{isEditingGoals ? calculatedCalories : dailyCalories}</p>
            <p className="text-xs text-muted-foreground">Calories</p>
            {isEditingGoals && (
              <p className="text-xs text-muted-foreground mt-1">(auto)</p>
            )}
          </div>
          <div>
            {isEditingGoals ? (
              <Input
                type="number"
                value={tempProtein}
                onChange={e => setTempProtein(e.target.value)}
                className="text-center text-2xl h-14 mb-1"
                min="0"
              />
            ) : (
              <p className="text-2xl">{proteinGoal}g</p>
            )}
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div>
            {isEditingGoals ? (
              <Input
                type="number"
                value={tempCarbs}
                onChange={e => setTempCarbs(e.target.value)}
                className="text-center text-2xl h-14 mb-1"
                min="0"
              />
            ) : (
              <p className="text-2xl">{carbsGoal}g</p>
            )}
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div>
            {isEditingGoals ? (
              <Input
                type="number"
                value={tempFat}
                onChange={e => setTempFat(e.target.value)}
                className="text-center text-2xl h-14 mb-1"
                min="0"
              />
            ) : (
              <p className="text-2xl">{fatGoal}g</p>
            )}
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>
        {isEditingGoals && (
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEditGoals}
              className="mt-2"
            >
              Cancel
            </Button>
          </div>
        )}
      </Card>

      <div className="space-y-3">
        {meals.map(meal => (
          <Card key={meal.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3>{meal.name}</h3>
                  {meal.hasFood && (
                    <p className="text-sm text-muted-foreground">{meal.calories} cal</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAddFood(meal.id)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {meal.hasFood && meal.foods.length > 0 && (
                <div className="space-y-2">
                  {meal.foods.map(food => (
                    <div
                      key={food.id}
                      className="relative flex items-center justify-between text-sm bg-muted/30 p-2 rounded"
                    >
                      {food.category && (
                        <Badge className={`absolute top-2 right-2 text-xs ${getCategoryColor(food.category)}`}>
                          {food.category}
                        </Badge>
                      )}
                      <div className="flex-1 pr-20">
                        <p className="font-medium">{food.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Input
                            type="number"
                            value={food.amount}
                            onChange={e =>
                              handleAmountChange(meal.id, food.id, Number(e.target.value))
                            }
                            className="w-20 h-6 text-center"
                            min={food.measurementType === 'unit' ? 1 : 1}
                            step={food.measurementType === 'unit' ? 1 : 1}
                          />
                          <span>
                            {getUnitLabel(food)} • {food.calories} cal
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFood(meal.id, food.id)}
                        className="text-red-500 hover:text-red-700 absolute bottom-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setIsEditing(true);
            setIsSaveDialogOpen(true);
          }}
        >
          <Save className="w-4 h-4 mr-2" />
          Save as Template
        </Button>
        <Button onClick={handleFinish} className="flex-1">
          Finish
        </Button>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="grid grid-cols-4 text-center">
          {renderRemaining(dailyCalories, totals.calories, 'Calories')}
          {renderRemaining(proteinGoal, totals.protein, 'Protein', 'g')}
          {renderRemaining(carbsGoal, totals.carbs, 'Carbs', 'g')}
          {renderRemaining(fatGoal, totals.fat, 'Fat', 'g')}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="public">Meal Templates</TabsTrigger>
          <TabsTrigger value="my">My Templates</TabsTrigger>
          <TabsTrigger value="create">Log Meal</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="mt-4">
          <h2 className="text-xl font-semibold mb-4">Pre-made Meal Plans</h2>
          {isLoadingTemplates ? (
            <p className="text-center text-muted-foreground">Loading templates...</p>
          ) : publicTemplates.length === 0 ? (
            <p className="text-center text-muted-foreground">No templates available</p>
          ) : (
            <div className="space-y-3">
              {publicTemplates.map(template => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {template.meals.reduce((acc, m) => acc + (m.hasFood ? 1 : 0), 0)} meals
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => loadTemplate(template)}
                    >
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-4">
          <h2 className="text-xl font-semibold mb-4">My Saved Meal Plans</h2>
          {isLoadingTemplates ? (
            <p className="text-center text-muted-foreground">Loading your templates...</p>
          ) : userTemplates.length === 0 ? (
            <p className="text-center text-muted-foreground">You haven't saved any meal plans yet</p>
          ) : (
            <div className="space-y-3">
              {userTemplates.map(template => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {template.meals.reduce((acc, m) => acc + (m.hasFood ? 1 : 0), 0)} meals
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => loadTemplate(template)}
                      >
                        Select
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          {renderMealEditor()}
        </TabsContent>
      </Tabs>

      <Dialog open={isAddFoodOpen} onOpenChange={setIsAddFoodOpen}>
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
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {isLoadingFoods ? (
                <p className="text-center text-muted-foreground">Loading foods...</p>
              ) : filteredFoods.length === 0 ? (
                <p className="text-center text-muted-foreground">No foods found</p>
              ) : (
                filteredFoods.map(food => {
                  const isUnit = food.measurement_type === 'unit';
                  return (
                    <Card
                      key={food.id}
                      className="p-3 cursor-pointer hover:bg-accent transition-colors relative"
                      onClick={() => addFoodToMeal(food)}
                    >
                      {food.category && (
                        <Badge className={`absolute top-2 right-2 text-xs ${getCategoryColor(food.category)}`}>
                          {food.category}
                        </Badge>
                      )}
                      <div className="pr-20">
                        <h4 className="font-medium">{food.name}</h4>
                        {food.brand && (
                          <p className="text-xs text-muted-foreground">{food.brand}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {food.calories || 0} cal per {isUnit ? '1 unit' : `${food.serving_size}${food.serving_unit}`}
                        </p>
                        <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                          <span>P: {food.protein || 0}g</span>
                          <span>C: {food.carbs || 0}g</span>
                          <span>F: {food.fat || 0}g</span>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this meal plan to reuse later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="e.g., High Protein Day"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="e.g., 2500 calories, 200g protein"
                value={templateDescription}
                onChange={e => setTemplateDescription(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>Save Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTemplate}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>{successMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsSuccessDialogOpen(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}