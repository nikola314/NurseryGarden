import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth.guard';
import { GardenListComponent } from './farmer/garden-list/garden-list.component';
import { GardenDashboardComponent } from './farmer/garden-dashboard/garden-dashboard.component';
import { HomePageGuard } from './homepage.guard';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { RequestsComponent } from './admin/requests/requests.component';
import { ProductListComponent } from './company/product-list/product-list.component';
import { OrderListComponent } from './company/order-list/order-list.component';
import { ProductDetailsComponent } from './product/product-details/product-details.component';
import { StoreComponent } from './product/store/store.component';
import { StatisticsComponent } from './company/statistics/statistics.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';

const routes: Routes = [
  { path: '', component: WelcomePageComponent, canActivate: [HomePageGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'gardens', component: GardenListComponent },
  {
    path: 'changePassword',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'gardens/:gardenId',
    component: GardenDashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'products/:productId',
    component: ProductDetailsComponent,
  },
  {
    path: 'orders',
    component: OrderListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'statistics',
    component: StatisticsComponent,
    canActivate: [AuthGuard],
  },
  { path: 'requests', component: RequestsComponent },
  { path: 'store', component: StoreComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, HomePageGuard],
})
export class AppRoutingModule {}
