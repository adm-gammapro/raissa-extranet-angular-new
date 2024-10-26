export class Cuentas {
    codigo: number;
    interfazCuentaProvieneCliente?: string;
    numeroCuenta?: string;
    codigoInstitucionFinanciera: string;
    nombreInstitucionFinanciera?: string;
    monedaCuenta?: string;
    tipoCuenta?: string;
    codigoAgrupacion?: number|string;
    descripcionAgrupacion?: string;
    codigoFrecuenciaActualizacion: string;
    descripcionFrecuenciaActualizacion?: string;
    ultimaActualizacion?: string;
    estadoRegistro?: string;
    codigoCredencial!: number;

    constructor() {
        this.codigo = 0;
        this.codigoFrecuenciaActualizacion = "";
        this.codigoInstitucionFinanciera = "";
        this.codigoAgrupacion = "";
        this.monedaCuenta = "";
        this.tipoCuenta = "";
    }
}
