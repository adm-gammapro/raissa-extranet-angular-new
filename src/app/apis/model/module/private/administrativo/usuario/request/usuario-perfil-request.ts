export class UsuarioPerfilRequest {
  codigoUsuario!: number[];
  codigoPerfil!: number[];

  constructor() {
    this.codigoUsuario = [];
    this.codigoPerfil = [];
  }
}
