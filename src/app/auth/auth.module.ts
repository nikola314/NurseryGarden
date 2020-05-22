import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AngularMaterialModule } from '../angular-material.module';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password/change-password.component';
import {
  RecaptchaModule,
  RecaptchaFormsModule,
  RECAPTCHA_SETTINGS,
  RecaptchaSettings,
} from 'ng-recaptcha';
import { RequestsComponent } from '../admin/requests/requests.component';

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    ChangePasswordComponent,
    RequestsComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    AngularMaterialModule,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: '6Lcp_PoUAAAAACbwbUVmxY6qitklDhPxA3YSmy2e',
      } as RecaptchaSettings,
    },
  ],
})
export class AuthModule {}
