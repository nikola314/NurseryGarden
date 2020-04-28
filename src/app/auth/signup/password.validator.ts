import { ErrorStateMatcher } from '@angular/material/core';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  FormGroup,
  AbstractControl,
} from '@angular/forms';

export class PasswordsMatchValidator implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    return control.parent.get('password').value != control.value;
  }
}

export function matchPasswords(form: FormGroup) {
  let pass = form.controls.password.value;
  let confirmPass = form.controls.confirmPassword.value;

  return pass === confirmPass ? null : { notSame: true };
}
