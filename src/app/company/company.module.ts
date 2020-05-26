import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
import { ProductListComponent } from './product-list/product-list.component';
import { AddProductDialogComponent } from './product-list/add-product-dialog/add-product-dialog.component';
import { OrderListComponent } from './order-list/order-list.component';

@NgModule({
  declarations: [ProductListComponent, AddProductDialogComponent, OrderListComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    FormsModule,
  ],
  entryComponents: [AddProductDialogComponent],
})
export class CompanyModule {}
