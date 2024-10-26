export class Moneda {
    valor: string;
    descripcion: string;

    constructor(valor: string, descripcion: string) {
        this.valor = valor;
        this.descripcion = descripcion;
    }
    
    static monedas: Moneda[] = [
        new Moneda('1', 'Soles'),
        new Moneda('2', 'Dólares'),
    ];
}