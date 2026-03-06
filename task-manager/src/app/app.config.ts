import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideHttpClient, withInterceptors, HttpInterceptorFn } from '@angular/common/http';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { mockBackendInterceptor } from './core/interceptors/mock-backend.interceptor';
import { environment } from '../environments/environment';

import { routes } from './app.routes';

const interceptors: HttpInterceptorFn[] = [errorInterceptor];
if (environment.useMockBackend) {
  interceptors.unshift(mockBackendInterceptor); // Mock must respond before error interceptor catches it as a real HTTP attempt
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideNativeDateAdapter(),
    provideCharts(withDefaultRegisterables()),
    provideHttpClient(withInterceptors(interceptors))
  ]
};
