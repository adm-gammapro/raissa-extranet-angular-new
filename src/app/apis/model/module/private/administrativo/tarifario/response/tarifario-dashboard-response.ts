export interface TarifarioDashboardResponse {
  sistema: string;
  plan: string;
  fechaInicio: Date;
  fechaFin: Date;
  diasRestantes: number;
  usuariosContratados: number;
  usuariosUtilizados: number;
  usuariosDisponibles: number;
  consumosContratados: number;
  consumosUtilizados: number;
  consumosDisponibles: number;
  porcentajeConsumo: number;
  periodoPrueba: boolean;
  suscripcionActiva: boolean;
}
