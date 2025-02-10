import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";

export class AgrupacionResponse {
    codigo!: number;
    interfazCuentaProvieneCliente!: string;
    nombreAgrupacionCliente!: string;
    codigoCliente!: number;
    razonSocialCliente!: string;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}