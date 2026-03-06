import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sidebar } from './sidebar';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from '../../core/services/task';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let mockTaskService: any;
  let mockDialog: any;

  beforeEach(async () => {
    mockTaskService = {
      createTask: vi.fn().mockResolvedValue({})
    };
    mockDialog = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([]),
        { provide: TaskService, useValue: mockTaskService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    })
      .overrideComponent(Sidebar, {
        set: {
          providers: [
            { provide: TaskService, useValue: mockTaskService },
            { provide: MatDialog, useValue: mockDialog }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Create Task', () => {
    it('should open TaskFormDialog on button click from template', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(null) });
      const btn = fixture.debugElement.query(By.css('.new-task-btn'));
      // Use a mock event object to ensure the listener function is hit in a way V8 records
      btn.triggerEventHandler('click', { 
        stopPropagation: () => {}, 
        preventDefault: () => {} 
      });
      fixture.detectChanges();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should have a "New Task" button with correct icon and text', () => {
      const btn = fixture.debugElement.query(By.css('.new-task-btn'));
      expect(btn).toBeTruthy();
      expect(btn.nativeElement.textContent).toContain('New Task');
      const icon = btn.query(By.css('mat-icon'));
      expect(icon).toBeTruthy();
      expect(icon.nativeElement.textContent).toBe('add');
    });
    it('should call createTask in TaskService if dialog result is present', () => {
      const taskResult = { title: 'New Task' };
      mockDialog.open.mockReturnValue({ afterClosed: () => of(taskResult) });

      component.createTask();
      expect(mockTaskService.createTask).toHaveBeenCalledWith(taskResult);
    });

    it('should not call createTask in TaskService if dialog is cancelled', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(null) });

      component.createTask();
      expect(mockTaskService.createTask).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Links', () => {
    it('should have Dashboard link and navigation works', () => {
      const link = fixture.debugElement.query(By.css('a[routerLink="/dashboard"]'));
      expect(link).toBeTruthy();
      expect(link.nativeElement.textContent).toContain('Dashboard');
      link.nativeElement.click();
      fixture.detectChanges();
    });

    it('should have Analytics link and navigation works', () => {
      const link = fixture.debugElement.query(By.css('a[routerLink="/analytics"]'));
      expect(link).toBeTruthy();
      expect(link.nativeElement.textContent).toContain('Analytics');
      link.nativeElement.click();
      fixture.detectChanges();
    });

    it('should have other links', () => {
      const links = fixture.debugElement.queryAll(By.css('mat-nav-list a'));
      expect(links.length).toBe(6);
      links.forEach(link => {
        link.nativeElement.click();
        fixture.detectChanges();
      });
    });
  });
});
