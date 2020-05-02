import { Garden, GardenBackendModel } from './garden.model';
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

  updateGarden(id: string, garden: Garden) {
    let updateData = {
      temperature: garden.temperature,
      occupied: garden.occupied,
      water: garden.water,
    };

    return this.http.put(BACKEND_URL + id, updateData);
  }
  //  ----------------------------------------------------------------------------------------------------------------------

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}
