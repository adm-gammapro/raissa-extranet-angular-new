export class Credenciales {
    codigo!: number;
    usuario!: string;
    clave!: string;
    referencia!: string;
    codigoProveedor!: string;
    nombreProveedor!: string;
    codigoCliente!: number;
    razonSocial!: string;
    codigoFrecuencia!: string;
    descripcionFrecuencia!: string;
    estadoRegistro!: string;

    constructor() {
        this.codigoProveedor = "";
        this.codigoFrecuencia = "";
    }
}
