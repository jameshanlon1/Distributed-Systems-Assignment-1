import { Task } from '../shared/types'

export const tasks: Task[] = [
  {
    taskId: "1",
    title: "Buy groceries",
    description: "Get eggs, milk, bread, and some fruits for the week.",
    status: "pending",
    createdAt: "2025-03-20T10:00:00Z",
    priority: "high",
    dueDate: "2025-03-20T18:00:00Z",
  },
  {
    taskId: "2",
    title: "Morning workout",
    description: "Complete a 30-minute workout session at the gym.",
    status: "in-progress",
    createdAt: "2025-03-19T06:30:00Z",
    priority: "medium",
    dueDate: "2025-03-19T07:00:00Z",
  },
  {
    taskId: "3",
    title: "Read a book",
    description: "Finish reading 50 pages of 'Atomic Habits'.",
    status: "pending",
    createdAt: "2025-03-18T08:00:00Z",
    priority: "low",
    dueDate: "2025-03-22T09:00:00Z",
  },
  {
    taskId: "4",
    title: "Plan weekend trip",
    description: "Look for places to visit this weekend and book a place to stay.",
    status: "pending",
    createdAt: "2025-03-17T15:00:00Z",
    priority: "medium",
    dueDate: "2025-03-20T10:00:00Z",
  },
  {
    taskId: "5",
    title: "Call mom",
    description: "Check in with mom and see how she’s doing.",
    status: "completed",
    createdAt: "2025-03-16T18:00:00Z",
    priority: "high",
    dueDate: "2025-03-16T19:00:00Z",
  }
];
