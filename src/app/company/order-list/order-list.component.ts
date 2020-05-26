import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ProductService } from 'src/app/product/product.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit {
  ordersDataSource: MatTableDataSource<any> = new MatTableDataSource();
  ordersDisplayedColumns: string[] = [
    'product.name',
    'count',
    'isPickedUp',
    'timestamp',
  ];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(private productsService: ProductService) {}

  ngOnInit(): void {
    this.ordersDataSource.sort = this.sort;
    this.ordersDataSource.paginator = this.paginator;
    this.getOrders();
  }

  public getOrders() {
    this.productsService.getCompanyOrders().subscribe((response) => {
      this.ordersDataSource.data = response.orders;
    });
  }
}
