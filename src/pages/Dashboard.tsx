import React, { useEffect, useState } from 'react';
import { supabase, Task } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { isPast, parseISO } from 'date-fns';
import { ArrowRight, CheckCircle2, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TaskPieChart } from '../components/Charts/TaskPieChart';
import { TaskBarChart } from '../components/Charts/TaskBarChart';
import { TaskLineChart } from '../components/Charts/TaskLineChart';
import { withDemoData } from '../lib/mockData';

export default function Dashboard() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const promises: any[] = [
        supabase.from('projects').select('*'),
        supabase.from('users').select('id, name')
      ];

      let tasksQuery = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (profile?.role === 'Member') {
         tasksQuery = tasksQuery.eq('assigned_to', profile.id);
      }
      promises.push(tasksQuery);

      const [projectsRes, usersRes, tasksRes] = await Promise.all(promises);

      if (projectsRes.error) throw projectsRes.error;
      if (usersRes.error) throw usersRes.error;
      if (tasksRes.error) throw tasksRes.error;

      const fullUsers = withDemoData(usersRes.data, 'users');
      const userMap = fullUsers.reduce((acc: any, u: any) => ({ ...acc, [u.id]: u.name }), {});
      setUsersMap(userMap);

      const fullProjects = withDemoData(projectsRes.data, 'projects', profile?.id);
      const fullTasks = withDemoData(tasksRes.data, 'tasks', profile?.id);
      
      // Filter tasks to only those assigned to member if needed
      const filteredTasks = profile?.role === 'Member' 
        ? fullTasks.filter((t: any) => t.assigned_to === profile.id)
        : fullTasks;

      setProjects(fullProjects);
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching data for dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full animate-pulse">
        <div className="mb-8">
          <div className="h-8 w-48 bg-zinc-800 rounded-md mb-2"></div>
          <div className="h-4 w-64 bg-zinc-800 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="outer-card h-[120px]">
              <div className="card-internal p-6">
                <div className="h-3 w-20 bg-zinc-800 rounded-md mb-4"></div>
                <div className="h-10 w-16 bg-zinc-800 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { totalTasks, completedTasks, pendingTasks, overdueTasks, completionPercentage } = React.useMemo(() => {
    const total = tasks.length;
    let completed = 0;
    let pending = 0;
    let overdue = 0;

    for (const t of tasks) {
      if (t.status === 'Done') {
        completed++;
      } else {
        pending++;
        if (t.deadline && isPast(parseISO(t.deadline))) {
          overdue++;
        }
      }
    }

    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks: overdue,
      completionPercentage: percentage
    };
  }, [tasks]);

  return (
    <div className="flex flex-col w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Hi, {profile?.name?.split(' ')[0]}</h1>
        <p className="text-[15px] text-zinc-400">Here's an overview of your tasks.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="outer-card">
          <span className="glow-layer"></span>
          <span className="glow-layer blur-strong"></span>
          <div className="card-internal p-6">
            <p className="text-zinc-400 text-[12px] font-semibold uppercase tracking-wider mb-2">Total Tasks</p>
            <h3 className="text-[40px] leading-none font-bold tracking-tight text-white">{totalTasks}</h3>
          </div>
        </div>
        
        <div className="outer-card">
          <span className="glow-layer"></span>
          <span className="glow-layer blur-strong"></span>
          <div className="card-internal p-6 flex flex-col justify-between">
            <div>
              <p className="text-zinc-400 text-[12px] font-semibold uppercase tracking-wider mb-2">Completed</p>
              <h3 className="text-[40px] leading-none font-bold tracking-tight text-white">{completedTasks}</h3>
            </div>
            <div className="mt-4 w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="outer-card">
          <span className="glow-layer"></span>
          <span className="glow-layer blur-strong"></span>
          <div className="card-internal p-6">
            <p className="text-zinc-400 text-[12px] font-semibold uppercase tracking-wider mb-2">Pending</p>
            <h3 className="text-[40px] leading-none font-bold tracking-tight text-white">{pendingTasks}</h3>
          </div>
        </div>

        <div className="outer-card">
          <span className="glow-layer"></span>
          <span className="glow-layer blur-strong"></span>
          <div className="card-internal p-6">
            <p className="text-zinc-400 text-[12px] font-semibold uppercase tracking-wider mb-2">Total Projects</p>
            <h3 className="text-[40px] leading-none font-bold tracking-tight text-white">{projects.length}</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
        <div className="outer-card lg:col-span-1">
          <span className="glow-layer"></span>
          <div className="card-internal p-6 flex flex-col items-center">
            <h2 className="text-[16px] font-semibold tracking-tight text-white self-start">Task Distribution</h2>
            <TaskPieChart tasks={tasks} />
          </div>
        </div>

        <div className="outer-card lg:col-span-1">
          <span className="glow-layer"></span>
          <div className="card-internal p-6 flex flex-col items-center">
            <h2 className="text-[16px] font-semibold tracking-tight text-white self-start">Project Workload</h2>
            <TaskBarChart tasks={tasks} projects={projects} />
          </div>
        </div>

        <div className="outer-card lg:col-span-1">
          <span className="glow-layer"></span>
          <div className="card-internal p-6 flex flex-col items-center">
            <h2 className="text-[16px] font-semibold tracking-tight text-white self-start">Progress Over Time</h2>
            <TaskLineChart tasks={tasks} />
          </div>
        </div>
      </div>

      {/* Activity and Recent Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[20px] font-semibold tracking-tight text-white">Activity Feed</h2>
          </div>
          
          <div className="bg-[#18181b] border border-white/5 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden">
            {tasks.length > 0 ? (
              <div className="divide-y divide-white/5">
                {tasks.slice(0, 6).map((task, i) => {
                  const userName = usersMap[task.assigned_to] || 'A team member';
                  const action = task.status === 'Done' ? 'completed' : task.status === 'In Progress' ? 'is working on' : 'was assigned';
                  return (
                  <div key={`act-${task.id}`} className="p-5 sm:px-6 hover:bg-white/5 transition-colors flex items-start gap-4 group">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-indigo-500/30">
                        {userName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="text-[14px] text-zinc-300">
                        <span className="font-medium text-white">{userName}</span> {action} task <span className="font-medium text-zinc-100">"{task.title}"</span>
                      </p>
                      <p className="text-[12px] text-zinc-500 mt-1">{i === 0 ? 'Just now' : `${i * 2 + 1} hours ago`}</p>
                    </div>
                  </div>
                )})}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-[15px] text-zinc-400 font-medium">No activity yet.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[20px] font-semibold tracking-tight text-white">Recent Tasks</h2>
            <Link to="/tasks" className="text-[14px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>
          
          <div className="bg-[#18181b] border border-white/5 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.2)] overflow-hidden">
            {tasks.length > 0 ? (
              <div className="divide-y divide-white/5">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="p-5 sm:px-6 hover:bg-white/5 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="mt-0.5 flex-shrink-0">
                        {task.status === 'Done' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 ${task.status === 'In Progress' ? 'border-amber-400 border-t-amber-200' : 'border-zinc-500'}`}></div>
                        )}
                      </div>
                      <div>
                        <h4 className={`text-[15px] font-medium transition-colors flex items-center gap-2 ${task.status === 'Done' ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                          {task.title}
                          {task.priority && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border
                              ${task.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                            >
                              {task.priority}
                            </span>
                          )}
                        </h4>
                        {task.description && (
                          <p className="text-[13px] text-zinc-400 mt-0.5 line-clamp-1 max-w-xs">{task.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-[15px] text-zinc-400 font-medium">No tasks yet.</p>
                <p className="text-[14px] text-zinc-500 mt-1">Get started by creating a new task.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
