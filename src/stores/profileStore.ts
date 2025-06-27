import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { UserProfile, SurveyData, HabitRecommendation } from "../types";
import { useAuthStore } from "./authStore";
import { toast } from "sonner";

interface ProfileState {
  profile: UserProfile | null;
  recommendations: HabitRecommendation[];
  loading: boolean;

  // Profile Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  completeSurvey: (surveyData: SurveyData) => Promise<void>;

  // Recommendations Actions
  fetchRecommendations: () => Promise<void>;
  generateRecommendations: () => Promise<void>;
  applyRecommendation: (recommendationId: string) => Promise<void>;
  dismissRecommendation: (recommendationId: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  recommendations: [],
  loading: false,

  fetchProfile: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      console.log("No user found, clearing profile");
      set({ profile: null });
      return;
    }

    try {
      set({ loading: true });
      console.log("Fetching profile for user:", user.id);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.log("Profile fetch error:", error);

        // If profile doesn't exist, create a basic one
        if (error.code === "PGRST116") {
          console.log(
            "Profile not found, creating new profile for user:",
            user.id
          );

          try {
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: user.id,
                  email: user.email || "",
                  survey_completed: false,
                },
              ])
              .select()
              .single();

            if (createError) {
              console.error("Error creating profile:", createError);

              // If insert fails, try to fetch again (profile might have been created by trigger)
              const { data: existingProfile, error: fetchError } =
                await supabase
                  .from("profiles")
                  .select("*")
                  .eq("id", user.id)
                  .single();

              if (fetchError) {
                console.error("Error fetching existing profile:", fetchError);
                set({ loading: false });
                return;
              }

              console.log("Found existing profile:", existingProfile);

              const transformedProfile: UserProfile = {
                id: existingProfile.id,
                email: existingProfile.email,
                name: existingProfile.name,
                displayName: existingProfile.display_name,
                age: existingProfile.age,
                gender: existingProfile.gender,
                occupationCategory: existingProfile.occupation_category,
                heightCm: existingProfile.height_cm,
                weightKg: existingProfile.weight_kg,
                lifestyleFocus: existingProfile.lifestyle_focus || [],
                surveyCompleted: existingProfile.survey_completed || false,
                surveyCompletedAt: existingProfile.survey_completed_at,
                createdAt: existingProfile.created_at,
                updatedAt: existingProfile.updated_at,
              };

              set({ profile: transformedProfile, loading: false });
              return;
            }

            console.log("New profile created:", newProfile);

            const transformedProfile: UserProfile = {
              id: newProfile.id,
              email: newProfile.email,
              name: newProfile.name,
              displayName: newProfile.display_name,
              age: newProfile.age,
              gender: newProfile.gender,
              occupationCategory: newProfile.occupation_category,
              heightCm: newProfile.height_cm,
              weightKg: newProfile.weight_kg,
              lifestyleFocus: newProfile.lifestyle_focus || [],
              surveyCompleted: newProfile.survey_completed || false,
              surveyCompletedAt: newProfile.survey_completed_at,
              createdAt: newProfile.created_at,
              updatedAt: newProfile.updated_at,
            };

