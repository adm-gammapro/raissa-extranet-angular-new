import {SearchRequest} from '../../../../../commons/search-request';

export interface UsuarioSearch extends SearchRequest {
  estadoRegistro?: string;
  nombreUsuario?: string;
  idEmpresa?: number;
}
