import {PerfilAsignacion} from './perfil-asignacion-response';

export interface UsuarioPerfilesTransfer {
  usuarioId: number;
  username: string;
  nombreCompleto: string;
  perfilesDisponibles: PerfilAsignacion[];
  perfilesAsignados: PerfilAsignacion[];
}
