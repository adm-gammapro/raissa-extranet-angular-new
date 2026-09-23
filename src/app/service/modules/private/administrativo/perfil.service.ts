import {Injectable} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../../../authorization/auth.service';
import {catchError, map, Observable, throwError} from 'rxjs';
import {PerfilSearch} from '../../../../apis/model/module/private/administrativo/perfil/request/perfil-search';
import {PerfilResponse} from '../../../../apis/model/module/private/administrativo/perfil/response/perfil-response';
import {PerfilRequest} from '../../../../apis/model/module/private/administrativo/perfil/request/perfil-request';
import {
  PerfilOpcionRequest
} from '../../../../apis/model/module/private/administrativo/perfil/request/perfil-opcion-request';
import {
  PerfilSearchResponse
} from '../../../../apis/model/module/private/administrativo/perfil/response/perfil-search-response';

@Injectable({
  providedIn: 'root'
})
export class PerfilService {
  private readonly urlPerfil: string = environment.url.base + '/perfil';

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) {
  }

  private handleError(err: any): Observable<never> {
    this.authService.isNoAutorizado(err);
    return throwError(() => err);
  }

  /**
   * Registrar un nuevo perfil
   */
  registrarPerfil(request: PerfilRequest): Observable<PerfilResponse> {
    return this.http.post<PerfilResponse>(
      `${this.urlPerfil}/registrar-perfil`,
      request
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Actualizar un perfil existente
   */
  actualizarPerfil(request: PerfilRequest): Observable<PerfilResponse> {
    return this.http.post<PerfilResponse>(
      `${this.urlPerfil}/actualizar-perfil`,
      request
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Eliminar (dar de baja) un perfil por código
   */
  eliminarPerfil(codigo: number): Observable<PerfilResponse> {
    return this.http.post<PerfilResponse>(
      `${this.urlPerfil}/eliminar-perfil/${codigo}`,
      {}
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Listar perfiles con paginación y filtros
   */
  listarPerfilesPage(search: PerfilSearch): Observable<PerfilSearchResponse> {
    return this.http.post<PerfilSearchResponse>(
      `${this.urlPerfil}/listarPerfil`,
      search
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Obtener un perfil por código
   */
  obtenerPerfil(codigoPerfil?: number): Observable<PerfilResponse> {
    let params: any = {};
    if (codigoPerfil) {
      params.codigoPerfil = codigoPerfil;
    }
    return this.http.get<PerfilResponse>(
      `${this.urlPerfil}/obtenerPerfil`,
      { params }
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
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
}
