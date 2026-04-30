import React, { useEffect, useState } from 'react';
import { supabase, Task, Project, UserProfile, TaskStatus } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Tasks() {
  const { profile } = useAuth();
  
  const [tasks, setTasks] = useState<(Task & { project: { name: string }, assignee: { name: string, id: string } | null })[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (profile) fetchData();
  }, [profile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: pData } = await supabase.from('projects').select('*');
      const { data: uData } = await supabase.from('users').select('*');
      
      setProjects(pData || []);
      setUsers(uData || []);

      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (profile?.role === 'Member') query = query.eq('assigned_to', profile.id);

      const { data: tData, error } = await query;
      if (error) throw error;

      const enriched = (tData || []).map(t => ({
        ...t,
        project: pData?.find(p => p.id === t.project_id) || { name: 'Unknown Project' },
        assignee: uData?.find(u => u.id === t.assigned_to) || null,
      }));

      setTasks(enriched);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setProjectId(task.project_id);
      setAssignedTo(task.assigned_to || '');
      setStatus(task.status);
      setDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setAssignedTo('');
      setStatus('To Do');
      setDeadline('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        description,
        project_id: projectId,
        assigned_to: assignedTo || null,
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      };

      if (editingTask) {
        if (profile?.role === 'Admin') {
          await supabase.from('tasks').update(payload).eq('id', editingTask.id);
        } else {
          await supabase.from('tasks').update({ status }).eq('id', editingTask.id);
        }
      } else {
        await supabase.from('tasks').insert([payload]);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await supabase.from('tasks').delete().eq('id', id);
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const isAdmin = profile?.role === 'Admin';

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Tasks</h1>
        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="flex-1 bg-[#111318] border border-slate-800 rounded-2xl flex flex-col overflow-hidden min-h-[400px]">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#16191F]">
            <h2 className="text-lg font-bold text-white">All Active Tasks</h2>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            {tasks.length === 0 ? (
               <div className="p-12 text-center text-sm text-slate-500">No tasks found.</div>
            ) : (
              <table className="w-full text-left min-w-[800px]">
                <thead className="bg-[#1A1D23]/50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Task Title</th>
                    <th className="px-6 py-4">Project</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-200">{task.title}</div>
                        {task.description && <div className="text-xs text-slate-500 mt-1 max-w-sm truncate">{task.description}</div>}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{task.project.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white">
                            {task.assignee ? getInitials(task.assignee.name) : '-'}
                          </div>
                          <span className="text-slate-300">{task.assignee?.name || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${task.deadline && isPast(parseISO(task.deadline)) && task.status !== 'Done' ? 'text-rose-400' : 'text-slate-400'}`}>
                         {task.deadline ? format(parseISO(task.deadline), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        {task.status === 'Done' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[11px] font-bold border border-emerald-500/20">DONE</span>
                        ) : task.status === 'In Progress' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[11px] font-bold border border-amber-500/20">IN PROGRESS</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[11px] font-bold border border-blue-500/20">TO DO</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2 text-slate-500">
                           <button onClick={() => handleOpenModal(task)} className="hover:text-indigo-400 transition-colors p-1">
                             <Edit className="h-4 w-4" />
                           </button>
                           {isAdmin && (
                            <button onClick={() => handleDelete(task.id)} className="hover:text-rose-400 transition-colors p-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                           )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-800 bg-[#16191F] flex items-center justify-between text-xs text-slate-500 font-medium">
            <p>Showing {tasks.length} task(s)</p>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#16191F] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-[#111318]">
               <h2 className="text-lg font-bold text-white">{editingTask ? 'Edit Task' : 'New Task'}</h2>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {isAdmin ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Project <span className="text-rose-500">*</span></label>
                    <select required value={projectId} onChange={e => setProjectId(e.target.value)} className="block w-full rounded-lg bg-[#0A0B0D] border border-slate-700 py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                      <option value="" disabled>Select a project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Title <span className="text-rose-500">*</span></label>
                    <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="block w-full rounded-lg bg-[#0A0B0D] border border-slate-700 py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder:text-slate-600" placeholder="Task title..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="block w-full rounded-lg bg-[#0A0B0D] border border-slate-700 py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm placeholder:text-slate-600" placeholder="Add more details..."></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Assign To</label>
                      <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="block w-full rounded-lg bg-[#0A0B0D] border border-slate-700 py-2.5 px-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option value="">Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1.5">Deadline</label>
                      <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="block w-full rounded-lg bg-[#0A0B0D] border border-slate-700 py-2.5 px-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-start">
                  <div className="text-sm text-indigo-400">
                    <p className="font-semibold mb-1">Status Update Only</p>
                    <p className="opacity-80">As a Team Member, you can only update the status of your assigned tasks. Contact an Admin for other changes.</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="block w-full rounded-lg bg-[#0A0B0D] border border-slate-700 py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="inline-flex items-center justify-center rounded-lg bg-[#1A1D23] border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
