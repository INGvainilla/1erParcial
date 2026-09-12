import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-reserva-ticket',
  styleUrl: './reserva-ticket.css',
  templateUrl: './reserva-ticket.html',
})
export class ReservaTicket implements OnInit {
  reserva: any;

  constructor(private router: Router, private location: Location) {}

  ngOnInit() {
    const state = this.location.getState() as any;
    if (state && state.reserva) {
      this.reserva = state.reserva;
    } else {
      // If no reservation in state, navigate back
      this.router.navigate(['/reservas/crear']);
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
  }
}
