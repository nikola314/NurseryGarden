import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../product.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Product } from '../product.model';
import { GardenService } from 'src/app/farmer/garden.service';
import { Garden, GardenBackendModel } from 'src/app/farmer/garden.model';
import { Order } from '../order.model';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css'],
})
export class StoreComponent implements OnInit {
  products: MatTableDataSource<any> = new MatTableDataSource();
  productsInCart: MatTableDataSource<any> = new MatTableDataSource();
  gardens: MatTableDataSource<any> = new MatTableDataSource();
  selectedGarden: GardenBackendModel = null;
  currentItemsToShow = [];
  defaultPageSize = 12;
  userId = null;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  constructor(
    private productsService: ProductService,
    private authService: AuthService,
    private gardensService: GardenService
  ) {}

  ngOnInit(): void {
    this.getProducts();
    this.userId = this.authService.getUserId();
    this.getGardens();
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

  private getGardens() {
    this.gardensService.getGardensUnsubscribed().subscribe((response) => {
      this.gardens.data = response.gardens;
      this.selectedGarden = this.gardens.data[0];
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

  addToCart(product: Product) {
    // Todo: if available
    console.log(product);
    let ind = this.productsInCart.data.findIndex(
      (pr) =>
        product._id == pr.product._id &&
        this.selectedGarden._id == pr.garden._id
    );
    if (ind == -1) {
      this.productsInCart.data = [
        ...this.productsInCart.data,
        { product: product, count: 1, garden: this.selectedGarden },
      ];
    } else {
      this.productsInCart.data[ind].count++;
    }
  }

  buyProductsFromCart() {
    let orders = [];
    for (let row of this.productsInCart.data) {
      if (!row.garden || !row.product || row.count == 0) continue;
      let order = {
        product: row.product._id,
        count: row.count,
        isPickedUp: false,
        isDelivered: false,
        garden: row.garden._id,
        timestamp: new Date(),
      };
      orders.push(order);
    }
    for (let order of orders) {
      this.productsService.makeOrder(order);
    }
  }

  totalCartSum() {
    let sum = 0;
    for (let row of this.productsInCart.data) {
      sum += row.product.price * row.count;
    }
    return sum;
  }

  selectGarden(garden) {
    this.selectedGarden = garden;
  }
}
