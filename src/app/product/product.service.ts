import { Product } from './product.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Order } from './order.model';

const BACKEND_URL = environment.apiUrl + '/products/';
const ORDERS_URL = environment.apiUrl + '/orders/';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private products: Product[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  getCompanyProducts(manufacturer: string) {
    return this.http.get<{ message: string; products: Product[] }>(
      BACKEND_URL + 'company/' + manufacturer
    );
  }

  addProduct(product) {
    return this.http.post<{ message: string; product: any }>(
      BACKEND_URL,
      product
    );
  }

  getProduct(id: string) {
    return this.http.get<{ message: string; product: Product }>(
      BACKEND_URL + id
    );
  }

  getAllProducts() {
    return this.http.get<{ message: string; products: Product[] }>(BACKEND_URL);
  }

  updateProduct(product: Product) {
    return this.http.put(BACKEND_URL + product._id, product);
  }

  deleteProduct(id: string) {
    return this.http.delete(BACKEND_URL + id);
  }

  getCompanyOrders() {
    return this.http.get<{ message: string; orders: Order[] }>(
      ORDERS_URL + '/company'
    );
  }
  getIsOrderedByUser(productId) {
    return this.http.get<{ message: string; canComment: boolean }>(
      // TODO: implement on backend
      ORDERS_URL + '/userOrdered/' + productId
    );
  }
}
