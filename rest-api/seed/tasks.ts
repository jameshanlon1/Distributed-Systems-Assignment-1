// seed/tasks.ts
import { Task, Project } from '../shared/types';

export const tasks: Task[] = [
  {
    taskId: 1,
    title: "Design homepage",
    description: "Create a new design for the homepage",
    status: "pending",
    createdAt: "2025-03-10T10:00:00Z",
    priority: "high",
    projectId: 1
  },
  {
    taskId: 2,
    title: "Develop login functionality",
    description: "Implement login functionality with email/password authentication",
    status: "in-progress",
    createdAt: "2025-03-12T10:00:00Z",
    priority: "medium",
    projectId: 2
  },
  {
    taskId: 3,
    title: "Test homepage design",
    description: "Test the newly designed homepage for responsiveness and performance",
    status: "pending",
    createdAt: "2025-03-15T10:00:00Z",
    priority: "low",
    projectId: 1
  }
];


export const projects: Project[] = [
  {
    projectId: 1,
    projectName: "Website Redesign",
    description: "A project to redesign the company website",
    status: "active",
    createdAt: "2025-03-01T10:00:00Z",
  },
  {
    projectId: 2,
    projectName: "Mobile App Development",
    description: "Building a new mobile app for the company",
    status: "active",
    createdAt: "2025-03-05T10:00:00Z",
  }
];