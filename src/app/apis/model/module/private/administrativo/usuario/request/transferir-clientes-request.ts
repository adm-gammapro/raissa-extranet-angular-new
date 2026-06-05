export interface TransferirClientesRequest {
  usuarioId: number;
  clientesIdsAsignar: number[];
  clientesIdsDesasignar: number[];
}
