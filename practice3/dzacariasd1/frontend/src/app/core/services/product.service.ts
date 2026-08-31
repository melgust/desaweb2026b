import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductPagedResult, ProductScrollResult } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(
    search?: string,
    sortBy?: string,
    sortDirection?: string,
    page: number = 1,
    pageSize: number = 10,
    categoryId?: string | null
  ): Observable<ProductPagedResult> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortDirection) params = params.set('sortDirection', sortDirection);
    if (categoryId) params = params.set('categoryId', categoryId);

    return this.http.get<ProductPagedResult>(this.apiUrl, { params });
  }

  /**
   * Paginacion incremental usada por el scroll infinito.
   * En lugar de un numero de pagina se envia el desplazamiento (offset) y el
   * tamanio del bloque (limit); la respuesta indica desde donde continuar.
   */
  getProductsScroll(
    search?: string,
    sortBy?: string,
    sortDirection?: string,
    offset: number = 0,
    limit: number = 12,
    categoryId?: string | null
  ): Observable<ProductScrollResult> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortDirection) params = params.set('sortDirection', sortDirection);
    if (categoryId) params = params.set('categoryId', categoryId);

    return this.http.get<ProductScrollResult>(`${this.apiUrl}/scroll`, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}