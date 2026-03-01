export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  completedAt: string | null;
  assignee: Assignee;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  data: Task[];
  meta: {
    totalCount: number;
    lastUpdated: string;
  };
}
