import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { TaskService } from '../core/services/task';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DashboardToolbar } from './components/toolbar/toolbar';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let mockTaskService: any;
  let mockStatsResource: any;
  let mockTasksResource: any;

  const getMockTask = (id: string) => ({
    id,
    title: `Task ${id}`,
    description: 'Desc',
    status: 'todo',
    priority: 'medium',
    isOverdue: false,
    dueDate: new Date().toISOString(),
    assignee: { id: 'u1', name: 'User 1', avatar: 'A' },
    tags: ['tag1']
  });

  beforeEach(async () => {
    const statsValueSignal = signal({ data: [{ id: 1, title: 'Tasks', value: 10, icon: 'task' }] });
    const statsIsLoadingSignal = signal(false);
    mockStatsResource = statsValueSignal as any;
    mockStatsResource.value = statsValueSignal;
    mockStatsResource.isLoading = statsIsLoadingSignal;
    mockStatsResource.error = signal(null);

    const tasksValueSignal = signal([getMockTask('1')]);
    const tasksIsLoadingSignal = signal(false);
    mockTasksResource = tasksValueSignal as any;
    mockTasksResource.value = tasksValueSignal;
    mockTasksResource.isLoading = tasksIsLoadingSignal;
    mockTasksResource.error = signal(null);

    mockTaskService = {
      statisticsResource: mockStatsResource,
      tasksResource: mockTasksResource,
      searchAssignees: vi.fn().mockReturnValue(of([])),
      searchTasks: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: TaskService, useValue: mockTaskService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Loading States', () => {
    it('should show spinner when statistics are loading', () => {
      mockStatsResource.isLoading.set(true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('app-spinner'))).toBeTruthy();
    });

    it('should show spinner when tasks are loading', () => {
      mockTasksResource.isLoading.set(true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('app-spinner'))).toBeTruthy();
    });
  });

  describe('Success States', () => {
    it('should show stat cards when statistics are available', () => {
      expect(fixture.debugElement.query(By.css('app-stat-card'))).toBeTruthy();
    });

    it('should show toolbar and board when tasks are available', () => {
      expect(fixture.debugElement.query(By.css('app-dashboard-toolbar'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('app-task-board'))).toBeTruthy();
    });
  });

  describe('Error/Empty States', () => {
    it('should show no-data when statistics are missing', () => {
      mockStatsResource.value.set(null);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('no-data'))).toBeTruthy();
    });

    it('should show no-data when tasks are missing', () => {
      mockTasksResource.value.set(null);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('no-data'))).toBeTruthy();
    });
  });

  describe('Toolbar Interactions', () => {
    it('should update selectedStatus from toolbar', () => {
      const toolbar = fixture.debugElement.query(By.directive(DashboardToolbar));
      toolbar.triggerEventHandler('statusChange', 'done');
      expect(component.selectedStatus()).toBe('done');
    });

    it('should update selectedPriority from toolbar', () => {
      const toolbar = fixture.debugElement.query(By.directive(DashboardToolbar));
      toolbar.triggerEventHandler('priorityChange', 'high');
      expect(component.selectedPriority()).toBe('high');
    });

    it('should update selectedAssignees from toolbar', () => {
      const toolbar = fixture.debugElement.query(By.directive(DashboardToolbar));
      toolbar.triggerEventHandler('assigneeChange', ['u1', 'u2']);
      expect(component.selectedAssignees()).toEqual(['u1', 'u2']);
    });
  });
});
