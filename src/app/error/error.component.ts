import { Component, Inject } from '@angular/core';
import { templateJitUrl } from '@angular/compiler';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './error.component.html'
})
export class ErrorComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) {}
}
