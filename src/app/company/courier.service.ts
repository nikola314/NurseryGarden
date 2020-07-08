import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/orders/';

@Injectable({
  providedIn: 'root',
})
export class CourierService {
  constructor(private http: HttpClient, private router: Router) {}

  getCouriers() {
    return this.http.get<{ message: string; destinations: any[] }>(
      BACKEND_URL + 'couriers/'
    );
  }

  acceptOrder(order) {
    return this.http.post<{ message: string; destinations: any[] }>(
      BACKEND_URL + 'accept/',
      order
    );
  }

  denyOrder(order) {
    return this.http.post<{ message: string; destinations: any[] }>(
      BACKEND_URL + 'deny/',
      order
    );
  }
}
