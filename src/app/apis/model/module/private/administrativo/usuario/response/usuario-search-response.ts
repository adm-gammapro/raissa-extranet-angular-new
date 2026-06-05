import {UsuarioResponse} from './usuario-response';
import {SearchResponse} from '../../../../../commons/search-response';

export interface UsuarioSearchResponse extends SearchResponse {
  list: UsuarioResponse[];
}
