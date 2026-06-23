import {SearchRequest} from '../../../../../commons/search-request';

export interface PerfilSearch extends SearchRequest{
  descripcion?: string;
  abreviatura?: string;
  estadoRegistro?: string;
  codigoCliente?: number;
}
