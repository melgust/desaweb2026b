import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Client,
  ClientPagedResult
} from '../models/client.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private readonly apiUrl =
    `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getClients(
    search?: string,
    sortBy?: string,
    sortDirection?: string,
    page: number = 1,
    pageSize: number = 10
  ): Observable<ClientPagedResult> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search)
      params = params.set('search', search);

    if (sortBy)
      params = params.set('sortBy', sortBy);

    if (sortDirection)
      params = params.set(
        'sortDirection',
        sortDirection
      );

    return this.http.get<ClientPagedResult>(
      this.apiUrl,
      { params }
    );
  }

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(
      `${this.apiUrl}/all`
    );
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(
      `${this.apiUrl}/${id}`
    );
  }

  createClient(
    client: Partial<Client>
  ): Observable<Client> {

    return this.http.post<Client>(
      this.apiUrl,
      client
    );
  }

  updateClient(
    id: string,
    client: Partial<Client>
  ): Observable<Client> {

    return this.http.put<Client>(
      `${this.apiUrl}/${id}`,
      client
    );
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}