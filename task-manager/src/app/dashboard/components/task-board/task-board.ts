import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskCard } from '../task-card/task-card';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task';
import { SearchService } from '../../../core/services/search';

@Component({
  selector: 'app-task-board',
  imports: [CommonModule, TaskCard, DragDropModule, MatSnackBarModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
})
export class TaskBoard {
  tasks = input.required<Task[]>();
  selectedStatus = input<string>('all');
  selectedPriority = input<string>('all');
  selectedAssignees = input<string[]>([]);
  private taskService = inject(TaskService);
  private snackBar = inject(MatSnackBar);
  private searchService = inject(SearchService);
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

  drop(event: CdkDragDrop<Task[]>) {
    // If dropping into a different column
    if (event.previousContainer !== event.container) {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id; // Expecting 'todo', 'in_progress', or 'done'
      
      // Perform local optimistic array move for smooth UI until reload finishes
      const targetArray = event.container.data;
      targetArray.splice(event.currentIndex, 0, event.previousContainer.data.splice(event.previousIndex, 1)[0]);
      
      this.taskService.updateTask(task.id, { status: newStatus as Task['status'] }).then(() => {
        this.snackBar.open(`Task moved to ${newStatus.replace('_', ' ').toUpperCase()}`, 'Close', { duration: 2000 });
      }).catch(err => {
        console.error('Failed to move task', err);
        this.snackBar.open('Failed to move task', 'Close', { duration: 3000, panelClass: 'error-snackbar' });
      });
    } else {
       // Just visual reorder in same array
       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
  }

  todoTasks = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase();
    return this.sortTasks(
      this.tasks()
        .filter((t) => t.status === 'todo')
        .filter((t) => this.selectedPriority() === 'all' || t.priority === this.selectedPriority())
        .filter((t) => this.selectedAssignees().length === 0 || (t.assignee && this.selectedAssignees().includes(t.assignee.id)))
        .filter((t) => !term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)),
    );
  });

  inProgressTasks = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase();
    return this.sortTasks(
      this.tasks()
        .filter((t) => t.status === 'in_progress')
        .filter((t) => this.selectedPriority() === 'all' || t.priority === this.selectedPriority())
        .filter((t) => this.selectedAssignees().length === 0 || (t.assignee && this.selectedAssignees().includes(t.assignee.id)))
        .filter((t) => !term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)),
    );
  });

  doneTasks = computed(() => {
    const term = this.searchService.searchTerm().toLowerCase();
    return this.sortTasks(
      this.tasks()
        .filter((t) => t.status === 'done')
        .filter((t) => this.selectedPriority() === 'all' || t.priority === this.selectedPriority())
        .filter((t) => this.selectedAssignees().length === 0 || (t.assignee && this.selectedAssignees().includes(t.assignee.id)))
        .filter((t) => !term || t.title.toLowerCase().includes(term) || t.description.toLowerCase().includes(term)),
    );
  });
}
