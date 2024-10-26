export class DetalleSaldos {
    codigoCuentaMovimiento: number;
	codigoCuenta: number;	
	fechaOperacion: string;
	fechaValor: string;
	concepto: string;
    referencia: string;
	cargo: number;
	abono: number;
	codigoServicioEjecucionBitacora: number;
    cargoFormato: string;
	abonoFormato: string;
    fechaOperacionFormato: string;
	fechaValorFormato: string;

    constructor() {
        this.codigoCuentaMovimiento = 0;
        this.codigoCuenta = 0;
        this.fechaOperacion = "";
        this.fechaValor = "";
        this.concepto = "";
        this.referencia = "";
        this.cargo = 0.0;
        this.abono = 0.0;
        this.codigoServicioEjecucionBitacora=0;
        this.cargoFormato = "";
        this.abonoFormato = "";
        this.fechaOperacionFormato = "";
        this.fechaValorFormato = "";
    }
}