import { useState } from "react";
import {
  Calendar,
  Download,
  Upload,
  Settings,
  ExternalLink,
  Check,
} from "lucide-react";
import Modal from "../ui/Modal";
import { toast } from "sonner";

interface CalendarSyncModalProps {
  onClose: () => void;
}

const CalendarSyncModal = ({ onClose }: CalendarSyncModalProps) => {
  const [selectedCalendar, setSelectedCalendar] = useState<string>("google");
  const [syncSettings, setSyncSettings] = useState({
    includeHabits: true,
    includeRoutines: true,
    includeReminders: true,
    syncFrequency: "daily",
  });
  const [isConnected, setIsConnected] = useState(false);

  const calendarProviders = [
    {
      id: "google",
      name: "Google Calendar",
      icon: "📅",
      description: "Sync with your Google Calendar",
      color: "#4285F4",
    },
    {
      id: "outlook",
      name: "Outlook Calendar",
      icon: "📧",
      description: "Sync with Microsoft Outlook",
      color: "#0078D4",
    },
    {
      id: "apple",
      name: "Apple Calendar",
      icon: "🍎",
      description: "Sync with iCloud Calendar",
      color: "#007AFF",
    },
    {
      id: "ical",
      name: "iCal Export",
      icon: "📄",
      description: "Export as .ics file",
      color: "#6B7280",
    },
  ];

  const handleConnect = async () => {
    // Simulate connection process
    toast.info("Connecting to calendar...");

    setTimeout(() => {
      setIsConnected(true);
      toast.success(
        `Connected to ${
          calendarProviders.find((p) => p.id === selectedCalendar)?.name
        }!`
      );
    }, 2000);
  };

  const handleExportICS = () => {
    // Generate ICS file content
    const icsContent = generateICSContent();

    // Create and download file
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trackbit-habits.ics";
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Calendar file downloaded!");
  };

  const generateICSContent = () => {
    const now = new Date();
    const formatDate = (date: Date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Trackbit//Habit Tracker//EN
CALNAME:Trackbit Habits
X-WR-CALNAME:Trackbit Habits
X-WR-CALDESC:Your habit tracking schedule
BEGIN:VEVENT
UID:morning-routine-${now.getTime()}@trackbit.app
DTSTART:${formatDate(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0)
    )}
DTEND:${formatDate(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30)
    )}
SUMMARY:Morning Routine
DESCRIPTION:Complete your morning habits
RRULE:FREQ=DAILY
END:VEVENT
BEGIN:VEVENT
UID:evening-routine-${now.getTime() + 1}@trackbit.app
DTSTART:${formatDate(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0)
    )}
DTEND:${formatDate(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 30)
    )}
SUMMARY:Evening Routine
DESCRIPTION:Complete your evening habits
RRULE:FREQ=DAILY
END:VEVENT
END:VCALENDAR`;
  };

  return (
    <Modal title="Calendar Sync" isOpen={true} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Calendar Providers */}
        <div>
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Choose Calendar Provider
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {calendarProviders.map((provider) => (
              <div
                key={provider.id}
                className={`cursor-pointer rounded-lg border p-4 transition-all ${
                  selectedCalendar === provider.id
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                }`}
                onClick={() => setSelectedCalendar(provider.id)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                    style={{ backgroundColor: `${provider.color}20` }}
                  >
                    {provider.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {provider.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {provider.description}
                    </p>
                  </div>
                  {selectedCalendar === provider.id && (
                    <Check size={20} className="ml-auto text-primary-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync Settings */}
        <div>
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            Sync Settings
          </h3>
          <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Include Habits
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add individual habit reminders to calendar
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={syncSettings.includeHabits}
                  onChange={(e) =>
                    setSyncSettings((prev) => ({
                      ...prev,
                      includeHabits: e.target.checked,
                    }))
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:after:border-gray-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Include Routines
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add routine schedules to calendar
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={syncSettings.includeRoutines}
                  onChange={(e) =>
                    setSyncSettings((prev) => ({
                      ...prev,
                      includeRoutines: e.target.checked,
                    }))
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:after:border-gray-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Include Reminders
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Set up notification reminders
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={syncSettings.includeReminders}
                  onChange={(e) =>
                    setSyncSettings((prev) => ({
                      ...prev,
                      includeReminders: e.target.checked,
                    }))
                  }
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700 dark:after:border-gray-600"></div>
              </label>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                Sync Frequency
              </h4>
              <select
                value={syncSettings.syncFrequency}
                onChange={(e) =>
                  setSyncSettings((prev) => ({
                    ...prev,
                    syncFrequency: e.target.value,
                  }))
                }
                className="input w-full"
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Every hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        {isConnected && (
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Successfully connected to{" "}
                {calendarProviders.find((p) => p.id === selectedCalendar)?.name}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          {selectedCalendar === "ical" ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExportICS}
            >
              <Download size={16} className="mr-2" />
              Export .ics File
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConnect}
              disabled={isConnected}
            >
              {isConnected ? (
                <>
                  <Check size={16} className="mr-2" />
                  Connected
                </>
              ) : (
                <>
                  <ExternalLink size={16} className="mr-2" />
                  Connect Calendar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CalendarSyncModal;
