import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReservaService, ReservaCreate, ReservaDetalleCreate } from '../../../shared/services/reserva.service';
import { API_BASE_URL } from '../../../core/constants/api.constants';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-reserva-crear',
  styleUrl: './reserva-crear.css',
  templateUrl: './reserva-crear.html',
})
export class ReservaCrear implements OnInit {
  sucursales: any[] = [];
  selectedSucursal: number | null = null;
  fechaVisita: string = '';
  horaVisita: string = '';
  
  // Mocking the shopping cart/pre-selected items for CU11
  cartItems: ReservaDetalleCreate[] = [
    { id_producto: 1, talla: 'M', color: 'Azul', cantidad: 1 },
    { id_producto: 2, talla: 'L', color: 'Negro', cantidad: 2 }
  ];

  errorMessage: string = '';
  isLoading: boolean = false;

  private http = inject(HttpClient);
  private reservaService = inject(ReservaService);
  private router = inject(Router);

  ngOnInit() {
    this.cargarSucursales();
  }

  cargarSucursales() {
    this.http.get<any[]>(`${API_BASE_URL}/sucursales`).subscribe({
      next: (data) => this.sucursales = data,
      error: (err) => console.error('Error fetching sucursales', err)
    });
  }

  crearReserva() {
    if (!this.selectedSucursal || !this.fechaVisita || !this.horaVisita) {
      this.errorMessage = 'Por favor complete todos los campos (Sucursal, Fecha, Hora).';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    // Combine date and time for ISO format
    const dateTime = new Date(`${this.fechaVisita}T${this.horaVisita}:00`);

    const payload: ReservaCreate = {
      id_sucursal: this.selectedSucursal,
      fecha_visita: dateTime.toISOString(),
      detalles: this.cartItems
    };

    this.reservaService.crearReserva(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Navigate to the ticket page, passing the reservation data in state
        this.router.navigate(['/reservas/ticket'], { state: { reserva: response } });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 400) {
          this.errorMessage = "Lo sentimos, una de las prendas no tiene stock físico en la sucursal seleccionada para esa talla/color.";
        } else {
          this.errorMessage = 'Ocurrió un error al procesar la reserva. Intente nuevamente.';
        }
      }
    });
  }
}
