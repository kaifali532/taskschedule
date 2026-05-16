import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TaskBarChartProps {
  tasks: any[];
  projects: any[];
}

export function TaskBarChart({ tasks, projects }: TaskBarChartProps) {
  const data = React.useMemo(() => {
    const projectCounts: Record<string, number> = {};
    const projectNameMap: Record<string, string> = {};

    projects.forEach(p => {
      projectNameMap[p.id] = p.name;
      projectCounts[p.id] = 0;
    });

    tasks.forEach(t => {
      if (t.project_id && projectCounts[t.project_id] !== undefined) {
        projectCounts[t.project_id]++;
      }
    });

    return Object.entries(projectCounts)
      .map(([id, count]) => ({
        name: projectNameMap[id] || 'Unknown',
        tasks: count
      }))
      .filter(item => item.tasks > 0)
      .sort((a, b) => b.tasks - a.tasks)
      .slice(0, 5); // Take top 5 projects
  }, [tasks, projects]);

  if (data.length === 0) return <div className="flex h-full items-center justify-center text-zinc-500 text-sm">No data available</div>;

  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
          />
          <YAxis 
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          />
          <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} animationDuration={1000} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
