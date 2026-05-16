import { Task, Project, UserProfile } from './supabase';

export const mockUsers: UserProfile[] = [
  { id: 'mock-1', name: 'Rahul Sharma', email: 'rahul@example.com', role: 'Admin', created_at: new Date().toISOString() },
  { id: 'mock-2', name: 'Priya Patel', email: 'priya@example.com', role: 'Member', created_at: new Date().toISOString() },
  { id: 'mock-3', name: 'Amit Kumar', email: 'amit@example.com', role: 'Member', created_at: new Date().toISOString() },
  { id: 'mock-4', name: 'Sneha Gupta', email: 'sneha@example.com', role: 'Member', created_at: new Date().toISOString() },
  { id: 'mock-5', name: 'Vikram Singh', email: 'vikram@example.com', role: 'Member', created_at: new Date().toISOString() },
];

export const mockProjects: Project[] = [
  { id: 'proj-1', name: 'AI Chatbot Platform', description: 'Next-gen customer support bot', admin_id: 'mock-1', created_at: new Date().toISOString() },
  { id: 'proj-2', name: 'E-commerce Website Redesign', description: 'Modernizing the shopping experience', admin_id: 'mock-1', created_at: new Date().toISOString() },
  { id: 'proj-3', name: 'Mobile Banking App', description: 'Secure and fast mobile payments', admin_id: 'mock-1', created_at: new Date().toISOString() },
  { id: 'proj-4', name: 'Task Management System', description: 'Internal productivity tool', admin_id: 'mock-1', created_at: new Date().toISOString() },
  { id: 'proj-5', name: 'Marketing Campaign Dashboard', description: 'Analytics for Q3 campaigns', admin_id: 'mock-1', created_at: new Date().toISOString() },
  { id: 'proj-6', name: 'HR Portal Update', description: 'Employee self-service portal', admin_id: 'mock-1', created_at: new Date().toISOString() },
];

const today = new Date();
const past = (days: number) => new Date(today.getTime() - days * 86400000).toISOString();
const future = (days: number) => new Date(today.getTime() + days * 86400000).toISOString();

