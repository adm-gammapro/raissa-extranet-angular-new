import {EstadoRegistroEnum} from '../../../../../enums/estado-registro';

export class PerfilResponse {
  codigo!: number;
  descripcion!: string;
  abreviatura!: string;
  nombreComercial!: string;
  fechaCaducidad!: string;
  idUsuario!: string;
  estadoRegistro!: EstadoRegistroEnum;
  audiFechIns!: string;
}
