import { HttpInterceptorFn, HttpResponse, HttpRequest } from '@angular/common/http';
import { of, throwError, Observable } from 'rxjs';
import { delay, dematerialize, materialize } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { Statistic } from '../models/statistic.model';
import defaultDb from '../../../../db.json';

const STORAGE_KEY = 'task_manager_db';

// Initialize LocalStorage with db.json if it doesn't exist
function initDb() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDb));
  }
}

function getDb(): { tasks: Task[], statistics: Statistic[] } {
  const dbStr = localStorage.getItem(STORAGE_KEY);
  return dbStr ? JSON.parse(dbStr) : { tasks: [], statistics: [] };
}

function saveDb(db: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  initDb();
  const db = getDb();
  
  // Only intercept requests directed at the mock API
  if (!req.url.includes('/tasks') && !req.url.includes('/statistics')) {
    return next(req);
  }

  return of(null).pipe(
    materialize(),
    delay(500), // Simulate network latency
    dematerialize(),
    (source) => {
      return new Observable<any>((observer: any) => {
        const idMatcher = req.url.match(/\/tasks\/(.*)/);
        const id = idMatcher ? idMatcher[1] : null;

        // --- GET /statistics ---
        if (req.url.endsWith('/statistics') && req.method === 'GET') {
          observer.next(new HttpResponse({ status: 200, body: db.statistics }));
          observer.complete();
          return;
        }

        // --- GET /tasks ---
        if (req.url.endsWith('/tasks') && req.method === 'GET') {
          observer.next(new HttpResponse({ status: 200, body: db.tasks }));
          observer.complete();
          return;
        }

        // --- POST /tasks ---
        if (req.url.endsWith('/tasks') && req.method === 'POST') {
          const newTask = req.body as Task;
          const taskObj = {
            ...newTask,
            id: `task-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          db.tasks.push(taskObj);
          saveDb(db);
          
          observer.next(new HttpResponse({ status: 201, body: taskObj }));
          observer.complete();
          return;
        }

        // --- PATCH /tasks/:id ---
        if (req.url.includes('/tasks/') && req.method === 'PATCH' && id) {
          const taskIndex = db.tasks.findIndex(t => t.id === id);
          if (taskIndex > -1) {
            db.tasks[taskIndex] = { ...db.tasks[taskIndex], ...(req.body as any) };
            saveDb(db);
            observer.next(new HttpResponse({ status: 200, body: db.tasks[taskIndex] }));
          } else {
            observer.error({ status: 404, error: { message: 'Task not found' } });
          }
          observer.complete();
          return;
        }

        // --- DELETE /tasks/:id ---
        if (req.url.includes('/tasks/') && req.method === 'DELETE' && id) {
          const taskIndex = db.tasks.findIndex(t => t.id === id);
          if (taskIndex > -1) {
            db.tasks.splice(taskIndex, 1);
            saveDb(db);
            observer.next(new HttpResponse({ status: 200, body: {} }));
          } else {
            observer.error({ status: 404, error: { message: 'Task not found' } });
          }
          observer.complete();
          return;
        }

        // Pass through unmatched requests
        source.subscribe(observer);
      });
    }
  );
};
