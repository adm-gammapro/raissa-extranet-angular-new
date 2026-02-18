import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {catchError, EMPTY, map, Observable, throwError} from 'rxjs';
import { AuthService } from '../../../authorization/auth.service';
import { MenuItem } from 'primeng/api';
import {MenuUsuario} from '../../../../apis/model/module/private/menu-usuario';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItems: MenuItem[] | null = null;
  private readonly url : string = environment.url.base + '/seguridad';

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) { }

  getMenuUsuarios(user: string | null, idEmpresa: string | null):  Observable<MenuUsuario> {

    const params = new HttpParams({ fromObject: {
        ...(user ? { usuario: user } : {}),
        ...(idEmpresa ? { idEmpresa: idEmpresa } : {}),
      }});

    return this.http.get<MenuUsuario>(`${this.url}/listarOpcionesUsuario`, { params }).pipe(
      catchError(err => {
        this.authService.isNoAutorizado(err);
        if (err?.status === 401) {
          return EMPTY;
        }
        return throwError(() => err);
      })
    );
  }

  setMenuItems(items: MenuItem[]): void {
    this.menuItems = items;
    sessionStorage.setItem(environment.session.MENU_ITEMS, JSON.stringify(items));
  }

  getMenuItems(): MenuItem[] | null {
    if (!this.menuItems) {
      const storedItems = sessionStorage.getItem('menuItems');
      this.menuItems = storedItems ? JSON.parse(storedItems) : null;
    }
    return this.menuItems;
  }
}
