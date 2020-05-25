import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { GardenService } from '../garden.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { GardenBackendModel, Garden, Slot } from '../garden.model';
import { parseISOString } from '../../date';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Order } from '../../product/order.model';

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
  warehouseDisplayedColumns: string[] = ['name', 'count', 'isPlant'];
  ordersDisplayedColumns: string[] = ['product.name', 'count', 'isPickedUp'];
  popoverPlantDisplayedColumns: string[] = ['product.name', 'count'];

  plantArray;
  warehouseDataSource: MatTableDataSource<any>;
  ordersDataSource: MatTableDataSource<any>;

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

  @ViewChild(MatSort, { static: true }) sort: MatSort;

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
        // if changed logout
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

  getSuplementsInWarehouse() {
    return this.garden.warehouse.filter(function (value) {
      return !value.product.isPlant && value.count > 0;
    });
  }

  getPlantsInWarehouse() {
    return this.garden.warehouse.filter(function (value) {
      return value.product.isPlant && value.count > 0;
    });
  }

  public getGarden() {
    this.gardensService
      .getGarden(this.gardenId)
      .subscribe((data: { message: string; garden: GardenBackendModel }) => {
        this.gridSettings.cols = data.garden.width;
        this.garden = {
          ...data.garden,
          id: data.garden._id,
          empty:
            +data.garden.width * +data.garden.height - data.garden.occupied,
        };
        // Warehouse table
        this.warehouseDataSource = new MatTableDataSource(
          this.garden.warehouse.map((x) => {
            return {
              name: x.product.name,
              count: x.count,
              isPlant: x.product.isPlant ? 'Plant' : 'Suplement',
            };
          })
        );
        this.warehouseDataSource.sort = this.sort;

        // Orders table
        this.ordersDataSource = new MatTableDataSource(
          this.garden.orders.map((x) => {
            return {
              name: x.product.name,
              isPickedUp: x.isPickedUp,
              count: x.count,
            };
          })
        );
      });
  }

  addWater(cap) {
    this.garden.water += cap;
    this.gardensService
      .updateGarden(this.garden)
      .subscribe((result: { message: string; garden: GardenBackendModel }) => {
        this.garden.water = result.garden.water;
      });
  }

  addTemperature(cap) {
    this.garden.temperature += cap;
    this.gardensService
      .updateGarden(this.garden)
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

  calculateCooldownProgress(slot) {
    if (this.getState(slot) != this.SLOT_STATES.COOLDOWN) return 0;
    var min = parseISOString(slot.timePlanted).getTime();
    const DAY = 1000 * 60 * 60 * 24;
    var input = this.currentDate.getTime();
    var correctedStartValue = input - min;
    return (correctedStartValue * 100) / DAY;
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

  applySuplement(slot: Slot, row: { product: any; count: number }) {
    let timePlanted = parseISOString(slot.timePlanted).getTime();
    let newTime = timePlanted - row.product.time;
    slot.timePlanted = new Date(newTime).toISOString();
    slot.product = slot.product._id;
    console.log('old time: ' + timePlanted);
    console.log('new time: ' + newTime);

    let suplement = this.garden.warehouse.find(
      (el) => el.product._id == row.product._id
    );
    suplement.count--;
    this.gardensService
      .updateSlot(slot)
      .subscribe((result: { message: string; slot: Slot }) => {
        let sl = this.garden.slots.find((el) => el._id == slot._id);
        sl.product = slot.product;
        sl.timePlanted = slot.timePlanted;
        console.log('got here');
        console.log(parseISOString(slot.timePlanted).getTime());
      });
    this.gardensService
      .updateGarden(this.garden)
      .subscribe((result: { message: string; garden: GardenBackendModel }) => {
        this.getGarden();
      });
  }

  plant(slot: Slot, row: { product: any; count: number }) {
    slot.timePlanted = this.currentDate.toISOString();
    slot.product = row.product._id;
    let plant = this.garden.warehouse.find(
      (el) => el.product._id == row.product._id
    );
    plant.count--;
    this.garden.occupied++;
    this.gardensService
      .updateSlot(slot)
      .subscribe((result: { message: string; slot: Slot }) => {
        let sl = this.garden.slots.find((el) => el._id == slot._id);
        sl.product = slot.product;
        sl.timePlanted = slot.timePlanted;
      });
    this.gardensService
      .updateGarden(this.garden)
      .subscribe((result: { message: string; garden: GardenBackendModel }) => {
        this.getGarden();
      });
  }

  takeOutFinishedPlant(slot) {
    slot.product = null;
    slot.timePlanted = this.currentDate.toISOString();
    this.gardensService
      .updateSlot(slot)
      .subscribe((result: { message: string; slot: Slot }) => {
        let sl = this.garden.slots.find((el) => el._id == slot._id);
        sl.product = slot.product;
        sl.timePlanted = slot.timePlanted;
      });
    // todo: handle number of occupied slots after finished digging
  }

  isCooldownOver(slot) {
    if (slot.product != null || slot.timePlanted == null) return false;
    var timePlanted = parseISOString(slot.timePlanted).getTime();
    const DAY = 1000 * 60 * 60 * 24;
    if (this.currentDate.getTime() - timePlanted > DAY) {
      return true;
    }
    return false;
  }

  applyWarehouseFilter($event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.warehouseDataSource.filter = filterValue.trim().toLowerCase();
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