            set({ profile: transformedProfile, loading: false });
            return;
          } catch (createError) {
            console.error("Failed to create profile:", createError);
            set({ loading: false });
            return;
          }
        }

        console.error("Unexpected profile fetch error:", error);
        set({ loading: false });
        return;
      }

      console.log("Profile fetched successfully:", profile);

      const transformedProfile: UserProfile = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        displayName: profile.display_name,
        age: profile.age,
        gender: profile.gender,
        occupationCategory: profile.occupation_category,
        heightCm: profile.height_cm,
        weightKg: profile.weight_kg,
        lifestyleFocus: profile.lifestyle_focus || [],
        surveyCompleted: profile.survey_completed || false,
        surveyCompletedAt: profile.survey_completed_at,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      };

      set({ profile: transformedProfile, loading: false });
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      set({ loading: false });
    }
  },

  updateProfile: async (data) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true });

      // Transform camelCase to snake_case for database
      const dbData: any = {};
      if (data.displayName !== undefined)
        dbData.display_name = data.displayName;
      if (data.age !== undefined) dbData.age = data.age;
      if (data.gender !== undefined) dbData.gender = data.gender;
      if (data.occupationCategory !== undefined)
        dbData.occupation_category = data.occupationCategory;
      if (data.heightCm !== undefined) dbData.height_cm = data.heightCm;
      if (data.weightKg !== undefined) dbData.weight_kg = data.weightKg;
      if (data.lifestyleFocus !== undefined)
        dbData.lifestyle_focus = data.lifestyleFocus;
      if (data.surveyCompleted !== undefined)
        dbData.survey_completed = data.surveyCompleted;
      if (data.surveyCompletedAt !== undefined)
        dbData.survey_completed_at = data.surveyCompletedAt;

      dbData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from("profiles")
        .update(dbData)
        .eq("id", user.id);

      if (error) throw error;

      set((state) => ({
        profile: state.profile ? { ...state.profile, ...data } : null,
        loading: false,
      }));

      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      set({ loading: false });
    }
  },

  completeSurvey: async (surveyData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true });

      const now = new Date().toISOString();
      const updateData = {
        display_name: surveyData.displayName,
        age: surveyData.age,
        gender: surveyData.gender,
        occupation_category: surveyData.occupationCategory,
        height_cm: surveyData.heightCm,
        weight_kg: surveyData.weightKg,
        lifestyle_focus: surveyData.lifestyleFocus,
        survey_completed: true,
        survey_completed_at: now,
        updated_at: now,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      // Update local state
      set((state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              displayName: surveyData.displayName,
              age: surveyData.age,
              gender: surveyData.gender,
              occupationCategory: surveyData.occupationCategory,
              heightCm: surveyData.heightCm,
              weightKg: surveyData.weightKg,
              lifestyleFocus: surveyData.lifestyleFocus,
              surveyCompleted: true,
              surveyCompletedAt: now,
            }
          : null,
        loading: false,
      }));

      console.log("Survey completed successfully");

      // Generate recommendations after survey completion
      await get().generateRecommendations();
    } catch (error) {
      console.error("Error completing survey:", error);
      toast.error("Failed to complete survey");
      set({ loading: false });
    }
  },

  fetchRecommendations: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data: recommendations, error } = await supabase
        .from("habit_recommendations")
        .select("*")
        .eq("user_id", user.id)
        .order("confidence_score", { ascending: false });

      if (error) throw error;

      const transformedRecommendations: HabitRecommendation[] = (
        recommendations || []
      ).map((r) => ({
        id: r.id,
        userId: r.user_id,
        category: r.category,
        name: r.name,
        description: r.description,
        icon: r.icon,
        color: r.color,
        frequency: r.frequency,
        targetDays: r.target_days,
        targetValue: r.target_value,
        unit: r.unit,
        reasoning: r.reasoning,
        confidenceScore: parseFloat(r.confidence_score),
        tags: r.tags || [],
        isApplied: r.is_applied,
        createdAt: r.created_at,
      }));

      set({ recommendations: transformedRecommendations });
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  },

  generateRecommendations: async () => {
    const user = useAuthStore.getState().user;
    const profile = get().profile;

    if (!user || !profile || !profile.surveyCompleted) return;

    try {
      // Clear existing recommendations
      await supabase
        .from("habit_recommendations")
        .delete()
        .eq("user_id", user.id);

      // Generate new recommendations based on profile
      const recommendations = generateHabitRecommendations(profile);

      // Insert new recommendations
      const dbRecommendations = recommendations.map((rec) => ({
        user_id: user.id,
        category: rec.category,
        name: rec.name,
        description: rec.description,
        icon: rec.icon,
        color: rec.color,
        frequency: rec.frequency,
        target_days: rec.targetDays,
        target_value: rec.targetValue,
        unit: rec.unit,
        reasoning: rec.reasoning,
        confidence_score: rec.confidenceScore,
        tags: rec.tags,
      }));

      const { error } = await supabase
        .from("habit_recommendations")
        .insert(dbRecommendations);

      if (error) throw error;

      // Fetch updated recommendations
      await get().fetchRecommendations();
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations");
    }
  },

  applyRecommendation: async (recommendationId) => {
    try {
      const { error } = await supabase
        .from("habit_recommendations")
        .update({ is_applied: true })
        .eq("id", recommendationId);

      if (error) throw error;

      set((state) => ({
        recommendations: state.recommendations.map((rec) =>
          rec.id === recommendationId ? { ...rec, isApplied: true } : rec
        ),
      }));
    } catch (error) {
      console.error("Error applying recommendation:", error);
      toast.error("Failed to apply recommendation");
    }
  },

  dismissRecommendation: async (recommendationId) => {
    try {
      const { error } = await supabase
        .from("habit_recommendations")
        .delete()
        .eq("id", recommendationId);

      if (error) throw error;

      set((state) => ({
        recommendations: state.recommendations.filter(
          (rec) => rec.id !== recommendationId
        ),
      }));

      toast.info("Recommendation dismissed");
    } catch (error) {
      console.error("Error dismissing recommendation:", error);
      toast.error("Failed to dismiss recommendation");
    }
  },
}));

