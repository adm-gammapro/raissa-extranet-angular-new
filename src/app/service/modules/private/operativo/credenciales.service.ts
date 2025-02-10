import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { CredencialesResponse } from '../../../../apis/model/module/private/operativo/credenciales/response/credenciales-response';
import { CredencialesRequest } from '../../../../apis/model/module/private/operativo/credenciales/request/credenciales-request';

@Injectable({
  providedIn: 'root'
})
export class CredencialesService {
  private readonly urlCredenciales = environment.url.base + '/credenciales';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getCredenciales(page: number,
    estadoRegistro: string,
    referencia: string,
    proveedor: string,
    size: number,
    codigoCliente: number): Observable<any> {

    const params = [
      `page=${page}`,
      `estadoRegistro=${estadoRegistro}`,
      `referencia=${referencia}`,
      `proveedor=${proveedor}`,
      `size=${size}`,
      `codigoCliente=${codigoCliente}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlCredenciales}/list-credenciales-page?${params}`;

    return this.http.get(url).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(credencial: CredencialesRequest): Observable<CredencialesResponse> {
    const url = `${this.urlCredenciales}/create-credencial`;

    return this.http.put<any>(url, credencial).pipe(
      map((response: any) => response as CredencialesResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(credencial: CredencialesRequest): Observable<CredencialesResponse> {
    const url = `${this.urlCredenciales}/update-credencial`;

    return this.http.put<any>(url, credencial).pipe(
      map((response: any) => response as CredencialesResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(codigo: number,
          codigoCliente: number): Observable<CredencialesResponse> {
    let credencial: CredencialesRequest = new CredencialesRequest();
      credencial.codigo = codigo;
      credencial.codigoCliente = codigoCliente;

    const url = `${this.urlCredenciales}/delete-credencial`;

    return this.http.post<any>(url, credencial).pipe(
      map((response: any) => response as CredencialesResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getCredencial(codigo: number,
                codigoCliente: number): Observable<CredencialesResponse> {
    let credencial: CredencialesRequest = new CredencialesRequest();
      credencial.codigo = codigo;
      credencial.codigoCliente = codigoCliente;

    const url = `${this.urlCredenciales}/get-credencial`;

    return this.http.post<any>(url, credencial).pipe(
      map((response: any) => response as CredencialesResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getCredencialesPorEmpresa(codigoCliente: number) {
    const params = [
      `codigoCliente=${codigoCliente}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlCredenciales}/list-credenciales-cliente?${params}`;

    return this.http.get(url).pipe(
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
