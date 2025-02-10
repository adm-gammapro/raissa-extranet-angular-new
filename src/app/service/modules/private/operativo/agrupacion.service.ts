import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Agrupacion } from '../../../../apis/model/module/private/agrupacion';
import { Cliente } from '../../../../apis/model/module/private/cliente';
import { AgrupacionRequest } from '../../../../apis/model/module/private/operativo/agrupacion/request/agrupacion-request';
import { AgrupacionResponse } from '../../../../apis/model/module/private/operativo/agrupacion/response/agrupacion-response';

@Injectable({
  providedIn: 'root'
})
export class AgrupacionService {
  private readonly urlextranet: string = environment.url.base + '/agrupacion';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

  getAgrupaciones(page: number,
    estadoRegistro: string,
    nombreAgrupacion: string,
    cantReg: number,
    idEmpresa: string): Observable<any> {
    const params = [
      `page=${page}`,
      `estadoRegistro=${estadoRegistro}`,
      `nombreAgrupacionCliente=${nombreAgrupacion}`,
      `size=${cantReg}`,
      `codigoCliente=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlextranet}/list-page-agrupacion?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(agrupacion: Agrupacion): Observable<Agrupacion> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlextranet}/create-agrupacion`;

    return this.http.put<any>(url, agrupacion, { headers: headers }).pipe(
      map((response: any) => response as Agrupacion),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(agrupacion: Agrupacion): Observable<Agrupacion> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlextranet}/update-agrupacion`;

    return this.http.put<any>(url, agrupacion, { headers: headers }).pipe(
      map((response: any) => response as Agrupacion),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(agrupacion: AgrupacionRequest): Observable<Agrupacion> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlextranet}/delete-agrupacion`;

    return this.http.post<any>(url, agrupacion, { headers: headers }).pipe(
      map((response: any) => response as Agrupacion),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
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

  getAgrupacion(codigoAgrupacion: number,
                codigoCliente: number): Observable<Agrupacion> {

    let agrupacion: AgrupacionRequest = {
      codigo: codigoAgrupacion,
      codigoCliente: codigoCliente,
      interfazCuentaProvieneCliente: "",
      nombreAgrupacionCliente: "",
      razonSocialCliente: ""
    };

    const url = `${this.urlextranet}/get-agrupacion`;

    return this.http.post<any>(url, agrupacion).pipe(
      map((response: any) => response as Agrupacion),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getAllAgrupaciones(idEmpresa: number): Observable<AgrupacionResponse[]> {
    const params = [
      `codigoCliente=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlextranet}/get-all-agrupaciones?${params}`;

    return this.http.get<AgrupacionResponse[]>(url).pipe(
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
