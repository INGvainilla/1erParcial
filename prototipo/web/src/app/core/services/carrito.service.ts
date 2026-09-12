import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export interface CarritoItem {
  id_item: number;
  id_producto: number;
  nombre_producto: string;
  codigo_sku_base: string;
  imagen_principal?: string | null;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  stock_maximo_disponible: number;
}

export interface CarritoData {
  id_carrito: number;
  id_usuario: number;
  estado: string;
  total_items: number;
  total_general: number;
  items: CarritoItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  private apiUrl = `${API_BASE_URL}/carrito`;

  // Signals de Estado Reactivo (Angular 17+)
  readonly cart = signal<CarritoData | null>(null);
  readonly isOpen = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly actionLoadingId = signal<number | null>(null);

  // Propiedades calculadas derivadas
  readonly items = computed(() => this.cart()?.items ?? []);
  readonly totalItems = computed(() => this.cart()?.total_items ?? 0);
  readonly totalGeneral = computed(() => this.cart()?.total_general ?? 0);

  constructor() {
    // Si el usuario ya está autenticado, cargar su carrito activo
    if (this.auth.currentUser()) {
      this.cargarCarrito();
    }
  }

  openCart(): void {
    this.isOpen.set(true);
    if (!this.cart() && this.auth.currentUser()) {
      this.cargarCarrito();
    }
  }

  closeCart(): void {
    this.isOpen.set(false);
  }

  toggleCart(): void {
    if (this.isOpen()) {
      this.closeCart();
    } else {
      this.openCart();
    }
  }

  /**
   * CU13: Carga el carrito del usuario autenticado
   */
  cargarCarrito(): void {
    if (!this.auth.currentUser()) return;

    this.loading.set(true);
    this.http.get<CarritoData>(this.apiUrl, { headers: this.auth.getAuthHeaders() }).pipe(
      tap(data => {
        this.cart.set(data);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        console.error('Error cargando carrito:', err);
        return throwError(() => err);
      })
    ).subscribe();
  }

  /**
   * CU13: Añadir producto al carrito con validación atómica
   */
  agregarItem(id_producto: number, talla: string, color: string, cantidad: number = 1): Observable<CarritoData> {
    if (!this.auth.currentUser()) {
      this.toast.info('Sesión requerida', 'Debes iniciar sesión para agregar productos a tu carrito.');
      return throwError(() => new Error('No autenticado'));
    }

    this.loading.set(true);
    const body = { id_producto, talla, color, cantidad };

    return this.http.post<CarritoData>(`${this.apiUrl}/items`, body, {
      headers: this.auth.getAuthHeaders()
    }).pipe(
      tap(data => {
        this.cart.set(data);
        this.loading.set(false);
        this.toast.success('¡Prenda agregada!', `Se añadió al carrito (${talla} - ${color}).`);
        this.openCart();
      }),
      catchError(err => {
        this.loading.set(false);
        const detail = err.error?.detail || 'No se pudo agregar el producto al carrito.';
        this.toast.warning('Existencias Insuficientes', detail);
        return throwError(() => err);
      })
    );
  }

  /**
   * CU13: Modificar cantidad de un ítem existente
   */
  actualizarCantidad(id_item: number, nuevaCantidad: number): void {
    if (nuevaCantidad < 1) {
      this.eliminarItem(id_item);
      return;
    }

    this.actionLoadingId.set(id_item);
    this.http.patch<CarritoData>(`${this.apiUrl}/items/${id_item}`, { cantidad: nuevaCantidad }, {
      headers: this.auth.getAuthHeaders()
    }).pipe(
      tap(data => {
        this.cart.set(data);
        this.actionLoadingId.set(null);
      }),
      catchError(err => {
        this.actionLoadingId.set(null);
        const detail = err.error?.detail || 'No es posible actualizar la cantidad.';
        this.toast.warning('Límite de Stock', detail);
        return throwError(() => err);
      })
    ).subscribe();
  }

  /**
   * CU13: Quitar ítem del carrito
   */
  eliminarItem(id_item: number): void {
    this.actionLoadingId.set(id_item);
    this.http.delete<CarritoData>(`${this.apiUrl}/items/${id_item}`, {
      headers: this.auth.getAuthHeaders()
    }).pipe(
      tap(data => {
        this.cart.set(data);
        this.actionLoadingId.set(null);
        this.toast.info('Producto removido', 'Se quitó la prenda de tu carrito.');
      }),
      catchError(err => {
        this.actionLoadingId.set(null);
        const detail = err.error?.detail || 'Error al eliminar el ítem.';
        this.toast.error('Error', detail);
        return throwError(() => err);
      })
    ).subscribe();
  }

  /**
   * CU13: Vaciar todos los ítems del carrito
   */
  vaciarCarrito(): void {
    if (!confirm('¿Estás seguro de que deseas vaciar todo tu carrito de compras?')) return;

    this.loading.set(true);
    this.http.delete<CarritoData>(this.apiUrl, {
      headers: this.auth.getAuthHeaders()
    }).pipe(
      tap(data => {
        this.cart.set(data);
        this.loading.set(false);
        this.toast.info('Carrito vacío', 'Se eliminaron todos los productos de tu carrito.');
      }),
      catchError(err => {
        this.loading.set(false);
        const detail = err.error?.detail || 'Error al vaciar el carrito.';
        this.toast.error('Error', detail);
        return throwError(() => err);
      })
    ).subscribe();
  }
}
