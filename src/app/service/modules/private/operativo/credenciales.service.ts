import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Credenciales } from '../../../../apis/model/module/private/credenciales';
import { Agrupacion } from '../../../../apis/model/module/private/agrupacion';

@Injectable({
  providedIn: 'root'
})
export class CredencialesService {
  private urlCredenciales = environment.url.base + '/extranet/credencial';

  constructor(private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }

  getCredenciales(page: number,
    estadoRegistro: string,
    referencia: string,
    proveedor: string,
    cantReg: number,
    idEmpresa: string): Observable<any> {

    const params = [
      `pagina=${page}`,
      `estadoRegistro=${estadoRegistro}`,
      `referencia=${referencia}`,
      `proveedor=${proveedor}`,
      `cantReg=${cantReg}`,
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlCredenciales}/listarCredencialesPage?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        (response.body.content as Credenciales[]).map(credencial => {
          credencial.codigo = credencial.codigo;
          credencial.usuario = credencial.usuario;
          credencial.clave = credencial.clave;
          credencial.referencia = credencial.referencia?.toUpperCase();
          credencial.codigoProveedor = credencial.codigoProveedor;
          credencial.nombreProveedor = credencial.nombreProveedor?.toUpperCase();
          credencial.codigoCliente = credencial.codigoCliente;
          credencial.razonSocial = credencial.razonSocial?.toUpperCase();
          credencial.codigoFrecuencia = credencial.codigoFrecuencia;
          credencial.descripcionFrecuencia = credencial.descripcionFrecuencia?.toUpperCase();

          if (credencial.estadoRegistro === 'S') {
            credencial.estadoRegistro = 'ACTIVO';
          } else {
            credencial.estadoRegistro = 'INACTIVO';
          }

          return credencial;
        });
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(credencial: Credenciales): Observable<Credenciales> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlCredenciales}/registrar-credencial`;

    return this.http.put<any>(url, credencial, { headers: headers }).pipe(
      map((response: any) => response.body as Credenciales),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(id: number): Observable<Credenciales> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlCredenciales}/eliminar-credencial/${id}`;
    return this.http.delete<Credenciales>(url, { headers: headers }).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getCredencial(id: number): Observable<Credenciales> {
    const params = [
      `codigo=${id}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlCredenciales}/obtenerCredencial?${params}`;

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

  getAllCredenciales(): Observable<Agrupacion[]> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlCredenciales}/listarAllAgrupacion`;

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

  getCredencialesPorEmpresa(idEmpresa: number) {
    const params = [
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlCredenciales}/listarCredencialesPorEmpresa?${params}`;

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
