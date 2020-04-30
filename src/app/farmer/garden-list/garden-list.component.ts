import { Component, ViewChild, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Garden } from '../garden.model';
import { GardenService } from '../garden.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from '@angular/material/dialog';
import { ValidationErrors, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-garden-list',
  templateUrl: './garden-list.component.html',
  styleUrls: ['./garden-list.component.css'],
})
export class GardenListComponent implements OnInit, OnDestroy {
  gardens = new MatTableDataSource<Garden>([]);
  displayedColumns: string[] = [
    'name',
    'location',
    'occupied',
    'empty',
    'water',
    'temperature',
  ];

  private gardensSub: Subscription;
  private authStatusSub: Subscription;

  userIsAuthenticated = false;
  userId: string;

  constructor(
    public gardensService: GardenService,
    private authService: AuthService,
    public gardenCreateDialog: MatDialog
  ) {}

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit() {
    this.gardens.paginator = this.paginator;
    this.gardensService.getGardens();
    this.gardensSub = this.gardensService
      .getGardensUpdateListener()
      .subscribe((gardenData) => {
        this.gardens.data = gardenData.gardens;
      });
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  newGarden() {
    console.log('in');
    if (!this.authService.getIsAuthenticated()) return;
    console.log('after if');
    const dialogRef = this.gardenCreateDialog.open(GardenCreateDialog, {
      data: null,
    });
    console.log('dialogRef = ' + dialogRef);
    dialogRef.afterClosed().subscribe((result: GardenCreateDialogData) => {
      if (result) {
        if (
          this.isEmptyString(result.name) ||
          this.isEmptyString(result.location)
        )
          return;
        this.gardensService.addGarden({
          ...result,
          occupied: 0,
          temperature: 18,
          water: 200,
        });
      }
    });
  }

  private isEmptyString(str: string) {
    return !str || str.length == 0;
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.gardensSub.unsubscribe();
  }
}

// ------------------------------------------------------------------------------------------------------------------

export interface GardenCreateDialogData {
  name: string;
  location: string;
  width: number;
  height: number;
}

@Component({
  selector: 'garden-create-dialog',
  templateUrl: './garden-create-dialog.html',
  styleUrls: ['./garden-create-dialog.css'],
})
export class GardenCreateDialog {
  data: GardenCreateDialogData = {
    name: '',
    location: '',
    width: 1,
    height: 1,
  };
  constructor(
    public dialogRef: MatDialogRef<GardenCreateDialog>,
    @Inject(MAT_DIALOG_DATA) public inputData: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  static dimensionGreaterThanZero(
    control: AbstractControl
  ): ValidationErrors | null {
    if ((control.value as number) < 1) {
      return { shouldBeGreaterThanZero: true };
    }
    return null;
  }
}
