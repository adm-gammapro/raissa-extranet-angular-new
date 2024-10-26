import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Cuentas } from '../../../../apis/model/module/private/cuentas';
import { Frecuencia } from '../../../../apis/model/module/private/frecuencia';
import { CredencialesCuentas } from '../../../../apis/model/module/private/credenciales-cuentas';

@Injectable({
  providedIn: 'root'
})
export class CuentasService {
  private urlCore: string = environment.url.base + '/core';
  private urlPlataforma: string = environment.url.base + '/extranet/general';
  private urlCuenta: string = environment.url.base + '/extranet/cuenta';
  private urlCuentaCredencial: string = environment.url.base + '/extranet/cuentaCredencial';

  constructor(private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }

  getCuentas(page: number,
    estadoRegistro: string,
    numeroCuenta: string,
    cantReg: number,
    idEmpresa: string,
    idBanco: string,
    idAgrupacion: number | null): Observable<any> {

    const params = [
      `pagina=${page}`,
      `estadoRegistro=${estadoRegistro}`,
      `numeroCuenta=${numeroCuenta}`,
      `cantReg=${cantReg}`,
      `idEmpresa=${idEmpresa}`,
      `idBanco=${idBanco}`,
      `idAgrupacion=${idAgrupacion}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlCuenta}/listarCuentaPage?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        (response.body.content as Cuentas[]).map(cuentas => {
          cuentas.interfazCuentaProvieneCliente = cuentas.interfazCuentaProvieneCliente?.toUpperCase();
          cuentas.nombreInstitucionFinanciera = cuentas.nombreInstitucionFinanciera?.toUpperCase();
          cuentas.codigoFrecuenciaActualizacion = cuentas.codigoFrecuenciaActualizacion?.toUpperCase();
          cuentas.descripcionFrecuenciaActualizacion = cuentas.descripcionFrecuenciaActualizacion?.toUpperCase();
          cuentas.ultimaActualizacion = cuentas.ultimaActualizacion?.toUpperCase();

          if (cuentas.estadoRegistro === 'S') {
            cuentas.estadoRegistro = 'ACTIVO';
          } else {
            cuentas.estadoRegistro = 'INACTIVO';
          }

          return cuentas;
        });
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(cuentas: Cuentas): Observable<Cuentas> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlCuenta}/registrar-cuenta`;

    return this.http.put<any>(url, cuentas, { headers: headers }).pipe(
      map((response: any) => response.body as Cuentas),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(id: number): Observable<Cuentas> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlCuenta}/eliminar-cuenta/${id}`;

    return this.http.delete<Cuentas>(url, { headers: headers }).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    )
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

  getPerfil(id: number): Observable<Cuentas> {
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
  }

  getFrecuencias(): Observable<Frecuencia[]> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlCuenta}/listarFrecuencias`;

    return this.http.get<Frecuencia[]>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getCuenta(id: number): Observable<any> {
    const params = [
      `codigoCuenta=${id}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlCuenta}/obtenerCuenta?${params}`;

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

  getCredencialesCuenta(idCuenta: number, idEmpresa: number) {
    const params = [
      `idCuenta=${idCuenta}`,
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlCuentaCredencial}/getCuentasCredenciales?${params}`;

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

  desVincularCredencial(credencial: CredencialesCuentas) {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlCuentaCredencial}/desvincularCredenciales`;

    return this.http.post<any>(url, credencial, { headers: headers }).pipe(
      map((response: any) => response.body as CredencialesCuentas),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  vincularCredencial(credencial: CredencialesCuentas) {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlCuentaCredencial}/vincularCredenciales`;

    return this.http.post<any>(url, credencial, { headers: headers }).pipe(
      map((response: any) => response.body as CredencialesCuentas),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}
