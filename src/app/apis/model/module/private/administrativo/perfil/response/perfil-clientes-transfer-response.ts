import {ClienteAsignacion} from './cliente-asignacion-response';

export interface PerfilClientesTransfer {
  perfilId: number;
  descripcion: string;
  abreviatura: string;
  nombreComercial: string;
  clientesDisponibles: ClienteAsignacion[];
  clientesAsignados: ClienteAsignacion[];
}
