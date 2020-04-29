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
import { matchPasswords, PasswordsMatchValidator } from './password.validator';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
  form: FormGroup;
  isLoading = false;
  isCompany = false;
  firstNamePlaceholders = ['First Name', 'Full Company Name'];
  firstNamePlaceholder = this.firstNamePlaceholders[0];
  usernamePlaceholders = ['Username', 'Unique Company Alias'];
  usernamePlaceholder = this.usernamePlaceholders[0];
  accountTypes = ['Farmer', 'Company'];
  accountType = this.accountTypes[0];

  matcher = new PasswordsMatchValidator();
  private authStatusSub: Subscription;

  constructor(
    public authService: AuthService,
    private formBuilder: FormBuilder
  ) {}

  switchAccountType($event: MatSlideToggleChange) {
    this.isCompany = $event.checked;
    const index = this.isCompany ? 1 : 0;
    this.usernamePlaceholder = this.usernamePlaceholders[index];
    this.firstNamePlaceholder = this.firstNamePlaceholders[index];
    this.accountType = this.accountTypes[index];
  }

  onSignup() {
    if (this.form.invalid) return;
    this.isLoading = true;

    let authData: AuthData = {
      email: this.form.value.email,
      password: this.form.value.password,
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      phone: this.form.value.phone,
      date: this.form.value.date,
      isCompany: this.isCompany,
      approved: false,
      username: this.form.value.username,
      location: this.form.value.location,
    };
    this.authService.createUser(authData);
  }

  ngOnInit() {
    this.form = new FormGroup(
      {
        username: new FormControl(null, { validators: [Validators.required] }),
        firstName: new FormControl(null, { validators: [Validators.required] }),
        lastName: new FormControl(null, { validators: [] }),
        email: new FormControl(null, { validators: [Validators.required] }),
        password: new FormControl(null, {
          validators: [
            Validators.required,
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%_*?&])[A-Za-z]{1}[A-Za-z\\d@$!%_*?&]{6,}$'
            ),
          ],
        }),
        confirmPassword: new FormControl(null),
        location: new FormControl(null, { validators: [Validators.required] }),
        phone: new FormControl(null, { validators: [Validators.required] }),
        date: new FormControl(null, { validators: [Validators.required] }),
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
