import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuideState {
  hasCompletedGuide: boolean;
  hasSeenGuide: boolean;
  shouldShowGuide: boolean;
  completedSteps: string[];
  
  // Actions
  completeGuide: () => void;
  skipGuide: () => void;
  markStepCompleted: (stepId: string) => void;
  resetGuide: () => void;
  setShouldShowGuide: (show: boolean) => void;
}

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      hasCompletedGuide: false,
      hasSeenGuide: false,
      shouldShowGuide: false,
      completedSteps: [],

      completeGuide: () => {
        set({
          hasCompletedGuide: true,
          hasSeenGuide: true,
          shouldShowGuide: false,
        });
      },

      skipGuide: () => {
        set({
          hasSeenGuide: true,
          shouldShowGuide: false,
        });
      },

      markStepCompleted: (stepId: string) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(stepId)) {
          set({
            completedSteps: [...completedSteps, stepId],
          });
        }
      },

      resetGuide: () => {
        set({
          hasCompletedGuide: false,
          hasSeenGuide: false,
          shouldShowGuide: true,
          completedSteps: [],
        });
      },

      setShouldShowGuide: (show: boolean) => {
        set({ shouldShowGuide: show });
      },
    }),
    {
      name: 'guide-store',
    }
  )
);