import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rutas exclusivas de Administrador General (CU04, Dashboard, etc.)
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) {
    return true;
  }
  router.navigate(['/catalogo']);
  return false;
};

/**
 * Guard para rutas de personal operativo / staff interno (Admin, Encargado, Cajero, Logística)
 */
export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isStaff()) {
    return true;
  }
  router.navigate(['/catalogo']);
  return false;
};

/**
 * Guard para módulo de Inventario y Kardex (Admin, Logística o Encargado de Sucursal)
 */
export const inventarioGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const rol = auth.currentUser()?.rol;
  if (rol === 'ADMINISTRADOR' || rol === 'LOGISTICA' || rol === 'ENCARGADO_SUCURSAL') {
    return true;
  }
  router.navigate(['/catalogo']);
  return false;
};

/**
 * Guard para módulo de Proveedores Textiles (Admin o Logística)
 */
export const proveedoresGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const rol = auth.currentUser()?.rol;
  if (rol === 'ADMINISTRADOR' || rol === 'LOGISTICA') {
    return true;
  }
  router.navigate(['/catalogo']);
  return false;
};
