import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Project, UserProfile } from '../lib/supabase';
import { Plus, Trash2, Folder, Shield, Users, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Projects() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const fetchData = async (currentProfile: UserProfile | null, isMounted: () => boolean) => {
    if (!currentProfile) {
      if (isMounted()) setLoading(false);
      return;
    }
    
    let fallbackTimeout: NodeJS.Timeout | undefined;
    
    try {
      if (isMounted()) {
        setLoading(true);
        setError(null);
      }
      
      fallbackTimeout = setTimeout(() => {
        if (isMounted() && loading) {
          setLoading(false);
        }
      }, 5000);

      const [projData, usersData] = await Promise.all([
        api.getProjects(currentProfile.id, currentProfile.role),
        api.getUsers()
      ]);
      
      if (isMounted()) {
        setProjects(projData || []);
        setUsers(usersData || []);
      }
    } catch (err: any) {
      console.error("fetchData projects error", err);
      if (isMounted()) setError('Failed to load projects.');
    } finally {
      clearTimeout(fallbackTimeout);
      if (isMounted()) setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;
    
    fetchData(profile, isMounted);
    
    return () => { mounted = false; };
  }, [profile?.id, profile?.role]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      await api.createProject({
        name: newProjectName,
        description: newProjectDesc.trim() || null,
        admin_id: profile?.id,
      });
      setIsCreating(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchData(profile, () => true);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.deleteProject(id);
      fetchData(profile, () => true);
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const isAdmin = profile?.role === 'Admin';

  if (loading && projects.length === 0) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Projects</h1>
          <p className="text-zinc-400">Manage your team's domains and initiatives.</p>
        </div>
        {isAdmin && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Project</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
          <h3 className="font-bold mb-1">Error loading data</h3>
          <p className="text-sm opacity-90">{error}</p>
        </div>
      )}

      {isCreating && (
        <div className="bg-[#18181b] border border-white/5 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Create Project</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                placeholder="E.g., Q4 Marketing Campaign"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
              <textarea
                value={newProjectDesc}
                onChange={e => setNewProjectDesc(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none h-24"
                placeholder="Optional description..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-2.5 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => {
          const admin = users.find(u => u.id === project.admin_id);
          return (
            <div key={project.id} className="group flex flex-col bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-lg hover:border-white/10 transition-colors relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Folder className="w-6 h-6" />
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">{project.name}</h3>
              
              <p className="text-zinc-400 text-sm flex-1 line-clamp-3 mb-6">
                {project.description || <span className="italic opacity-50">No description provided.</span>}
              </p>

              <div className="space-y-2 mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center text-sm text-zinc-500">
                  <Shield className="w-4 h-4 mr-2 text-zinc-600" />
                  <span>Admin: <span className="text-zinc-300">{admin?.name || 'Unknown'}</span></span>
                </div>
                <div className="flex items-center text-sm text-zinc-500">
                  <Calendar className="w-4 h-4 mr-2 text-zinc-600" />
                  <span>Created {project.created_at ? format(parseISO(project.created_at), 'MMM d, yyyy') : 'Unknown'}</span>
                </div>
              </div>
            </div>
          );
        })}

        {projects.length === 0 && !loading && !isCreating && (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#18181b]/50">
            <Folder className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No Projects Found</h3>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto">
              There are no projects available. {isAdmin && "Create one to get started."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
