export class TipoCliente {
    codigo: string;
    descripcion: string;

    constructor(valor: string, descripcion: string) {
        this.codigo = valor;
        this.descripcion = descripcion;
    }
}