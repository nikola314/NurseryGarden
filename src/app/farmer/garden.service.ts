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

  //  ------------------------------------------------------------------------------------------------------------------------

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>(BACKEND_URL + id);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null,
      };
    }

    this.http.put(BACKEND_URL + id, postData).subscribe((response) => {
      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }
}
