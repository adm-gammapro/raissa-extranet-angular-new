export class Saldos {
    idBanco: string;
    banco: string;
    abreviaturaBanco: string;
    moneda: string;
    idCuenta: number;
    cuenta: string;
    codigoAgrupacion: number;
    saldoContable: number;
    saldoContableformato: string;
    saldoDisponible: number;
    saldoDisponibleformato: string;
    fechaActualizacion: string;
    fechaUltimaActualizacion: string;
    bitacora: number;

    constructor() {
        this.idBanco = "0";
        this.banco = "";
        this.abreviaturaBanco = "";
        this.moneda = "";
        this.idCuenta = 0;
        this.cuenta = "";
        this.codigoAgrupacion = 0;
        this.saldoContable = 0.0;
        this.saldoContableformato = "0,00";
        this.saldoDisponible = 0.0;
        this.saldoDisponibleformato = "0,00";
        this.fechaActualizacion = "";
        this.fechaUltimaActualizacion = "";
        this.bitacora = 0;
    }
    
}
