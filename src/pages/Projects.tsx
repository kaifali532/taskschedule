import React, { useEffect, useState } from 'react';
import { supabase, Project, UserProfile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Folder, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { withDemoData } from '../lib/mockData';

export default function Projects() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<(Project & { admin: { name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) fetchProjects();
  }, [profile]);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const isMember = profile?.role === 'Member';
      const fetchParams = [
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('id, name')
      ];

      if (isMember) {
        fetchParams.push(supabase.from('tasks').select('project_id').eq('assigned_to', profile.id));
      }

      const results = await Promise.all(fetchParams);
      
      const { data: projData, error: projErr } = results[0];
      if (projErr) throw projErr;
      const fullProjects = withDemoData(projData, 'projects', profile?.id);

      const { data: usersData, error: usrErr } = results[1];
      if (usrErr) throw usrErr;
      const fullUsers = withDemoData(usersData, 'users');

      let assignedProjectIds = new Set<string>();
      if (isMember) {
        const { data: myTasks, error: myTasksErr } = results[2];
        if (myTasksErr) throw myTasksErr;
        const fullMyTasks = withDemoData(myTasks, 'tasks', profile?.id);
        if (fullMyTasks) {
          fullMyTasks.forEach((t: any) => {
            if (t.assigned_to === profile.id || profile.id === undefined) {
               assignedProjectIds.add(t.project_id);
            }
          });
        }
      }

      let enriched = fullProjects.map(p => ({
        ...p,
        admin: fullUsers.find((u: any) => u.id === p.admin_id) || { name: 'Unknown' }
      }));

      if (isMember) {
        // If they are a member, they only see projects they have tasks in, OR projects where they are explicitly the admin (demo injects admin)
        enriched = enriched.filter(p => assignedProjectIds.has(p.id) || p.admin_id === profile.id);
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
          description: newProjectDesc.trim() || null,
          admin_id: profile?.id,
        }
      ]);

      if (error) throw error;
      setNewProjectName('');
      setNewProjectDesc('');
      setIsCreating(false);
      fetchProjects();
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteError(null);
    if (!confirm('Are you sure? This will delete all tasks within the project.')) return;
    try {
      console.log(`Attempting to delete project with ID: ${id}`);
      
      // Manually delete tasks first to handle missing ON DELETE CASCADE on older DBs
      const { error: taskError } = await supabase.from('tasks').delete().eq('project_id', id);
      if (taskError) {
        console.error('Task delete error:', taskError);
        throw new Error(`Failed to delete tasks: ${taskError.message}`);
      }
      
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        console.error('Project delete error:', error);
        throw new Error(`Failed to delete project: ${error.message}`);
      }
      
      console.log(`Successfully deleted project: ${id}`);
      fetchProjects();
    } catch (error: any) {
      console.error('Delete error details:', error);
      setDeleteError(error.message || 'Failed to delete project. Please try again.');
    }
  };

  const isAdmin = profile?.role === 'Admin';

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Projects</h1>
          <p className="text-[15px] text-zinc-400">Manage and organize your work.</p>
        </div>
        {isAdmin && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-[14px] font-medium text-white hover:from-indigo-500 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] transition-all duration-300"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Project
          </button>
        )}
      </div>

      {deleteError && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 mb-4 flex items-center justify-between">
          <p className="text-[14px]">{deleteError}</p>
          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isCreating && (
        <div className="bg-[#18181b] p-6 md:p-8 rounded-[24px] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)] animate-in mb-4 relative">
           <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5"/>
           </button>
           <h3 className="text-xl font-semibold mb-6 text-white">Create New Project</h3>
          <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="projectName" className="block text-[13px] font-medium text-zinc-400 mb-2 ml-1">Project Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="projectName"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="block w-full rounded-xl bg-zinc-900 border border-white/10 py-3.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-[15px] transition-all placeholder:text-zinc-500"
                  placeholder="E.g., Q1 Marketing Campaign"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label htmlFor="projectDesc" className="block text-[13px] font-medium text-zinc-400 mb-2 ml-1">Project Description</label>
              <textarea
                id="projectDesc"
                rows={3}
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="block w-full rounded-xl bg-zinc-900 border border-white/10 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-[14px] transition-all placeholder:text-zinc-500"
                placeholder="Add a brief description of this project..."
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 mt-2">
               <button
                 type="submit"
                 className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)]"
               >
                 Create Project
               </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="outer-card h-[200px]">
              <div className="card-internal p-6 flex flex-col">
                <div className="w-12 h-12 rounded-[14px] bg-zinc-800 mb-4"></div>
                <div className="h-5 w-3/4 bg-zinc-800 rounded-md mb-2"></div>
                <div className="h-3 w-1/2 bg-zinc-800 rounded-md mb-4"></div>
                <div className="h-10 w-full bg-zinc-800 rounded-md mt-auto"></div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="outer-card group">
              <span className="glow-layer"></span>
              <span className="glow-layer blur-strong"></span>
              <div className="card-internal flex flex-col p-6 overflow-hidden">
                 <div className="flex items-start justify-between mb-8 flex-1">
                    <div className="w-12 h-12 rounded-[14px] bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                       <Folder className="w-6 h-6" />
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-full transition-all"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                 </div>
                 <div>
                    <h3 className="text-[20px] font-semibold text-white mb-1.5 leading-tight truncate" title={project.name}>{project.name}</h3>
                    <p className="text-[14px] text-zinc-400 mb-4">Admin: {project.admin.name}</p>
                    {project.description ? (
                      <p className="text-[13px] text-zinc-500 leading-relaxed line-clamp-3">{project.description}</p>
                    ) : (
                      <p className="text-[13px] text-zinc-600 italic">No description</p>
                    )}
                 </div>
                 <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-zinc-500">Created {format(parseISO(project.created_at), 'MMM d, yyyy')}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center rounded-[24px] border border-dashed border-white/10 p-16 bg-[#18181b] shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="text-[16px] font-semibold text-white">No projects found</h3>
          <p className="mt-1 text-[14px] text-zinc-400 max-w-sm mx-auto">Get started by creating a new project to organize your team's tasks.</p>
        </div>
      )}
    </div>
  );
}
