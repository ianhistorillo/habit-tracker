import { useState, useEffect } from 'react';
import { format, addDays, eachDayOfInterval } from 'date-fns';
import { useHabitStore } from '../stores/habitStore';
import { Target, Calendar, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HabitGoal, GoalAssessment } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

const PlannerPage = () => {
  const { user } = useAuthStore();
  const { getActiveHabits, getHabitLogsForDate } = useHabitStore();
  const activeHabits = getActiveHabits();
  
  const [selectedHabit, setSelectedHabit] = useState(activeHabits[0]?.id);
  const [targetDays, setTargetDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [goals, setGoals] = useState<HabitGoal[]>([]);
  const [assessments, setAssessments] = useState<GoalAssessment[]>([]);

  // Fetch goals on component mount and when user changes
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data: goalsData, error: goalsError } = await supabase
          .from('habit_goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (goalsError) throw goalsError;

        const { data: assessmentsData, error: assessmentsError } = await supabase
          .from('goal_assessments')
          .select('*')
          .in('goal_id', goalsData?.map(g => g.id) || []);

        if (assessmentsError) throw assessmentsError;

        setGoals(goalsData || []);
        setAssessments(assessmentsData || []);
      } catch (error) {
        console.error('Error fetching goals:', error);
        toast.error('Failed to load goals');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user]);
  
  const handleCreateGoal = async () => {
    if (!selectedHabit) {
      toast.error('Please select a habit');
      return;
    }

    if (!user) {
      toast.error('Please sign in to create goals');
      return;
    }
    
    const startDate = new Date();
    const endDate = addDays(startDate, targetDays);
    
    try {
      setLoading(true);
      const { data: newGoal, error } = await supabase
        .from('habit_goals')
        .insert({
          habit_id: selectedHabit,
          user_id: user.id,
          target_days: targetDays,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setGoals(prevGoals => [newGoal, ...prevGoals]);
      toast.success('Goal created successfully');
      
      // Reset form
      setNotes('');
      setTargetDays(30);
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('habit_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.filter(g => g.id !== goalId));
      setAssessments(assessments.filter(a => a.goalId !== goalId));
      toast.success('Goal deleted successfully');
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    } finally {
      setLoading(false);
    }
  };
  
  const calculateGoalProgress = (goal: HabitGoal) => {
    const dateRange = eachDayOfInterval({
      start: new Date(goal.start_date),
      end: new Date(goal.end_date),
    });
    
    const totalDays = dateRange.length;
    const completedDays = dateRange.filter(date => {
      const logs = getHabitLogsForDate(format(date, 'yyyy-MM-dd'));
      return logs.some(log => log.habitId === goal.habit_id && log.completed);
    }).length;
    
    const progress = (completedDays / totalDays) * 100;
    const isEffective = progress >= 80;
    
    return {
      completedDays,
      totalDays,
      progress,
      isEffective,
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="card">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Habit Planner
          </h2>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <Target size={18} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Habit
            </label>
            <select
              value={selectedHabit}
              onChange={(e) => setSelectedHabit(e.target.value)}
              className="input w-full"
            >
              {activeHabits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Days
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={targetDays}
              onChange={(e) => setTargetDays(parseInt(e.target.value))}
              className="input w-full"
            />
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input w-full resize-none"
              rows={3}
              placeholder="Add any notes or motivation for this goal..."
            />
          </div>
          
          <button
            type="button"
            onClick={handleCreateGoal}
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            ) : (
              'Create Goal'
            )}
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Active Goals
        </h3>
        
        {goals.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-6 text-center dark:bg-gray-800">
            <Calendar size={24} className="mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              No active goals yet. Create one to start tracking!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((goal) => {
              const habit = activeHabits.find((h) => h.id === goal.habit_id);
              if (!habit) return null;
              
              const { completedDays, totalDays, progress, isEffective } = calculateGoalProgress(goal);
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {habit.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(goal.start_date), 'MMM d, yyyy')} - {format(new Date(goal.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-red-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div 
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${habit.color}20` }}
                      >
                        <Target size={20} style={{ color: habit.color }} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {completedDays}/{totalDays} days
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: habit.color,
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex items-center">
                      {isEffective ? (
                        <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                      ) : progress >= 50 ? (
                        <AlertCircle className="mr-2 h-5 w-5 text-yellow-500" />
                      ) : (
                        <XCircle className="mr-2 h-5 w-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {isEffective
                          ? 'Highly Effective'
                          : progress >= 50
                          ? 'Moderately Effective'
                          : 'Needs Improvement'}
                      </span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: habit.color }}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  
                  {goal.notes && (
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                      {goal.notes}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlannerPage;