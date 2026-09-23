import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {catchError, forkJoin, map, mapTo, Observable, of, tap, throwError} from 'rxjs';
import {Cliente} from '../../apis/model/module/private/cliente';
import {UsuarioResponse} from '../../apis/model/module/private/administrativo/usuario/response/usuario-response';
import {TokenService} from './token.service';
import {EmpresaDto} from '../../apis/model/module/private/administrativo/empresa/empresa-simple';

export interface ValidacionUsuario {
  status: 'A' | 'C' | 'E';
  empresas?: EmpresaDto[];
  mensaje?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly validarUsuarioUrl = environment.security.validacion_url;
  private readonly customLoginUrl = environment.security.custom_login_url;
  private readonly token_url = environment.security.token_url;
  public _token?: string | null;

  constructor(private readonly httpClient: HttpClient,
              private readonly router: Router,
              private readonly tokenService: TokenService) {
  }

  public getToken(code: string, code_verifier: string): Observable<any> {
    let body = new URLSearchParams();
    body.set('grant_type', environment.security.grant_type);
    body.set('client_id', environment.security.client_id);
    body.set('redirect_uri', environment.security.redirect_uri);
    body.set('scope', environment.security.scope);
    body.set('code_verifier', code_verifier);
    body.set('code', code);
    const basic_auth = 'Basic ' + btoa(environment.security.client_id + ':' + environment.security.secret_client);
    const headers_object = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*',
      'Authorization': basic_auth
    });
    const httpOptions = {headers: headers_object}
    return this.httpClient.post<any>(this.token_url, body, httpOptions);
  }

  public logout(): void {
    this._token = null;
    if (typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }
  }

  public isNoAutorizado(e: any): boolean | any {
    if (e.status == 401) {
      if (this.getToken != null) {
        this.logout();
      }
      this.router.navigate(['/content-web']);
      return true;
    }

    if (e.status == 403) {
      return true;
    }
    return false;
  }

  guardarUsuario(accessToken: string): Observable<void> {
    const payload = this.obtenerDatosToken(accessToken);
    const usuario = String(payload.username ?? '').replaceAll(/['"]+/g, '');
    const idEmpresa = String(payload.empresaId ?? '').replaceAll(/['"]+/g, '');

    sessionStorage.setItem(environment.session.USERNAME, usuario);

    const ops: Observable<any>[] = [];
    ops.push(
      this.getUsuario(usuario).pipe(
        tap(u => {
          sessionStorage.setItem(environment.session.ID_USUARIO_SESSION, u.id?.toString() ?? '');
          sessionStorage.setItem(environment.session.NOMBRES_USUARIO, u.nombres ?? '');
          sessionStorage.setItem(environment.session.CLASE_USUARIO_SESSION, u.claseUsuario ?? '');

          sessionStorage.setItem(environment.session.APELLIDO_PATERNO_USUARIO_SESSION, u.apePaterno ?? '');
          sessionStorage.setItem(environment.session.APELLIDO_MATERNO_USUARIO_SESSION, u.apeMaterno ?? '');
          sessionStorage.setItem(environment.session.CORREO_USUARIO_SESSION, u.correo ?? '');
          sessionStorage.setItem(environment.session.TELEFONO_USUARIO_SESSION, u.telefono ?? '');
        })
      )
    );

    if (idEmpresa && idEmpresa !== '0') {
      sessionStorage.setItem(environment.session.ID_EMPRESA, idEmpresa);
      ops.push(
        this.getEmpresa(idEmpresa).pipe(
          tap(emp => {
            sessionStorage.setItem(environment.session.NOMBRE_EMPRESA, emp.razonSocial ?? '');
          })
        )
      );
    }

    if (ops.length === 0) {
      return of(void 0);
    }

    return forkJoin(ops).pipe(mapTo(void 0));
  }

  public getUsuario(username: string): Observable<UsuarioResponse> {
    const params = [
      `username=${username}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({});
    const url = `${environment.url.base}/usuario/obtenerUsuarioByUsername?${params}`;

    return this.httpClient.get(url, {headers: headers}).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError((e) => {
        this.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public getEmpresa(idEmpresa: string): Observable<Cliente> {
    const params = [
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({});
    const url = `${environment.url.base}/plataforma/cliente/obtenerCliente?${params}`;

    return this.httpClient.get(url, {headers: headers}).pipe(
      map((response: any) => {
        return response.body;
      }),
      catchError((e) => {
        this.isNoAutorizado(e);
        return throwError(() => e);
      })
    );
  }

  public obtenerDatosToken(accessToken: string): any {
    if (accessToken != null) {
      return JSON.parse(atob(accessToken.split(".")[1]));
    }
    return null;
  }

  public confirmAndLogout(): void {
    this.logout();
    window.location.href = environment.security.logout_url;
  }

  public validarUsuario(tipoDoc: string, usuario: string, password: string): Observable<ValidacionUsuario> {
    return this.httpClient.post<ValidacionUsuario>(this.validarUsuarioUrl, {
      tipoDoc,
      usuario,
      password
    });
  }

  public realizarLogin(username: string,
                       password: string,
                       empresa?: string): void {
    // Generar PKCE
    const codeVerifier = this.tokenService.generateCodeVerifier();
    this.tokenService.setVerifier(codeVerifier);
    const codeChallenge = this.tokenService.generateCodeChallenge(codeVerifier);

    // Parámetros OAuth
    const oauthParams = {
      client_id: environment.security.client_id,
      redirect_uri: environment.security.redirect_uri,
      scope: environment.security.scope,
      response_type: environment.security.response_type,
      response_mode: environment.security.response_mode,
      code_challenge_method: environment.security.code_challenge_method,
      code_challenge: codeChallenge
    };

    const httpParams = new HttpParams({fromObject: oauthParams});
    const authUrl = environment.security.authorize_uri + httpParams.toString();

    // Crear formulario
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('redirect_uri', authUrl);
    if (empresa) {
      formData.append('empresa', empresa);
    }

    console.log('📤 Enviando formulario de login...');
    console.log('📍 Auth URL:', authUrl);

    // Crear un formulario HTML y enviarlo directamente
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = this.customLoginUrl;
    form.style.display = 'none';

    const addHiddenField = (name: string, value: string): void => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    addHiddenField('username', username);
    addHiddenField('password', password);
    addHiddenField('redirect_uri', authUrl);
    if (empresa) {
      addHiddenField('empresa', empresa);
    }

    // Agregar el formulario al DOM y enviarlo
    document.body.appendChild(form);
    form.submit();
  }

  // Construir username compuesto (tipoDoc_numeroDoc)
  buildUsername(tipoDoc: string, usuario: string): string {
    return `${tipoDoc}_${usuario}`;
  }
}
