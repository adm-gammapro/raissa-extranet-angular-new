export class ConfiguracionForm {
    codigoJobCliente: number;
    descripcionJobCliente: string;
    inputGroupLunes: string;
    inputGroupMartes: string;
    inputGroupMiercoles: string;
    inputGroupJueves: string;
    inputGroupViernes: string;
    inputGroupSabado: string;
    inputGroupDomingo: string;
    codigoGroupLunes: number;
    codigoGroupMartes: number;
    codigoGroupMiercoles: number;
    codigoGroupJueves: number;
    codigoGroupViernes: number;
    codigoGroupSabado: number;
    codigoGroupDomingo: number;

    codigoServicioCliente!: number;
    nombreServicioAplicacion!: string;

    constructor() {
        this.codigoJobCliente = 0;
        this.descripcionJobCliente = "";
        this.inputGroupLunes = "";
        this.inputGroupMartes = "";
        this.inputGroupMiercoles = "";
        this.inputGroupJueves = "";
        this.inputGroupViernes = "";
        this.inputGroupSabado = "";
        this.inputGroupDomingo = "";
        this.codigoGroupLunes = 0;
        this.codigoGroupMartes = 0;
        this.codigoGroupMiercoles = 0;
        this.codigoGroupJueves = 0;
        this.codigoGroupViernes = 0;
        this.codigoGroupSabado = 0;
        this.codigoGroupDomingo = 0;
    }
}