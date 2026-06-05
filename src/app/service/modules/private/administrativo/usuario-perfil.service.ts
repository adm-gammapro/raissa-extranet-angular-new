import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {AuthService} from '../../../authorization/auth.service';
import {
  UsuarioPerfilesTransfer
} from '../../../../apis/model/module/private/administrativo/usuario/response/usuario-perfiles-transfer-response';
import {
  TransferirPerfilesRequest
} from '../../../../apis/model/module/private/administrativo/usuario/request/transferir-perfiles-request';

@Injectable({
  providedIn: 'root',
})
export class UsuarioPerfilService {
  private readonly urlUsuarioPerfiles: string = environment.url.base + '/api/usuario-perfiles';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  obtenerPerfilesParaTransferencia(usuarioId: number): Observable<UsuarioPerfilesTransfer> {
    return this.http.get<UsuarioPerfilesTransfer>(
      `${this.urlUsuarioPerfiles}/transfer/${usuarioId}`
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  transferirPerfiles(request: TransferirPerfilesRequest): Observable<void> {
    return this.http.post<void>(
      `${this.urlUsuarioPerfiles}/transferir`,
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
