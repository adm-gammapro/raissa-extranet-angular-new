import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Resumen } from '../../../../apis/model/module/private/resumen';
import { Ejecucion } from '../../../../apis/model/module/private/ejecucion';
import { EjecucionRequest } from '../../../../apis/model/module/private/operativo/saldos/request/ejecucion-request';

@Injectable({
  providedIn: 'root'
})
export class SaldosService {
  private readonly urlEjecucion: string = environment.url.base + '/extranet/ejecucion';
  private readonly urlSaldos: string = environment.url.base + '/saldos';

  constructor(private readonly  http: HttpClient,
              private readonly  authService: AuthService) { }

  getSaldos(idEmpresa: number): Observable<Resumen> {
    const params = [
      `estadoRegistro=S`,
      `codigoCliente=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSaldos}/list-saldos?${params}`;

    return this.http.get<Resumen>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getSaldosPorCuenta(idEmpresa: string, idBanco: string): Observable<Resumen> {
    const params = [
      `codigoCliente=${idEmpresa}`,
      `idBanco=${idBanco}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlSaldos}/list-saldos-por-cuenta?${params}`;

    return this.http.get<Resumen>(url).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getMovimientos(codigoCliente: number, 
                idCuenta: number, 
                fechaInicial: string | null, 
                fechaFinal: string | null, 
                tipoMovimiento: string | null, 
                cantReg: number, pagina: number): Observable<any> {
    const params = [
      `codigoCliente=${codigoCliente}`,
      `idCuenta=${idCuenta}`,
      `fechaInicial=${fechaInicial}`,
      `fechaFinal=${fechaFinal}`,
      `tipoMovimiento=${tipoMovimiento}`,
      `cantReg=${cantReg}`,
      `pagina=${pagina}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlSaldos}/list-movimientos-page?${params}`;

    return this.http.get<any>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  actualizarSaldosMovimientos(codigoCliente: number,
                              codigoCuenta: number) {

      let ejecucionRequest: EjecucionRequest = new EjecucionRequest();
      ejecucionRequest.codigoCliente = codigoCliente;
      ejecucionRequest.codigoCuenta = codigoCuenta;
      ejecucionRequest.valorToken = "";

    const url = `${this.urlEjecucion}/ejecutarConsultaPosicionGeneralOnline`;

    return this.http.post<any>(url, ejecucionRequest).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  actualizarSaldosMovimientosGeneral(codigoCliente: number) {
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
    codigoIfi: string) {
    let ejecucion: Ejecucion = new Ejecucion();
    ejecucion.codigoCliente = codigoCliente;
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
