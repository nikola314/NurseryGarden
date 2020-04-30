import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService } from './auth/auth.service';

@Injectable()
export class HomePageGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | import('@angular/router').UrlTree> {
    // TODO: redirect based on user type
    const user = this.authService.getUser();
    if (!user) return true;

    if (user.isAdmin) {
      this.router.navigate(['/requests']);
    } else if (user.isCompany) {
      this.router.navigate(['/orders']);
    } else {
      this.router.navigate(['/gardens']);
    }
  }
}
