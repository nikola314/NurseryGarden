import { Component, OnInit } from '@angular/core';
import { Post } from './posts/post.model';
import { AuthService } from './auth/auth.service';
import { GardenService } from './farmer/garden.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Nursery Garden';
  notificationMessage = null;

  constructor(
    private authService: AuthService,
    private gardensService: GardenService
  ) {}

  ngOnInit() {
    this.authService.autoAuthUser();

    if (this.authService.getUser()) {
      this.getNotification();
    }
    this.gardensService.getUpdateListener().subscribe((params) => {
      if (this.authService.getUser()) {
        this.getNotification();
      }
    });

    this.authService.getAuthStatusListener().subscribe((log) => {
      if (log == false) this.notificationMessage = null;
      else this.getNotification();
    });
  }

  private getNotification() {
    this.gardensService.getNotificationGardens().subscribe((response) => {
      if (response.gardens.length == 0) {
        this.notificationMessage = null;
      } else {
        this.notificationMessage = 'Gardens: ';
        for (let garden of response.gardens) {
          this.notificationMessage += garden.name;
        }
        this.notificationMessage += ' require your attention';
      }
    });
  }
}
