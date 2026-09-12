import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { AuthService } from './auth.service';

export interface OrdenCreateRequest {
  modalidad_entrega: 'DELIVERY' | 'RETIRO_TIENDA';
  id_sucursal?: number | null;
  direccion_envio?: string | null;
  telefono_contacto?: string | null;
  nit_factura: string;
  razon_social_factura: string;
  notas_entrega?: string | null;
}

export interface OrdenDetalleItem {
  id_detalle_orden: number;
  id_producto: number;
  nombre_producto: string;
  codigo_sku_base: string;
  imagen_principal?: string | null;
  talla: string;
  color: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface OrdenData {
  id_orden: number;
  id_usuario?: number | null;
  id_sucursal?: number | null;
  nombre_sucursal?: string | null;
  numero_factura?: string | null;
  canal_venta: string;
  modalidad_entrega: string;
  direccion_envio?: string | null;
  telefono_contacto?: string | null;
  nit_factura?: string | null;
  razon_social_factura?: string | null;
  notas_entrega?: string | null;
  subtotal: number;
  costo_envio: number;
  total: number;
  estado_pago: string;
  estado_logistica: string;
  creado_en: string;
  detalles: OrdenDetalleItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private apiUrl = `${API_BASE_URL}/ordenes`;

  /**
   * CU14: Enviar datos del checkout y formalizar orden de venta
   */
  procesarCheckout(datos: OrdenCreateRequest): Observable<OrdenData> {
    return this.http.post<OrdenData>(`${this.apiUrl}/checkout`, datos, {
      headers: this.auth.getAuthHeaders()
    });
  }

  /**
   * CU14: Obtener datos de la orden generada
   */
  obtenerOrden(idOrden: number): Observable<OrdenData> {
    return this.http.get<OrdenData>(`${this.apiUrl}/${idOrden}`, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
