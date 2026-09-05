import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, InvoicePagedResult } from '../models/invoice.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  getInvoices(search?: string, sortBy?: string, sortDirection?: string, page: number = 1, pageSize: number = 10): Observable<InvoicePagedResult> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());
    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortDirection) params = params.set('sortDirection', sortDirection);
    return this.http.get<InvoicePagedResult>(this.apiUrl, { params });
  }

  createInvoice(invoice: { clientId: string; details: { productId: string; quantity: number; unitPrice: number }[] }): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  deleteInvoice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}