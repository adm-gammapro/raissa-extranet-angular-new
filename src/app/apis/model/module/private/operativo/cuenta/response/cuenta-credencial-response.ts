import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";

export class CuentaCredencialResponse {
    codigo!: number;
    codigoCuenta!: number;
    codigoCredencial!: number;
    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}