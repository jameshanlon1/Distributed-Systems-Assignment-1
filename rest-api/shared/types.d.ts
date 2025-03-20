export type Task = {
  taskId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // optional
  projectId: string; // reference to the Project entity
};

export type Project = {
  projectId: string;
  projectName: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
};
