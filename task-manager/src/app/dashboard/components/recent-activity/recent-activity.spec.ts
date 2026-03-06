import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecentActivity } from './recent-activity';
import { By } from '@angular/platform-browser';

describe('RecentActivity', () => {
  let component: RecentActivity;
  let fixture: ComponentFixture<RecentActivity>;

  const mockTasks: any[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Desc 1',
      status: 'todo',
      priority: 'low',
      dueDate: '2024-03-10',
      isOverdue: false,
      completedAt: null,
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2024-03-01T10:00:00Z',
      assignee: { id: 'u1', name: 'Alice', avatar: 'A', email: 'alice@example.com' },
      tags: []
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Desc 2',
      status: 'in_progress',
      priority: 'medium',
      dueDate: '2024-03-11',
      isOverdue: false,
      completedAt: null,
      createdAt: '2024-03-01T09:00:00Z',
      updatedAt: '2024-03-01T11:00:00Z',
      assignee: { id: 'u2', name: 'Bob', avatar: 'B', email: 'bob@example.com' },
      tags: []
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentActivity]
    }).compileComponents();

    fixture = TestBed.createComponent(RecentActivity);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('tasks', []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should sort activities by updatedAt descending', () => {
    fixture.componentRef.setInput('tasks', mockTasks);
    fixture.detectChanges();

    const activities = component.recentActivities();
    expect(activities[0].id).toBe('2'); // Updated latest
    expect(activities[1].id).toBe('1');
  });

  it('should identify "created" vs "updated" actions', () => {
    fixture.componentRef.setInput('tasks', mockTasks);
    fixture.detectChanges();

    const activities = component.recentActivities();
    const task2Activity = activities.find(a => a.id === '2');
    const task1Activity = activities.find(a => a.id === '1');

    expect(task2Activity?.action).toBe('updated the task');
    expect(task1Activity?.action).toBe('created the task');
  });

  it('should handle missing assignee', () => {
    const taskWithoutAssignee: any = {
      ...mockTasks[0],
      id: '3',
      assignee: null
    };
    fixture.componentRef.setInput('tasks', [taskWithoutAssignee]);
    fixture.detectChanges();

    const activities = component.recentActivities();
    expect(activities[0].assigneeName).toBe('Unknown User');
    expect(activities[0].assigneeAvatar).toBe('');
  });

  it('should limit to top 10 activities', () => {
    const manyTasks: any[] = Array.from({ length: 15 }, (_, i) => ({
      ...mockTasks[0],
      id: `${i}`,
      updatedAt: new Date(2024, 0, i + 1).toISOString()
    }));

    fixture.componentRef.setInput('tasks', manyTasks);
    fixture.detectChanges();

    expect(component.recentActivities().length).toBe(10);
    expect(component.recentActivities()[0].id).toBe('14'); // Latest day
  });

  it('should render activities in the template', () => {
    fixture.componentRef.setInput('tasks', mockTasks);
    fixture.detectChanges();

    const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(listItems.length).toBe(2);

    const firstItemText = listItems[0].nativeElement.textContent;
    expect(firstItemText).toContain('Bob');
    expect(firstItemText).toContain('updated the task');
    expect(firstItemText).toContain('Task 2');
  });
});
