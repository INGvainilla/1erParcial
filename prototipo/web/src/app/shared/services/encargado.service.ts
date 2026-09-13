import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { API_BASE_URL } from '../../core/constants/api.constants';

export interface ReservaDetalle {
  id_reserva_detalle: number;
  id_producto: number;
  talla: string;
  color: string;
  cantidad: number;
  nombre_producto?: string;
  codigo_sku_base?: string;
}

export interface ReservaEncargado {
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
  detalles: ReservaDetalle[];
}

@Injectable({
  providedIn: 'root'
})
export class EncargadoService {
  private apiUrl = `${API_BASE_URL}/reservas`;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /**
   * CU12: Obtener reservas para la sucursal del encargado (opcionalmente filtradas por sucursal y fecha)
   */
  getReservasHoy(idSucursal?: number | null, fecha: string = 'todas'): Observable<ReservaEncargado[]> {
    const params: string[] = [];
    if (idSucursal) params.push(`id_sucursal=${idSucursal}`);
    if (fecha) params.push(`fecha=${fecha}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<ReservaEncargado[]>(`${this.apiUrl}/sucursal/hoy${query}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * CU12: Cambiar estado de una reserva (PENDIENTE -> PREPARADA)
   */
  cambiarEstadoReserva(idReserva: number, nuevoEstado: string): Observable<ReservaEncargado> {
    return this.http.patch<ReservaEncargado>(
      `${this.apiUrl}/${idReserva}/estado`,
      { estado: nuevoEstado },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  /**
   * CU12: Escanear QR y atender reserva
   */
  escanearQr(codigoQr: string): Observable<ReservaEncargado> {
    return this.http.post<ReservaEncargado>(
      `${this.apiUrl}/escanear-qr`,
      { codigo_qr: codigoQr },
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
