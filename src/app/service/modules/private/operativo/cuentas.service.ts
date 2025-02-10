import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Cuentas } from '../../../../apis/model/module/private/cuentas';
import { Frecuencia } from '../../../../apis/model/module/private/frecuencia';
import { CuentaRequest } from '../../../../apis/model/module/private/operativo/cuenta/request/cuenta-request';
import { FrecuenciaActualizacionResponse } from '../../../../apis/model/module/private/commons/frecuencia-actualizacion-response';
import { CuentaResponse } from '../../../../apis/model/module/private/operativo/cuenta/response/cuenta-response';
import { CuentaCredencialRequest } from '../../../../apis/model/module/private/operativo/cuenta/request/cuenta-credencial-request';
import { CuentaCredencialResponse } from '../../../../apis/model/module/private/operativo/cuenta/response/cuenta-credencial-response';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {
  //private urlCore: string = environment.url.base + '/core';
  private readonly urlPlataforma: string = environment.url.base + '/extranet/general';
  private readonly urlCuenta: string = environment.url.base + '/cuenta';
  private readonly urlCuentaCredencial: string = environment.url.base + '/cuenta-credencial';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getCuentas(page: number,
            estadoRegistro: string | undefined,
            numeroCuenta: string | undefined,
            cantReg: number,
            codigoCliente: number,
            idBanco: string | undefined,
            idAgrupacion: number | null): Observable<any> {

    const params = [
      `page=${page}`,
      `estadoRegistro=${estadoRegistro}`,
      `numeroCuenta=${numeroCuenta}`,
      `size=${cantReg}`,
      `codigoCliente=${codigoCliente}`,
      `idBanco=${idBanco}`,
      idAgrupacion !== null && idAgrupacion !== undefined ? `idAgrupacion=${idAgrupacion}` : null,
    ].filter(param => param !== null).join('&');

    const url = `${this.urlCuenta}/list-page-cuenta?${params}`;

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

  create(cuentas: CuentaRequest): Observable<CuentaResponse> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlCuenta}/create-cuenta`;

    return this.http.put<any>(url, cuentas, { headers: headers }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(cuentas: CuentaRequest): Observable<CuentaResponse> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlCuenta}/update-cuenta`;

    return this.http.put<any>(url, cuentas, { headers: headers }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(id: number,
    codigoCliente: number): Observable<Cuentas> {

    let cuenta: CuentaRequest = new CuentaRequest();
    cuenta.codigo = id;
    cuenta.codigoCliente = codigoCliente;

    const url = `${this.urlCuenta}/delete-cuenta`;

    return this.http.post<any>(url, cuenta).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getInstitucionesFinancieras(): Observable<Cuentas[]> {
    const params = [
      `estadoRegistro=S`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataforma}/listarInstitucionFinanciera?${params}`;

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

  /*getPerfil(id: number): Observable<Cuentas> {
    const params = [
      `codigoCuenta=${id}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlCore}/obtenerCuenta?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }*/

  getFrecuencias(): Observable<FrecuenciaActualizacionResponse[]> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataforma}/list-frecuencias`;

    return this.http.get<Frecuencia[]>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getCuenta(codigo: number,
            codigoCliente: number): Observable<any> {
    let cuenta: CuentaRequest = new CuentaRequest();
    cuenta.codigo = codigo;
    cuenta.codigoCliente = codigoCliente;

    const url = `${this.urlCuenta}/get-cuenta`;

    return this.http.post<any>(url, cuenta).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getCredencialesCuenta(codigoCuenta: number, codigoCliente: number) {
    let cuentaCredencial: CuentaCredencialRequest = new CuentaCredencialRequest();
    cuentaCredencial.codigoCuenta = codigoCuenta;
    cuentaCredencial.codigoCliente = codigoCliente;

    const url = `${this.urlCuentaCredencial}/get-cuentas-credenciales`;

    return this.http.post<any>(url, cuentaCredencial).pipe(
      map((response: any) => response as CuentaCredencialResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  registrarVinculoCuentaCredencial(cuentaCredencial: CuentaCredencialRequest) {

    const url = `${this.urlCuentaCredencial}/registrar-cuenta-credencial`;

    return this.http.post<any>(url, cuentaCredencial).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}
