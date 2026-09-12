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

/**
 * Guard para rutas del Encargado de Sucursal (CU12: Preparar y Atender Reservas)
 */
export const encargadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const rol = auth.currentUser()?.rol;
  if (rol === 'ADMINISTRADOR' || rol === 'ENCARGADO_SUCURSAL') {
    return true;
  }
  router.navigate(['/catalogo']);
  return false;
};

/**
 * Guard para rutas del Punto de Venta / Terminal POS (CU15)
 * Permite acceso a Cajeros, Encargados de Sucursal y Administradores
 */
export const posGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const rol = auth.currentUser()?.rol;
  if (rol === 'ADMINISTRADOR' || rol === 'ENCARGADO_SUCURSAL' || rol === 'CAJERO') {
    return true;
  }
  router.navigate(['/catalogo']);
  return false;
};

/**
 * Guard para rutas de Logística y Despacho de Delivery (CU18)
 * Permite acceso a personal de LOGISTICA y ADMINISTRADOR
 */
export const logisticaGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const rol = auth.currentUser()?.rol;
  if (rol === 'ADMINISTRADOR' || rol === 'LOGISTICA' || rol === 'ENCARGADO_SUCURSAL') {
    return true;
  }
  router.navigate(['/catalogo']);
  return false;
};



