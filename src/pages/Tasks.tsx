import React, { useEffect, useState } from 'react';
import { supabase, Task, Project, UserProfile, TaskStatus } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit, X, Filter } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { demoTasks, demoProjects, demoUsers } from '../lib/demoData';

export default function Tasks() {
  const { profile } = useAuth();
  
  const [tasks, setTasks] = useState<(Task & { project: { name: string }, assignee: { name: string, id: string } | null })[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');

  useEffect(() => {
    if (profile) {
      fetchTasks();
      fetchProjects();
      fetchUsers();
    }
  }, [profile]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data: tasksData, error: taskError } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (taskError) throw taskError;

      const { data: projectsData, error: projError } = await supabase.from('projects').select('*');
      if (projError) throw projError;

      const { data: usersData, error: usrError } = await supabase.from('users').select('*');
      if (usrError) throw usrError;

      const pData = projectsData && projectsData.length > 0 ? projectsData : demoProjects;
      const uData = usersData && usersData.length > 0 ? usersData : demoUsers;

      let enriched = (tasksData || []).map(t => ({
        ...t,
        project: pData.find(p => p.id === t.project_id) || { name: 'Unknown' },
        assignee: uData.find(u => u.id === t.assigned_to) || null
      }));

      // Fallback
      if (enriched.length === 0) {
         enriched = demoTasks as any;
      }

      if (profile?.role === 'Member') {
         enriched = enriched.filter(t => t.assigned_to === profile.id);
      }

      setTasks(enriched);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks(demoTasks as any);
    } finally {
       setLoading(false);
    }
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*');
    setProjects(data && data.length > 0 ? data : demoProjects);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select('*');
    setUsers(data && data.length > 0 ? data : demoUsers);
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setProjectId(task.project_id);
      setAssignedTo(task.assigned_to || '');
      setDeadline(task.deadline ? task.deadline.slice(0, 16) : '');
      setStatus(task.status);
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setProjectId(profile?.role === 'Admin' && projects.length > 0 ? projects[0].id : '');
      setAssignedTo('');
      setDeadline('');
      setStatus('To Do');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        status,
      };

      if (profile?.role === 'Admin') {
         payload.title = title;
         payload.description = description;
         payload.project_id = projectId;
         payload.assigned_to = assignedTo || null;
         payload.deadline = deadline ? new Date(deadline).toISOString() : null;
      }

      if (editingTask) {
        if (editingTask.id.startsWith('t')) {
           // It's a demo task, don't update DB
           setIsModalOpen(false);
           return;
        }
        if (profile?.role === 'Admin') {
          await supabase.from('tasks').update(payload).eq('id', editingTask.id);
        } else {
          await supabase.from('tasks').update({ status }).eq('id', editingTask.id).eq('assigned_to', profile.id);
        }
      } else {
        if (profile?.role === 'Member') return;
        await supabase.from('tasks').insert([payload]);
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      if (id.startsWith('t')) {
         setTasks(tasks.filter(t => t.id !== id));
         return;
      }
      await supabase.from('tasks').delete().eq('id', id);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const isAdmin = profile?.role === 'Admin';
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'U';

  const filteredTasks = statusFilter === 'All' ? tasks : tasks.filter(t => t.status === statusFilter);

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Tasks</h1>
          <p className="text-[15px] text-zinc-400">View, update, and manage action items.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
             <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
             <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value as any)}
                className="pl-9 pr-8 py-2 rounded-full bg-zinc-900 border border-white/10 text-white text-[13px] font-medium appearance-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
             >
                <option value="All">All Status</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
             </select>
          </div>
          {isAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-[14px] font-medium text-white hover:from-indigo-500 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] transition-all duration-300"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Task
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-[#18181b] border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-[24px] p-6">
          <div className="space-y-4">
             {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl w-full"></div>
             ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#18181b] border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.2)] rounded-[24px] overflow-hidden">
          
          <div className="overflow-x-auto">
            {filteredTasks.length === 0 ? (
               <div className="p-16 text-center text-[15px] text-zinc-500 font-medium">No tasks found matching current filters.</div>
            ) : (
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-zinc-900/50 border-b border-white/10 text-zinc-500 uppercase text-[11px] font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-[24px]">Task Title</th>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right rounded-tr-[24px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[14px]">
                  {filteredTasks.map((task) => {
                     const isOverdue = task.deadline && isPast(parseISO(task.deadline)) && task.status !== 'Done';
                     
                     return (
                    <tr key={task.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className={`font-medium ${task.status === 'Done' ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>{task.title}</div>
                        {task.description && <div className="text-[13px] text-zinc-500 mt-0.5 max-w-sm truncate">{task.description}</div>}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                         <span className="bg-white/5 px-2.5 py-1 rounded-md text-[12px]">{task.project.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                           {task.assignee ? (
                              <div className="flex items-center gap-2">
                                 <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-[10px] font-bold text-indigo-300 shadow-sm">
                                   {task.assignee ? getInitials(task.assignee.name) : '-'}
                                 </div>
                                 <span className="text-zinc-300 font-medium text-[13px]">{task.assignee.name}</span>
                              </div>
                           ) : (
                              <span className="text-zinc-500 italic text-[13px]">Unassigned</span>
                           )}
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-[13px] ${isOverdue ? 'text-red-400 font-medium' : 'text-zinc-500'}`}>
                         {task.deadline ? (
                            <span className={isOverdue ? 'bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20' : ''}>
                               {format(parseISO(task.deadline), 'MMM d, yyyy')}
                            </span>
                         ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {task.status === 'Done' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">Done</span>
                        ) : task.status === 'In Progress' ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">In Progress</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-300 border border-slate-500/20 text-[11px] font-semibold">To Do</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-1 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleOpenModal(task)} className="hover:text-indigo-400 hover:bg-white/5 p-2 rounded-full transition-all">
                             <Edit className="h-4 w-4" />
                           </button>
                           {isAdmin && (
                            <button onClick={() => handleDelete(task.id)} className="hover:text-red-400 hover:bg-red-500/10 p-2 rounded-full transition-all">
                              <Trash2 className="h-4 w-4" />
                            </button>
                           )}
                         </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            )}
          </div>
          
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in">
          <div className="outer-card w-full max-w-lg">
            <span className="glow-layer"></span>
            <span className="glow-layer blur-strong"></span>
            <div className="w-full card-internal overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                 <h2 className="text-[20px] font-semibold tracking-tight text-white">{editingTask ? 'Edit Task' : 'New Task'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
                {isAdmin ? (
                  <>
                    <div>
                      <label className="block text-[13px] font-medium text-zinc-400 mb-1.5 ml-1">Project <span className="text-red-500">*</span></label>
                      <select required value={projectId} onChange={e => setProjectId(e.target.value)} className="block w-full rounded-xl bg-zinc-900 border border-white/10 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-[14px] transition-all appearance-none cursor-pointer">
                        <option value="" disabled>Select a project</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-[13px] font-medium text-zinc-400 mb-1.5 ml-1">Title <span className="text-red-500">*</span></label>
                      <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="block w-full rounded-xl bg-zinc-900 border border-white/10 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-[14px] transition-all placeholder:text-zinc-500" placeholder="Task title..." />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-zinc-400 mb-1.5 ml-1">Description</label>
                      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="block w-full rounded-xl bg-zinc-900 border border-white/10 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-[14px] transition-all placeholder:text-zinc-500" placeholder="Add more details..."></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[13px] font-medium text-zinc-400 mb-1.5 ml-1">Assign To</label>
                        <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="block w-full rounded-xl bg-zinc-900 border border-white/10 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-[14px] transition-all appearance-none cursor-pointer">
                          <option value="">Unassigned</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-zinc-400 mb-1.5 ml-1">Deadline</label>
                        <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="block w-full rounded-xl bg-zinc-900 border border-white/10 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-[14px] transition-all" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 rounded-[16px] bg-indigo-500/10 border border-indigo-500/20 flex items-start">
                    <div className="text-[14px] text-indigo-400">
                      <p className="font-semibold mb-1">Status Update Only</p>
                      <p className="opacity-80">As a Team Member, you can only update the status of your assigned tasks. Contact an Admin for other changes.</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-medium text-zinc-400 mb-1.5 ml-1">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="block w-full rounded-xl bg-zinc-900 border border-white/10 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-[14px] transition-all appearance-none cursor-pointer">
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex items-center justify-center rounded-full bg-zinc-800 border border-white/10 px-5 py-2.5 text-[14px] font-medium text-white hover:bg-zinc-700 transition-colors">Cancel</button>
                  <button type="submit" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-[14px] font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)]">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
