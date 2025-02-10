import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { FrecuenciaActualizacionResponse } from "../../../commons/frecuencia-actualizacion-response";
import { ProveedorResponse } from "../../proveedor/response/proveedor-response";

export class CredencialesResponse {
    codigo!: number;
    nombreReferencial!: string;
    usuario!: string;
    clave!: string;
    referencia!: string;
    proveedor!: ProveedorResponse;
    frecuenciaActualizacion!: FrecuenciaActualizacionResponse;
    razonSocialCliente!: string;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}