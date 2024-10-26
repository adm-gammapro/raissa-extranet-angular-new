import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '../../../authorization/auth.service';
import { MenuItem } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private menuItems: MenuItem[] | null = null;
  private url : string = environment.url.base + '/seguridad';

  constructor(private http: HttpClient,
              private authService: AuthService) { }

  getMenuUsuarios(user: string, idEmpresa: string):  Observable<any> {

    const params = [
      `usuario=${user}`,
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.url}/listarOpcionesUsuario?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
          this.authService.isNoAutorizado(e);
          return throwError(() => e);
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
