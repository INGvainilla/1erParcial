import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/constants/api.constants';

export interface ReservaDetalleCreate {
  id_producto: number;
  talla: string;
  color: string;
  cantidad: number;
}

export interface ReservaCreate {
  id_sucursal: number;
  fecha_visita: string; // ISO format string
  detalles: ReservaDetalleCreate[];
}

export interface ReservaResponse {
  id_reserva: number;
  id_usuario: number;
  id_sucursal: number;
  codigo_qr: string;
  fecha_visita: string;
  estado: string;
  creado_en: string;
  detalles: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = `${API_BASE_URL}/reservas`;

  constructor(private http: HttpClient) {}

  crearReserva(reserva: ReservaCreate): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(this.apiUrl, reserva);
  }
}
