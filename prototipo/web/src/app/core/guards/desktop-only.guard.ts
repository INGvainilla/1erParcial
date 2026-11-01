import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class DesktopOnlyGuard implements CanActivate {
  private router = inject(Router);
  private toast = inject(ToastService);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (typeof window === 'undefined') {
      return true;
    }

    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 768;

    if (isMobileUserAgent || isSmallScreen) {
      this.toast.error(
        'Acceso Restringido (CU20)',
        'El módulo de Compras y Aprovisionamiento es exclusivo para la versión Web Desktop (Pantalla >= 768px).'
      );
      this.router.navigate(['/admin/pos']);
      return false;
    }

    return true;
  }
}

