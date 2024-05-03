import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import {PaginationParams, Product, Products} from '../../types';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private apiService: ApiService) {}

  // Existing methods...

  getProductById = (id: string): Observable<Product> => {
    const url = `http://localhost:3000/items/${id}`; // Replace with your actual API endpoint
    return this.apiService.get(url, { responseType: 'json' });
  };

  addProduct = (url: string, body: any): Observable<any> => {
    return this.apiService.post(url, body, {});
  };

  editProduct = (url: string, body: any): Observable<any> => {
    return this.apiService.put(url, body, {});
  };

  deleteProduct = (url: string): Observable<any> => {
    return this.apiService.delete(url, {});
  };
}
