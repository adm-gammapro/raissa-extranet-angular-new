import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Agrupacion } from '../../../../apis/model/module/private/agrupacion';
import { Cliente } from '../../../../apis/model/module/private/cliente';

@Injectable({
  providedIn: 'root'
})
export class AgrupacionService {
  private urlextranet: string = environment.url.base + '/extranet/agrupacion';
  private urlCliente: string = environment.url.base + '/plataforma/cliente';

  constructor(private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }

  getAgrupaciones(page: number,
    estadoRegistro: string,
    nombreAgrupacion: string,
    cantReg: number,
    idEmpresa: string): Observable<any> {
    const params = [
      `pagina=${page}`,
      `estadoRegistro=${estadoRegistro}`,
      `nombreAgrupacionCliente=${nombreAgrupacion}`,
      `cantReg=${cantReg}`,
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlextranet}/listarAgrupacionPage?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        (response.body.content as Agrupacion[]).map(agrupacion => {
          agrupacion.nombreAgrupacionCliente = agrupacion.nombreAgrupacionCliente?.toUpperCase();
          agrupacion.interfazCuentaProvieneCliente = agrupacion.interfazCuentaProvieneCliente?.toUpperCase();
          agrupacion.razonSocialCliente = agrupacion.razonSocialCliente?.toUpperCase();

          if (agrupacion.estadoRegistro === 'S') {
            agrupacion.estadoRegistro = 'ACTIVO';
          } else {
            agrupacion.estadoRegistro = 'INACTIVO';
          }

          return agrupacion;
        });
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(agrupacion: Agrupacion): Observable<Agrupacion> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlextranet}/registrar-agrupacion`;

    return this.http.put<any>(url, agrupacion, { headers: headers }).pipe(
      map((response: any) => response.body as Agrupacion),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(id: number): Observable<Agrupacion> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlextranet}/eliminar-agrupacion/${id}`;
    return this.http.delete<Agrupacion>(url, { headers: headers }).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    )
  }

  getClientes(): Observable<Cliente[]> {
    const params = [
      `estadoRegistro=S`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlextranet}/listarAllClientes?${params}`;

    return this.http.get<Cliente[]>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getAgrupacion(id: number): Observable<Agrupacion> {
    const params = [
      `codigoAgrupacion=${id}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlextranet}/obtenerAgrupacion?${params}`;

    return this.http.get<Agrupacion>(url, { headers: headers }).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getAllAgrupaciones(idEmpresa: number): Observable<Agrupacion[]> {
    const params = [
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlextranet}/listarAllAgrupacion?${params}`;

    return this.http.get<Agrupacion[]>(url, { headers: headers }).pipe(
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
