import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientPagedResult } from '../models/client.model';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly apiUrl = `${environment.apiUrl}/clients`;
  constructor(private http: HttpClient) {}
  getClients(search = '', sortBy = 'name', sortDirection = 'asc', page = 1, pageSize = 10): Observable<ClientPagedResult> { return this.http.get<ClientPagedResult>(this.apiUrl, { params: new HttpParams().set('search', search).set('sortBy', sortBy).set('sortDirection', sortDirection).set('page', page).set('pageSize', pageSize) }); }
  getAllClients(): Observable<Client[]> { return this.http.get<Client[]>(`${this.apiUrl}/all`); }
  getClientById(id: string): Observable<Client> { return this.http.get<Client>(`${this.apiUrl}/${id}`); }
  createClient(data: Partial<Client>): Observable<Client> { return this.http.post<Client>(this.apiUrl, data); }
  updateClient(id: string, data: Partial<Client>): Observable<Client> { return this.http.put<Client>(`${this.apiUrl}/${id}`, data); }
  deleteClient(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
