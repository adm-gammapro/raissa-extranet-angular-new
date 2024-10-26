import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Proveedor } from '../../../../apis/model/module/private/proveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private urlProveedor: string = environment.url.base + '/extranet/proveedor';

  constructor(private http: HttpClient,
    private router: Router,
    private authService: AuthService) { }

  getProveedores(page: number,
    estadoRegistro: string,
    nombreProveedor: string,
    cantReg: number,
    codigoEmpresa: number): Observable<any> {

    const params = [
      `pagina=${page}`,
      `estadoRegistro=${estadoRegistro}`,
      `nombre=${nombreProveedor}`,
      `cantReg=${cantReg}`,
      `codigoEmpresa=${codigoEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlProveedor}/listarProveedorPage?${params}`;

    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        (response.body.content as Proveedor[]).map(proveedor => {
          proveedor.nombre = proveedor.nombre?.toUpperCase();
          proveedor.codigo = proveedor.codigo?.toUpperCase();
          proveedor.referencia = proveedor.referencia?.toUpperCase();
          proveedor.codigoInstitucionFinanciera = proveedor.codigoInstitucionFinanciera?.toUpperCase();
          proveedor.nombreInstitucionFinanciera = proveedor.nombreInstitucionFinanciera?.toUpperCase();

          if (proveedor.estadoRegistro === 'S') {
            proveedor.estadoRegistro = 'ACTIVO';
          } else {
            proveedor.estadoRegistro = 'INACTIVO';
          }

          if (proveedor.indicadorValorAdicional) {
            proveedor.descripcionIndicadorAdicional = 'Si';
          } else {
            proveedor.descripcionIndicadorAdicional = 'No';
          }

          return proveedor;
        });
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  create(proveedor: Proveedor): Observable<Proveedor> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlProveedor}/registrar-proveedor`;

    return this.http.put<any>(url, proveedor, { headers: headers }).pipe(
      map((response: any) => response.body as Proveedor),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(id: string): Observable<Proveedor> {
    const headers = new HttpHeaders({
    });

    const url = `${this.urlProveedor}/eliminar-proveedor/${id}`;
    return this.http.delete<Proveedor>(url, { headers: headers }).pipe(
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    )
  }

  getProveedor(id: string): Observable<Proveedor> {
    const params = [
      `codigo=${id}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlProveedor}/obtenerProveedor?${params}`;

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

  getAllProveedor(codigoEmpresa: number): Observable<Proveedor[]> {
    const params = [
      `codigoEmpresa=${codigoEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlProveedor}/listarAllProveedor?${params}`;

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
