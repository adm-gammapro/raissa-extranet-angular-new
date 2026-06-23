import {OpcionAsignacion} from './opcion-asignacion-response';

export interface PerfilOpcionesTransfer {
  perfilId: number;
  descripcion: string;
  abreviatura: string;
  nombreComercial: string;
  opcionesDisponibles: OpcionAsignacion[];
  opcionesAsignadas: OpcionAsignacion[];
}
