import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";

export class DetalleServicioEjecucionResponse {
    codigo!: number;
    numeroCuenta!: string;
    nombreEntidadFinanciera!: string;
    descripcionMoneda!: string;
    estadoProceso!: string;

    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}