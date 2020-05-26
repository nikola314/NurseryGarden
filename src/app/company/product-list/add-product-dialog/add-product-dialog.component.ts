import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-add-product-dialog',
  templateUrl: './add-product-dialog.component.html',
  styleUrls: ['./add-product-dialog.component.css'],
})
export class AddProductDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<AddProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public inputData: any,
    private _formBuilder: FormBuilder
  ) {}

  isPlant = true;
  productTypes = ['Suplement', 'Plant'];
  productType = this.productTypes[1];

  timeStrings = ['Growing time reduced', 'Time to grow'];
  timeString = this.timeStrings[1];

  formGroup1: FormGroup;
  formGroup2: FormGroup;
  formGroup3: FormGroup;
  formGroup4: FormGroup;

  ngOnInit(): void {
    this.formGroup1 = this._formBuilder.group({
      firstCtrl: new FormControl(null, Validators.required),
    });
    this.formGroup2 = this._formBuilder.group({
      firstCtrl: new FormControl(null, Validators.required),
    });
    this.formGroup3 = this._formBuilder.group({
      firstCtrl: new FormControl(null, Validators.required),
    });
    this.formGroup4 = this._formBuilder.group({
      firstCtrl: new FormControl(null, Validators.required),
    });
  }

  switchProductType($event) {
    this.isPlant = $event.checked;
    const index = this.isPlant ? 1 : 0;
    this.productType = this.productTypes[index];
    this.timeString = this.timeStrings[index];
  }

  getResponseData() {
    return {
      isPlant: this.isPlant,
      name: this.formGroup1.get('firstCtrl').value,
      available: this.formGroup2.get('firstCtrl').value,
      time: this.formGroup3.get('firstCtrl').value,
      price: this.formGroup4.get('firstCtrl').value,
    };
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
