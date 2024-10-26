export class TipoCuenta {
    valor: string;
    descripcion: string;

    constructor(valor: string, descripcion: string) {
        this.valor = valor;
        this.descripcion = descripcion;
    }
    
    static tipoCuentas: TipoCuenta[] = [
        new TipoCuenta('1', 'Operativa'),
        new TipoCuenta('2', 'Administrativa'),
    ];
}