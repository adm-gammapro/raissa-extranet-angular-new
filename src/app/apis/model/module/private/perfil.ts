export class Perfil {
    codigo: number;
    descripcion: string;
    abreviatura: string;
    nombreComercial: string;
    descripcionAplicacion: string;
    codigoAplicacion: string;
    fechaCaducidad: string;
    estadoRegistro: string;
    idUsuario: string;

    constructor() {
        this.codigo = 0;
        this.descripcion = "";
        this.abreviatura = "";
        this.nombreComercial = "";
        this.descripcionAplicacion = "";
        this.codigoAplicacion = "";
        this.fechaCaducidad = "";
        this.estadoRegistro = "";
        this.idUsuario = "";
    }
}
