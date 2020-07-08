import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ProductService } from 'src/app/product/product.service';
import { MatPaginator } from '@angular/material/paginator';
import { CourierService } from '../courier.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit {
  ordersDataSource: MatTableDataSource<any> = new MatTableDataSource();
  pendingOrdersDataSource: MatTableDataSource<any> = new MatTableDataSource();
  ordersDisplayedColumns: string[] = [
    'products',
    'count',
    'isPickedUp',
    'timestamp',
    'actions',
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private productsService: ProductService,
    private courierService: CourierService
  ) {}

  ngOnInit(): void {
    this.ordersDataSource.sort = this.sort;
    this.ordersDataSource.paginator = this.paginator;
    this.getOrders();
  }

  public getOrders() {
    this.productsService.getCompanyOrders().subscribe((response) => {
      let pending = [];
      let notPending = [];
      this.pendingOrdersDataSource.data = [];
      for (let order of response.orders) {
        if (order.status == 'accepted' && order.isPickedUp == false) {
          pending.push(order);
        } else {
          notPending.push(order);
        }
      }
      this.ordersDataSource.data = notPending;
      this.pendingOrdersDataSource.data = pending;
    });
  }

  public getProductsStringToShow(products: string) {
    if (products.length > 60) {
      return products.slice(0, 57) + '...';
    } else return products;
  }

  public acceptOrder(order) {
    this.courierService.acceptOrder(order).subscribe((response) => {
      this.getOrders();
    });
  }

  public denyOrder(order) {
    console.log(order);
    this.courierService.denyOrder(order).subscribe((response) => {
      console.log(response.message);
      this.getOrders();
    });
  }
}
