import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {
  PerfilOpcionesTransfer
} from '../../../../apis/model/module/private/administrativo/perfil/response/perfil-opciones-transfer-response';
import {
  TransferirOpcionesRequest
} from '../../../../apis/model/module/private/administrativo/perfil/request/transferir-opciones-request';
import {AuthService} from '../../../authorization/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PerfilOpcionService {
  private readonly urlPerfilOpciones: string = environment.url.base + '/api/perfil-opciones';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  obtenerOpcionesParaTransferencia(perfilId: number): Observable<PerfilOpcionesTransfer> {
    return this.http.get<PerfilOpcionesTransfer>(
      `${this.urlPerfilOpciones}/transfer/${perfilId}`
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  transferirOpciones(request: TransferirOpcionesRequest): Observable<void> {
    return this.http.post<void>(
      `${this.urlPerfilOpciones}/transferir`,
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
