import React, { useEffect, useState } from 'react';
import { supabase, Project, UserProfile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Projects() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<(Project & { admin: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    if (profile) fetchProjects();
  }, [profile]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projErr) throw projErr;

      const { data: usersData, error: usrErr } = await supabase
        .from('users')
        .select('id, name');

      if (usrErr) throw usrErr;

      let assignedProjectIds = new Set<string>();
      if (profile?.role === 'Member') {
        const { data: myTasks } = await supabase
          .from('tasks')
          .select('project_id')
          .eq('assigned_to', profile.id);
          
        if (myTasks) {
          myTasks.forEach(t => assignedProjectIds.add(t.project_id));
        }
      }

      let enriched = (projData || []).map(p => ({
        ...p,
        admin: usersData?.find(u => u.id === p.admin_id) || { name: 'Unknown' }
      }));

      if (profile?.role === 'Member') {
        enriched = enriched.filter(p => assignedProjectIds.has(p.id));
      }

      setProjects(enriched);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const { error } = await supabase.from('projects').insert([
        {
          name: newProjectName,
          admin_id: profile?.id,
        }
      ]);

      if (error) throw error;
      setNewProjectName('');
      setIsCreating(false);
      fetchProjects();
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure? This will delete all tasks within the project.')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      fetchProjects();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const isAdmin = profile?.role === 'Admin';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Projects</h1>
        {isAdmin && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-[#16191F] p-6 rounded-2xl border border-slate-800 shadow-xl mb-6">
          <form onSubmit={handleCreateProject} className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1">
              <label htmlFor="projectName" className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
              <input
                type="text"
                id="projectName"
                required
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="block w-full rounded-lg bg-[#111318] border border-slate-700 py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                placeholder="E.g., Q1 Marketing Campaign"
              />
            </div>
            <div className="flex gap-3">
               <button
                 type="submit"
                 className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 transition-all"
               >
                 Create
               </button>
               <button
                 type="button"
                 onClick={() => setIsCreating(false)}
                 className="inline-flex items-center justify-center rounded-lg bg-[#1A1D23] border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
               >
                 Cancel
               </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#16191F] border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                     <FolderOpen className="w-5 h-5 text-indigo-400" />
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Delete Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-1 truncate" title={project.name}>{project.name}</h3>
                <p className="text-sm text-slate-500 mb-4">Admin: <span className="text-slate-400">{project.admin.name}</span></p>
                <div className="border-t border-slate-800/60 pt-4 mt-auto">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-600">Created</p>
                    <p className="text-xs text-slate-400 mt-1">{format(parseISO(project.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center rounded-2xl border border-dashed border-slate-800 p-16 bg-[#16191F]/50">
          <FolderOpen className="mx-auto h-12 w-12 text-slate-700 mb-4" />
          <h3 className="text-sm font-semibold text-slate-300">No projects</h3>
          <p className="mt-2 text-sm text-slate-500">Get started by creating a new project.</p>
        </div>
      )}
    </div>
  );
}
