import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { GardenService } from '../garden.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { count } from 'rxjs/operators';
import { GardenBackendModel, Garden } from '../garden.model';
import { parseISOString } from '../../date';

@Component({
  selector: 'app-garden-dashboard',
  templateUrl: './garden-dashboard.component.html',
  styleUrls: ['./garden-dashboard.component.css'],
})
export class GardenDashboardComponent implements OnInit, OnDestroy {
  private authStatusSub: Subscription;
  userId: string;
  garden: Garden;

  gardenId: string;
  gridSettings = {
    cols: 3,
  };

  constructor(
    private authService: AuthService,
    public gardensService: GardenService,
    public route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userId = this.authService.getUserId();
      });
    this.route.paramMap.subscribe((paramMap) => {
      this.gardenId = paramMap.get('gardenId');
      this.getGarden();
      // setInterval(this.getGarden.bind(this), 10000);
    });
  }

  public getGarden() {
    this.gardensService
      .getGarden(this.gardenId)
      .subscribe((data: { message: string; garden: GardenBackendModel }) => {
        console.log(data.garden.temperature);
        this.gridSettings.cols = data.garden.width;
        this.garden = {
          ...data.garden,
          id: data.garden._id,
          empty:
            +data.garden.width * +data.garden.height - data.garden.occupied,
        };
      });
  }

  addWater(cap) {
    this.garden.water += cap;
    this.gardensService
      .updateGarden(this.gardenId, this.garden)
      .subscribe((result: { message: string; garden: GardenBackendModel }) => {
        this.garden.water = result.garden.water;
      });
  }

  addTemperature(cap) {
    this.garden.temperature += cap;
    this.gardensService
      .updateGarden(this.gardenId, this.garden)
      .subscribe((result: { message: string; garden: GardenBackendModel }) => {
        this.garden.temperature = result.garden.temperature;
      });
  }

  getImagePath(slot) {
    let order = 0;
    if (slot.timePlanted != null) {
      const DAY = 24 * 3600 * 1000;
      var timePlanted = parseISOString(slot.timePlanted).getTime();
      var finishDate = timePlanted + slot.timeToGrow;
      finishDate += DAY;
      var currentDate = new Date().getTime();
      var divider = slot.timeToGrow / 2;
      if (finishDate > currentDate) order = 3;
      else if (timePlanted + divider < currentDate) order = 2;
      else order = 1;
    }
    return '../../../assets/images/slot' + order + '.png';
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
