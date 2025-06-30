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
import GuideAssistant from './components/guide/GuideAssistant';

import { useThemeStore } from './stores/themeStore';
import { useAuthStore } from './stores/authStore';
import { useProfileStore } from './stores/profileStore';
import { useGuideStore } from './stores/guideStore';

function App() {
  const { theme, setTheme } = useThemeStore();
  const { user, loading: authLoading } = useAuthStore();
  const { profile, loading: profileLoading } = useProfileStore();
  const { shouldShowGuide, hasSeenGuide, setShouldShowGuide, completeGuide, skipGuide } = useGuideStore();
  const [showSurvey, setShowSurvey] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Track if survey has been handled (completed or dismissed) to show guide next
  const [surveyHandled, setSurveyHandled] = useState(false);

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

  // Handle survey and guide display logic
  useEffect(() => {
    console.log('Survey and Guide check:', {
      user: !!user,
      authLoading,
      profileLoading,
      profile: !!profile,
      surveyCompleted: profile?.surveyCompleted,
      hasSeenGuide,
      shouldShowGuide,
      surveyHandled
    });

    if (user && !authLoading && !profileLoading && profile) {
      // Priority 1: Show survey if not completed
      if (!profile.surveyCompleted && !surveyHandled) {
        console.log('Showing survey modal');
        setShowSurvey(true);
        setShowGuide(false);
      } 
      // Priority 2: Show guide if survey has been handled (completed or dismissed) but guide hasn't been seen
      else if ((profile.surveyCompleted || surveyHandled) && !hasSeenGuide && !shouldShowGuide) {
        console.log('Showing guide modal');
        setShowSurvey(false);
        setShowGuide(true);
        setShouldShowGuide(true);
      }
      // Priority 3: Show guide if explicitly requested
      else if (shouldShowGuide) {
        console.log('Showing requested guide modal');
        setShowSurvey(false);
        setShowGuide(true);
      }
      else {
        console.log('Not showing any modals');
        setShowSurvey(false);
        if (!surveyHandled) {
          setShowGuide(false);
        }
      }
    }
  }, [user, profile, authLoading, profileLoading, hasSeenGuide, shouldShowGuide, setShouldShowGuide, surveyHandled]);

  const handleSurveyClose = (completed: boolean = false) => {
    console.log('Survey closed, completed:', completed);
    setShowSurvey(false);
    setSurveyHandled(true);
    
    // Show guide after survey is handled (whether completed or skipped)
    setTimeout(() => {
      setShowGuide(true);
      setShouldShowGuide(true);
    }, 1000); // Small delay for smooth transition
  };

  const handleGuideClose = (completed: boolean = false) => {
    console.log('Guide closed, completed:', completed);
    setShowGuide(false);
    setShouldShowGuide(false);
    
    if (completed) {
      completeGuide();
    } else {
      skipGuide();
    }
  };

  // Handle guide button click from header
  useEffect(() => {
    const handleShowGuide = () => {
      setShowGuide(true);
      setShouldShowGuide(true);
    };

    // When guide is explicitly requested, show it regardless of survey status
    if (shouldShowGuide && !showSurvey) {
      setShowGuide(true);
    }

    // Listen for guide requests from header
    if (shouldShowGuide && !showSurvey) {
      setShowGuide(true);
    }
  }, [shouldShowGuide, showSurvey]);

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

      {/* Guide Assistant Modal */}
      <GuideAssistant 
        isOpen={showGuide} 
        onClose={handleGuideClose} 
      />
    </>
  );
}

export default App;