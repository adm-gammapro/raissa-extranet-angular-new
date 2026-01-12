import { PerfilResponse } from "../../perfil/response/perfil-response";

export class UsuarioPerfilResponse {
    perfilesAsignados!: PerfilResponse[];
    perfilesNoAsignados!: PerfilResponse[];
}