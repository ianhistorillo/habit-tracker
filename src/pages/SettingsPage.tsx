import { useState } from 'react';
import { Save, Moon, Sun, Bell, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useThemeStore } from '../stores/themeStore';
import { useHabitStore } from '../stores/habitStore';

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { habits, logs } = useHabitStore();
  
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(0); // 0 = Sunday, 1 = Monday
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleSaveSettings = () => {
    // In a real app, this would save to local storage or a backend
    toast.success('Settings saved successfully');
  };
  
  const handleClearData = () => {
    setShowConfirmation(false);
    
    // In a real app, this would clear all data
    localStorage.clear();
    window.location.reload();
  };
  
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">
          Settings
        </h2>
        
        <div className="mb-6 space-y-4">
          <div>
            <h3 className="mb-2 text-base font-medium text-gray-800 dark:text-gray-200">
              Appearance
            </h3>
            <div className="flex items-center justify-between rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                <span className="text-gray-700 dark:text-gray-300">
                  Theme Mode
                </span>
              </div>
              <div>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                  className="input"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="mb-2 text-base font-medium text-gray-800 dark:text-gray-200">
              Reminders
            </h3>
            <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell size={20} />
                  <span className="text-gray-700 dark:text-gray-300">
                    Daily Reminders
                  </span>
                </div>
                <div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={remindersEnabled}
                      onChange={() => setRemindersEnabled(!remindersEnabled)}
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:after:border-gray-600"></div>
                  </label>
                </div>
              </div>
              
              {remindersEnabled && (
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Reminder time:
                  </span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="input"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="mb-2 text-base font-medium text-gray-800 dark:text-gray-200">
              Calendar Preferences
            </h3>
            <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Week starts on
                </span>
                <select
                  value={weekStartsOn}
                  onChange={(e) => setWeekStartsOn(parseInt(e.target.value) as 0 | 1)}
                  className="input"
                >
                  <option value={0}>Sunday</option>
                  <option value={1}>Monday</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleSaveSettings}
          className="btn btn-primary"
        >
          <Save size={16} className="mr-2" />
          Save Settings
        </button>
      </div>
      
      <div className="card">
        <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-gray-200">
          Data Management
        </h3>
        
        <div className="mb-4 rounded-md bg-gray-50 p-4 dark:bg-gray-700/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You currently have {habits.length} habits and {logs.length} log entries.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Export Data
            </h4>
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => {
                const data = {
                  habits: useHabitStore.getState().habits,
                  logs: useHabitStore.getState().logs,
                  streaks: useHabitStore.getState().streaks,
                };
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                
                toast.success('Data exported successfully');
              }}
            >
              Export Data (.json)
            </button>
          </div>
          
          <div>
            <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Clear All Data
            </h4>
            <button
              type="button"
              className="btn w-full bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              onClick={() => setShowConfirmation(true)}
            >
              <Trash size={16} className="mr-2" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
      
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              Are you sure?
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              This will permanently delete all your habit data. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                className="btn btn-secondary flex-1"
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn flex-1 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                onClick={handleClearData}
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;