import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TaskPieChartProps {
  tasks: any[];
}

export function TaskPieChart({ tasks }: TaskPieChartProps) {
  const data = React.useMemo(() => {
    let todo = 0, inProgress = 0, done = 0;
    tasks.forEach(t => {
      if (t.status === 'Done') done++;
      else if (t.status === 'In Progress') inProgress++;
      else todo++;
    });

    return [
      { name: 'To Do', value: todo, color: '#94a3b8' },
      { name: 'In Progress', value: inProgress, color: '#fbbf24' },
      { name: 'Done', value: done, color: '#34d399' },
    ].filter(item => item.value > 0);
  }, [tasks]);

  if (tasks.length === 0) return <div className="flex h-full items-center justify-center text-zinc-500 text-sm">No data available</div>;

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1000}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.1)" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
