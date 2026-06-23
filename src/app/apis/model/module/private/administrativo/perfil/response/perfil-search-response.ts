import {SearchResponse} from '../../../../../commons/search-response';
import {PerfilResponse} from './perfil-response';

export interface PerfilSearchResponse extends SearchResponse {
  list: PerfilResponse[];
}
