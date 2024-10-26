import { Saldos } from "./saldos";

export class Resumen {
    cantidadCuentasSoles: number;
    cantidadCuentaDolares: number;
    saldoContableSoles: string;
    saldoDisponibleSoles: string
    saldoContableDolares: string;
    saldoDisponibleDolares: string;
    saldosGeneral: Saldos[] = [];
    saldosCuenta: Saldos[] = [];

    constructor() {
        this.cantidadCuentaDolares = 0;
        this.cantidadCuentasSoles = 0;
        this.saldoContableSoles = "0,00";
        this.saldoDisponibleSoles = "0,00";
        this.saldoContableDolares = "0,00";
        this.saldoDisponibleDolares = "0,00";
    }
}