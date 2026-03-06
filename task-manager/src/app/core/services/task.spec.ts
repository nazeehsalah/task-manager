import { TestBed } from '@angular/core/testing';
import { TaskService } from './task';
import { vi } from 'vitest';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
    
    // Mock the reload method on tasksResource
    service.tasksResource = {
      reload: vi.fn()
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchAssignees', () => {
    it('should return matching assignees', async () => {
      const results = await service.searchAssignees('John');
      expect(results.length).toBe(2);
      expect(results[0].name).toBe('John Doe');
      expect(results[1].name).toBe('Mike Johnson');
    });

    it('should return all assignees on empty string', async () => {
      const results = await service.searchAssignees('');
      expect(results.length).toBe(4);
    });

    it('should return empty array if no match', async () => {
      const results = await service.searchAssignees('ZZZ');
      expect(results.length).toBe(0);
    });
  });

  describe('CRUD operations', () => {
    const mockTasksData = {
      meta: { totalCount: 1 },
      data: [
        { id: 'task-1', title: 'Task 1' }
      ]
    };

    beforeEach(() => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any, init?: any) => {
        if (init?.method === 'PUT') {
          return { ok: true } as Response;
        }
        return {
          json: async () => JSON.parse(JSON.stringify(mockTasksData))
        } as Response;
      });
    });

    it('should create a new task', async () => {
      await service.createTask({ title: 'New Task', description: 'Test' });
      
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
      expect(globalThis.fetch).toHaveBeenNthCalledWith(1, 'http://localhost:3000/tasks');
      expect(globalThis.fetch).toHaveBeenNthCalledWith(2, 'http://localhost:3000/tasks', expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"title":"New Task"')
      }));
      expect(service.tasksResource.reload).toHaveBeenCalled();
    });

    it('should update an existing task', async () => {
      await service.updateTask('task-1', { title: 'Updated Title' });

      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
      expect(globalThis.fetch).toHaveBeenNthCalledWith(2, 'http://localhost:3000/tasks', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"title":"Updated Title"')
      }));
      expect(service.tasksResource.reload).toHaveBeenCalled();
    });

    it('should not update if task is not found', async () => {
      await service.updateTask('non-existent-task', { title: 'Updated Title' });

      expect(globalThis.fetch).toHaveBeenCalledTimes(1); // Only the initial GET call
      expect(service.tasksResource.reload).not.toHaveBeenCalled();
    });

    it('should delete an existing task', async () => {
      await service.deleteTask('task-1');

      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
      expect(globalThis.fetch).toHaveBeenNthCalledWith(2, 'http://localhost:3000/tasks', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"data":[]') // Should be empty after filtering out task-1
      }));
      expect(service.tasksResource.reload).toHaveBeenCalled();
    });
  });
});
