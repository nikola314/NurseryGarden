import { NgModule } from '@angular/core';
import { GardenDashboardComponent } from './garden-dashboard/garden-dashboard.component';
import {
  GardenListComponent,
  GardenCreateDialog,
} from './garden-list/garden-list.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AngularMaterialModule } from '../angular-material.module';

@NgModule({
  declarations: [
    GardenDashboardComponent,
    GardenListComponent,
    GardenCreateDialog,
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    FormsModule,
  ],
  entryComponents: [GardenCreateDialog],
})
export class FarmerModule {}
