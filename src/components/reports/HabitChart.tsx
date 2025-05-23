import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useThemeStore } from '../../stores/themeStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface HabitChartProps {
  title: string;
  type: 'bar' | 'line';
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

const HabitChart = ({ title, type, labels, datasets }: HabitChartProps) => {
  const { theme } = useThemeStore();
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#E5E7EB' : '#374151';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#374151' : '#FFFFFF',
        titleColor: isDark ? '#F3F4F6' : '#111827',
        bodyColor: isDark ? '#D1D5DB' : '#4B5563',
        borderColor: isDark ? '#4B5563' : '#E5E7EB',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
    },
  };
  
  const data = {
    labels,
    datasets: datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: `${dataset.color}80`, // Add 50% opacity
      borderColor: dataset.color,
      borderWidth: type === 'line' ? 2 : 1,
      borderRadius: type === 'bar' ? 4 : undefined,
      tension: type === 'line' ? 0.3 : undefined,
      pointBackgroundColor: type === 'line' ? dataset.color : undefined,
      pointRadius: type === 'line' ? 3 : undefined,
      fill: type === 'line' ? {
        target: 'origin',
        above: `${dataset.color}15`, // Very light fill
      } : undefined,
    })),
  };
  
  return (
    <div className="card h-80">
      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
        {title}
      </h3>
      {type === 'bar' ? (
        <Bar options={options} data={data} />
      ) : (
        <Line options={options} data={data} />
      )}
    </div>
  );
};

export default HabitChart;