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
    // TODO: not working well
    let order = 0;
    if (slot.timePlanted != null) {
      const DAY = 24 * 3600 * 1000;
      var timePlanted = parseISOString(slot.timePlanted).getTime();
      var finishDate = timePlanted + slot.product.time;
      finishDate += DAY;
      var currentDate = new Date().getTime();
      var divider = slot.product.time / 2;
      if (currentDate > finishDate) order = 3;
      else if (timePlanted + divider < currentDate) order = 2;
      else order = 1;
    }
    return '../../../assets/images/slot' + order + '.png';
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  // testing
  getCurrentTime() {
    return new Date().getTime();
  }

  getDiff(d1, d2) {
    return d1 - d2;
  }
  parseISOString(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  }
}
