import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../authorization/auth.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Proveedor } from '../../../../apis/model/module/private/proveedor';
import { ProveedorResponse } from '../../../../apis/model/module/private/operativo/proveedor/response/proveedor-response';
import { ProveedorRequest } from '../../../../apis/model/module/private/operativo/proveedor/request/proveedor-request';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly urlProveedor: string = environment.url.base + '/extranet/proveedor';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

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
      `codigoCliente=${codigoEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlProveedor}/list-page-proveedor?${params}`;

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

  create(proveedor: ProveedorRequest): Observable<ProveedorResponse> {
    const url = `${this.urlProveedor}/registrar-proveedor`;

    return this.http.put<any>(url, proveedor).pipe(
      map((response: any) => response),
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

  getProveedor(id: string): Observable<ProveedorResponse> {
    const params = [
      `codigoProveedor=${id}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlProveedor}/get-proveedor?${params}`;

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

  getAllProveedor(codigoCliente: number): Observable<ProveedorResponse[]> {
    const params = [
      `codigoCliente=${codigoCliente}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
    });

    const url = `${this.urlProveedor}/list-all-proveedor?${params}`;

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

  getProveedoresClienteBanco(codigoCliente: number, codigoBanco: string): Observable<ProveedorResponse[]> {
    const params = [
      `codigoCliente=${codigoCliente}`,
      `codigoBanco=${codigoBanco}`,
    ].filter(Boolean).join('&');

    const url = `${this.urlProveedor}/list-proveedor-banco?${params}`;

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
