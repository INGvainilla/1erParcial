import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../constants/api.constants';

export interface PosItemInput {
  id_producto: number;
  sku: string;
  nombre_producto?: string;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: number;
}

export interface PosVentaCreate {
  nit_cliente?: string;
  nombre_cliente?: string;
  metodo_pago: string; // 'EFECTIVO' | 'TARJETA' | 'QR'
  monto_recibido?: number;
  id_reserva_origen?: number;
  items: PosItemInput[];
}

export interface PosProductoLookupResponse {
  id_producto: number;
  codigo_sku_base: string;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagen_principal?: string;
  tallas: string[];
  colores: string[];
  stock_disponible_sucursal: number;
}

export interface PosReservaLoadResponse {
  id_reserva: number;
  qr_texto: string;
  nombre_cliente: string;
  nit_cliente: string;
  estado: string;
  detalles: PosItemInput[];
  subtotal: number;
}

export interface PosTicketDetalle {
  nombre_producto: string;
  codigo_sku_base: string;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface PosTicketResponse {
  id_orden: number;
  numero_factura: string;
  id_sucursal: number;
  nombre_sucursal: string;
  direccion_sucursal: string;
  fecha_hora: string;
  nit_cliente: string;
  nombre_cliente: string;
  metodo_pago: string;
  subtotal: number;
  total: number;
  monto_recibido: number;
  cambio_devolver: number;
  cajero_nombre: string;
  detalles: PosTicketDetalle[];
}

@Injectable({
  providedIn: 'root'
})
export class PosService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${API_BASE_URL}/pos`;

  lookupProducto(sku: string, idSucursal?: number): Observable<PosProductoLookupResponse> {
    const query = idSucursal ? `?id_sucursal=${idSucursal}` : '';
    return this.http.get<PosProductoLookupResponse>(
      `${this.apiUrl}/productos/${encodeURIComponent(sku.trim())}${query}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  lookupReserva(codigoQr: string, idSucursal?: number): Observable<PosReservaLoadResponse> {
    const query = idSucursal ? `?id_sucursal=${idSucursal}` : '';
    return this.http.get<PosReservaLoadResponse>(
      `${this.apiUrl}/reservas/${encodeURIComponent(codigoQr.trim())}${query}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  procesarVenta(venta: PosVentaCreate, idSucursal?: number): Observable<PosTicketResponse> {
    const query = idSucursal ? `?id_sucursal=${idSucursal}` : '';
    return this.http.post<PosTicketResponse>(
      `${this.apiUrl}/venta${query}`,
      venta,
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
