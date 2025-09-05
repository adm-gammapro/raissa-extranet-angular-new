import { TipoCliente } from "./tipo-cliente";

export class Cliente {
    codigo: number;
    razonSocial: string;
    ruc: string;
    tipoCliente!: TipoCliente;
    direccion: string;
    telefonoFijo: string;
    telefonoCelular: string;
    estadoRegistro: string;

    constructor() {
        this.codigo = 0;
        this.razonSocial = "";
        this.ruc = "";
        this.direccion = "";
        this.telefonoFijo = "";
        this.telefonoCelular = "";
        this.estadoRegistro = "";
    }
}
