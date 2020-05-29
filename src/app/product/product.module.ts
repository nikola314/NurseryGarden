import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { StoreComponent } from './store/store.component';

@NgModule({
  declarations: [ProductDetailsComponent, StoreComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    FormsModule,
  ],
})
export class ProductModule {}
