import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Banco } from '../../../../apis/model/module/private/banco';
import { Resumen } from '../../../../apis/model/module/private/resumen';
import { Ejecucion } from '../../../../apis/model/module/private/ejecucion';

@Injectable({
  providedIn: 'root'
})
export class SaldosService {
  private urlGeneral: string = environment.url.base + '/extranet/general';
  private urlEjecucion: string = environment.url.base + '/extranet/ejecucion';

  constructor(private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }

  getAllBancos(idEmpresa: number): Observable<Banco[]> {
    const params = [
      `estadoRegistro=S`,
      `codigoCliente=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlGeneral}/listarInstitucionFinancieraEmpresa?${params}`;

    return this.http.get<Banco[]>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getSaldos(idEmpresa: string): Observable<Resumen> {
    const params = [
      `estadoRegistro=S`,
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlEjecucion}/listarSaldos?${params}`;

    return this.http.get<Resumen>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getSaldosPorCuenta(idEmpresa: string, idBanco: string): Observable<Resumen> {
    const params = [
      `idEmpresa=${idEmpresa}`,
      `idBanco=${idBanco}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlEjecucion}/listarSaldosporCuenta?${params}`;

    return this.http.get<Resumen>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getMovimientos(idCuenta: number, bitacora: number, fechaInicial: string | null, fechaFinal: string | null, tipoMovimiento: string | null, cantReg: number, pagina: number): Observable<any> {
    const params = [
      `idCuenta=${idCuenta}`,
      `bitacora=${bitacora}`,
      `fechaInicial=${fechaInicial}`,
      `fechaFinal=${fechaFinal}`,
      `tipoMovimiento=${tipoMovimiento}`,
      `cantReg=${cantReg}`,
      `pagina=${pagina}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlEjecucion}/listarMovimientosPage?${params}`;

    return this.http.get<any>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  actualizarSaldosMovimientos(codigoCliente: number,
    codigoAgrupacion: number,
    codigoIfi: string,
    numeroCuenta: string,
    fechaInicioMov: string,
    fechaFinMov: string) {
    let ejecucion: Ejecucion = new Ejecucion();
    ejecucion.codigoAgrupacion = codigoAgrupacion;
    ejecucion.codigoCliente = codigoCliente;
    ejecucion.codigoIfi = codigoIfi;
    ejecucion.fechaFinMov = fechaFinMov;
    ejecucion.fechaInicioMov = fechaInicioMov;
    ejecucion.numeroCuenta = numeroCuenta;

    const headers = new HttpHeaders({
    });

    const url = `${this.urlEjecucion}/ejecutarConsultaOnline`;

    return this.http.post<any>(url, ejecucion, { headers: headers }).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  actualizarSaldosMovimientosGeneral(codigoCliente: number,
                                     fechaInicioMov: string,
                                     fechaFinMov: string) {
    let ejecucion: Ejecucion = new Ejecucion();
    ejecucion.codigoCliente = codigoCliente;
    ejecucion.usuarioEjecucionProceso = sessionStorage.getItem(environment.session.USERNAME)!;

    const headers = new HttpHeaders({
    });

    const url = `${this.urlEjecucion}/ejecutarConsultaPosicionGeneralOnline`;

    return this.http.post<any>(url, ejecucion, { headers: headers }).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  actualizarSaldosMovimientosPorBanco(codigoCliente: number,
    codigoIfi: string,
    fechaInicioMov: string,
    fechaFinMov: string) {
    let ejecucion: Ejecucion = new Ejecucion();
    ejecucion.codigoCliente = codigoCliente;
    ejecucion.fechaFinMov = fechaFinMov;
    ejecucion.fechaInicioMov = fechaInicioMov;
    ejecucion.codigoIfi = codigoIfi;

    const headers = new HttpHeaders({
    });

    const url = `${this.urlEjecucion}/ejecutarConsultaPosicionGeneralOnline`;

    return this.http.post<any>(url, ejecucion, { headers: headers }).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}
