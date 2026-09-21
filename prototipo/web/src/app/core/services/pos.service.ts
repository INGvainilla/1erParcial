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

  // ==========================================================================
  // CU25: Gestionar Devolución y Cambio de Prendas
  // ==========================================================================
  consultarTicketDevolucion(nroTicket: string): Observable<TicketConsultaResponse> {
    return this.http.get<TicketConsultaResponse>(
      `${this.apiUrl}/devoluciones/ticket/${encodeURIComponent(nroTicket.trim())}`,
      { headers: this.auth.getAuthHeaders() }
    );
  }

  procesarDevolucion(payload: DevolucionCreate, idSucursal?: number): Observable<DevolucionTicketResponse> {
    const query = idSucursal ? `?id_sucursal=${idSucursal}` : '';
    return this.http.post<DevolucionTicketResponse>(
      `${this.apiUrl}/devoluciones${query}`,
      payload,
      { headers: this.auth.getAuthHeaders() }
    );
  }
}

export interface TicketItemLookup {
  id_producto: number;
  nombre_producto: string;
  codigo_sku_base: string;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  costo_historico_cpp: number;
  imagen_principal?: string;
}

export interface TicketConsultaResponse {
  id_orden: number;
  numero_factura: string;
  fecha_emision: string;
  nombre_cliente: string;
  nit_cliente: string;
  total: number;
  dias_transcurridos: number;
  es_valido_14_dias: boolean;
  mensaje_plazo: string;
  items: TicketItemLookup[];
}

export interface DevolucionItemInput {
  id_producto: number;
  talla: string;
  color: string;
  cantidad: number;
  estado_fisico: 'APTO_VENTA' | 'DEFECTUOSO_MERMA';
}

export interface CambioVarianteInput {
  nuevo_producto_id: number;
  nueva_talla: string;
  nuevo_color: string;
  nueva_cantidad: number;
}

export interface DevolucionCreate {
  nro_ticket_original: string;
  motivo: string;
  tipo_resolucion: 'CAMBIO_VARIANTE' | 'VALE_CREDITO' | 'REEMBOLSO_EFECTIVO' | 'REEMBOLSO_STRIPE';
  items: DevolucionItemInput[];
  cambio_info?: CambioVarianteInput;
}

export interface DevolucionTicketResponse {
  id_devolucion: number;
  nro_devolucion: string;
  nro_ticket_original: string;
  fecha_hora: string;
  sucursal_nombre: string;
  cajero_nombre: string;
  cliente_nombre: string;
  motivo: string;
  tipo_resolucion: string;
  total_devuelto: number;
  diferencia_cobrada: number;
  codigo_vale?: string;
  mensaje_kardex: string;
  items_devueltos: any[];
  item_nuevo_entregado?: any;
}
