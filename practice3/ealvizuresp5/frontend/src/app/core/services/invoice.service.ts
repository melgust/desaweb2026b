import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInvoiceRequest, Invoice, InvoicePagedResult } from '../models/invoice.model';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly apiUrl = `${environment.apiUrl}/invoices`;
  constructor(private http: HttpClient) {}
  getInvoices(page = 1, pageSize = 10): Observable<InvoicePagedResult> { return this.http.get<InvoicePagedResult>(this.apiUrl, { params: new HttpParams().set('page', page).set('pageSize', pageSize) }); }
  getInvoiceById(id: string): Observable<Invoice> { return this.http.get<Invoice>(`${this.apiUrl}/${id}`); }
  createInvoice(data: CreateInvoiceRequest): Observable<Invoice> { return this.http.post<Invoice>(this.apiUrl, data); }
}
