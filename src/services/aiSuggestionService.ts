import {
  SmartSuggestion,
  UserPattern,
  Habit,
  HabitLog,
  Routine,
} from "../types";
import { ROUTINE_TEMPLATES } from "../data/routineTemplates";
import { format, subDays, getDay, differenceInDays } from "date-fns";

export class AISuggestionService {
  private static instance: AISuggestionService;

  static getInstance(): AISuggestionService {
    if (!AISuggestionService.instance) {
      AISuggestionService.instance = new AISuggestionService();
    }
    return AISuggestionService.instance;
  }

  // Analyze user patterns from habit data
  analyzeUserPatterns(habits: Habit[], logs: HabitLog[]): UserPattern {
    const completionTimes: Record<string, string[]> = {};
    const streakPatterns: Record<string, number[]> = {};
    const weeklyPatterns: Record<string, number[]> = {};
    const seasonalPatterns: Record<string, Record<string, number>> = {};
    const correlations: Array<{
      habit1: string;
      habit2: string;
      correlation: number;
    }> = [];

    // Analyze completion times and patterns
    habits.forEach((habit) => {
      const habitLogs = logs.filter(
        (log) => log.habitId === habit.id && log.completed
      );

      // Weekly patterns (completion by day of week)
      const weeklyCompletions = new Array(7).fill(0);
      const weeklyCounts = new Array(7).fill(0);

      habitLogs.forEach((log) => {
        const dayOfWeek = getDay(new Date(log.date));
        weeklyCompletions[dayOfWeek]++;
        weeklyCounts[dayOfWeek]++;
      });

      weeklyPatterns[habit.id] = weeklyCompletions.map((count, index) =>
        weeklyCounts[index] > 0 ? count / weeklyCounts[index] : 0
      );

      // Streak patterns
      const streaks = this.calculateStreaks(habitLogs);
      streakPatterns[habit.id] = streaks;

      // Seasonal patterns (by month)
      const monthlyData: Record<string, number> = {};
      habitLogs.forEach((log) => {
        const month = format(new Date(log.date), "MMM");
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });
      seasonalPatterns[habit.id] = monthlyData;
    });

    // Calculate correlations between habits
    for (let i = 0; i < habits.length; i++) {
      for (let j = i + 1; j < habits.length; j++) {
        const correlation = this.calculateHabitCorrelation(
          habits[i].id,
          habits[j].id,
          logs
        );
        if (Math.abs(correlation) > 0.3) {
          // Only significant correlations
          correlations.push({
            habit1: habits[i].id,
            habit2: habits[j].id,
            correlation,
          });
        }
      }
    }

    return {
      userId: "current-user",
      completionTimes,
      streakPatterns,
      weeklyPatterns,
      seasonalPatterns,
      correlations,
      lastAnalyzed: new Date().toISOString(),
    };
  }

