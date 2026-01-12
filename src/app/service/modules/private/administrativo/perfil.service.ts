import {Injectable} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../../../authorization/auth.service';
import {Perfil} from '../../../../apis/model/module/private/perfil';
import {catchError, map, Observable, throwError} from 'rxjs';
import {Aplicacion} from '../../../../apis/model/module/private/aplicacion';
import {ModuloRequest} from '../../../../apis/model/module/private/request/modulo-request';
import {buildPageableParams} from '../../../commons/http-request-handler.service';
import {PerfilSearch} from '../../../../apis/model/module/private/administrativo/perfil/request/perfil-search';
import {PerfilResponse} from '../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';
import {PerfilRequest} from '../../../../apis/model/module/private/administrativo/perfil/request/perfil-request';
import {
  PerfilOpcionRequest
} from '../../../../apis/model/module/private/administrativo/perfil/request/perfil-opcion-request';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private readonly urlSeguridad: string = environment.url.base + '/seguridad';
  private readonly urlPerfil: string = environment.url.base + '/perfil';
  private readonly urlPlataforma: string = environment.url.base + '/plataforma/aplicacion';

  constructor(private http: HttpClient,
              private authService: AuthService) {
  }

  getPerfilesPage(page: number,
                  estadoRegistro: string | undefined,
                  nombrePerfil: string | undefined,
                  cantReg: number,
                  idEmpresa: number | undefined): Observable<any> {

    let perfilSearch: PerfilSearch = {
      nombrePerfil: nombrePerfil ?? "",
      estadoRegistro: estadoRegistro ?? "",
      idEmpresa: idEmpresa ?? 0
    };

    const direction: 'ASC' | 'DESC' = 'ASC';
    const pageable = {
      page: page,
      size: cantReg,
      sort: {
        property: "id",
        direction: direction
      }
    };

    const url = `${this.urlPerfil}/listarPerfil`;

    return this.http.post(url, perfilSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  registrar(perfil: PerfilRequest): Observable<PerfilResponse> {
    const headers = new HttpHeaders({});

    let url;
    if (perfil.codigo != null && perfil.codigo > 0) {
      url = `${this.urlPerfil}/actualizar-perfil`;
    } else {
      url = `${this.urlPerfil}/registrar-perfil`;
    }

    return this.http.post<any>(url, perfil, {headers: headers}).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(id: number): Observable<PerfilResponse> {
    const headers = new HttpHeaders({});

    const url = `${this.urlPerfil}/eliminar-perfil/${id}`;

    return this.http.post<any>(url, {headers: headers}).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getPerfil(id: number): Observable<PerfilResponse> {
    const params = [
      `codigoPerfil=${id}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({});

    const url = `${this.urlPerfil}/obtenerPerfil?${params}`;

    return this.http.get<any>(url, {headers: headers}).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getAllPerfiles(): Observable<any> {
    const headers = new HttpHeaders({});

    const url = `${this.urlSeguridad}/listarAllPerfil`;

    return this.http.get(url, {headers: headers}).pipe(
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

    const headers = new HttpHeaders({});

    const url = `${this.urlPerfil}/listarPerfilModulos?${params}`;

    return this.http.get(url, {headers: headers}).pipe(
      map((response: any) => {
        return response;
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

    const headers = new HttpHeaders({});

    const url = `${this.urlSeguridad}/listarPerfilMenus?${params}`;

    return this.http.get(url, {headers: headers}).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  vincularOpcion(moduloRequest: PerfilOpcionRequest): Observable<any> {
    const headers = new HttpHeaders({});

    const url = `${this.urlPerfil}/vincular-opcion-perfil`;

    return this.http.post<any>(url, moduloRequest, {headers: headers}).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  desvincularOpcion(moduloRequest: PerfilOpcionRequest): Observable<any> {
    const headers = new HttpHeaders({});

    const url = `${this.urlPerfil}/desvincular-opcion-perfil`;

    return this.http.post<any>(url, moduloRequest, {headers: headers}).pipe(
      map((response: any) => response),
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

    const headers = new HttpHeaders({});

    const url = `${this.urlSeguridad}/listarAllPerfiles?${params}`;

    return this.http.get(url, {headers: headers}).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getPerfilesEmpresa(idUsuario: number, idEmpresa: number): Observable<Perfil[]> {
    const params = [
      `idUsuario=${idUsuario}`,
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({});

    const url = `${this.urlSeguridad}/list-perfiles-empresa?${params}`;

    return this.http.get(url, {headers: headers}).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}
