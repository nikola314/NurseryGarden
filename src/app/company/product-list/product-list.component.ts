import { Component, OnInit } from '@angular/core';
import { AddProductDialogComponent } from './add-product-dialog/add-product-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from '../../product/product.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import { Product } from 'src/app/product/product.model';

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

  userId;
  private authStatusSub: Subscription;

  products: Product[] = [];

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userId = this.authService.getUserId();
        // logout on false
      });
    this.productService
      .getCompanyProducts(this.authService.getUserId())
      .subscribe((response: { message: string; products: Product[] }) => {
        this.products = response.products;
        console.log(JSON.stringify(this.products));
      });
  }

  addProductManually() {
    const dialogRef = this.addProductDialog.open(AddProductDialogComponent, {
      data: null,
    });
    dialogRef
      .afterClosed()
      .subscribe(
        (result: { name: string; isPlant: boolean; available: number }) => {
          console.log(JSON.stringify(result));
          if (result) {
            if (this.products.findIndex((x) => x.name == result.name) != -1) {
              // TODO: update available field in product
            } else {
              // TODO: create new product
            }
          }
        }
      );
  }
}
