import {ClienteAsignacion} from './cliente-asignacion-response';

export interface UsuarioClientesTransfer {
  usuarioId: number;
  username: string;
  nombreCompleto: string;
  clientesDisponibles: ClienteAsignacion[];
  clientesAsignados: ClienteAsignacion[];
}
