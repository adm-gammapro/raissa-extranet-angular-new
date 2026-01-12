import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '../../../../../environments/environment';
import {catchError, map, Observable, throwError} from 'rxjs';
import {AuthService} from '../../../authorization/auth.service';
import {Usuario} from '../../../../apis/model/module/private/usuario';
import {UsuarioCliente} from '../../../../apis/model/module/private/usuario-cliente';
import {ResetPassword} from '../../../../apis/model/module/private/reset-password';
import {UsuarioSearch} from '../../../../apis/model/module/private/administrativo/usuario/request/usuario-search';
import {buildPageableParams} from '../../../commons/http-request-handler.service';
import {UsuarioRequest} from '../../../../apis/model/module/private/administrativo/usuario/request/usuario-request';
import {UsuarioResponse} from '../../../../apis/model/module/private/administrativo/usuario/response/usuario-response';
import {
  UsuarioPerfilRequest
} from '../../../../apis/model/module/private/administrativo/usuario/request/usuario-perfil-request';
import {
  UsuarioCuentaSearch
} from '../../../../apis/model/module/private/administrativo/usuario/request/usuario-cuenta-search';
import {
  UsuarioCuentaRequest
} from '../../../../apis/model/module/private/administrativo/usuario/request/usuario-cuenta-request';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly urlSeguridad: string = environment.url.base + '/seguridad';
  private readonly urlUsuario: string = environment.url.base + '/usuario';
  private readonly urlUsuarioCuenta: string = environment.url.base + '/usuario-cuenta';

  constructor(private readonly http: HttpClient,
              private readonly authService: AuthService) {
  }

  getUsuariosPage(page: number,
                  estadoRegistro: string | undefined,
                  nombreUsuario: string | undefined,
                  idEmpresa: number | undefined,
                  cantReg: number): Observable<any> {

    let usuarioSearch: UsuarioSearch = {
      nombreUsuario: nombreUsuario ?? "",
      estadoRegistro: estadoRegistro ?? "",
      idEmpresa: idEmpresa ?? 0
    };

    const direction: 'ASC' | 'DESC' = 'ASC';
    const pageable = {
      page: page,
      size: cantReg,
      sort: {
        property: "id",
        direction: direction
      }
    };

    const url = `${this.urlSeguridad}/listarUsuarios`;

    return this.http.post(url, usuarioSearch, {params: buildPageableParams(pageable)}).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  registrar(usuario: UsuarioRequest, idEmpresa: number): Observable<UsuarioResponse> {
    usuario.idEmpresa = idEmpresa;
    const headers = new HttpHeaders({});

    let url
    if (usuario.id != null && usuario.id > 0) {
      url = `${this.urlSeguridad}/actualizar-usuario`;
    } else {
      url = `${this.urlSeguridad}/registrar-usuario`;
    }

    return this.http.post<any>(url, usuario, {headers: headers}).pipe(
      map((response: any) => response.body as UsuarioResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminar(codigo: number): Observable<Usuario> {

    const url = `${this.urlSeguridad}/eliminar-usuario/${codigo}`;

    return this.http.delete<Usuario>(url).pipe(
      catchError((e) => {
        return throwError(() => e);
      })
    );
  }

  getUsuario(id: number): Observable<UsuarioResponse> {
    const params = [
      `codigoUsuario=${id}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({});

    const url = `${this.urlSeguridad}/obtenerUsuario?${params}`;

    return this.http.get(url, {headers: headers}).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  actualizarPerfil(usuario: UsuarioRequest): Observable<UsuarioResponse> {
    const headers = new HttpHeaders({});

    let url = `${this.urlUsuario}/actualizar-perfil-usuario`;

    return this.http.post<any>(url, usuario, {headers: headers}).pipe(
      map((response: any) => response.body as UsuarioResponse),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getUsuariosEmpresas(idUsuario: number, idUsuarioSession: number): Observable<any> {
    const params = [
      `idUsuario=${idUsuario}`,
      `idUsuarioSession=${idUsuarioSession}`,
      `estadoRegistro=S`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({});

    const url = `${this.urlSeguridad}/listarEmpresasUsuarioPage?${params}`;

    return this.http.get(url, {headers: headers}).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getUsuarioPerfiles(idUsuario: number, idEmpresa: string): Observable<any> {
    const params = [
      `idUsuario=${idUsuario}`,
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({});

    const url = `${this.urlUsuario}/listarUsuarioPerfil?${params}`;

    return this.http.get(url, {headers: headers}).pipe(
      map((response: any) => {
        return response;
      }),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public vincularEmpresa(idEmpresa: number, idUsuario: number) {
    let usuarioCliente: UsuarioCliente = new UsuarioCliente();
    usuarioCliente.codigoCliente = idEmpresa;
    usuarioCliente.codigoUsuario = idUsuario;

    const headers = new HttpHeaders({});

    const url = `${this.urlSeguridad}/vincularEmpresas`;

    return this.http.post<any>(url, usuarioCliente, {headers: headers}).pipe(
      map((response: any) => response.body as Usuario),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public desVincularEmpresa(idUsuarioCliente: number) {
    let usuarioCliente: UsuarioCliente = new UsuarioCliente();
    usuarioCliente.codigo = idUsuarioCliente;

    const headers = new HttpHeaders({});

    const url = `${this.urlSeguridad}/desvincularEmpresas`;

    return this.http.post<any>(url, usuarioCliente, {headers: headers}).pipe(
      map((response: any) => response.body as Usuario),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public cambiarPassword(idUsuario: number, password: string): Observable<any> {
    let resetPassword: ResetPassword = new ResetPassword();
    resetPassword.id = idUsuario;
    resetPassword.password = password;

    const headers = new HttpHeaders({});

    const url = `${this.urlSeguridad}/resetear-password`;

    return this.http.post<any>(url, resetPassword, {headers: headers}).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public vincularPerfil(vincularPerfiles: UsuarioPerfilRequest) {
    const headers = new HttpHeaders({});

    const url = `${this.urlUsuario}/vincular-usuario-perfil`;

    return this.http.post<any>(url, vincularPerfiles, {headers: headers}).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public desVincularPerfil(desvincularPerfiles: UsuarioPerfilRequest) {
    const headers = new HttpHeaders({});

    const url = `${this.urlUsuario}/desvincular-usuario-perfil`;

    return this.http.post<any>(url, desvincularPerfiles, {headers: headers}).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public vincularEmpresaPerfil(usuarioCliente: UsuarioCliente) {
    const headers = new HttpHeaders({});

    const url = `${this.urlSeguridad}/vincularEmpresas`;

    return this.http.post<any>(url, usuarioCliente, {headers: headers}).pipe(
      map((response: any) => response.body as UsuarioCliente),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }


  getUsuariosCuentaPage(page: number,
                        estadoRegistro: string | undefined,
                        agrupacion: string | undefined,
                        banco: string | undefined,
                        moneda: string | undefined,
                        idEmpresa: number | undefined,
                        idUsuario: number | undefined,
                        cantReg: number): Observable<any> {

    let search: UsuarioCuentaSearch = {
      estadoRegistro: estadoRegistro ?? "",
      agrupacion: agrupacion ?? "",
      moneda: moneda ?? "",
      banco: banco ?? "",
      codigoEmpresa: idEmpresa ?? 0,
      codigoUsuario: idUsuario ?? 0
    };

    const direction: 'ASC' | 'DESC' = 'ASC';
    const pageable = {
      page: page,
      size: cantReg,
      sort: {
        property: "id",
        direction: direction
      }
    };

    const url = `${this.urlUsuarioCuenta}/list-page-usuario-cuenta`;

    return this.http.post(url, search, {params: buildPageableParams(pageable)}).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  getUsuarioCuentasDisponibles(idEmpresa: number | undefined,
                               idUsuario: number | undefined): Observable<any> {

    const params = [
      `codigoUsuario=${idEmpresa}`,
      `codigoEmpresa=${idUsuario}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({});

    const url = `${this.urlUsuarioCuenta}/listar-cuentas-disponibles-por-usuario?${params}`;

    return this.http.get(url, {headers: headers}).pipe(
      map((response: any) => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  registrarVinculoUsuariocuenta(idEmpresa: number | undefined,
                                idUsuario: number | undefined,
                                cuentas: number[] | undefined): Observable<any> {

    if (!idEmpresa || !idUsuario || !cuentas || cuentas.length === 0) {
      return throwError(() => new Error('Datos incompletos para registrar vínculo.'));
    }

    const body: UsuarioCuentaRequest[] = cuentas.map(c => ({
      id: 0,
      codigoEmpresa: idEmpresa,
      codigoUsuario: idUsuario,
      codigoCuenta: c,
      estadoRegistro: 'S'
    }));

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const url = `${this.urlUsuarioCuenta}/registrar-usuario-cuenta`;

    return this.http.post<UsuarioCuentaRequest[]>(url, body, {headers}).pipe(
      map(response => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  eliminarUsuarioCuenta(codigo: number): Observable<UsuarioResponse> {
    const body: UsuarioCuentaRequest = {
      id: codigo,
      codigoEmpresa: 0,
      codigoUsuario: 0,
      codigoCuenta: 0,
      estadoRegistro: 'S'
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const url = `${this.urlUsuarioCuenta}/eliminar-usuario-cuenta`;

    return this.http.post<UsuarioResponse>(url, body, {headers}).pipe(
      map(response => response),
      catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }
}
