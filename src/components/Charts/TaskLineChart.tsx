import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

interface TaskLineChartProps {
  tasks: any[];
}

export function TaskLineChart({ tasks }: TaskLineChartProps) {
  const data = React.useMemo(() => {
    const doneTasks = tasks.filter(t => t.status === 'Done' && t.updated_at);
    
    // Create last 7 days map
    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'MMM dd');
      last7Days[date] = 0;
    }

    doneTasks.forEach(t => {
      try {
        const dateStr = format(parseISO(t.updated_at), 'MMM dd');
        if (last7Days[dateStr] !== undefined) {
          last7Days[dateStr]++;
        }
      } catch (e) {
        // Handle invalid dates seamlessly
      }
    });

    return Object.entries(last7Days).map(([date, count]) => ({
      date,
      completed: count
    }));
  }, [tasks]);

  const totalCompletedInPeriod = data.reduce((sum, item) => sum + item.completed, 0);

  if (totalCompletedInPeriod === 0) return <div className="flex h-full items-center justify-center text-zinc-500 text-sm">No completed tasks in the last 7 days</div>;

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
