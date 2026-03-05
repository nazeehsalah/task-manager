import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { TaskService } from '../../../core/services/task';
import { Spinner } from '../../../shared/spinner/spinner';
import { NoData } from '../../../shared/no-data/no-data';

@Component({
  selector: 'app-task-analytics',
  imports: [CommonModule, BaseChartDirective, Spinner, NoData],
  templateUrl: './task-analytics.html',
  styleUrl: './task-analytics.scss',
})
export class TaskAnalytics {
  private taskService = inject(TaskService);
  tasksResource = this.taskService.tasksResource;

  priorityChartData = computed<ChartData<'pie'>>(() => {
    const data = this.tasksResource.value() || [];
    const high = data.filter(t => t.priority === 'high').length;
    const medium = data.filter(t => t.priority === 'medium').length;
    const low = data.filter(t => t.priority === 'low').length;

    return {
      labels: ['High', 'Medium', 'Low'],
      datasets: [{
        data: [high, medium, low],
        backgroundColor: ['#fc5c65', '#fd9644', '#2bcbba'],
        hoverBackgroundColor: ['#ea2027', '#fa8231', '#0fb9b1'],
      }]
    };
  });

  statusChartData = computed<ChartData<'doughnut'>>(() => {
    const data = this.tasksResource.value() || [];
    const todo = data.filter(t => t.status === 'todo').length;
    const inProgress = data.filter(t => t.status === 'in_progress').length;
    const done = data.filter(t => t.status === 'done').length;

    return {
      labels: ['To Do', 'In Progress', 'Done'],
      datasets: [{
        data: [todo, inProgress, done],
        backgroundColor: ['#d1d8e0', '#4b7bec', '#20bf6b'],
        hoverBackgroundColor: ['#a5b1c2', '#3867d6', '#26de81'],
      }]
    };
  });

  assigneeChartData = computed<ChartData<'bar'>>(() => {
    const data = this.tasksResource.value() || [];
    const assigneeCounts: Record<string, number> = {};

    data.forEach(t => {
      const name = t.assignee ? t.assignee.name : 'Unassigned';
      assigneeCounts[name] = (assigneeCounts[name] || 0) + 1;
    });

    const labels = Object.keys(assigneeCounts);
    const counts = Object.values(assigneeCounts);

    return {
      labels,
      datasets: [{
        label: 'Tasks',
        data: counts,
        backgroundColor: '#3867d6',
        hoverBackgroundColor: '#4b7bec',
        maxBarThickness: 50
      }]
    };
  });

  overdueChartData = computed<ChartData<'doughnut'>>(() => {
    const data = this.tasksResource.value() || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let overdue = 0;
    let onTime = 0;

    data.forEach(t => {
      if (t.status === 'done') {
        onTime++;
      } else if (t.dueDate) {
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          overdue++;
        } else {
          onTime++;
        }
      } else {
        onTime++; // no due date = not overdue
      }
    });

    return {
      labels: ['On Time', 'Overdue'],
      datasets: [{
        data: [onTime, overdue],
        backgroundColor: ['#20bf6b', '#eb3b5a'],
        hoverBackgroundColor: ['#26de81', '#fc5c65'],
      }]
    };
  });

  priorityChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: false }
    }
  };

  statusChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: false }
    }
  };

  assigneeChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  overdueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: false }
    }
  };
}
