import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {AuthService} from '../../../authorization/auth.service';
import {
  UsuarioClientesTransfer
} from '../../../../apis/model/module/private/administrativo/usuario/response/usuario-clientes-transfer-response';
import {
  TransferirClientesRequest
} from '../../../../apis/model/module/private/administrativo/usuario/request/transferir-clientes-request';

@Injectable({
  providedIn: 'root',
})
export class UsuarioClienteService {
  private readonly urlUsuarioClientes: string = environment.url.base + '/api/usuario-clientes';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  obtenerClientesParaTransferencia(usuarioId: number): Observable<UsuarioClientesTransfer> {
    return this.http.get<UsuarioClientesTransfer>(
      `${this.urlUsuarioClientes}/transfer/${usuarioId}`
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  transferirClientes(request: TransferirClientesRequest): Observable<void> {
    return this.http.post<void>(
      `${this.urlUsuarioClientes}/transferir`,
      request
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
