import { supabase } from './supabase';

export async function checkAndSeedDemoData(userId: string, email: string) {
  try {
    // 1. Ensure user profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
       console.error('Error fetching profile for seeding:', profileError);
    }

    if (!existingProfile) {
      console.log('Profile not found, creating demo profile...');
      const { error: insertProfileError } = await supabase.from('users').insert({
        id: userId,
        email: email,
        name: 'Demo Admin User',
        role: 'Admin',
      });
      if (insertProfileError) {
         console.error('Error creating demo profile:', insertProfileError);
      }
    }

    // 2. Check if user has projects
    const { data: existingProjects, error: fetchProjectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('admin_id', userId)
      .limit(1);

    if (fetchProjectsError) {
       console.error('Error fetching projects for seeding:', fetchProjectsError);
       return;
    }

    if (existingProjects && existingProjects.length > 0) {
      // User already has data, no need to seed
      console.log('Data already exists, skipping seed.');
      return;
    }

    console.log('No projects found, seeding demo data...');

    // 3. Insert Demo Projects
    const projectsToInsert = [
      { name: 'AI Dashboard', description: 'Analytics and visualizations for ML models.', admin_id: userId },
      { name: 'E-commerce Platform', description: 'Revamp the main shopping experience.', admin_id: userId },
      { name: 'Banking App', description: 'Mobile app for digital banking features.', admin_id: userId },
      { name: 'Task Manager', description: 'Internal tool for organizing sprints.', admin_id: userId },
      { name: 'Portfolio Website', description: 'Company landing page and portfolio show case.', admin_id: userId },
      { name: 'Customer Support Portal', description: 'Zendesk alternative for B2B support.', admin_id: userId },
    ];

    const { data: insertedProjects, error: projectsInsertError } = await supabase
      .from('projects')
      .insert(projectsToInsert)
      .select();

    if (projectsInsertError) {
      console.error('Error inserting demo projects:', projectsInsertError);
      return;
    }

    if (!insertedProjects || insertedProjects.length === 0) return;

    // 4. Insert Demo Tasks
    const statusOptions = ['To Do', 'In Progress', 'Done'];
    const p1Id = insertedProjects[0].id;
    const p2Id = insertedProjects[1].id;
    const p3Id = insertedProjects[2].id;
    const p4Id = insertedProjects[3].id;
    const p5Id = insertedProjects[4].id;

    const tasksToInsert = [
      { title: 'Design System Update', description: 'Update color palette.', project_id: p1Id, assigned_to: userId, status: 'Done', deadline: new Date(Date.now() - 864000000).toISOString() },
      { title: 'API Integration', description: 'Connect frontend to AI gateway.', project_id: p1Id, assigned_to: userId, status: 'In Progress', deadline: new Date(Date.now() + 86400000).toISOString() },
      { title: 'User Testing', description: 'Run A/B tests on the dashboard.', project_id: p1Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 172800000).toISOString() },
      { title: 'Shopping Cart Bug', description: 'Fix rounding error in total calculation.', project_id: p2Id, assigned_to: userId, status: 'In Progress', deadline: new Date(Date.now() + 43200000).toISOString() },
      { title: 'Stripe Integration', description: 'Add new payment methods.', project_id: p2Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 86400000 * 3).toISOString() },
      { title: 'OAuth Login', description: 'Implement Google login.', project_id: p3Id, assigned_to: userId, status: 'Done', deadline: new Date(Date.now() - 86400000 * 5).toISOString() },
      { title: 'Fingerprint Auth', description: 'Biometric login for mobile app.', project_id: p3Id, assigned_to: userId, status: 'In Progress', deadline: new Date(Date.now() + 86400000 * 4).toISOString() },
      { title: 'Transaction History', description: 'Create UI for recent transactions.', project_id: p3Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 86400000 * 7).toISOString() },
      { title: 'Drag and Drop', description: 'Implement sorting for tasks.', project_id: p4Id, assigned_to: userId, status: 'Done', deadline: new Date(Date.now() - 86400000 * 3).toISOString() },
      { title: 'Email Notifications', description: 'Send daily digests.', project_id: p4Id, assigned_to: userId, status: 'In Progress', deadline: new Date(Date.now() + 86400000 * 2).toISOString() },
      { title: 'Role Based Access', description: 'Add admin controls.', project_id: p4Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 86400000 * 5).toISOString() },
      { title: 'SEO Optimization', description: 'Improve meta tags.', project_id: p5Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 86400000 * 6).toISOString() },
      { title: 'Dark Mode', description: 'Add theme toggle.', project_id: p5Id, assigned_to: userId, status: 'Done', deadline: new Date(Date.now() - 86400000 * 10).toISOString() },
      { title: 'Deploy to Vercel', description: 'Setup CI/CD pipeline.', project_id: p5Id, assigned_to: userId, status: 'In Progress', deadline: new Date(Date.now() + 86400000 * 2).toISOString() },
      // Add more tasks to make it look full
      { title: 'Update dependencies', description: 'Bump npm packages.', project_id: p1Id, assigned_to: userId, status: 'Done', deadline: new Date(Date.now() - 86400000 * 2).toISOString() },
      { title: 'Write tests', description: 'Add unit tests for components.', project_id: p2Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 86400000 * 8).toISOString() },
      { title: 'Update documentation', description: 'Write API docs.', project_id: p3Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 86400000 * 9).toISOString() },
      { title: 'Refactor components', description: 'Clean up code.', project_id: p4Id, assigned_to: userId, status: 'In Progress', deadline: new Date(Date.now() + 86400000 * 4).toISOString() },
      { title: 'Performance audit', description: 'Run lighthouse tests.', project_id: p5Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 86400000 * 12).toISOString() },
      { title: 'Accessibility check', description: 'Ensure WCAG compliance.', project_id: p1Id, assigned_to: userId, status: 'In Progress', deadline: new Date(Date.now() + 86400000 * 3).toISOString() },
       { title: 'Update README', description: 'Add usage instructions.', project_id: p2Id, assigned_to: userId, status: 'Done', deadline: new Date(Date.now() - 86400000 * 1).toISOString() },
      { title: 'Fix typo in footer', description: 'Self explanatory.', project_id: p3Id, assigned_to: userId, status: 'Done', deadline: new Date(Date.now() - 86400000 * 8).toISOString() },
      { title: 'Optimize images', description: 'Compress assets.', project_id: p4Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 86400000 * 15).toISOString() },
      { title: 'Add analytics', description: 'Integrate tools.', project_id: p5Id, assigned_to: userId, status: 'In Progress', deadline: new Date(Date.now() + 86400000 * 5).toISOString() },
      { title: 'Review PRs', description: 'Check open pull requests.', project_id: p1Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 86400000 * 1).toISOString() },
      { title: 'Plan Sprint', description: 'Prepare for next week.', project_id: p2Id, assigned_to: userId, status: 'To Do', deadline: new Date(Date.now() + 86400000 * 6).toISOString() }
    ];

    const { error: tasksInsertError } = await supabase
      .from('tasks')
      .insert(tasksToInsert);
      
    if (tasksInsertError) {
        console.error('Error inserting demo tasks:', tasksInsertError);
    } else {
        console.log('Demo data seeded successfully!');
    }

  } catch (err) {
    console.error('Error in seedDemoData:', err);
  }
}
