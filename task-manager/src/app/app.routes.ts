import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/app-layout/app-layout').then(m => m.AppLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'analytics',
        loadComponent: () => import('./dashboard/components/task-analytics/task-analytics').then(m => m.TaskAnalytics)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
