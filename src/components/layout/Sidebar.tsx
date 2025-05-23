import { NavLink } from 'react-router-dom';
import { Activity, Calendar, LineChart, Settings, Home, X } from 'lucide-react';

interface SidebarProps {
  closeMobileMenu: () => void;
}

const Sidebar = ({ closeMobileMenu }: SidebarProps) => {
  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <Home size={20} />,
    },
    {
      name: 'My Habits',
      path: '/habits',
      icon: <Activity size={20} />,
    },
    {
      name: 'Calendar',
      path: '/calendar',
      icon: <Calendar size={20} />,
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: <LineChart size={20} />,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings size={20} />,
    },
  ];

  return (
    <div className="flex h-full flex-col bg-white px-3 py-4 dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-between px-2">
        <div className="flex items-center">
          <Activity className="mr-2 h-6 w-6 text-primary-600 dark:text-primary-400" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            HabitHub
          </h1>
        </div>
        <button
          className="ml-auto rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300 md:hidden"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`
            }
          >
            <span className="mr-3 text-gray-500 dark:text-gray-400">
              {item.icon}
            </span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 rounded-md bg-primary-50 p-4 dark:bg-gray-700/50">
        <div className="mb-2 flex items-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">
            <Activity size={18} />
          </span>
          <span className="ml-3 text-sm font-medium text-primary-700 dark:text-primary-300">
            Streaks
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-300">
          You're on a 5-day streak! Keep it up to unlock new achievements.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;