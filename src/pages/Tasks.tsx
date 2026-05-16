import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Task, Project, UserProfile, TaskStatus } from '../lib/supabase';
import { Plus, Trash2, Edit, X, Calendar, Clock, CheckCircle2, Circle, AlertCircle, Filter } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';

export default function Tasks() {
  const { profile } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<TaskStatus>('To Do');

  const [statusFilter, setStatusFilter] = useState<string>('All');

  const fetchData = async () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [tasksData, projectsData, usersData] = await Promise.all([
        api.getTasks(profile.id, profile.role),
        api.getProjects(profile.id, profile.role),
        api.getUsers()
      ]);
      setTasks(tasksData || []);
      setProjects(projectsData || []);
      setUsers(usersData || []);
    } catch (err: any) {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

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
    if (profile?.role === 'Member' && !editingTask) return; // Members can't create

    try {
      const payload: Partial<Task> = { status };

      if (profile?.role === 'Admin') {
        payload.title = title;
        payload.description = description;
        payload.project_id = projectId;
        payload.assigned_to = assignedTo || null as any;
        payload.deadline = deadline ? new Date(deadline).toISOString() : null as any;
      }

      if (editingTask) {
        await api.updateTask(editingTask.id, payload);
      } else {
        await api.createTask(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const isAdmin = profile?.role === 'Admin';
  
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }
    return result;
  }, [tasks, statusFilter]);

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center gap-4">
        <div className="flex space-x-2">
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
        </div>
        <span className="text-zinc-400 font-medium text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Tasks</h1>
          <p className="text-zinc-400">View, update, and manage action items.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-[#18181b] border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          {isAdmin && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
          <h3 className="font-bold mb-1">Error loading data</h3>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#18181b]/50">
            <CheckCircle2 className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No Tasks Found</h3>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              You're all caught up! {isAdmin && "Create a new task to assign work."}
            </p>
          </div>
        )}

        {filteredTasks.map(task => {
          const project = projects.find(p => p.id === task.project_id);
          const assignee = users.find(u => u.id === task.assigned_to);
          const isOverdue = task.deadline && isPast(parseISO(task.deadline)) && task.status !== 'Done';

          return (
            <div key={task.id} className="group bg-[#18181b] border border-white/5 rounded-2xl p-5 shadow-lg hover:border-white/10 transition-colors flex flex-col relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {task.status === 'Done' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : task.status === 'In Progress' ? (
                    <Clock className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-600" />
                  )}
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400' :
                    task.status === 'In Progress' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {task.status}
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button onClick={() => handleOpenModal(task)} className="p-1.5 text-zinc-500 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10">
                    <Edit className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <button onClick={() => handleDelete(task.id)} className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className={`text-lg font-medium mb-1 line-clamp-1 ${task.status === 'Done' ? 'text-zinc-500 line-through' : 'text-white'}`}>
                {task.title}
              </h3>
              
              <p className="text-sm text-zinc-400 line-clamp-2 flex-1 mb-4">
                {task.description || <span className="italic opacity-50">No description.</span>}
              </p>

              <div className="space-y-2 pt-3 border-t border-white/5 text-sm">
                <div className="flex items-center justify-between text-zinc-500">
                  <span className="truncate pr-2">Project: <span className="text-zinc-300">{project?.name || 'Unknown'}</span></span>
                  {assignee ? (
                    <div className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold" title={assignee.name}>
                      {assignee.name.substring(0, 2).toUpperCase()}
                    </div>
                  ) : (
                    <span className="text-zinc-600 text-[11px]">Unassigned</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  {task.deadline ? (
                    <div className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>
                      {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                      <span className="text-[12px]">{format(parseISO(task.deadline), 'MMM d, yyyy')}</span>
                    </div>
                  ) : (
                    <span className="text-[12px] text-zinc-600 italic">No due date</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#18181b] border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-4">
              {isAdmin ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Project <span className="text-red-500">*</span></label>
                    <select required value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none">
                      <option value="" disabled>Select project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Title <span className="text-red-500">*</span></label>
                    <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors" placeholder="Task name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none" placeholder="Task details" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Assignee</label>
                      <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none text-sm">
                        <option value="">None</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Deadline</label>
                      <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-sm text-indigo-300">
                  You can only update the status of this task.
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none">
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium transition-colors">
                  Save Task
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
