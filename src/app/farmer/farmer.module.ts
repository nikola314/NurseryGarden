import { NgModule } from '@angular/core';
import { GardenDashboardComponent } from './garden-dashboard/garden-dashboard.component';
import { GardenListComponent } from './garden-list/garden-list.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';

@NgModule({
  declarations: [GardenDashboardComponent, GardenListComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AngularMaterialModule,
  ],
})
export class FarmerModule {}
