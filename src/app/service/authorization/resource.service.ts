import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  resourceUrl = environment.security.resource_url;

  constructor(private httpClient: HttpClient) { }

  public user(): Observable<any> {
    return this.httpClient.get<any>(this.resourceUrl + 'user');//api para rol de user
  }

  public admin(): Observable<any> {
    return this.httpClient.get<any>(this.resourceUrl + 'admin');//api para rol de admin
  }
}
