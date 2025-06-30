import { Bell, Plus, Menu, User } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGuideStore } from '../../stores/guideStore';
import { toast } from 'sonner';
import ThemeToggle from '../ui/ThemeToggle';
import CreateHabitModal from '../habits/CreateHabitModal';
import { useProfileStore } from '../../stores/profileStore';

interface HeaderProps {
  openMobileMenu: () => void;
  isMobile: boolean;
}

const Header = ({ openMobileMenu, isMobile }: HeaderProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setShouldShowGuide } = useGuideStore();
  const { profile } = useProfileStore();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/app/habits':
        return 'My Habits';
      case '/app/routines':
        return 'Routines';
      case '/app/calendar':
        return 'Calendar';
      case '/app/planner':
        return 'Planner';
      case '/app/coach':
        return 'AI Coach';
      case '/app/reports':
        return 'Reports';
      case '/app/settings':
        return 'Settings';
      default:
        return 'Trackbit';
    }
  };

  const handleNotificationClick = () => {
    if (!("Notification" in window)) {
      toast.error("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      toast.success("Notifications are already enabled");
    } else if (Notification.permission === "denied") {
      toast.error("Please enable notifications in your browser settings");
    } else {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          toast.success("Notifications enabled successfully!");
        } else {
          toast.error("Notification permission denied");
        }
      });
    }
  };

  const handleCompleteProfileClick = () => {
    // Navigate to habits page where the profile completion modal will show
    navigate('/app/habits');
    // Small delay to ensure navigation completes
    setTimeout(() => {
      // Trigger profile completion modal
      const event = new CustomEvent('showProfileModal');
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center">
          {isMobile && (
            <button
              type="button"
              className="mr-4 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={openMobileMenu}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white md:text-2xl">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          <button
            type="button"
            onClick={() => {
              // Always show guide when guide button is clicked
              setShouldShowGuide(true);
            }}
            className="btn btn-secondary relative p-2"
            aria-label="Open Guide"
            title="Getting Started Guide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          {!profile?.surveyCompleted && (
            <button
              type="button"
              onClick={handleCompleteProfileClick}
              className="btn btn-accent relative p-2 hidden sm:inline-flex"
              aria-label="Complete Profile"
              title="Complete Your Profile"
            >
              <User size={20} />
              <span className="ml-1 text-sm">Complete Profile</span>
            </button>
          )}
          
          <button
            type="button"
            className="btn btn-secondary relative p-2"
            aria-label="Notifications"
            onClick={handleNotificationClick}
          >
            <Bell size={20} />
            {Notification.permission === "granted" && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary-500" />
            )}
          </button>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary hidden items-center space-x-1 sm:inline-flex"
          >
            <Plus size={18} />
            <span>New Habit</span>
          </button>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary p-2 sm:hidden"
            aria-label="Create new habit"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {showCreateModal && (
        <CreateHabitModal onClose={() => setShowCreateModal(false)} />
      )}
    </header>
  );
};

export default Header;