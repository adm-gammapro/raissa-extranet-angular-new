import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {
  ConfiguracionUsuario,
  OpcionesConfiguracion
} from '../../../../apis/model/module/private/administrativo/usuario/response/configuracion-usuario-response';
import {AuthService} from '../../../authorization/auth.service';
import {
  ConfiguracionUsuarioRequest
} from '../../../../apis/model/module/private/administrativo/usuario/request/configuracion-request';

@Injectable({
  providedIn: 'root',
})
export class ConfiguracionUsuarioService {
  private readonly urlBase: string = environment.url.base + '/api/configuracion-usuario';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  obtenerOpcionesConfiguracion(usuarioId: number): Observable<OpcionesConfiguracion> {
    return this.http.get<OpcionesConfiguracion>(
      `${this.urlBase}/opciones/${usuarioId}`
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  listarConfiguracionesPorUsuario(usuarioId: number): Observable<ConfiguracionUsuario[]> {
    return this.http.get<ConfiguracionUsuario[]>(
      `${this.urlBase}/listar/${usuarioId}`
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  guardarConfiguracion(request: ConfiguracionUsuarioRequest): Observable<ConfiguracionUsuario> {
    return this.http.post<ConfiguracionUsuario>(
      `${this.urlBase}/guardar`,
      request
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  eliminarConfiguracion(configuracionId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.urlBase}/eliminar/${configuracionId}`
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  private handleError(err: any) {
    this.authService.isNoAutorizado(err);
    if (err?.status === 401) {
      return throwError(() => new Error('Unauthorized'));
    }
    return throwError(() => err);
  }
}
