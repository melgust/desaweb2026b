import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Invoice,
  InvoicePagedResult,
  CreateInvoiceRequest,
  UpdateInvoiceRequest
} from '../models/invoice.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private readonly apiUrl =
    `${environment.apiUrl}/invoices`;

  constructor(
    private http: HttpClient
  ) {}

  getInvoices(
    search: string = '',
    page: number = 1,
    pageSize: number = 10
  ): Observable<InvoicePagedResult> {

    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    if (search.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http.get<InvoicePagedResult>(
      this.apiUrl,
      { params }
    );
  }

  getInvoiceById(
    id: string
  ): Observable<Invoice> {

    return this.http.get<Invoice>(
      `${this.apiUrl}/${id}`
    );
  }

  createInvoice(
    request: CreateInvoiceRequest
  ): Observable<Invoice> {

    return this.http.post<Invoice>(
      this.apiUrl,
      request
    );
  }

  updateInvoice(
    id: string,
    request: UpdateInvoiceRequest
  ): Observable<Invoice> {

    return this.http.put<Invoice>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deleteInvoice(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}