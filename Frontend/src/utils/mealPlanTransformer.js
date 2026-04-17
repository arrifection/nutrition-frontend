export function mockTransformUploadedMealPlan(file) {
    return {
        planTitle: "DietDesk Plan",
        days: [
            {
                dayLabel: "Monday",
                meals: [
                    {
                        id: "m1",
                        mealType: "Breakfast",
                        recommendedTime: "08:00 AM",
                        items: ["Oatmeal with berries", "2 egg whites"],
                        completed: false,
                    },
                    {
                        id: "m2",
                        mealType: "Lunch",
                        recommendedTime: "01:30 PM",
                        items: ["Grilled chicken salad", "Quinoa"],
                        completed: false,
                    },
                ],
            },
            {
                dayLabel: "Tuesday",
                meals: [
                    {
                        id: "m3",
                        mealType: "Breakfast",
                        recommendedTime: "08:30 AM",
                        items: ["Greek yogurt with nuts", "Fresh fruit"],
                        completed: false,
                    },
                    {
                        id: "m4",
                        mealType: "Lunch",
                        recommendedTime: "01:00 PM",
                        items: ["Turkey wrap", "Mixed greens"],
                        completed: false,
                    },
                ],
            },
            {
                dayLabel: "Wednesday",
                meals: [
                    {
                        id: "m5",
                        mealType: "Breakfast",
                        recommendedTime: "07:45 AM",
                        items: ["Smoothie bowl", "Chia pudding"],
                        completed: false,
                    },
                    {
                        id: "m6",
                        mealType: "Dinner",
                        recommendedTime: "06:30 PM",
                        items: ["Baked salmon", "Roasted vegetables"],
                        completed: false,
                    },
                ],
            },
        ],
    };
}
