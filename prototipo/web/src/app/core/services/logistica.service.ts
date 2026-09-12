import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';

export interface PrendaEmpaque {
  id_detalle_orden: number;
  id_producto: number;
  nombre_producto: string;
  codigo_sku_base: string;
  imagen_principal?: string;
  talla: string;
  color: string;
  cantidad: number;
}

export interface OrdenLogistica {
  id_orden: number;
  numero_factura?: string;
  canal_venta: string;
  modalidad_entrega: string;
  id_usuario?: number;
  nombre_cliente?: string;
  telefono_contacto?: string;
  direccion_envio?: string;
  notas_entrega?: string;
  latitud_destino?: number;
  longitud_destino?: number;
  distancia_km?: number;
  costo_envio: number;
  total: number;
  estado_pago: string;
  estado_logistica: string;
  creado_en: string;
  id_repartidor?: number;
  nombre_repartidor?: string;
  telefono_repartidor?: string;
  id_sucursal?: number;
  nombre_sucursal?: string;
  prendas: PrendaEmpaque[];
}

export interface AsignarRepartidorPayload {
  id_repartidor?: number;
  nombre_repartidor: string;
  telefono_repartidor?: string;
}

export interface CambioEstadoPayload {
  nuevo_estado: string;
  notas?: string;
}

export interface RepartidorDisponible {
  id_usuario: number;
  nombre_completo: string;
  email: string;
  telefono: string;
  rol: string;
}

export interface TrackingPaso {
  codigo: string;
  titulo: string;
  descripcion: string;
  completado: boolean;
  activo: boolean;
  icono: string;
}

export interface TrackingOrden {
  id_orden: number;
  numero_factura?: string;
  estado_pago: string;
  estado_logistica: string;
  direccion_envio?: string;
  nombre_cliente?: string;
  nombre_repartidor?: string;
  telefono_repartidor?: string;
  distancia_km?: number;
  costo_envio: number;
  total: number;
  creado_en: string;
  porcentaje_progreso: number;
  pasos: TrackingPaso[];
  prendas: PrendaEmpaque[];
}

export interface CotizarTarifaPayload {
  latitud_origen: number;
  longitud_origen: number;
  latitud_destino: number;
  longitud_destino: number;
}

export interface CotizarTarifaResponse {
  distancia_km: number;
  costo_envio: number;
  tiempo_estimado_minutos: number;
}

@Injectable({
  providedIn: 'root'
})
export class LogisticaService {
  private http = inject(HttpClient);
  private apiUrl = `${API_BASE_URL}/logistica`;

  private getHeaders(): { headers: any } {
    let token = '';
    const stored = localStorage.getItem('fs_user') || sessionStorage.getItem('fs_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        token = parsed.access_token || parsed.token || '';
      } catch (e) {}
    }
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    };
  }

  getOrdenes(estado?: string): Observable<OrdenLogistica[]> {
    const url = estado ? `${this.apiUrl}/ordenes?estado=${estado}` : `${this.apiUrl}/ordenes`;
    return this.http.get<OrdenLogistica[]>(url, this.getHeaders());
  }

  asignarRepartidor(idOrden: number, payload: AsignarRepartidorPayload): Observable<OrdenLogistica> {
    return this.http.post<OrdenLogistica>(`${this.apiUrl}/ordenes/${idOrden}/asignar`, payload, this.getHeaders());
  }

  cambiarEstado(idOrden: number, payload: CambioEstadoPayload): Observable<OrdenLogistica> {
    return this.http.patch<OrdenLogistica>(`${this.apiUrl}/ordenes/${idOrden}/estado`, payload, this.getHeaders());
  }

  getRepartidores(): Observable<RepartidorDisponible[]> {
    return this.http.get<RepartidorDisponible[]>(`${this.apiUrl}/repartidores`, this.getHeaders());
  }

  getTracking(idOrden: number): Observable<TrackingOrden> {
    return this.http.get<TrackingOrden>(`${this.apiUrl}/tracking/${idOrden}`);
  }

  calcularTarifa(payload: CotizarTarifaPayload): Observable<CotizarTarifaResponse> {
    return this.http.post<CotizarTarifaResponse>(`${this.apiUrl}/calcular-tarifa`, payload);
  }
}
