import {EstadoRegistroEnum} from '../../../../../enums/estado-registro';

export class UsuarioResponse {
  id!: number;
  username!: string;
  nombres!: string;
  apePaterno!: string;
  apeMaterno!: string;
  password!: string;
  fechaCambioClave!: string;
  indicadorExpiracion!: string;
  fechaExpiracionClave!: string;
  correo!: string;
  telefono!: string;
  codigoTipoDocumento!: string;
  descripcionTipoDocumento!: string;
  numeroDocumento!: string;
  tipoUsuario!: string;
  claseUsuario!: string;
  estadoRegistro!: EstadoRegistroEnum;
  idEmpresa!: string;
  audiFechIns!: string;
}
