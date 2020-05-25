import { Product } from './product.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/products/';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products: Product[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  getCompanyProducts(manufacturer: string) {
    return this.http.get<{ message: string; products: Product[] }>(
      BACKEND_URL + manufacturer
    );
  }

  addProduct(product) {
    this.http
      .post<{ message: string; garden: any }>(BACKEND_URL, product)
      .subscribe((responseData) => {
        // tODO needed?
      });
  }

  getProduct(id: string) {
    return this.http.get<{ message: string; product: Product }>(
      BACKEND_URL + id
    );
  }

  updateProduct(product: Product) {
    return this.http.put(BACKEND_URL + product._id, product);
  }

  deleteProduct(id: string) {
    return this.http.delete(BACKEND_URL + id);
  }
}
