export interface FoodFromDB {
    id: string;
    name: string;
    brand?: string;
    serving_size: number;
    serving_unit: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    category?: string;
    measurement_type?: 'weight' | 'unit';
}

export interface FoodItem {
    id: string;
    food_id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    amount: number;
    unit: string;
    baseCalories: number;
    baseProtein: number;
    baseCarbs: number;
    baseFat: number;
    category?: string;
    measurementType: 'weight' | 'unit';
}

export interface Meal {
    id: string;
    name: string;
    calories: number;
    hasFood: boolean;
    foods: FoodItem[];
}

export interface MealTemplate {
    id: string;
    name: string;
    description?: string;
    is_public: boolean;
    meals: Meal[];
}

export interface CreateMealTemplateRequest {
    name: string;
    description?: string;
    is_public: boolean;
    meals: {
        meal_type: string;
        foods: {
            food_id: string;
            amount: number;
        }[];
    }[];
}
