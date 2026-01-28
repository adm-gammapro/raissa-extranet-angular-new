import {inject} from '@angular/core';
import {environment} from '../../../environments/environment';
import {TokenService} from '../../service/authorization/token.service';
import {HttpInterceptorFn} from '@angular/common/http';

export const resourceInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  if (req.url.startsWith(environment.url.base)) {
    const token = tokenService.getAccessToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
  }

  return next(req);
};
