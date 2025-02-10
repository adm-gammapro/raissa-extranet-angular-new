import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { FrecuenciaActualizacionResponse } from "../../../commons/frecuencia-actualizacion-response";
import { AgrupacionResponse } from "../../agrupacion/response/agrupacion-response";

export class CuentaResponse {
    codigo!: number;
    interfazCuentaProvieneCliente!: string;
    numeroCuenta!: string;
    codigoInstitucionFinanciera!: string;
    nombreInstitucionFinanciera!: string;
    monedaCuenta!: string;
    descripcionMonedaCuenta!: string;
    tipoCuenta!: string;
    agrupacion!: AgrupacionResponse;
    frecuenciaActualizacion!: FrecuenciaActualizacionResponse;
    ultimaActualizacion!: string;
    codigoProveedor!: string;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}