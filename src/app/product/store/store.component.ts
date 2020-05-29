import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../product.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Product } from '../product.model';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'],
})
export class StoreComponent implements OnInit {
  products: MatTableDataSource<any> = new MatTableDataSource();
  currentItemsToShow = [];
  defaultPageSize = 12;
  userId = null;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(
    private productsService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.userId = this.authService.getUserId();
  }

  private getProducts() {
    this.productsService.getAllProducts().subscribe((response) => {
      if (response.products) {
        this.products.data = response.products;
        this.products.paginator = this.paginator;
        this.currentItemsToShow = this.products.data.slice(
          0,
          this.defaultPageSize
        );
      }
    });
  }

  onPageChange($event) {
    this.currentItemsToShow = this.products.data.slice(
      $event.pageIndex * $event.pageSize,
      $event.pageIndex * $event.pageSize + $event.pageSize
    );
  }

  calculateRating(product: Product) {
    if (product.comments.length == 0) return 0;
    let sum = 0;
    for (let comm of product.comments) {
      sum += comm.grade;
    }
    return sum / product.comments.length;
  }

  details(product: Product) {}

  addToCart(product: Product) {}

  // applyFilter(event: Event) {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.products.filter = filterValue.trim().toLowerCase();
  // }
}
