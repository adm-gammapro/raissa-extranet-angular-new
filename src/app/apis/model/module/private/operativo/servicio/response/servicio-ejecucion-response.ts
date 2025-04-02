import { EstadoRegistroEnum } from "../../../../../enums/estado-registro";

export class ServicioEjecucionResponse {
    codigo!: number;
    fechaProceso!: string;
    estadoProceso!: string;
    registrosTotales!: number;
    registrosProcesados!: number;
    registrosErrados!: number;
    registrosPendientes!: number;
    proceso!: string;
    valuesProgreso!: { label: string; color: string; value: number; }[];

    estadoRegistro!: EstadoRegistroEnum;
    audiFechIns!: string;
}