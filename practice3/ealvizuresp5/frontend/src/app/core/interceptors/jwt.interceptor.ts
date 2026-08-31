import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  const apiBase = environment.apiUrl.replace(/\/$/, '');
  const isApiRequest = req.url === apiBase || req.url.startsWith(`${apiBase}/`);

  return next(isApiRequest && token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req);
};
