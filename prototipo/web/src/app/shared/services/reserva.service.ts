import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/constants/api.constants';
import { AuthService } from '../../core/services/auth.service';

export interface ReservaDetalleCreate {
  id_producto: number;
  talla: string;
  color: string;
  cantidad: number;
  nombre_producto?: string;
  codigo_sku_base?: string;
  imagen_principal?: string | null;
  tallas_disponibles?: string[];
  colores_disponibles?: string[];
}

export interface ReservaCreate {
  id_sucursal: number;
  fecha_visita: string; // ISO format string
  detalles: ReservaDetalleCreate[];
}

export interface ReservaDetalleResponse {
  id_reserva_detalle: number;
  id_producto: number;
  talla: string;
  color: string;
  cantidad: number;
  nombre_producto?: string;
  codigo_sku_base?: string;
  imagen_principal?: string | null;
}

export interface ReservaResponse {
  id_reserva: number;
  id_usuario: number;
  id_sucursal: number;
  codigo_qr: string;
  qr_texto?: string;
  fecha_visita: string;
  estado: string;
  creado_en: string;
  nombre_sucursal?: string;
  nombre_ciudad?: string;
  nombre_cliente?: string;
  detalles: ReservaDetalleResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${API_BASE_URL}/reservas`;

  crearReserva(reserva: ReservaCreate): Observable<ReservaResponse> {
    return this.http.post<ReservaResponse>(this.apiUrl, reserva, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getMisReservas(): Observable<ReservaResponse[]> {
    return this.http.get<ReservaResponse[]>(`${this.apiUrl}/mis-reservas`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getReserva(idReserva: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${this.apiUrl}/${idReserva}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}