// Helper function to generate habit recommendations based on user profile
function generateHabitRecommendations(
  profile: UserProfile
): Omit<HabitRecommendation, "id" | "userId" | "isApplied" | "createdAt">[] {
  const recommendations: Omit<
    HabitRecommendation,
    "id" | "userId" | "isApplied" | "createdAt"
  >[] = [];
  const lifestyleFocus = profile.lifestyleFocus || [];

  // Health & Wellness recommendations
  if (lifestyleFocus.includes("health-wellness")) {
    recommendations.push(
      {
        category: "health-wellness",
        name: "Drink Water",
        description: "Stay hydrated throughout the day",
        icon: "Droplets",
        color: "#3B82F6",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 8,
        unit: "glasses",
        reasoning: `Based on your focus on health & wellness${
          profile.weightKg ? ` and weight of ${profile.weightKg}kg` : ""
        }, staying hydrated is essential for optimal body function.`,
        confidenceScore: 0.95,
        tags: ["hydration", "health", "daily"],
      },
      {
        category: "health-wellness",
        name: "Morning Exercise",
        description: "30 minutes of physical activity",
        icon: "Dumbbell",
        color: "#EF4444",
        frequency: "daily",
        targetDays: [1, 2, 3, 4, 5],
        targetValue: 30,
        unit: "minutes",
        reasoning: `Regular exercise is crucial for ${
          profile.age && profile.age < 30
            ? "building healthy habits early"
            : "maintaining health and energy"
        }. Perfect for your health-focused lifestyle.`,
        confidenceScore: 0.9,
        tags: ["exercise", "fitness", "morning"],
      }
    );
  }

  // Work & Career recommendations
  if (lifestyleFocus.includes("work-career")) {
    recommendations.push(
      {
        category: "work-career",
        name: "Deep Work Session",
        description: "Focused work without distractions",
        icon: "Brain",
        color: "#8B5CF6",
        frequency: "daily",
        targetDays: [1, 2, 3, 4, 5],
        targetValue: profile.occupationCategory === "student" ? 90 : 120,
        unit: "minutes",
        reasoning: `As a ${profile.occupationCategory}, deep focus sessions will significantly boost your productivity and career growth.`,
        confidenceScore: 0.88,
        tags: ["productivity", "focus", "career"],
      },
      {
        category: "work-career",
        name: "Skill Learning",
        description: "Learn something new related to your field",
        icon: "BookOpen",
        color: "#10B981",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 30,
        unit: "minutes",
        reasoning:
          "Continuous learning is essential for career advancement and staying competitive in your field.",
        confidenceScore: 0.85,
        tags: ["learning", "growth", "skills"],
      }
    );
  }

  // Family & Relationship recommendations
  if (lifestyleFocus.includes("family-relationship")) {
    recommendations.push({
      category: "family-relationship",
      name: "Quality Time",
      description: "Spend meaningful time with loved ones",
      icon: "Heart",
      color: "#EC4899",
      frequency: "daily",
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      targetValue: 60,
      unit: "minutes",
      reasoning:
        "Strong relationships are built through consistent, quality interactions. This habit will strengthen your bonds with family and friends.",
      confidenceScore: 0.9,
      tags: ["relationships", "family", "connection"],
    });
  }

  // Financial recommendations
  if (lifestyleFocus.includes("financial")) {
    recommendations.push({
      category: "financial",
      name: "Budget Review",
      description: "Review and track daily expenses",
      icon: "DollarSign",
      color: "#F59E0B",
      frequency: "daily",
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      reasoning:
        "Daily financial awareness is key to building wealth and achieving financial goals.",
      confidenceScore: 0.82,
      tags: ["money", "budgeting", "financial-health"],
    });
  }

  // Cultural & Spiritual recommendations
  if (lifestyleFocus.includes("cultural-spiritual")) {
    recommendations.push(
      {
        category: "cultural-spiritual",
        name: "Meditation",
        description: "Mindfulness and inner peace practice",
        icon: "Brain",
        color: "#6366F1",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 15,
        unit: "minutes",
        reasoning:
          "Regular meditation enhances spiritual growth, reduces stress, and improves overall well-being.",
        confidenceScore: 0.87,
        tags: ["meditation", "mindfulness", "spiritual"],
      },
      {
        category: "cultural-spiritual",
        name: "Gratitude Journal",
        description: "Write down things you're grateful for",
        icon: "BookOpen",
        color: "#10B981",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 3,
        unit: "items",
        reasoning:
          "Gratitude practice enhances spiritual awareness and promotes positive thinking.",
        confidenceScore: 0.83,
        tags: ["gratitude", "journaling", "positivity"],
      }
    );
  }

  // Age-specific recommendations
  if (profile.age) {
    if (profile.age < 25) {
      recommendations.push({
        category: "personal-development",
        name: "Read Books",
        description: "Read for personal and professional growth",
        icon: "BookOpen",
        color: "#0D9488",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 30,
        unit: "minutes",
        reasoning:
          "At your age, building a strong reading habit will compound into tremendous knowledge and wisdom over time.",
        confidenceScore: 0.9,
        tags: ["reading", "learning", "growth"],
      });
    } else if (profile.age > 50) {
      recommendations.push({
        category: "health-wellness",
        name: "Gentle Stretching",
        description: "Maintain flexibility and mobility",
        icon: "Activity",
        color: "#10B981",
        frequency: "daily",
        targetDays: [0, 1, 2, 3, 4, 5, 6],
        targetValue: 15,
        unit: "minutes",
        reasoning:
          "Regular stretching becomes increasingly important for maintaining mobility and preventing injury as we age.",
        confidenceScore: 0.88,
        tags: ["stretching", "flexibility", "health"],
      });
    }
  }

  // Gender-specific recommendations
  if (profile.gender === "female") {
    recommendations.push({
      category: "health-wellness",
      name: "Self-Care Time",
      description: "Dedicated time for personal wellness",
      icon: "Heart",
      color: "#EC4899",
      frequency: "daily",
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      targetValue: 30,
      unit: "minutes",
      reasoning:
        "Self-care is essential for maintaining physical and mental health, especially important for overall well-being.",
      confidenceScore: 0.85,
      tags: ["self-care", "wellness", "mental-health"],
    });
  }

  // Occupation-specific recommendations
  if (profile.occupationCategory === "student") {
    recommendations.push({
      category: "work-career",
      name: "Study Session",
      description: "Focused study time",
      icon: "BookOpen",
      color: "#8B5CF6",
      frequency: "daily",
      targetDays: [1, 2, 3, 4, 5],
      targetValue: 120,
      unit: "minutes",
      reasoning:
        "Consistent daily study habits are crucial for academic success and knowledge retention.",
      confidenceScore: 0.92,
      tags: ["studying", "education", "focus"],
    });
  }

  return recommendations.slice(0, 8); // Limit to top 8 recommendations
}

// Initialize profile data when auth state changes
useAuthStore.subscribe((state, prevState) => {
  if (state.user?.id !== prevState?.user?.id) {
    if (state.user) {
      // Fetch profile immediately when user logs in
      console.log(
        "Auth state changed, fetching profile for user:",
        state.user.id
      );

      // Add a small delay to ensure auth is fully initialized
      setTimeout(() => {
        useProfileStore.getState().fetchProfile();
        useProfileStore.getState().fetchRecommendations();
      }, 100);
    } else {
      // Clear profile when user logs out
      console.log("User logged out, clearing profile");
      useProfileStore.setState({ profile: null, recommendations: [] });
    }
  }
});
