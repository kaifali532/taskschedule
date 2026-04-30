import React, { useEffect, useState } from 'react';
import { supabase, Project, UserProfile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Folder, X } from 'lucide-react';
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

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="flex flex-col space-y-8">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-1">Projects</h1>
          <p className="text-[15px] text-[#86868b]">Manage and organize your work.</p>
        </div>
        {isAdmin && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center justify-center rounded-full bg-[#1d1d1f] px-5 py-2.5 text-[14px] font-medium text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Project
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] animate-in mb-4 relative">
           <button onClick={() => setIsCreating(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors">
              <X className="w-5 h-5"/>
           </button>
           <h3 className="text-xl font-semibold mb-6">Create New Project</h3>
          <form onSubmit={handleCreateProject} className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1">
              <label htmlFor="projectName" className="block text-[13px] font-medium text-gray-500 mb-2 ml-1">Project Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="projectName"
                required
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="block w-full rounded-xl bg-gray-50 border border-gray-200 py-3.5 px-4 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-[15px] transition-all placeholder:text-gray-400"
                placeholder="E.g., Q1 Marketing Campaign"
                autoFocus
              />
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
               <button
                 type="submit"
                 className="inline-flex items-center justify-center rounded-xl bg-[#1d1d1f] px-6 py-3.5 text-[15px] font-semibold text-white shadow-sm hover:bg-black transition-all"
               >
                 Create
               </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="outer-card group">
              <span className="glow-layer"></span>
              <span className="glow-layer blur-strong"></span>
              <div className="card-internal flex flex-col p-6 overflow-hidden">
                 <div className="flex items-start justify-between mb-8 flex-1">
                    <div className="w-12 h-12 rounded-[14px] bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                       <Folder className="w-6 h-6" />
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                 </div>
                 <div>
                    <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-1.5 leading-tight truncate" title={project.name}>{project.name}</h3>
                    <p className="text-[14px] text-[#86868b]">Admin: {project.admin.name}</p>
                 </div>
                 <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[12px] font-medium text-gray-400">Created {format(parseISO(project.created_at), 'MMM d, yyyy')}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center rounded-[24px] border border-dashed border-gray-200 p-16 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-[16px] font-semibold text-[#1d1d1f]">No projects found</h3>
          <p className="mt-1 text-[14px] text-gray-500 max-w-sm mx-auto">Get started by creating a new project to organize your team's tasks.</p>
        </div>
      )}
    </div>
  );
}
