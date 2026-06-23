import {Injectable} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, map, Observable, throwError} from 'rxjs';
import {
  TarifarioDashboardResponse
} from '../../../../apis/model/module/private/administrativo/tarifario/response/tarifario-dashboard-response';
import {AuthService} from '../../../authorization/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TarifarioService {
  private readonly urlTarifario = `${environment.url.base}/api/tarifario`;

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) {}

  /**
   * Obtener dashboard del tarifario por ID de cliente
   */
  obtenerDashboard(clienteId: number): Observable<TarifarioDashboardResponse> {
    return this.http.get<TarifarioDashboardResponse>(
      `${this.urlTarifario}/dashboard/${clienteId}`
    ).pipe(
      map((response: any) => response),
      catchError(err => this.handleError(err))
    );
  }

  private handleError(err: any): Observable<never> {
    this.authService.isNoAutorizado(err);
    return throwError(() => err);
  }
}
