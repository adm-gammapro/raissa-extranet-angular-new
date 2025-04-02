import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    console.log('Datos enviados:', search);
  
    return this.http.post(url, search, { headers, responseType: 'blob' }).pipe(
      map((response: Blob) => response),
      catchError(e => {
        if (e.error instanceof Blob) {
          e.error.text().then((text: string) => {
            console.error('Error detallado:', text);
          });
        }

        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}
