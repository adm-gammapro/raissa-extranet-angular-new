import { Icono } from "./icono";

export class Menu {
    codigo: number;
    descripcionOpcion: string;
    rutaOpcion: string;
    parteFija: string;
    icono: string;
    opcionPadre: number;
    descripcionOpcionPadre: string;
    numeroOrden: number;
    codigoModulo: number;
    descripcionModulo: string;
    estadoRegistro: string;
    listIconos: Icono[] = [];

    constructor() {
        this.codigo = 0;
        this.descripcionOpcion = "";
        this.rutaOpcion = "";
        this.parteFija = "";
        this.icono = "";
        this.opcionPadre = 0;
        this.descripcionOpcionPadre = "";
        this.numeroOrden = 0;
        this.codigoModulo = 0;
        this.descripcionModulo = "";
        this.estadoRegistro = "";
    }
}