import { JobClienteProgramacion } from "./Job-cliente-programacion";

export class Configuracion {
        codigoJobCliente!: number;
        descripcionJobCliente!: string;
        codigoServicioCliente!: number;
        nombreServicioAplicacion!: string;
        listaJobClienteProgramacion: JobClienteProgramacion[] = [];

}
