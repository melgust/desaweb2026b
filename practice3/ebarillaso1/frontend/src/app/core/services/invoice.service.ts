import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, InvoiceListItem, InvoicePagedResult } from '../models/invoice.model';
import { environment } from '../../../environments/environment';

export interface CreateInvoiceDetailPayload {
  productId: string;
  quantity: number;
}

export interface CreateInvoicePayload {
  clientId: string;
  invoiceDate: string;
  details: CreateInvoiceDetailPayload[];
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  getInvoices(
    search?: string,
    sortBy?: string,
    sortDirection?: string,
    page: number = 1,
    pageSize: number = 10
  ): Observable<InvoicePagedResult> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortDirection) params = params.set('sortDirection', sortDirection);

    return this.http.get<InvoicePagedResult>(this.apiUrl, { params });
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  createInvoice(payload: CreateInvoicePayload): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, payload);
  }

  updateStatus(id: string, status: string): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteInvoice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
