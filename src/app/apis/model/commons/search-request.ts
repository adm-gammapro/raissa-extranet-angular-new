import {SortOrderEnum} from '../enums/sort-order.enum';

export interface SearchRequest {
  page: number;
  size: number;
  sortField?: string;
  sortOrder?: SortOrderEnum;
}
