import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryPagedResult } from '../models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/categories`;
  constructor(private http: HttpClient) {}
  getCategories(search = '', sortBy = 'name', sortDirection = 'asc', page = 1, pageSize = 10): Observable<CategoryPagedResult> { return this.http.get<CategoryPagedResult>(this.apiUrl, { params: new HttpParams().set('search', search).set('sortBy', sortBy).set('sortDirection', sortDirection).set('page', page).set('pageSize', pageSize) }); }
  getAllCategories(): Observable<Category[]> { return this.http.get<Category[]>(`${this.apiUrl}/all`); }
  getCategoryById(id: string): Observable<Category> { return this.http.get<Category>(`${this.apiUrl}/${id}`); }
  createCategory(data: Partial<Category>): Observable<Category> { return this.http.post<Category>(this.apiUrl, data); }
  updateCategory(id: string, data: Partial<Category>): Observable<Category> { return this.http.put<Category>(`${this.apiUrl}/${id}`, data); }
  deleteCategory(id: string): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}
