import {SistemaAsignacion} from './sistema-asignacion-response';

export interface UsuarioSistemasTransfer {
  usuarioId: number;
  username: string;
  nombreCompleto: string;
  sistemasDisponibles: SistemaAsignacion[];
  sistemasAsignados: SistemaAsignacion[];
}
