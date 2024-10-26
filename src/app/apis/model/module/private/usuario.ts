export class Usuario {
    public id: number;
    public username: string;
    public nombres: string;
    public apePaterno: string;
    public apeMaterno: string;
    public password: string;
    public fechaCambioClave: string;
    public indicadorExpiracion: String;
    public fechaExpiracionClave: string;
    public correo: String;
    public telefono: String;
    public estadoRegistro: string;
    public codigoTipoDocumento: string;
    public descripcionTipoDocumento: string;
    public numeroDocumento: string;
    public idEmpresa: string;

    constructor() {
        this.id = 0;
        this.username = "";
        this.nombres = "";
        this.apePaterno = "";
        this.apeMaterno = "";
        this.password = "";
        this.fechaCambioClave = "";
        this.indicadorExpiracion = "";
        this.fechaExpiracionClave = "";
        this.correo = "";
        this.telefono = "";
        this.estadoRegistro = "";
        this.codigoTipoDocumento = "";
        this.descripcionTipoDocumento = "";
        this.numeroDocumento = "";
        this.idEmpresa = "";
    }
}
