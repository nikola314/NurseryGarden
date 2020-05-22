import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Subscription } from 'rxjs';
import { AuthData } from '../../auth/auth-data.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

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

  constructor(public authService: AuthService) {}

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

  newUser() {
    console.log('newUser()');
  }

  ngOnDestroy() {
    this.accountsSub.unsubscribe();
  }
}
