import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData, SignedUserData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/auth/';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string;
  private authStatusLIstener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer;
  constructor(private http: HttpClient, private router: Router) {}

  private user: SignedUserData = null;

  getToken() {
    return this.token;
  }

  getAuthStatusListener() {
    return this.authStatusLIstener.asObservable();
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getUserId() {
    if (this.user) return this.user.userId;
    return null;
  }

  getUser() {
    return this.user;
  }

  createUser(authData: AuthData) {
    return this.http.post(BACKEND_URL + 'signup', authData).subscribe(
      (response) => {
        this.router.navigate(['/login']);
      },
      (error) => {
        this.authStatusLIstener.next(false);
      }
    );
  }

  changePassword(passData) {
    console.log(JSON.stringify(passData));
    return this.http.post(BACKEND_URL + 'changePassword', passData).subscribe(
      (response) => {
        this.logout();
      },
      (error) => {
        this.authStatusLIstener.next(false);
      }
    );
  }

  login(username: string, password: string) {
    const loginData = {
      username: username,
      password: password,
    };
    this.http
      .post<{
        userData: SignedUserData;
      }>(BACKEND_URL + 'login', loginData)
      .subscribe(
        (response) => {
          const token = response.userData.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.userData.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.user = response.userData;
            this.authStatusLIstener.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData(response.userData, expirationDate);
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.authStatusLIstener.next(false);
        }
      );
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInfo.user.token;
      this.isAuthenticated = true;
      this.user = authInfo.user;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusLIstener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusLIstener.next(false);
    this.user = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private saveAuthData(userData: SignedUserData, expirationDate: Date) {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('isAdmin', String(userData.isAdmin));
    localStorage.setItem('isCompany', String(userData.isCompany));
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('isCompany');
  }

  private getAuthData() {
    const expirationDate = localStorage.getItem('expiration');
    const user: SignedUserData = {
      token: localStorage.getItem('token'),
      userId: localStorage.getItem('userId'),
      isAdmin: JSON.parse(localStorage.getItem('isAdmin')),
      isCompany: JSON.parse(localStorage.getItem('isCompany')),
      expiresIn: 0, // TODO: not needed
    };

    if (!user.token || !expirationDate) {
      return;
    }
    return {
      user: user,
      expirationDate: new Date(expirationDate),
    };
  }
}
