import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCard } from './task-card';
import { TaskService } from '../../../core/services/task';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Task } from '../../../core/models/task.model';

describe('TaskCard', () => {
  let component: TaskCard;
  let fixture: ComponentFixture<TaskCard>;
  let mockTaskService: any;
  let mockDialog: any;

  const getMockTask = (overdue = false, daysDiff = 0): Task => {
    const due = new Date();
    due.setDate(due.getDate() + (overdue ? -daysDiff : daysDiff));
    return {
      id: '1',
      title: 'Test Task',
      description: 'Test Desc',
      status: 'todo',
      priority: 'high',
      isOverdue: overdue,
      dueDate: due.toISOString(),
      completedAt: null,
      assignee: { id: 'u1', name: 'User 1', avatar: 'A', email: 'u1@example.com' },
      tags: ['tag1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  beforeEach(async () => {
    mockTaskService = {
      updateTask: vi.fn().mockResolvedValue({}),
      deleteTask: vi.fn().mockResolvedValue({})
    };
    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: () => of(null)
      })
    };

    await TestBed.configureTestingModule({
      imports: [TaskCard],
    })
    .overrideProvider(TaskService, { useValue: mockTaskService })
    .overrideProvider(MatDialog, { useValue: mockDialog })
    .compileComponents();

    fixture = TestBed.createComponent(TaskCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', getMockTask());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Dialog Operations', () => {
    it('should open TaskFormDialog and call updateTask on result', async () => {
      const editResult = { title: 'Updated' };
      mockDialog.open.mockReturnValue({
        afterClosed: () => of(editResult)
      });

      component.editTask();
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockTaskService.updateTask).toHaveBeenCalledWith('1', editResult);
    });

    it('should open ConfirmDialog and call deleteTask on result', async () => {
      mockDialog.open.mockReturnValue({
        afterClosed: () => of(true)
      });

      component.deleteTask();
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('1');
    });

    it('should not call services if dialog is cancelled', () => {
      mockDialog.open.mockReturnValue({
        afterClosed: () => of(null)
      });

      component.editTask();
      component.deleteTask();
      expect(mockTaskService.updateTask).not.toHaveBeenCalled();
      expect(mockTaskService.deleteTask).not.toHaveBeenCalled();
    });
  });

  describe('Computed Signals - overdueText', () => {
    it('should return empty string if not overdue', () => {
      fixture.componentRef.setInput('task', getMockTask(false, 1));
      expect(component.overdueText()).toBe('');
    });

    it('should return "Overdue" if overdue by 0 days (today)', () => {
      fixture.componentRef.setInput('task', getMockTask(true, 0));
      expect(component.overdueText()).toBe('Overdue');
    });

    it('should return "Overdue by 1 day" if overdue by 1 day', () => {
      fixture.componentRef.setInput('task', getMockTask(true, 1));
      expect(component.overdueText()).toBe('Overdue by 1 day');
    });

    it('should return "Overdue by 2 days" if overdue by 2 days', () => {
      fixture.componentRef.setInput('task', getMockTask(true, 2));
      expect(component.overdueText()).toBe('Overdue by 2 days');
    });
  });

  describe('Computed Signals - upcomingDueText', () => {
    it('should return empty string if overdue', () => {
      fixture.componentRef.setInput('task', getMockTask(true, 1));
      expect(component.upcomingDueText()).toBe('');
    });

    it('should return "Due today" if due today', () => {
      fixture.componentRef.setInput('task', getMockTask(false, 0));
      expect(component.upcomingDueText()).toBe('Due today');
    });

    it('should return "Due tomorrow" if due in 1 day', () => {
      fixture.componentRef.setInput('task', getMockTask(false, 1));
      expect(component.upcomingDueText()).toBe('Due tomorrow');
    });

    it('should return "Due in 1 week" if due in 7 days', () => {
      fixture.componentRef.setInput('task', getMockTask(false, 7));
      expect(component.upcomingDueText()).toBe('Due in 1 week');
    });

    it('should return "Due in X days" for others', () => {
      fixture.componentRef.setInput('task', getMockTask(false, 5));
      expect(component.upcomingDueText()).toBe('Due in 5 days');
    });
  });

  describe('Template Rendering', () => {
    it('should display priority badge', () => {
      const badge = fixture.debugElement.query(By.css('.priority-badge'));
      expect(badge.nativeElement.textContent).toContain('HIGH');
    });

    it('should display assignee avatar and name', () => {
      expect(fixture.debugElement.query(By.css('.avatar')).nativeElement.textContent).toBe('A');
      expect(fixture.debugElement.query(By.css('.name')).nativeElement.textContent).toBe('User 1');
    });
  });
});
