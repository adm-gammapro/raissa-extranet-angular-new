import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '../../../authorization/auth.service';
import { Usuario } from '../../../../apis/model/module/private/usuario';
import { UsuarioCliente } from '../../../../apis/model/module/private/usuario-cliente';
import { ResetPassword } from '../../../../apis/model/module/private/reset-password';
import { UsuarioPerfil } from '../../../../apis/model/module/private/usuario-perfil';
import { PerfilRequest } from '../../../../apis/model/module/private/request/perfil-request';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private urlSeguridad:string = environment.url.base + '/seguridad';

  constructor(private http: HttpClient, 
              private router: Router,
              private authService: AuthService) { }

  getUsuarios(page: number,
              estadoRegistro: String,
              nombreUsuario: String,
              cantReg: number,
              idEmpresa: String): Observable<any> {

    const params = [
            `pagina=${page}`,
            `estadoRegistro=${estadoRegistro}`,
            `nombreUsuario=${nombreUsuario}`,
            `cantReg=${cantReg}`,
            `idEmpresa=${idEmpresa}`,
          ].filter(Boolean).join('&');
            
          const headers = new HttpHeaders({
          });
            
    const url = `${this.urlSeguridad}/listarUsuarios?${params}`;
            
    return this.http.get(url, { headers: headers }).pipe(
      map((response: any) => {
        (response.body.content as Usuario[]).map(usuario => {
          usuario.nombres = usuario.nombres.toUpperCase();
          usuario.apePaterno = usuario.apePaterno.toUpperCase();
          usuario.apeMaterno = usuario.apeMaterno.toUpperCase();
          if (usuario.indicadorExpiracion === 'S') {
            usuario.indicadorExpiracion = 'ACTIVO';
          } else {
            usuario.indicadorExpiracion = 'INACTIVO';
          }          
          if (usuario.estadoRegistro === 'S') {
            usuario.estadoRegistro = 'ACTIVO';
          } else {
            usuario.estadoRegistro = 'INACTIVO';
          }

          return usuario;
        });
        return response.body;
      }),
      catchError(e => {
          this.authService.isNoAutorizado(e);
          return throwError(() => e);
      })
    );
  }

  create(usuario: Usuario, idEmpresa: string) : Observable<Usuario> {
    usuario.idEmpresa = idEmpresa;
      
    const headers = new HttpHeaders({
    });
  
    const url = `${this.urlSeguridad}/registrar-usuario`;
          
    return this.http.put<any>(url, usuario, { headers: headers }).pipe(
    map((response: any) => response.body as Usuario),
    catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
    })
    );
  }

  eliminar(codigo: number): Observable<Usuario>{
  
    const url = `${this.urlSeguridad}/eliminar-usuario/${codigo}`;
          
    return this.http.delete<Usuario>(url).pipe(
      catchError((e) => {
        return throwError(() => e);
      })
    );
  }

  getUsuario(id: number): Observable<Usuario> {
    const params = [
      `codigoUsuario=${id}`,
    ].filter(Boolean).join('&');
      
    const headers = new HttpHeaders({
    });
      
    const url = `${this.urlSeguridad}/obtenerUsuario?${params}`;
          
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
  

  getUsuariosEmpresas(idUsuario: number, idUsuarioSession: number): Observable<any> {
    const params = [
      `idUsuario=${idUsuario}`,
      `idUsuarioSession=${idUsuarioSession}`,
      `estadoRegistro=S`,
    ].filter(Boolean).join('&');
      
    const headers = new HttpHeaders({
    });
      
    const url = `${this.urlSeguridad}/listarEmpresasUsuarioPage?${params}`;
          
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

  getUsuarioPerfiles(idUsuario: number, idEmpresa: string): Observable<any> {
    const params = [
      `idUsuario=${idUsuario}`,
      `idEmpresa=${idEmpresa}`,
    ].filter(Boolean).join('&');
      
    const headers = new HttpHeaders({
    });
      
    const url = `${this.urlSeguridad}/listarUsuarioPerfil?${params}`;
          
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

  public vincularEmpresa(idEmpresa: number, idUsuario: number) {
    let usuarioCliente: UsuarioCliente = new UsuarioCliente();
    usuarioCliente.codigoCliente = idEmpresa;
    usuarioCliente.codigoUsuario = idUsuario;
      
    const headers = new HttpHeaders({
    });
  
    const url = `${this.urlSeguridad}/vincularEmpresas`;
          
    return this.http.post<any>(url, usuarioCliente, { headers: headers }).pipe(
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
      
    const headers = new HttpHeaders({
    });
  
    const url = `${this.urlSeguridad}/desvincularEmpresas`;
          
    return this.http.post<any>(url, usuarioCliente, { headers: headers }).pipe(
    map((response: any) => response.body as Usuario),
    catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
    })
    );
  }

  public cambiarPassword(idUsuario: number, password: string) {
    let resetPassword: ResetPassword = new ResetPassword();
    resetPassword.id = idUsuario;
    resetPassword.password = password;
      
    const headers = new HttpHeaders({
    });
  
    const url = `${this.urlSeguridad}/resetear-password`;
          
    return this.http.put<any>(url, resetPassword, { headers: headers }).pipe(
    map((response: any) => response.body as Usuario),
    catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
    })
    );
  }

  public vincularPerfil(vincularPerfiles: PerfilRequest) {
    const headers = new HttpHeaders({
    });
  
    const url = `${this.urlSeguridad}/vincular-usuario-perfil`;
          
    return this.http.put<any>(url, vincularPerfiles, { headers: headers }).pipe(
    map((response: any) => response.body as Usuario),
    catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
    })
    );
  }

  public desVincularPerfil(desvincularPerfiles: PerfilRequest) {      
    const headers = new HttpHeaders({
    });
  
    const url = `${this.urlSeguridad}/desvincular-usuario-perfil`;
          
    return this.http.put<any>(url, desvincularPerfiles, { headers: headers }).pipe(
    map((response: any) => response.body as Usuario),
    catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
    })
    );
  }

  public vincularEmpresaPerfil(usuarioCliente: UsuarioCliente) {      
    const headers = new HttpHeaders({
    });
  
    const url = `${this.urlSeguridad}/vincularEmpresas`;
          
    return this.http.post<any>(url, usuarioCliente, { headers: headers }).pipe(
    map((response: any) => response.body as UsuarioCliente),
    catchError(e => {
        this.authService.isNoAutorizado(e);
        return throwError(() => e);
    })
    );
  }
}
