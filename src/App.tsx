import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/layout/Layout';
import AuthGuard from './components/auth/AuthGuard';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import HabitsPage from './pages/HabitsPage';
import RoutinesPage from './pages/RoutinesPage';
import CalendarPage from './pages/CalendarPage';
import PlannerPage from './pages/PlannerPage';
import CoachPage from './pages/CoachPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import UserSurveyModal from './components/profile/UserSurveyModal';

import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { useProfileStore } from './stores/profileStore';

function App() {
  const { theme, setTheme } = useThemeStore();
  const { user, loading: authLoading } = useAuthStore();
  const { profile, loading: profileLoading } = useProfileStore();
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check for saved theme preference in local storage
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    } else if (prefersDarkMode) {
      setTheme('dark');
    }
  }, [setTheme]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Check if user needs to complete survey - Show IMMEDIATELY if not completed
  useEffect(() => {
    console.log('Survey check:', {
      user: !!user,
      authLoading,
      profileLoading,
      profile: !!profile,
      surveyCompleted: profile?.surveyCompleted
    });

    // Only show survey if:
    // 1. User is authenticated
    // 2. Auth is not loading
    // 3. Profile is not loading
    // 4. Profile exists and survey is not completed
    if (user && !authLoading && !profileLoading && profile && !profile.surveyCompleted) {
      console.log('Showing survey modal');
      setShowSurvey(true);
    } else {
      console.log('Not showing survey modal');
      setShowSurvey(false);
    }
  }, [user, profile, authLoading, profileLoading]);

  const handleSurveyClose = (completed: boolean = false) => {
    console.log('Survey closed, completed:', completed);
    setShowSurvey(false);
    
    // If user just skipped (not completed), don't show success message
    if (!completed) {
      // Survey was skipped - modal just closes
      return;
    }
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/app/*"
          element={
            <AuthGuard>
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="habits" element={<HabitsPage />} />
                  <Route path="routines" element={<RoutinesPage />} />
                  <Route path="calendar" element={<CalendarPage />} />
                  <Route path="planner" element={<PlannerPage />} />
                  <Route path="coach" element={<CoachPage />} />
                  <Route path="reports" element={<ReportsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </AuthGuard>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* User Survey Modal - Show IMMEDIATELY for incomplete profiles */}
      <UserSurveyModal 
        isOpen={showSurvey} 
        onClose={handleSurveyClose} 
      />
    </>
  );
}

export default App;