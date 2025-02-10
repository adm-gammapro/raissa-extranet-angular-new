import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Usuario } from '../../apis/model/module/private/usuario';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TokenService } from './token.service';
import { Router } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public _token?: string | null;
  private token_url = environment.security.token_url;
  private _usuario: Usuario = new Usuario();

  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private httpClient: HttpClient, 
              private tokenService: TokenService,
              private router: Router) { }

  public getToken(code: string, code_verifier: string): Observable<any> {
    let body = new URLSearchParams();
    body.set('grant_type',environment.security.grant_type);
    body.set('client_id',environment.security.client_id);
    body.set('redirect_uri',environment.security.redirect_uri);
    body.set('scope',environment.security.scope);
    body.set('code_verifier',code_verifier);
    body.set('code',code);
    const basic_auth = 'Basic ' + btoa(environment.security.client_id+':secret');
    const headers_object = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': '*/*',
      'Authorization': basic_auth
    });
    const httpOptions = { headers: headers_object}
    return this.httpClient.post<any>(this.token_url, body, httpOptions);
  }

  public token(): string | null {
    if (this._token != null && this._token !="") {
      return this._token;
    } else {
      if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
        if ((this._token == null) && (sessionStorage.getItem(environment.session.ACCESS_TOKEN) != null && sessionStorage.getItem(environment.session.ACCESS_TOKEN) != undefined)) {
          if (sessionStorage.getItem(environment.session.ACCESS_TOKEN) != undefined) {
            this._token = sessionStorage.getItem(environment.session.ACCESS_TOKEN);
            return this._token;
          }
        }
      }
    }
    return null;
  }

  public logout(): void {
    this._token = null;
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
      sessionStorage.clear();
    }
  }

  public agregarAuthorizationHeader() {
    let token = this.tokenService.getAccessToken();
    if (token != null) {
      return this.httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeaders;
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
      console.log('No se pudo verificar acceso a la aplicación');
      return true;
    }
    return false;
  }

  guardarUsuario(accessToken: string): void {
    let payload = this.obtenerDatosToken(accessToken);
    let usuario = JSON.stringify(payload.username).replace(/['"]+/g, '');

    sessionStorage.setItem(environment.session.USERNAME, usuario);

    this.getUsuario(payload.username).subscribe(response => {
      this._usuario = response as Usuario;
      sessionStorage.setItem(environment.session.ID_USUARIO_SESSION, this._usuario.id.toString());
      sessionStorage.setItem(environment.session.NOMBRES_USUARIO, this._usuario.nombres);
    });
  }

  public getUsuario(username: string):  Observable<Usuario> {
    const params = [
      `username=${username}`,
    ].filter(Boolean).join('&');

    const headers = new HttpHeaders({
      
    });
    const url = `${environment.url.base}/seguridad/obtenerUsuarioByUsername?${params}`;

    return this.httpClient.get(url, { headers: headers }).pipe(
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

  public getusuario(): string | null {
    
    if(typeof window !== 'undefined'  && typeof window.sessionStorage !== 'undefined'){
      let username = sessionStorage.getItem(environment.session.USERNAME);
      if (username != null) {
        return JSON.parse(username);
      }
    }
    return "";
  }
}
