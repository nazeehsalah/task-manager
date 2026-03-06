import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskAnalytics } from './task-analytics';
import { TaskService } from '../../../core/services/task';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

describe('TaskAnalytics', () => {
  let component: TaskAnalytics;
  let fixture: ComponentFixture<TaskAnalytics>;
  let mockTaskService: any;
  let mockResource: any;

  const mockTasks: any[] = [
    {
      id: '1',
      title: 'Task 1',
      status: 'todo',
      priority: 'high',
      dueDate: '2020-01-01', // Overdue
      assignee: { name: 'Alice', avatar: 'A', email: 'alice@example.com' },
      updatedAt: '2024-03-01T10:00:00Z'
    },
    {
      id: '2',
      title: 'Task 2',
      status: 'done',
      priority: 'medium',
      dueDate: '2024-12-31',
      assignee: { name: 'Bob', avatar: 'B', email: 'bob@example.com' },
      updatedAt: '2024-03-01T11:00:00Z'
    },
    {
      id: '3',
      title: 'Task 3',
      status: 'in_progress',
      priority: 'low',
      dueDate: null,
      assignee: null,
      updatedAt: '2024-03-01T12:00:00Z'
    }
  ];

  beforeEach(async () => {
    // Correctly mock the resource as a combined signal + methods structure
    const valueSignal = signal<any[]>(mockTasks);
    const isLoadingSignal = signal(false);
    
    mockResource = valueSignal as any;
    mockResource.value = valueSignal;
    mockResource.isLoading = isLoadingSignal;
    mockResource.error = signal(null);

    mockTaskService = {
      tasksResource: mockResource
    };

    await TestBed.configureTestingModule({
      imports: [TaskAnalytics],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        provideCharts(withDefaultRegisterables())
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAnalytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Chart Data Computations', () => {
    it('should compute priorityChartData correctly', () => {
      const data = component.priorityChartData();
      expect(data.datasets[0].data).toEqual([1, 1, 1]);
    });

    it('should compute statusChartData correctly', () => {
      const data = component.statusChartData();
      expect(data.datasets[0].data).toEqual([1, 1, 1]);
    });

    it('should compute assigneeChartData correctly including Unassigned', () => {
      const data = component.assigneeChartData();
      expect(data.labels).toContain('Alice');
      expect(data.labels).toContain('Bob');
      expect(data.labels).toContain('Unassigned');
      expect(data.datasets[0].data).toEqual([1, 1, 1]);
    });

    it('should compute overdueChartData correctly', () => {
      const data = component.overdueChartData();
      expect(data.datasets[0].data).toEqual([2, 1]);
    });

    it('should compute overdueChartData correctly for on-time but not done tasks', () => {
      const futureTask = { ...mockTasks[0], dueDate: '2050-01-01', status: 'todo' };
      mockResource.set([futureTask]);
      fixture.detectChanges();
      
      const data = component.overdueChartData();
      expect(data.datasets[0].data).toEqual([1, 0]); // Hits "onTime++" for future due date
    });
  });

  describe('Template States', () => {
    it('should show spinner when loading', () => {
      mockResource.isLoading.set(true);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('app-spinner'))).toBeTruthy();
    });

    it('should show no-data when no tasks available', () => {
      mockResource.set([]);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('no-data'))).toBeTruthy();
    });

    it('should render charts when data is available', () => {
      const charts = fixture.debugElement.queryAll(By.directive(BaseChartDirective));
      expect(charts.length).toBe(4);
    });
  });

  describe('Empty Data Fallbacks', () => {
    it('should handle null value in computed signals', () => {
      mockResource.set(null);
      fixture.detectChanges();

      expect(component.priorityChartData().datasets[0].data).toEqual([0, 0, 0]);
      expect(component.assigneeChartData().labels).toEqual([]);
    });
  });
});
