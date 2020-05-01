import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { AuthData } from '../auth-data.model';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import {
  matchPasswords,
  PasswordsMatchValidator,
} from '../signup/password.validator';

@Component({
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoading = false;

  matcher = new PasswordsMatchValidator();
  private authStatusSub: Subscription;

  constructor(
    public authService: AuthService,
    private formBuilder: FormBuilder
  ) {}

  onChangePassword() {
    if (this.form.invalid) return;
    this.isLoading = true;

    let passData = {
      currentPassword: this.form.value.currentPassword,
      newPassword: this.form.value.password,
    };
    this.authService.changePassword(passData);
  }

  ngOnInit() {
    this.form = new FormGroup(
      {
        currentPassword: new FormControl(null, {
          validators: [
            Validators.required,
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%_*?&])[A-Za-z]{1}[A-Za-z\\d@$!%_*?&]{6,}$'
            ),
          ],
        }),
        password: new FormControl(null, {
          validators: [
            Validators.required,
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%_*?&])[A-Za-z]{1}[A-Za-z\\d@$!%_*?&]{6,}$'
            ),
          ],
        }),
        confirmPassword: new FormControl(null),
      },
      { validators: matchPasswords }
    );

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
