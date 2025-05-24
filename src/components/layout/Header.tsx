import { Bell, Plus, Menu } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ThemeToggle from "../ui/ThemeToggle";
import CreateHabitModal from "../habits/CreateHabitModal";

interface HeaderProps {
  openMobileMenu: () => void;
  isMobile: boolean;
}

const Header = ({ openMobileMenu, isMobile }: HeaderProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/habits":
        return "My Habits";
      case "/calendar":
        return "Calendar";
      case "/reports":
        return "Reports";
      case "/settings":
        return "Settings";
      default:
        return "HabitHub";
    }
  };

  const handleNotificationClick = () => {
    if (typeof window === "undefined" || typeof Notification === "undefined") {
      toast.error("This browser does not support notifications");
      return;
    }

    const permission = Notification.permission;

    if (permission === "granted") {
      toast.success("Notifications are already enabled");
    } else if (permission === "denied") {
      toast.error("Please enable notifications in your browser settings");
    } else {
      Notification.requestPermission()
        .then((newPermission) => {
          if (newPermission === "granted") {
            toast.success("Notifications enabled successfully!");
          } else {
            toast.error("Notification permission denied");
          }
        })
        .catch((err) => {
          console.error("Notification error:", err);
          toast.error("Could not request notification permission");
        });
    }
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
