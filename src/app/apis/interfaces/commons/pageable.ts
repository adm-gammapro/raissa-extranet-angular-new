import { Sort } from "./sort";

/**
 * Configuración de paginación
 * 
 * @since 1.0.0
 */
export interface Pageable {
    page: number;
    size: number;
    sort?: Sort;
  }
  
  export const DEFAULT_PAGE_SIZE = 5;