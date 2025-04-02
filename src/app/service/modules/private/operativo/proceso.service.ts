import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../../../authorization/auth.service';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ServicioEjecucionSearch } from '../../../../apis/model/module/private/operativo/servicio/request/servicio-ejecucion-search';
import { buildPageableParams } from '../../../commons/http-request-handler.service';
import { DetalleServicioEjecucionSearch } from '../../../../apis/model/module/private/operativo/servicio/request/detalle-servicio-ejecucion-search';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {
  private readonly urlServicioEjecucion: string = environment.url.base + '/servicio-ejecucion';

  constructor(private readonly http: HttpClient,
    private readonly authService: AuthService) { }

    
  getProcesosPage(page: number,
    fechaInicial: string | undefined,
    fechaFinal: string | undefined,
    cantReg: number,
    codigoCliente: number): Observable<any> {

    let servicioSearch: ServicioEjecucionSearch = {
      fechaInicial: fechaInicial ?? "",
      fechaFinal: fechaFinal ?? "",
      codigoCliente: codigoCliente
    };

    const direction: 'ASC' | 'DESC' = 'ASC';
    const pageable = {
      page: page,
      size: cantReg,
      sort: {
        property: "codigo",
        direction: direction
      }
    };

    const url = `${this.urlServicioEjecucion}/list-page-procesos`;

    return this.http.post(url, servicioSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getDetalleProcesosPage(page: number,
    cantReg: number,
    codigoBitacoraEjecucion: number): Observable<any> {

    let servicioSearch: DetalleServicioEjecucionSearch = {
      codigoBitacoraEjecucion: codigoBitacoraEjecucion
    };

    const direction: 'ASC' | 'DESC' = 'ASC';
    const pageable = {
      page: page,
      size: cantReg,
      sort: {
        property: "codigo",
        direction: direction
      }
    };

    const url = `${this.urlServicioEjecucion}/list-page-detalle-procesos`;

    return this.http.post(url, servicioSearch, { params: buildPageableParams(pageable) }).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}
