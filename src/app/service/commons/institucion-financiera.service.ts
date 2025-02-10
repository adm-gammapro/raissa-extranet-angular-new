import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../authorization/auth.service';
import { InstitucionFinancieraResponse } from '../../apis/model/module/private/commons/institucion-financiera-response';

@Injectable({
  providedIn: 'root'
})
export class InstitucionFinancieraService {
  private readonly urlGeneral: string = environment.url.base + '/extranet/general';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getAllBancos(codigoCliente: number): Observable<InstitucionFinancieraResponse[]> {
    const params = [
      `codigoCliente=${codigoCliente}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlGeneral}/list-institucion-financiera-empresa?${params}`;

    return this.http.get<InstitucionFinancieraResponse[]>(url).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}
