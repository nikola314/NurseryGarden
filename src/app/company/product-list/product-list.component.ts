import { Component, OnInit, ViewChild } from '@angular/core';
import { AddProductDialogComponent } from './add-product-dialog/add-product-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../product/product.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/product/product.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  constructor(
    public addProductDialog: MatDialog,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  file;
  userId;
  private authStatusSub: Subscription;

  products = new MatTableDataSource<Product>([]);
  displayedColumns = [
    'name',
    'isPlant',
    'time',
    'comments',
    'available',
    'price',
  ];

  ngOnInit(): void {
    this.products.paginator = this.paginator;
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userId = this.authService.getUserId();
        // logout on false
      });
    this.getProducts();
  }

  private getProducts() {
    this.productService
      .getCompanyProducts(this.authService.getUserId())
      .subscribe((response: { message: string; products: Product[] }) => {
        this.products.data = response.products;
      });
  }

  addProductManually() {
    const dialogRef = this.addProductDialog.open(AddProductDialogComponent, {
      data: null,
    });
    dialogRef
      .afterClosed()
      .subscribe(
        (result: {
          name: string;
          isPlant: boolean;
          available: number;
          time: number;
          price: number;
        }) => {
          this.addOrUpdateProduct(result);
        }
      );
  }

  addOrUpdateProduct(product) {
    if (product) {
      if (this.products.data.findIndex((x) => x.name == product.name) != -1) {
        var productToUpdate = this.products.data.find(
          (x) => x.name == product.name
        );
        productToUpdate.isPlant = product.isPlant;
        productToUpdate.price = product.price;
        productToUpdate.time = product.time;
        this.productService
          .updateProduct(productToUpdate)
          .subscribe((responseData) => {
            this.getProducts();
          });
      } else {
        this.productService.addProduct(product).subscribe((responseData) => {
          this.getProducts();
        });
      }
    }
  }

  onJSONPicked($event) {
    this.file = (event.target as HTMLInputElement).files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(this.file, 'UTF-8');
    if (this.file.type != 'application/json') {
      return;
      // TODO: notify user
    }
    fileReader.onload = () => {
      let jsonString = fileReader.result.toString();
      let products = JSON.parse(jsonString);
      let productsToSend = [];
      for (var product of products) {
        if (
          !product.name ||
          !product.time ||
          !product.isPlant ||
          !product.price
        ) {
          // TODO notify user
          console.log('missing essential property');
          continue;
        }
        const productToSend = {
          name: product.name,
          time: product.time,
          isPlant: product.isPlant,
          available: product.available ? product.available : 1,
          price: product.price,
          comments: product.comments ? product.comments : [],
        };

        productsToSend.push(productToSend);
      }
      // filter doubles and existing products
      var seen = {};
      var filteredArray = productsToSend.filter(function (item) {
        var k = item.name;
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
      });
      for (product of filteredArray) {
        this.addOrUpdateProduct(product);
      }
    };
    fileReader.onerror = (error) => {
      console.log(error);
      // TODO notify user
    };
  }
}
