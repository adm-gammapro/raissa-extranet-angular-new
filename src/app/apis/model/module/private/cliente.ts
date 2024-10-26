export class Cliente {
    codigo: number;
    razonSocial: string;
    ruc: string;
    codigoTipoCliente: string;
    descripcionTipoCliente: string;
    direccion: string;
    telefonoFijo: string;
    telefonoCelular: string;
    estadoRegistro: string;

    constructor() {
        this.codigo = 0;
        this.razonSocial = "";
        this.ruc = "";
        this.codigoTipoCliente = "";
        this.descripcionTipoCliente = "";
        this.direccion = "";
        this.telefonoFijo = "";
        this.telefonoCelular = "";
        this.estadoRegistro = "";
    }
}
