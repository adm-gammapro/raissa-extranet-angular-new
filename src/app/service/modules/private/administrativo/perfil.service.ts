import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../authorization/auth.service';
import { Perfil } from '../../../../apis/model/module/private/perfil';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Aplicacion } from '../../../../apis/model/module/private/aplicacion';
import { ModuloRequest } from '../../../../apis/model/module/private/request/modulo-request';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private urlSeguridad: string = environment.url.base + '/seguridad';
  private urlPlataforma: string = environment.url.base + '/plataforma/aplicacion';

  constructor(private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }

  getPerfiles(page: number,
    estadoRegistro: string,
    nombrePerfil: string,
    cantReg: number,
    idEmpresa: string): Observable<any> {

    const params = [
      `pagina=${page}`,
      `estadoRegistro=${estadoRegistro}`,
      `nombrePerfil=${nombrePerfil}`,
      `cantReg=${cantReg}`,
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/listarPerfil?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        (response.body.content as Perfil[]).map(perfil => {
          perfil.descripcion = perfil.descripcion.toUpperCase();
          perfil.abreviatura = perfil.abreviatura.toUpperCase();
          perfil.nombreComercial = perfil.nombreComercial.toUpperCase();
          perfil.abreviatura = perfil.abreviatura.toUpperCase();
          if (perfil.estadoRegistro === 'S') {
            perfil.estadoRegistro = 'ACTIVO';
          } else {
            perfil.estadoRegistro = 'INACTIVO';
          }

          return perfil;
        });
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(perfil: Perfil): Observable<Perfil> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/registrar-perfil`;

    return this.http.put<any>(url, perfil, { headers: headers }).pipe(
      map((response: any) => response.body as Perfil),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(id: number): Observable<Perfil> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/eliminar-perfil/${id}`;

    return this.http.delete<Perfil>(url, { headers: headers }).pipe(
      map((response: any) => response.body as Perfil),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getAplicaciones(): Observable<Aplicacion[]> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataforma}/listarAllAplicaciones`;

    return this.http.get<Aplicacion[]>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getPerfil(id: number): Observable<Perfil> {
    const params = [
      `codigoPerfil=${id}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/obtenerPerfil?${params}`;

    return this.http.get<Perfil>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getAllPerfiles(): Observable<any> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/listarAllPerfil`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        (response.body.content as Perfil[]).map(perfil => {
          perfil.descripcion = perfil.descripcion.toUpperCase();
          perfil.abreviatura = perfil.abreviatura.toUpperCase();
          perfil.nombreComercial = perfil.nombreComercial.toUpperCase();
          perfil.abreviatura = perfil.abreviatura.toUpperCase();
          if (perfil.estadoRegistro === 'S') {
            perfil.estadoRegistro = 'ACTIVO';
          } else {
            perfil.estadoRegistro = 'INACTIVO';
          }

          return perfil;
        });
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getPerfilModulos(idPerfil: number): Observable<any> {
    const params = [
      `idPerfil=${idPerfil}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataforma}/listarPerfilModulos?${params}`;

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

  getPerfilMenus(idPerfil: number): Observable<any> {
    const params = [
      `idPerfil=${idPerfil}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/listarPerfilMenus?${params}`;

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

  vincularOpcion(moduloRequest: ModuloRequest): Observable<any> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/vincular-opcion-perfil`;

    return this.http.put<any>(url, moduloRequest, { headers: headers }).pipe(
      map((response: any) => response.body as Perfil),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  desvincularOpcion(moduloRequest: ModuloRequest): Observable<any> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/desvincular-opcion-perfil`;

    return this.http.put<any>(url, moduloRequest, { headers: headers }).pipe(
      map((response: any) => response.body as Perfil),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getPerfilesEstadoRegistro(idEmpresa: string, idUsuario: string): Observable<any> {
    const params = [
      `estadoRegistro=S`,
      `idEmpresa=${idEmpresa}`,
      `idUsuario=${idUsuario}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/listarAllPerfiles?${params}`;

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

  getPerfilesEmpresa(idEmpresa: number): Observable<Perfil[]> {
    const params = [
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSeguridad}/listarPerfilesEmpresa?${params}`;

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
}
