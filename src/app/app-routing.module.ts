import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostListComponent } from './posts/post-list/post-list.component';
import { PostCreateComponent } from './posts/post-create/post-create.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth.guard';
import { GardenListComponent } from './farmer/garden-list/garden-list.component';
import { GardenDashboardComponent } from './farmer/garden-dashboard/garden-dashboard.component';
import { HomePageGuard } from './homepage.guard';

const routes: Routes = [
  { path: '', component: PostListComponent, canActivate: [HomePageGuard] },
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard] },
  {
    path: 'edit/:postId',
    component: PostCreateComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'gardens', component: GardenListComponent },
  {
    path: 'gardens/:gardenId',
    component: GardenDashboardComponent,
    canActivate: [AuthGuard], // TODO: check garden ownership
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, HomePageGuard],
})
export class AppRoutingModule {}
