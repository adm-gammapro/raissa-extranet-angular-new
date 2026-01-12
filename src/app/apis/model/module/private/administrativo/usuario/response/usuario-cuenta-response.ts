import {EstadoRegistroEnum} from '../../../../../enums/estado-registro';

export class UsuarioCuentaResponse {
  id!: number;
  codigoUsuario!: number;
  nombreUsuario!: string;
  codigoCuenta!: number;
  numeroCuenta!: string;
  nombreEntidadFinanciera!: string;
  monedaCuenta!: string;
  nombreAgrupacion!: string;
  estadoRegistro!: EstadoRegistroEnum;
  audiFechIns!: string;
  idEmpresa!: number;
}
