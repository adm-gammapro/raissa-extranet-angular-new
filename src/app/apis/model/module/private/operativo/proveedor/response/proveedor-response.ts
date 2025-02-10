import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";
import { InstitucionFinancieraResponse } from "../../../commons/institucion-financiera-response";

export class ProveedorResponse {
    codigo!: string;
    nombre!: string;
    referencia!: string;
    institucionFinanciera!: InstitucionFinancieraResponse;
    indicadorValorAdicional!: boolean;
    codigoCliente!: number;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}