export const mockTasks: Task[] = [
  // AI Chatbot
  { id: 't-1', title: 'NLP Model Training', description: 'Train the core intent recognition model', project_id: 'proj-1', assigned_to: 'mock-2', status: 'In Progress', deadline: future(5), created_at: past(10), priority: 'High', updated_at: past(2) },
  { id: 't-2', title: 'Chat UI Design', description: 'Design frontend chat components', project_id: 'proj-1', assigned_to: 'mock-4', status: 'Done', deadline: past(2), created_at: past(12), priority: 'Medium', updated_at: past(2) },
  { id: 't-3', title: 'Integration with LLM', project_id: 'proj-1', assigned_to: 'mock-3', status: 'To Do', deadline: future(10), created_at: past(5), priority: 'High', description: 'Connect to OpenAI APIs', updated_at: past(1) },
  
  // E-commerce
  { id: 't-4', title: 'Shopping Cart State', description: 'Implement Redux store for cart', project_id: 'proj-2', assigned_to: 'mock-2', status: 'Done', deadline: past(1), created_at: past(15), priority: 'High', updated_at: past(1) },
  { id: 't-5', title: 'Product Catalog API', description: 'GraphQL endpoint for products', project_id: 'proj-2', assigned_to: 'mock-5', status: 'In Progress', deadline: future(2), created_at: past(8), priority: 'Medium', updated_at: past(3) },
  { id: 't-6', title: 'Payment Gateway Integration', description: 'Stripe setup and webhooks', project_id: 'proj-2', assigned_to: 'mock-3', status: 'To Do', deadline: future(15), created_at: past(2), priority: 'High', updated_at: past(2) },
  { id: 't-7', title: 'Mobile Responsiveness', description: 'Fix CSS issues on product pages', project_id: 'proj-2', assigned_to: 'mock-4', status: 'Done', deadline: past(5), created_at: past(20), priority: 'Low', updated_at: past(6) },
  
  // Banking App
  { id: 't-8', title: 'Biometric Auth', description: 'FaceID/TouchID wrapper', project_id: 'proj-3', assigned_to: 'mock-3', status: 'In Progress', deadline: future(4), created_at: past(6), priority: 'High', updated_at: past(1) },
  { id: 't-9', title: 'Transaction History Screen', description: 'Infinite scroll list', project_id: 'proj-3', assigned_to: 'mock-2', status: 'To Do', deadline: future(8), created_at: past(3), priority: 'Medium', updated_at: past(3) },
  { id: 't-10', title: 'Security Audit', description: 'Penetration testing round 1', project_id: 'proj-3', assigned_to: 'mock-5', status: 'Done', deadline: past(3), created_at: past(25), priority: 'High', updated_at: past(3) },

  // Task Management
  { id: 't-11', title: 'Dashboard Analytics', description: 'Add recharts visualizations', project_id: 'proj-4', assigned_to: 'mock-4', status: 'Done', deadline: past(0), created_at: past(7), priority: 'High', updated_at: past(0) },
  { id: 't-12', title: 'Drag and Drop Kanban', description: 'Use dnd-kit for board', project_id: 'proj-4', assigned_to: 'mock-2', status: 'In Progress', deadline: future(3), created_at: past(4), priority: 'Medium', updated_at: past(1) },
  { id: 't-13', title: 'Role Based Access', description: 'Supabase RLS policies', project_id: 'proj-4', assigned_to: 'mock-3', status: 'To Do', deadline: future(7), created_at: past(1), priority: 'High', updated_at: past(1) },

  // Generic Tasks to pad it out
  { id: 't-14', title: 'Email Templates', description: 'Design transactional emails', project_id: 'proj-5', assigned_to: 'mock-4', status: 'Done', deadline: past(4), created_at: past(10), priority: 'Low', updated_at: past(5) },
  { id: 't-15', title: 'Data Migration', description: 'Move old users to new schema', project_id: 'proj-6', assigned_to: 'mock-5', status: 'In Progress', deadline: future(1), created_at: past(5), priority: 'High', updated_at: past(1) },
  { id: 't-16', title: 'Push Notifications', description: 'Firebase setup', project_id: 'proj-3', assigned_to: 'mock-2', status: 'To Do', deadline: future(10), created_at: past(1), priority: 'Medium', updated_at: past(1) },
  { id: 't-17', title: 'User Testing', description: 'Conduct 5 user interviews', project_id: 'proj-2', assigned_to: 'mock-4', status: 'In Progress', deadline: future(12), created_at: past(2), priority: 'Low', updated_at: past(0) },
  { id: 't-18', title: 'Performance Optimization', description: 'Improve load time by 50%', project_id: 'proj-1', assigned_to: 'mock-3', status: 'To Do', deadline: future(20), created_at: today.toISOString(), priority: 'Medium', updated_at: today.toISOString() },
  { id: 't-19', title: 'Documentation', description: 'Write API docs', project_id: 'proj-4', assigned_to: 'mock-5', status: 'Done', deadline: past(2), created_at: past(15), priority: 'Low', updated_at: past(2) },
  { id: 't-20', title: 'Server Upgrade', description: 'Upgrade Node.js version', project_id: 'proj-6', assigned_to: 'mock-1', status: 'To Do', deadline: future(3), created_at: past(1), priority: 'Medium', updated_at: past(1) },
  { id: 't-21', title: 'Bug Fixes', description: 'Fix login issue on Safari', project_id: 'proj-2', assigned_to: 'mock-2', status: 'Done', deadline: past(6), created_at: past(8), priority: 'High', updated_at: past(6) },
  { id: 't-22', title: 'Analytics Tracking', description: 'GA4 Setup', project_id: 'proj-5', assigned_to: 'mock-3', status: 'In Progress', deadline: future(4), created_at: past(3), priority: 'Medium', updated_at: past(1) },
  { id: 't-23', title: 'Localization', description: 'Add French language support', project_id: 'proj-1', assigned_to: 'mock-4', status: 'To Do', deadline: future(25), created_at: today.toISOString(), priority: 'Low', updated_at: today.toISOString() },
  { id: 't-24', title: 'Load Testing', description: 'Simulate 10k users', project_id: 'proj-3', assigned_to: 'mock-5', status: 'Done', deadline: past(1), created_at: past(12), priority: 'High', updated_at: past(1) },
  { id: 't-25', title: 'Feedback Form', description: 'In-app feedback modal', project_id: 'proj-6', assigned_to: 'mock-2', status: 'To Do', deadline: future(6), created_at: past(1), priority: 'Low', updated_at: past(1) }
];

export function withDemoData<T>(realData: T[] | null | undefined, mockDataType: 'users' | 'projects' | 'tasks', profileId?: string): T[] {
  const data = realData || [];
  
  if (mockDataType === 'users') {
    return [...data, ...mockUsers] as any[];
  }
  if (mockDataType === 'projects') {
    const projects = mockProjects.map(p => profileId ? { ...p, admin_id: profileId, name: p.name + ' (Demo)' } : p);
    // Don't append demo data if there is already lot of real data to avoid clutter
    if (data.length > 2) return data;
    return [...data, ...projects] as T[];
  }
  if (mockDataType === 'tasks') {
    const tasks = mockTasks.map((t, index) => {
      // Assign every 3rd task to the current user so they see it
      if (profileId && index % 3 === 0) {
        return { ...t, assigned_to: profileId, title: t.title + ' (Demo)' };
      }
      return t;
    });
    if (data.length > 5) return data;
    return [...data, ...tasks] as T[];
  }
  return data;
}

