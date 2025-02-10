import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../authorization/auth.service';
import { SaldosCuentaSearch } from '../../../../apis/model/module/private/operativo/reportes/request/saldos-cuenta-search';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly urlReportes: string = environment.url.base + '/reportes';

  constructor(private readonly  http: HttpClient,
              private readonly  authService: AuthService) { }

  descargarReporteSaldosMovimientos(search: SaldosCuentaSearch): Observable<Blob> {
    const url = `${this.urlReportes}/descargar-saldos-movimientos`;
  
    return this.http.post(url, search, { responseType: 'blob' }).pipe(
      map((response: Blob) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}
