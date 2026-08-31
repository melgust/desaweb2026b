import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Supplier, SupplierPagedResult } from '../models/supplier.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly apiUrl = `${environment.apiUrl}/suppliers`;
  constructor(private http: HttpClient) {}
  getSuppliers(search = '', sortBy = 'name', sortDirection = 'asc', page = 1, pageSize = 10): Observable<SupplierPagedResult> { return this.http.get<SupplierPagedResult>(this.apiUrl, { params: new HttpParams().set('search', search).set('sortBy', sortBy).set('sortDirection', sortDirection).set('page', page).set('pageSize', pageSize) }); }
  getAllSuppliers(): Observable<Supplier[]> { return this.http.get<Supplier[]>(`${this.apiUrl}/all`); }
  getSupplierById(id: string): Observable<Supplier> { return this.http.get<Supplier>(`${this.apiUrl}/${id}`); }
  createSupplier(data: Partial<Supplier>): Observable<Supplier> { return this.http.post<Supplier>(this.apiUrl, data); }
  updateSupplier(id: string, data: Partial<Supplier>): Observable<Supplier> { return this.http.put<Supplier>(`${this.apiUrl}/${id}`, data); }
  deleteSupplier(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
