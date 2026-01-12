import {EstadoRegistroEnum} from '../../../../../enums/estado-registro';

export class OpcionResponse {
  codigo!: number;
  descripcionOpcion!: string;
  rutaOpcion!: string;
  parteFija!: string;
  icono!: string;
  opcionPadre!: number;
  descripcionOpcionPadre!: string;
  numeroOrden!: number;
  seleccionable!: string;
  estadoRegistro!: EstadoRegistroEnum;
  audiFechIns!: string;
}
