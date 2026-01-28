import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {TokenService} from '../../service/authorization/token.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private readonly token: TokenService,
              private readonly router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const logged = this.token.isLogged();
    const url = state.url;
    const publicUrls = ['/login', '/authorized'];

    if (publicUrls.includes(url)) {
      return logged ? this.router.parseUrl('/content') : true;
    }

    if (logged) return true;

    window.location.href = 'http://127.0.0.4:4200';
    return false;
  }
}
