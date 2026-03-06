import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppLayout } from './app-layout';
import { provideRouter } from '@angular/router';
import { SearchService } from '../../core/services/search';
import { TaskService } from '../../core/services/task';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

describe('AppLayout', () => {
  let component: AppLayout;
  let fixture: ComponentFixture<AppLayout>;
  let mockSearchService: any;
  let mockTaskService: any;
  let mockDialog: any;

  beforeEach(async () => {
    mockSearchService = {
      searchTerm: signal('')
    };

    mockTaskService = {
      createTask: vi.fn(),
      getTasks: vi.fn(),
      statisticsResource: signal({ isLoading: () => false, value: () => null }),
      tasksResource: signal({ isLoading: () => false, value: () => null })
    };

    mockDialog = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AppLayout],
      providers: [
        provideRouter([]),
        { provide: SearchService, useValue: mockSearchService },
        { provide: TaskService, useValue: mockTaskService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Global Search', () => {
    it('should update search term on input change', () => {
      const input = fixture.debugElement.query(By.css('input')).nativeElement;
      input.value = 'test search';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(mockSearchService.searchTerm()).toBe('test search');
    });

    it('should show clear button when search term is present', () => {
      mockSearchService.searchTerm.set('something');
      fixture.detectChanges();
      const clearBtn = fixture.debugElement.query(By.css('button[aria-label="Clear"]'));
      expect(clearBtn).toBeTruthy();
    });

    it('should clear search term when clear button is clicked', () => {
      mockSearchService.searchTerm.set('something');
      fixture.detectChanges();
      const clearBtn = fixture.debugElement.query(By.css('button[aria-label="Clear"]'));
      clearBtn.triggerEventHandler('click', null);
      expect(mockSearchService.searchTerm()).toBe('');
    });

    it('should not show clear button when search term is empty', () => {
      mockSearchService.searchTerm.set('');
      fixture.detectChanges();
      const clearBtn = fixture.debugElement.query(By.css('button[aria-label="Clear"]'));
      expect(clearBtn).toBeFalsy();
    });
  });

  describe('Structural Components', () => {
    it('should have a toolbar', () => {
      expect(fixture.debugElement.query(By.css('mat-toolbar'))).toBeTruthy();
    });

    it('should have a sidenav container', () => {
      expect(fixture.debugElement.query(By.css('mat-sidenav-container'))).toBeTruthy();
    });

    it('should have a sidebar component', () => {
      expect(fixture.debugElement.query(By.css('app-sidebar'))).toBeTruthy();
    });

    it('should have a router-outlet', () => {
      expect(fixture.debugElement.query(By.css('router-outlet'))).toBeTruthy();
    });
  });
});
