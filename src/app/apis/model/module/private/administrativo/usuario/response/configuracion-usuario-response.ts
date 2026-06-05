export interface ClienteOpcion {
  id: number;
  razonSocial: string;
  ruc: string;
}

export interface SistemaOpcion {
  id: string;
  nombre: string;
}

export interface PerfilOpcion {
  id: number;
  descripcion: string;
  abreviatura: string;
}

export interface OpcionesConfiguracion {
  clientes: ClienteOpcion[];
  sistemas: SistemaOpcion[];
  perfiles: PerfilOpcion[];
}

export interface ConfiguracionUsuario {
  idConfiguracion: number;
  usuarioId: number;
  username: string;
  usuarioNombre: string;
  clienteId: number;
  clienteRazonSocial: string;
  clienteRuc: string;
  sistemaId: string;
  sistemaNombre: string;
  perfilId: number;
  perfilDescripcion: string;
  perfilAbreviatura: string;
  estadoRegistro: string;
}