  // Generate smart suggestions based on user patterns
  generateSuggestions(
    habits: Habit[],
    logs: HabitLog[],
    routines: Routine[]
  ): SmartSuggestion[] {
    const patterns = this.analyzeUserPatterns(habits, logs);
    const suggestions: SmartSuggestion[] = [];

    // 1. Routine Template Suggestions
    suggestions.push(...this.suggestRoutineTemplates(habits, patterns));

    // 2. Habit Optimization Suggestions
    suggestions.push(...this.suggestHabitOptimizations(habits, logs, patterns));

    // 3. New Habit Suggestions
    suggestions.push(...this.suggestNewHabits(habits, patterns));

    // 4. Timing Optimization Suggestions
    suggestions.push(...this.suggestTimingOptimizations(habits, patterns));

    // 5. Correlation-based Suggestions
    suggestions.push(...this.suggestCorrelationBasedHabits(habits, patterns));

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5); // Return top 5 suggestions
  }

  private suggestRoutineTemplates(
    habits: Habit[],
    patterns: UserPattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    // Analyze user's habit categories
    const userCategories = this.categorizeUserHabits(habits);

    // Suggest templates that complement existing habits
    ROUTINE_TEMPLATES.forEach((template) => {
      const compatibility = this.calculateTemplateCompatibility(
        template,
        userCategories,
        patterns
      );

      if (compatibility > 0.6) {
        suggestions.push({
          id: `template-${template.id}`,
          type: "routine",
          title: `Try "${template.name}" Routine`,
          description: `Based on your current habits, this ${
            template.category
          } routine could boost your progress by ${Math.round(
            compatibility * 100
          )}%`,
          reasoning: `Your ${userCategories.join(
            ", "
          )} habits show you're ready for this ${
            template.difficulty
          } routine. Users with similar patterns saw ${Math.round(
            compatibility * 50 + 25
          )}% improvement.`,
          confidence: compatibility,
          category: template.category,
          actionData: {
            templateId: template.id,
            routineData: {
              name: template.name,
              description: template.description,
              color: template.color,
              icon: template.icon,
            },
          },
          createdAt: new Date().toISOString(),
        });
      }
    });

    return suggestions;
  }

  private suggestHabitOptimizations(
    habits: Habit[],
    logs: HabitLog[],
    patterns: UserPattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    habits.forEach((habit) => {
      const habitLogs = logs.filter((log) => log.habitId === habit.id);
      const completionRate = this.calculateCompletionRate(habitLogs, 30);

      if (completionRate < 0.7 && completionRate > 0.3) {
        // Suggest frequency adjustment
        const weeklyPattern = patterns.weeklyPatterns[habit.id] || [];
        const bestDays = weeklyPattern
          .map((rate, day) => ({ day, rate }))
          .filter((d) => d.rate > 0.7)
          .map((d) => d.day);

        if (bestDays.length > 0 && bestDays.length < habit.targetDays.length) {
          suggestions.push({
            id: `optimize-${habit.id}`,
            type: "optimization",
            title: `Optimize "${habit.name}" Schedule`,
            description: `Focus on your most successful days to build consistency`,
            reasoning: `You complete this habit ${Math.round(
              completionRate * 100
            )}% of the time. Your success rate is highest on ${bestDays
              .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
              .join(", ")}.`,
            confidence: 0.8,
            category: "optimization",
            actionData: {
              optimizationTips: [
                `Focus on ${bestDays.length} days per week instead of ${habit.targetDays.length}`,
                "Build consistency before expanding",
                "Track what makes those days successful",
              ],
            },
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    return suggestions;
  }

  private suggestNewHabits(
    habits: Habit[],
    patterns: UserPattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];
    const userCategories = this.categorizeUserHabits(habits);

    // Suggest complementary habits based on what's missing
    const habitSuggestions = [
      {
        category: "health",
        missing: !userCategories.includes("health"),
        habits: [
          {
            name: "Drink Water",
            icon: "Droplets",
            description: "Stay hydrated throughout the day",
          },
          {
            name: "Take Vitamins",
            icon: "Pill",
            description: "Support your nutritional needs",
          },
        ],
      },
      {
        category: "mindfulness",
        missing: !userCategories.includes("mindfulness"),
        habits: [
          {
            name: "Meditation",
            icon: "Brain",
            description: "Practice mindfulness and reduce stress",
          },
          {
            name: "Gratitude Journal",
            icon: "Heart",
            description: "Reflect on positive moments",
          },
        ],
      },
      {
        category: "productivity",
        missing: !userCategories.includes("productivity"),
        habits: [
          {
            name: "Plan Tomorrow",
            icon: "Calendar",
            description: "Prepare for the next day",
          },
          {
            name: "Deep Work",
            icon: "Focus",
            description: "Dedicated focused work time",
          },
        ],
      },
    ];

    habitSuggestions.forEach((category) => {
      if (category.missing && habits.length >= 2) {
        const habit = category.habits[0];
        suggestions.push({
          id: `new-habit-${category.category}`,
          type: "habit",
          title: `Add "${habit.name}" to Your Routine`,
          description: `Complement your existing habits with ${category.category} practices`,
          reasoning: `You've built consistency with ${habits.length} habits. Adding ${category.category} habits could create a more balanced routine and improve overall well-being.`,
          confidence: 0.7,
          category: category.category,
          actionData: {
            habitSuggestions: [
              {
                name: habit.name,
                description: habit.description,
                icon: habit.icon,
                frequency: "daily",
                targetDays: [0, 1, 2, 3, 4, 5, 6],
                color: "#0D9488",
              },
            ],
          },
          createdAt: new Date().toISOString(),
        });
      }
    });

    return suggestions;
  }

  private suggestTimingOptimizations(
    habits: Habit[],
    patterns: UserPattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    // Analyze if user has morning vs evening habits
    const morningHabits = habits.filter(
      (h) =>
        h.name.toLowerCase().includes("morning") ||
        h.name.toLowerCase().includes("wake") ||
        h.name.toLowerCase().includes("breakfast")
    );

    const eveningHabits = habits.filter(
      (h) =>
        h.name.toLowerCase().includes("evening") ||
        h.name.toLowerCase().includes("night") ||
        h.name.toLowerCase().includes("sleep")
    );

    if (morningHabits.length > 0 && eveningHabits.length === 0) {
      suggestions.push({
        id: "timing-evening",
        type: "routine",
        title: "Add Evening Wind-Down Routine",
        description: "Balance your morning habits with evening practices",
        reasoning:
          "You have strong morning habits but no evening routine. Evening habits can improve sleep quality and next-day performance.",
        confidence: 0.75,
        category: "timing",
        actionData: {
          templateId: "evening-wind-down",
        },
        createdAt: new Date().toISOString(),
      });
    }

    return suggestions;
  }

  private suggestCorrelationBasedHabits(
    habits: Habit[],
    patterns: UserPattern
  ): SmartSuggestion[] {
    const suggestions: SmartSuggestion[] = [];

    patterns.correlations.forEach((correlation) => {
      if (correlation.correlation > 0.7) {
        const habit1 = habits.find((h) => h.id === correlation.habit1);
        const habit2 = habits.find((h) => h.id === correlation.habit2);

        if (habit1 && habit2) {
          suggestions.push({
            id: `correlation-${correlation.habit1}-${correlation.habit2}`,
            type: "optimization",
            title: `Pair "${habit1.name}" with "${habit2.name}"`,
            description: "These habits work great together",
            reasoning: `You complete these habits together ${Math.round(
              correlation.correlation * 100
            )}% of the time. Consider doing them in sequence for better consistency.`,
            confidence: correlation.correlation,
            category: "correlation",
            actionData: {
              optimizationTips: [
                "Do these habits back-to-back",
                "Set the same reminder time",
                "Create a mini-routine with both habits",
              ],
            },
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    return suggestions;
  }

  // Helper methods
  private calculateStreaks(logs: HabitLog[]): number[] {
    const sortedLogs = logs.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const streaks: number[] = [];
    let currentStreak = 0;

    for (let i = 0; i < sortedLogs.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedLogs[i - 1].date);
        const currentDate = new Date(sortedLogs[i].date);
        const daysDiff = differenceInDays(currentDate, prevDate);

        if (daysDiff === 1) {
          currentStreak++;
        } else {
          streaks.push(currentStreak);
          currentStreak = 1;
        }
      }
    }

    if (currentStreak > 0) {
      streaks.push(currentStreak);
    }

    return streaks;
  }

  private calculateHabitCorrelation(
    habit1Id: string,
    habit2Id: string,
    logs: HabitLog[]
  ): number {
    const habit1Logs = logs.filter(
      (log) => log.habitId === habit1Id && log.completed
    );
    const habit2Logs = logs.filter(
      (log) => log.habitId === habit2Id && log.completed
    );

    const habit1Dates = new Set(habit1Logs.map((log) => log.date));
    const habit2Dates = new Set(habit2Logs.map((log) => log.date));

    const intersection = new Set(
      [...habit1Dates].filter((date) => habit2Dates.has(date))
    );
    const union = new Set([...habit1Dates, ...habit2Dates]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  private calculateCompletionRate(logs: HabitLog[], days: number): number {
    const recentLogs = logs.filter((log) => {
      const logDate = new Date(log.date);
      const cutoffDate = subDays(new Date(), days);
      return logDate >= cutoffDate && log.completed;
    });

    return recentLogs.length / days;
  }

  private categorizeUserHabits(habits: Habit[]): string[] {
    const categories = new Set<string>();

    habits.forEach((habit) => {
      const name = habit.name.toLowerCase();
      const description = (habit.description || "").toLowerCase();

      if (
        name.includes("water") ||
        name.includes("exercise") ||
        name.includes("sleep") ||
        name.includes("vitamin")
      ) {
        categories.add("health");
      }
      if (
        name.includes("meditat") ||
        name.includes("gratitude") ||
        name.includes("journal") ||
        name.includes("mindful")
      ) {
        categories.add("mindfulness");
      }
      if (
        name.includes("work") ||
        name.includes("plan") ||
        name.includes("study") ||
        name.includes("learn")
      ) {
        categories.add("productivity");
      }
      if (
        name.includes("read") ||
        name.includes("book") ||
        name.includes("course")
      ) {
        categories.add("learning");
      }
      if (
        name.includes("workout") ||
        name.includes("run") ||
        name.includes("gym") ||
        name.includes("exercise")
      ) {
        categories.add("fitness");
      }
    });

    return Array.from(categories);
  }

  private calculateTemplateCompatibility(
    template: any,
    userCategories: string[],
    patterns: UserPattern
  ): number {
    let compatibility = 0;

    // Category match
    if (userCategories.includes(template.category)) {
      compatibility += 0.3;
    }

    // Difficulty match (based on number of existing habits)
    const habitCount = Object.keys(patterns.weeklyPatterns).length;
    if (template.difficulty === "beginner" && habitCount <= 3)
      compatibility += 0.2;
    if (
      template.difficulty === "intermediate" &&
      habitCount >= 3 &&
      habitCount <= 6
    )
      compatibility += 0.2;
    if (template.difficulty === "advanced" && habitCount > 6)
      compatibility += 0.2;

    // Popularity boost
    compatibility += (template.popularity / 5) * 0.3;

    // Random factor for variety
    compatibility += Math.random() * 0.2;

    return Math.min(compatibility, 1);
  }
}

export const aiSuggestionService = AISuggestionService.getInstance();
