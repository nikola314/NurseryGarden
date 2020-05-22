import { Garden, GardenBackendModel, Slot } from './garden.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/gardens/';

@Injectable({ providedIn: 'root' })
export class GardenService {
  private gardens: Garden[] = [];
  private gardensUpdated = new Subject<{
    gardens: Garden[];
  }>();

  constructor(private http: HttpClient, private router: Router) {}

  getGardens() {
    this.http
      .get<{ message: string; gardens: GardenBackendModel[] }>(BACKEND_URL)
      .pipe(
        map((gardenData) => {
          return {
            gardens: gardenData.gardens.map((garden) => {
              return {
                name: garden.name,
                location: garden.location,
                water: garden.water,
                temperature: garden.temperature,
                occupied: garden.occupied,
                empty: garden.width * garden.height - garden.occupied,
                width: garden.width,
                height: garden.height,
                id: garden._id,
                slots: garden.slots,
                warehouse: garden.warehouse,
                orders: garden.orders,
              };
            }),
          };
        })
      )
      .subscribe((gardenData) => {
        this.gardens = gardenData.gardens;
        this.gardensUpdated.next({
          gardens: [...this.gardens],
        });
      });
  }

  addGarden(data) {
    this.http
      .post<{ message: string; garden: any }>(BACKEND_URL, data)
      .subscribe((responseData) => {
        this.getGardens();
      });
  }

  getGardensUpdateListener() {
    return this.gardensUpdated.asObservable();
  }

  getGarden(id: string) {
    return this.http.get<{ message: string; garden: GardenBackendModel }>(
      BACKEND_URL + id
    );
  }

  // updateGardenWaterAndTemperature(id: string, garden: Garden) {
  //   // TODO: change to send and recieve +/- 1 instead of value
  //   let updateData = {
  //     temperature: garden.temperature,
  //     occupied: garden.occupied,
  //     water: garden.water,
  //   };
  //   return this.http.put(BACKEND_URL + id, updateData);
  // }

  updateGarden(garden: Garden) {
    let updateData = {
      occupied: garden.occupied,
      warehouse: garden.warehouse,
      water: garden.water,
      temperature: garden.temperature,
    };
    return this.http.put(BACKEND_URL + garden.id, updateData);
  }

  updateSlot(slot: Slot) {
    let updateData = {
      timePlanted: slot.timePlanted,
      product: slot.product,
    };
    return this.http.put(BACKEND_URL + 'slot/' + slot._id, updateData);
  }

  //  ----------------------------------------------------------------------------------------------------------------------

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}
