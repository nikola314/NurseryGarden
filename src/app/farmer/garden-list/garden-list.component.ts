import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Garden } from '../garden.model';
import { GardenService } from '../garden.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';

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
    private authService: AuthService
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
    // TODO: create garden component and form
    console.log('button works');
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
    this.gardensSub.unsubscribe();
  }
}
