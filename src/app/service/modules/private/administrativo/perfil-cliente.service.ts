import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {
  PerfilClientesTransfer
} from '../../../../apis/model/module/private/administrativo/perfil/response/perfil-clientes-transfer-response';
import {
  TransferirClientesPerfilRequest
} from '../../../../apis/model/module/private/administrativo/perfil/request/transferir-clientes-request';
import {AuthService} from '../../../authorization/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PerfilClienteService {
  private readonly urlPerfilClientes: string = environment.url.base + '/api/perfil-clientes';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  obtenerClientesParaTransferencia(perfilId: number): Observable<PerfilClientesTransfer> {
    console.log('obtenerClientesParaTransferencia', perfilId);
    return this.http.get<PerfilClientesTransfer>(
      `${this.urlPerfilClientes}/transfer/${perfilId}`
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  transferirClientes(request: TransferirClientesPerfilRequest): Observable<void> {
    console.log('transferirClientes', request);
    return this.http.post<void>(
      `${this.urlPerfilClientes}/transferir`,
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
