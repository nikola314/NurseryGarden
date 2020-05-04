import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { GardenService } from '../garden.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GardenBackendModel, Garden } from '../garden.model';
import { parseISOString } from '../../date';

@Component({
  selector: 'app-garden-dashboard',
  templateUrl: './garden-dashboard.component.html',
  styleUrls: ['./garden-dashboard.component.css'],
})
export class GardenDashboardComponent
  implements OnInit, OnDestroy, AfterViewChecked {
  private authStatusSub: Subscription;
  userId: string;
  garden: Garden;
  currentDate: Date = new Date();

  public SLOT_STATES = {
    EMPTY: 0,
    GROWING: 1,
    FINISHED: 3,
    COOLDOWN: 4,
  };

  gardenId: string;
  gridSettings = {
    cols: 3,
  };

  constructor(
    private authService: AuthService,
    public gardensService: GardenService,
    public route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
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

  ngAfterViewChecked() {
    this.currentDate = new Date();
    this.cdRef.detectChanges();
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

  calculateProgress(slot) {
    var input = this.currentDate.getTime();
    var min = parseISOString(slot.timePlanted).getTime();
    var range = slot.product.time;
    var correctedStartValue = input - min;
    return (correctedStartValue * 100) / range;
  }

  getState(slot) {
    var currentDate = this.currentDate.getTime();
    let state = this.SLOT_STATES.EMPTY;
    if (slot.product != null) {
      var timePlanted = parseISOString(slot.timePlanted).getTime();
      var finishDate = timePlanted + slot.product.time;
      if (currentDate > finishDate) state = this.SLOT_STATES.FINISHED;
      else state = this.SLOT_STATES.GROWING;
    } else {
      if (slot.timePlanted != null) {
        var timePlanted = parseISOString(slot.timePlanted).getTime();
        const DAY = 1000 * 60 * 60 * 24;
        if (currentDate - timePlanted < DAY) {
          state = this.SLOT_STATES.COOLDOWN;
        }
      }
    }
    return state;
  }

  getImagePath(slot) {
    let state = this.getState(slot);
    if (state == this.SLOT_STATES.GROWING) {
      var progress = this.calculateProgress(slot);
      if (progress > 50) state = 2;
    }

    return '../../../assets/images/slot' + state + '.png';
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  // testing
  getCurrentTime() {
    return this.currentDate.getTime();
  }

  getDiff(d1, d2) {
    return d1 - d2;
  }
  parseISOString(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
  }

  popupButtonTest() {
    console.log('called');
  }
}
