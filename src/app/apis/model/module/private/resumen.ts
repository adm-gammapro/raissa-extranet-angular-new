import { Saldos } from "./saldos";
import { SaldosBanco } from "./saldos-banco";

export class Resumen {
    cantidadCuentasSoles!: number;
    cantidadCuentaDolares!: number;
    saldoContableSoles!: string;
    saldoDisponibleSoles!: string
    saldoContableDolares!: string;
    saldoDisponibleDolares!: string;
    saldosGeneral: Saldos[] = [];
    saldosCuenta: Saldos[] = [];
    saldosBanco: SaldosBanco[] = [];
}