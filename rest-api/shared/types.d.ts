export type Task = {
  taskId: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string; // optional
  projectId: number; // reference to the Project entity
};

export type Project = {
  projectId: number;
  projectName: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
};
