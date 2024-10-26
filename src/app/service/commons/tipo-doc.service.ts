import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '../authorization/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TipoDocService {
  private url:string = environment.url.base + '/extranet/general';

  constructor(private http: HttpClient, 
              private authService: AuthService) { }

  getAllTipoDocumentos():  Observable<any> {
    const params = [
      `estadoRegistro=S`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.url}/listarTipoDocumento?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {          
        return response.body;
      }),
      catchError(e => {
          this.authService.isNoAutorizado(e);
          return throwError(() => e);
      })
    );
  }
}
