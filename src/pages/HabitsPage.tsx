import { useState } from 'react';
import { useHabitStore } from '../stores/habitStore';
import HabitCard from '../components/habits/HabitCard';
import { Plus, Filter, LayoutGrid, LayoutList, Search } from 'lucide-react';
import CreateHabitModal from '../components/habits/CreateHabitModal';
import { motion } from 'framer-motion';

const HabitsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterActive, setFilterActive] = useState(true);
  
  const { getActiveHabits, getArchivedHabits } = useHabitStore();
  
  const activeHabits = getActiveHabits();
  const archivedHabits = getArchivedHabits();
  
  const filteredHabits = (filterActive ? activeHabits : archivedHabits)
    .filter((habit) =>
      habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-9"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setFilterActive(true)}
              className={`flex items-center px-3 py-1.5 text-sm transition-colors ${
                filterActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setFilterActive(false)}
              className={`flex items-center px-3 py-1.5 text-sm transition-colors ${
                !filterActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Archived
            </button>
          </div>
          
          <div className="flex overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-2 py-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center px-2 py-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
              aria-label="List view"
            >
              <LayoutList size={18} />
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary hidden items-center space-x-1 sm:inline-flex"
          >
            <Plus size={18} />
            <span>New Habit</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary p-2 sm:hidden"
            aria-label="Create new habit"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      
      {filteredHabits.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-800">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <Filter size={24} className="text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
              {searchQuery ? 'No matching habits found' : filterActive ? 'No active habits' : 'No archived habits'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? `No habits matching "${searchQuery}"`
                : filterActive 
                  ? 'Create your first habit to start tracking your progress!'
                  : 'You haven\'t archived any habits yet.'}
            </p>
            {filterActive && !searchQuery && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus size={16} className="mr-1" />
                New Habit
              </button>
            )}
          </motion.div>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
          {filteredHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}
      
      {showCreateModal && (
        <CreateHabitModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default HabitsPage;