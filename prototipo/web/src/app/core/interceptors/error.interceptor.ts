import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        const detail = error.error?.detail || '';
        if (typeof detail === 'string' && detail.includes('SUSCRIPCION_NO_VIGENTE')) {
          toast.warning(
            'Suscripción No Vigente',
            'La suscripción de su empresa ha vencido o está suspendida. Las operaciones de registro y modificación están restringidas (modo solo lectura).'
          );
        }
      } else if (error.status === 409) {
        const detail = error.error?.detail || '';
        if (typeof detail === 'string') {
          if (detail.includes('LIMITE_PLAN_SUCURSALES')) {
            toast.warning(
              'Límite de Sucursales Alcanzado',
              detail.replace('LIMITE_PLAN_SUCURSALES: ', '')
            );
          } else if (detail.includes('LIMITE_PLAN_USUARIOS')) {
            toast.warning(
              'Límite de Personal Operativo',
              detail.replace('LIMITE_PLAN_USUARIOS: ', '')
            );
          } else if (detail.includes('DOWNGRADE_NO_PERMITIDO')) {
            toast.error(
              'Cambio de Plan No Permitido',
              detail.replace('DOWNGRADE_NO_PERMITIDO: ', '')
            );
          }
        }
      }
      return throwError(() => error);
    })
  );
};
