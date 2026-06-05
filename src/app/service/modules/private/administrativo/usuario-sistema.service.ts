import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {AuthService} from '../../../authorization/auth.service';
import {
  UsuarioSistemasTransfer
} from '../../../../apis/model/module/private/administrativo/usuario/response/usuario-sistemas-transfer-response';
import {
  TransferirSistemasRequest
} from '../../../../apis/model/module/private/administrativo/usuario/request/transferir-sistemas-request';

@Injectable({
  providedIn: 'root',
})
export class UsuarioSistemaService {
  private readonly urlUsuarioSistemas: string = environment.url.base + '/api/usuario-sistemas';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  /**
   * Obtener sistemas para transferencia (disponibles y asignados)
   */
  obtenerSistemasParaTransferencia(usuarioId: number): Observable<UsuarioSistemasTransfer> {
    return this.http.get<UsuarioSistemasTransfer>(
      `${this.urlUsuarioSistemas}/transfer/${usuarioId}`
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Transferir sistemas (asignar y/o desasignar)
   */
  transferirSistemas(request: TransferirSistemasRequest): Observable<void> {
    return this.http.post<void>(
      `${this.urlUsuarioSistemas}/transferir`,
      request
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  // Manejo de errores común
  private handleError(err: any) {
    this.authService.isNoAutorizado(err);
    if (err?.status === 401) {
      return throwError(() => new Error('Unauthorized'));
    }
    return throwError(() => err);
  }
}
