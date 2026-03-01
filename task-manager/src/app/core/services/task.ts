import { Injectable } from '@angular/core';
import { httpResource, HttpResponse } from '@angular/common/http';
import { Task } from '../models/task.model';
import { Statistic, StatisticsResponse } from '../models/statistic.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:3000';

  // Using the new experimental HttpResource API available in Angular 19+
  tasksResource = httpResource<Task[]>(
    () => `${this.apiUrl}/tasks`,
    {
      parse: (response: any) => {
        return response.data;
      }
    }
  );
  statisticsResource = httpResource<StatisticsResponse>(
    () => `${this.apiUrl}/statistics`
  );
}
