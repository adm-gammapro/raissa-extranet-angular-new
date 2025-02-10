import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from '../../service/authorization/token.service';

export const resourceInterceptor: HttpInterceptorFn = (request: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const tokenService = inject(TokenService);
 
  if (request.url.includes(environment.url.base)) {
    if (tokenService.isLogged()) {
      const token: string | null = tokenService.getAccessToken();
      let headersConfig = {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      };
      request = request.clone({ setHeaders: headersConfig }); 
    } else {
        router.navigateByUrl("/content-web");
    }
  }

  return next(request);
};