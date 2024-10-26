export class ServicioCliente {
    estadoRegistro?: string;
    descripcionEstadoRegistro?: string;
    fechaRegistro?: string;
    codigoServicioCliente: number;
    codigoServivio?: number;
    nombreServicio?: string;
    esJob?: boolean;
    codigoAplicacion?: string;
    descripcionAplicacion?: string;
    codigoEntorno?: string;
    descripcionEntorno?: string;

    constructor() {
        this.codigoServicioCliente = 0;
    }
}