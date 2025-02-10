import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Configuracion } from '../../../../apis/model/module/private/configuracion';
import { AplicacionEntorno } from '../../../../apis/model/module/private/aplicacion-entorno';
import { ServicioCliente } from '../../../../apis/model/module/private/servicio-cliente';
import { JobCliente } from '../../../../apis/model/module/private/job-cliente';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private urlPlataformaAplicacion: string = environment.url.base + '/plataforma/aplicacion';
  private urlPlataformaCliente: string = environment.url.base + '/plataforma/cliente';

  constructor(private http: HttpClient,
              private authService: AuthService) { }

  create(configuracion: Configuracion): Observable<Configuracion> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataformaCliente}/registrarJobCliente`;

    return this.http.put<any>(url, configuracion, { headers: headers }).pipe(
      map((response: any) => response.body as Configuracion),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  update(configuracion: Configuracion): Observable<Configuracion> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataformaCliente}/actualizarJobCliente`;

    return this.http.put<any>(url, configuracion, { headers: headers }).pipe(
      map((response: any) => response.body as Configuracion),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  delete(id: number): Observable<Configuracion> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataformaCliente}/deshabilitarJobCliente/${id}`;

    return this.http.delete<Configuracion>(url, { headers: headers }).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    )
  }

  getAplicacionEntorno(codigoEmpresa: string): Observable<AplicacionEntorno> {
    const params = [
      `codigoCliente=${codigoEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataformaAplicacion}/obtenerAplicacionEntorno?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getServicioCliente(idEmpresa: number,
                     codigoAplicacionEntorno: number): Observable<ServicioCliente> {
    const params = [
      `codigoCliente=${idEmpresa}`,
      `codigoAplicacionEntorno=${codigoAplicacionEntorno}`,
      `soloJobs=true`,
      `estadoRegistro=S`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataformaCliente}/listarServicioCliente?${params}`;

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

  getJobs(codigoServicioCliente: number): Observable<JobCliente[]> {
    const params = [
      `codigoServicioCliente=${codigoServicioCliente}`,
      `estadoRegistro=S`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataformaCliente}/listarJobClienteByServicioCliente?${params}`;

    return this.http.get<JobCliente[]>(url, { headers: headers }).pipe(
      map((response: any) => {
        (response.body as JobCliente[]).map(job => {
          if (job.estadoRegistro === 'S') {
            job.estadoRegistro = 'ACTIVO';
          } else {
            job.estadoRegistro = 'INACTIVO';
          }

          return job;
        });
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getConfiguracion(id: number): Observable<Configuracion> {
    const params = [
      `codigoJobCliente=${id}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlPlataformaCliente}/findJobClienteById?${params}`;

    return this.http.get<Configuracion>(url, { headers: headers }).pipe(
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
