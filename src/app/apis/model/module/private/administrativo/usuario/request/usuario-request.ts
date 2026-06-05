export interface UsuarioRequest {
  id?: number | null;
  username: string;
  nombres: string;
  apePaterno: string;
  apeMaterno: string;
  password?: string;
  fechaCambioClave?: string;
  indicadorExpiracion?: string;
  fechaExpiracionClave?: string;
  correo: string;
  telefono: string;
  codigoTipoDocumento: string;
  descripcionTipoDocumento?: string;
  numeroDocumento: string;
  estadoRegistro?: string;
  tipoUsuario: string;
  claseUsuario: string;
  idEmpresa: number;
}
