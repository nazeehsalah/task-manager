import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCard } from './components/stat-card/stat-card';
import { TaskService } from '../core/services/task';
import { Spinner } from '../shared/spinner/spinner';
import { DashboardToolbar } from './components/toolbar/toolbar';
import { NoData } from '../shared/no-data/no-data';
import { TaskBoard } from './components/task-board/task-board';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, StatCard, Spinner, NoData, DashboardToolbar, TaskBoard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private taskService = inject(TaskService);
  statistics = this.taskService.statisticsResource;
  tasks = this.taskService.tasksResource;
  selectedStatus = signal<string>('all');
}
