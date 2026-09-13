import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReservaService, ReservaResponse } from '../../../shared/services/reserva.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-reserva-ticket',
  styleUrl: './reserva-ticket.css',
  templateUrl: './reserva-ticket.html',
})
export class ReservaTicket implements OnInit {
  reserva: any = null;
  todasReservas: ReservaResponse[] = [];
  mostrarHistorial: boolean = false;
  isLoading: boolean = false;

  private router = inject(Router);
  private location = inject(Location);
  private reservaService = inject(ReservaService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    // 1. Intentar recuperar desde router state o history.state
    const state = (this.location.getState() as any) || (window.history && window.history.state);
    if (state && state.reserva) {
      this.reserva = state.reserva;
    }

    // 2. Si no viene en el state (ej. recarga de página), recuperar de sessionStorage
    if (!this.reserva) {
      try {
        const guardado = sessionStorage.getItem('reserva_activa');
        if (guardado) {
          this.reserva = JSON.parse(guardado);
        }
      } catch (e) {
        console.warn('No se pudo leer reserva_activa de sessionStorage', e);
      }
    }

    this.cdr.detectChanges();

    // 3. Cargar reservas del usuario para sincronizar y permitir navegar historial
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.reservaService.getMisReservas().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.todasReservas = data || [];
        // Ordenar siempre de más reciente a más antigua (mayor ID primero)
        this.todasReservas.sort((a, b) => b.id_reserva - a.id_reserva);
        
        // Si no teníamos reserva activa en el estado, tomar la más reciente
        if (!this.reserva && this.todasReservas.length > 0) {
          this.reserva = this.todasReservas[0];
          try {
            sessionStorage.setItem('reserva_activa', JSON.stringify(this.reserva));
          } catch {}
        } else if (this.reserva && this.todasReservas.length > 0) {
          // Si ya teníamos una reserva activa, actualizarla con los datos frescos del backend
          const fresca = this.todasReservas.find(r => r.id_reserva === this.reserva.id_reserva);
          if (fresca) {
            this.reserva = fresca;
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar historial de reservas', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarReserva(r: ReservaResponse) {
    this.reserva = r;
    try {
      sessionStorage.setItem('reserva_activa', JSON.stringify(r));
    } catch {}
    this.mostrarHistorial = false;
    this.toast.info('Ticket Seleccionado', `Mostrando ticket #${r.id_reserva}`);
    this.cdr.detectChanges();
  }

  formatearHora(fechaStr: string): string {
    if (!fechaStr) return '';
    // Extraer hora local limpia sin aplicar desplazamientos de zona horaria
    const match = fechaStr.match(/[T ](\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}:${match[2]}`;
    }
    try {
      const d = new Date(fechaStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return fechaStr;
    }
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const partes = fechaStr.split(/[T ]/)[0].split('-');
      if (partes.length === 3) {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const dia = partes[2];
        const mesIndex = parseInt(partes[1], 10) - 1;
        const anio = partes[0];
        return `${dia} ${meses[mesIndex] || partes[1]} ${anio}`;
      }
      return new Date(fechaStr).toLocaleDateString();
    } catch {
      return fechaStr;
    }
  }

  descargarTicket() {
    if (!this.reserva || !this.reserva.codigo_qr) return;
    
    const a = document.createElement('a');
    a.href = this.reserva.codigo_qr;
    a.download = `Ticket-Reserva-${this.reserva.id_reserva}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.toast.success('Ticket Guardado', 'Se ha descargado el código QR de tu reserva.');
  }
}
