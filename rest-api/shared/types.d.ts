// Define the Task type with necessary fields
export type Task = {
  taskId: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  createdAt: string;  // ISO date string
  updatedAt?: string;  // ISO date string (optional)
  dueDate?: string;  // ISO date string (optional)
  priority: "low" | "medium" | "high";
};

// Define a query parameter structure for filtering tasks
export type TaskQueryParams = {
  status?: string;
  priority?: string;
  dueDate?: string;  // ISO date string (optional)
};
