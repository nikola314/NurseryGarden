import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { NgForm, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';
import { AuthData } from '../../auth/auth-data.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css'],
})
export class RequestsComponent implements OnInit, OnDestroy {
  private authStatusSub: Subscription;
  private accountsSub: Subscription;

  pendingUsers = new MatTableDataSource<AuthData>([]);
  displayedColumns: string[] = [
    'firstName',
    'lastName',
    'username',
    'email',
    'isCompany',
    'location',
    'approved',
  ];

  constructor(
    public authService: AuthService,
    public requestsDialog: MatDialog
  ) {}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit() {
    this.pendingUsers.paginator = this.paginator;
    this.accountsSub = this.authService
      .getAccountsListener()
      .subscribe((accounts) => {
        this.pendingUsers.data = accounts;
      });
    this.authService.getUsers();
  }

  approveUser(user: AuthData) {
    user.approved = true;
    this.authService.updateUser(user).subscribe(() => {
      this.authService.getUsers();
    });
  }

  deleteUser(user) {
    this.authService.deleteUser(user).subscribe(() => {
      this.authService.getUsers();
    });
  }

  editUser(user) {
    const dialogRef = this.requestsDialog.open(RequestsDialog, {
      data: {
        user: user,
        dialogType: DIALOG_TYPE.UPDATE,
      },
    });
    dialogRef.afterClosed().subscribe((result: RequestsDialogData) => {
      if (result) {
        this.authService.updateUser(result).subscribe(() => {
          this.authService.getUsers();
        });
      }
    });
  }

  newUser() {
    const dialogRef = this.requestsDialog.open(RequestsDialog, {
      data: {
        user: null,
        dialogType: DIALOG_TYPE.ADD,
      },
    });
    dialogRef.afterClosed().subscribe((result: RequestsDialogData) => {
      if (result) {
        this.authService.createUser(result, false);
      }
    });
  }

  ngOnDestroy() {
    this.accountsSub.unsubscribe();
  }
}

// ----------------------------------------------  DIALOG  ------------------------------------------------------

export interface RequestsDialogData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  phone: string;
  location: string;
  date: Date;
  isCompany: boolean;
  approved: boolean;
}

let DIALOG_TYPE = {
  ADD: 1,
  UPDATE: 2,
};

@Component({
  selector: 'requests-dialog',
  templateUrl: './requests-dialog.html',
  styleUrls: ['./requests-dialog.css'],
})
export class RequestsDialog {
  data: RequestsDialogData = {
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    location: '',
    approved: false,
    date: new Date(),
    isCompany: false,
  };

  isCompany = false;
  approved = false;
  firstNamePlaceholders = ['First Name', 'Full Company Name'];
  firstNamePlaceholder = this.firstNamePlaceholders[0];
  usernamePlaceholders = ['Username', 'Unique Company Alias'];
  usernamePlaceholder = this.usernamePlaceholders[0];
  accountTypes = ['Farmer', 'Company'];
  accountType = this.accountTypes[0];
  submitButtonText = 'Add';
  dialogTitle = 'Create new user';
  isApprovedTexts = ['NotApproved', 'Approved'];
  isApprovedText = this.isApprovedTexts[0];

  constructor(
    public dialogRef: MatDialogRef<RequestsDialog>,
    @Inject(MAT_DIALOG_DATA) public inputData: any
  ) {
    if (inputData.dialogType == DIALOG_TYPE.UPDATE) {
      this.submitButtonText = 'Save';
      this.dialogTitle = 'Modify user';
      this.populateDataFields(inputData.user);
    }
  }

  private populateDataFields(user: AuthData) {
    if (!user) return;
    this.data = user;

    this.isCompany = this.data.isCompany;
    let index = this.isCompany ? 1 : 0;
    this.usernamePlaceholder = this.usernamePlaceholders[index];
    this.firstNamePlaceholder = this.firstNamePlaceholders[index];
    this.accountType = this.accountTypes[index];
    this.approved = this.data.approved;
    index = this.approved ? 1 : 0;
    this.isApprovedText = this.isApprovedTexts[index];
  }

  switchIsApproved($event: MatSlideToggleChange) {
    this.approved = $event.checked;
    this.data.approved = this.approved;
    const index = this.approved ? 1 : 0;
    this.isApprovedText = this.isApprovedTexts[index];
  }

  switchAccountType($event: MatSlideToggleChange) {
    this.isCompany = $event.checked;
    const index = this.isCompany ? 1 : 0;
    this.usernamePlaceholder = this.usernamePlaceholders[index];
    this.firstNamePlaceholder = this.firstNamePlaceholders[index];
    this.accountType = this.accountTypes[index];
    this.data.isCompany = this.isCompany;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
