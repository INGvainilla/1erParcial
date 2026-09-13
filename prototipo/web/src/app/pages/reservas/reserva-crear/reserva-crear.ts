import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ReservaService, ReservaCreate, ReservaDetalleCreate } from '../../../shared/services/reserva.service';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { AuthService } from '../../../core/services/auth.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { ToastService } from '../../../core/services/toast.service';
import { FashionApiService } from '../../../core/services/fashion-api.service';
import { Sucursal, CatalogoItem } from '../../../core/models/fashion.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-reserva-crear',
  styleUrl: './reserva-crear.css',
  templateUrl: './reserva-crear.html',
})
export class ReservaCrear implements OnInit {
  sucursales: any[] = [];
  selectedSucursal: number | null = null;
  fechaVisita: string = '';
  horaVisita: string = '';
  
  // Lista dinámica de prendas a reservar (CU11)
  cartItems: ReservaDetalleCreate[] = [];

  // Catálogo rápido para agregar más prendas si lo desea
  catalogoDisponibles: CatalogoItem[] = [];
  mostrarSelectorPrendas: boolean = false;

  errorMessage: string = '';
  isLoading: boolean = false;

  private http = inject(HttpClient);
  private reservaService = inject(ReservaService);
  private router = inject(Router);
  auth = inject(AuthService);
  private carritoService = inject(CarritoService);
  private toast = inject(ToastService);
  private api = inject(FashionApiService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // 1. Verificar sesión
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Inicio de Sesión Requerido', 'Inicia sesión para reservar tus prendas y probador en sucursal.');
      this.router.navigate(['/login']);
      return;
    }

    // 2. Establecer fecha por defecto (mañana) y hora habitual
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 1);
    this.fechaVisita = fecha.toISOString().split('T')[0];
    this.horaVisita = '11:00';

    // 3. Cargar sucursales de la base de datos
    this.cargarSucursales();

    // 4. Cargar prendas seleccionadas desde navegación o carrito
    this.inicializarPrendas();

    // 5. Cargar catálogo disponible para añadir prendas adicionales
    this.cargarCatalogo();
  }

  cargarSucursales() {
    this.http.get<any[]>(`${API_BASE_URL}/sucursales`).subscribe({
      next: (data) => {
        this.sucursales = data || [];
        // Si vino una sucursal en el estado de navegación, seleccionarla
        const state = history.state;
        if (state && state.id_sucursal) {
          this.selectedSucursal = state.id_sucursal;
        } else if (this.sucursales.length > 0 && !this.selectedSucursal) {
          this.selectedSucursal = this.sucursales[0].id_sucursal;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al consultar sucursales', err);
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarSucursal(idSucursal: number) {
    this.selectedSucursal = idSucursal;
    this.cdr.detectChanges();
  }

  inicializarPrendas() {
    const state = history.state;
    if (state && Array.isArray(state.items) && state.items.length > 0) {
      // Viene desde el Catálogo o desde el Carrito con prendas seleccionadas
      this.cartItems = state.items.map((it: any) => ({
        id_producto: it.id_producto,
        talla: it.talla || 'M',
        color: it.color || 'Azul Marino',
        cantidad: it.cantidad || 1,
        nombre_producto: it.nombre_producto || it.nombre || `Prenda #${it.id_producto}`,
        codigo_sku_base: it.codigo_sku_base || '',
        imagen_principal: it.imagen_principal || ''
      }));
    } else if (this.carritoService.items().length > 0) {
      // Viene con ítems en el carrito activo
      this.cartItems = this.carritoService.items().map(it => ({
        id_producto: it.id_producto,
        talla: it.talla,
        color: it.color,
        cantidad: it.cantidad,
        nombre_producto: it.nombre_producto,
        codigo_sku_base: it.codigo_sku_base,
        imagen_principal: it.imagen_principal
      }));
    }
  }

  cargarCatalogo() {
    this.api.getCatalogo().subscribe({
      next: (data) => {
        this.catalogoDisponibles = data || [];
        // No pre-cargar ninguna prenda por defecto: el usuario debe elegir sus prendas libremente
        this.cdr.detectChanges();
      },
      error: () => this.cdr.detectChanges()
    });
  }

  agregarPrenda(prod: CatalogoItem) {
    const tallas = (prod.tallas && prod.tallas.length > 0) ? prod.tallas.map(t => t.talla) : ['S', 'M', 'L', 'XL'];
    const colores = (prod.colores && prod.colores.length > 0) ? prod.colores.map(c => c.color_nombre) : ['Azul Marino', 'Negro', 'Gris'];
    const colorNom = colores[0];
    const tallaNom = tallas[0];
    this.cartItems.push({
      id_producto: prod.id_producto,
      nombre_producto: prod.nombre,
      codigo_sku_base: prod.codigo_sku_base,
      talla: tallaNom,
      color: colorNom,
      cantidad: 1,
      imagen_principal: prod.imagen_principal,
      tallas_disponibles: tallas,
      colores_disponibles: colores
    } as any);
    this.mostrarSelectorPrendas = false;
    this.toast.success('Prenda Añadida', `${prod.nombre} agregada a la reserva.`);
    this.cdr.detectChanges();
  }

  incrementarCantidad(item: ReservaDetalleCreate) {
    item.cantidad = (item.cantidad || 1) + 1;
    this.cdr.detectChanges();
  }

  decrementarCantidad(item: ReservaDetalleCreate) {
    if (item.cantidad > 1) {
      item.cantidad -= 1;
      this.cdr.detectChanges();
    }
  }

  eliminarPrenda(index: number) {
    this.cartItems.splice(index, 1);
    this.cdr.detectChanges();
  }

  crearReserva() {
    if (!this.selectedSucursal || !this.fechaVisita || !this.horaVisita) {
      this.errorMessage = 'Por favor complete todos los campos obligatorios (Sucursal, Fecha y Hora).';
      this.toast.warning('Datos incompletos', this.errorMessage);
      return;
    }

    if (this.cartItems.length === 0) {
      this.errorMessage = 'Debes incluir al menos una prenda para reservar tu probador.';
      this.toast.warning('Sin prendas', this.errorMessage);
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    // Combinar fecha y hora en formato local ISO sin desplazamiento UTC
    const fechaHoraLocal = `${this.fechaVisita}T${this.horaVisita}:00`;

    const payload: ReservaCreate = {
      id_sucursal: this.selectedSucursal,
      fecha_visita: fechaHoraLocal,
      detalles: this.cartItems.map(it => ({
        id_producto: it.id_producto,
        talla: it.talla,
        color: it.color,
        cantidad: it.cantidad
      }))
    };

    this.reservaService.crearReserva(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        try {
          sessionStorage.setItem('reserva_activa', JSON.stringify(response));
        } catch (e) {
          console.warn('Error guardando reserva en sessionStorage', e);
        }
        this.toast.success('¡Reserva Confirmada!', 'Se ha generado tu Ticket QR oficial.');
        this.cdr.detectChanges();
        // Navegar a la pantalla del Ticket pasando los datos completos de la reserva
        this.router.navigate(['/reservas/ticket'], { state: { reserva: response } });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400) {
          const detail = err.error?.detail || 'Stock insuficiente en la sucursal elegida.';
          this.errorMessage = detail;
          this.toast.error('Disponibilidad Física', detail);
        } else {
          this.errorMessage = 'Ocurrió un error al procesar la reserva. Intente nuevamente.';
          this.toast.error('Error de Reserva', this.errorMessage);
        }
        this.cdr.detectChanges();
      }
    });
  }
}
