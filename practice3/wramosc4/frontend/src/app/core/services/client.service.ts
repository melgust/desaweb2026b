import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Client,
  ClientPagedResult,
  CreateClientRequest,
  UpdateClientRequest
} from '../models/client.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private readonly apiUrl =
    `${environment.apiUrl}/clients`;

  constructor(
    private http: HttpClient
  ) {}

  getClients(
    search: string = '',
    sortBy: string = 'name',
    sortDirection: 'asc' | 'desc' = 'asc',
    page: number = 1,
    pageSize: number = 10
  ): Observable<ClientPagedResult> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    if (search.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

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


  getClientById(
    id: string
  ): Observable<Client> {

    return this.http.get<Client>(
      `${this.apiUrl}/${id}`
    );
  }


  createClient(
    request: CreateClientRequest
  ): Observable<Client> {

    return this.http.post<Client>(
      this.apiUrl,
      request
    );
  }


  updateClient(
    id: string,
    request: UpdateClientRequest
  ): Observable<Client> {

    return this.http.put<Client>(
      `${this.apiUrl}/${id}`,
      request
    );
  }


  deleteClient(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}