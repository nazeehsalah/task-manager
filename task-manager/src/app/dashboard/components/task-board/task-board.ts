import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-board',
  imports: [CommonModule, TaskCard],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
})
export class TaskBoard {
  tasks = input.required<Task[]>();
  selectedStatus = input<string>('all');
  selectedPriority = input<string>('all');
  sortTasks = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      // Both overdue or both not overdue
      if (a.isOverdue === b.isOverdue) {
        // Sort chronologically ascending (oldest/closest due date first)
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      // Overdue tasks come first
      return a.isOverdue ? -1 : 1;
    });
  };

  todoTasks = computed(() =>
    this.sortTasks(
      this.tasks()
        .filter((t) => t.status === 'todo')
        .filter((t) => this.selectedPriority() === 'all' || t.priority === this.selectedPriority()),
    ),
  );

  inProgressTasks = computed(() =>
    this.sortTasks(
      this.tasks()
        .filter((t) => t.status === 'in_progress')
        .filter((t) => this.selectedPriority() === 'all' || t.priority === this.selectedPriority()),
    ),
  );

  doneTasks = computed(() =>
    this.sortTasks(
      this.tasks()
        .filter((t) => t.status === 'done')
        .filter((t) => this.selectedPriority() === 'all' || t.priority === this.selectedPriority()),
    ),
  );
}
