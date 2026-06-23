export interface PerfilRequest {
  codigo?: number | null;
  descripcion: string;
  abreviatura: string;
  nombreComercial?: string;
  fechaCaducidad?: string;
  codigoCliente: number;
}
