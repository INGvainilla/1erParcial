import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo: string;
  mensaje: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  show(tipo: 'success' | 'error' | 'warning' | 'info', titulo: string, mensaje: string, duracionMs = 5000): void {
    const id = ++this.counter;
    const newToast: ToastMessage = { id, tipo, titulo, mensaje };
    this.toasts.update(list => [...list, newToast]);

    setTimeout(() => {
      this.remove(id);
    }, duracionMs);
  }

  success(titulo: string, mensaje: string): void {
    this.show('success', titulo, mensaje);
  }

  error(titulo: string, mensaje: string): void {
    this.show('error', titulo, mensaje, 7000);
  }

  warning(titulo: string, mensaje: string): void {
    this.show('warning', titulo, mensaje);
  }

  info(titulo: string, mensaje: string): void {
    this.show('info', titulo, mensaje);
  }

  remove(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
