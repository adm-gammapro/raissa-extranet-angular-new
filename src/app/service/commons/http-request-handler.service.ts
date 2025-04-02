import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pageable } from '../../apis/interfaces/commons/pageable';

@Injectable({
  providedIn: 'root'
})
export class HttpRequestHandlerService {
  constructor() { }
}

/**
 * Añade parámetros de paginación a una petición
 * 
 * @param pageable Configuración de paginación
 * @returns Parámetros de la petición con los parámetros de paginación añadidos
 */
export function buildPageableParams(pageable?: Pageable): HttpParams {
  let params = new HttpParams();
  
  if(pageable) {
    params = pageable.page ? params?.set('page', pageable.page.toString()) : params;
    params = pageable.size ? params?.set('size', pageable.size.toString()) : params;
    if (pageable.sort) {
      const sortValue = `${pageable.sort.property}${pageable.sort.direction ? ',' : ''}${pageable.sort.direction ?? ''}`;
      params = params.set('sort', sortValue); 
    }
  }

  return params;
}
