import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface IntencionPagoResponse {
  client_secret: string;
  publishable_key: string;
  id_orden: number;
  numero_factura: string;
  total: number;
  moneda: string;
  payment_intent_id: string;
}

export interface TransaccionResponse {
  id_transaccion: number;
  id_orden: number;
  pasarela: string;
  payment_intent_id: string;
  monto: number;
  moneda: string;
  estado: string;
  marca_tarjeta?: string;
  ultimos4?: string;
  fecha_creacion: string;
  numero_factura?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = '/api/v1/pagos';

  crearIntencionPago(id_orden: number): Observable<IntencionPagoResponse> {
    return this.http.post<IntencionPagoResponse>(
      `${this.apiUrl}/intencion`,
      { id_orden },
      { headers: this.auth.getAuthHeaders() }
    );
  }

  confirmarPago(id_orden: number, payment_intent_id: string): Observable<TransaccionResponse> {
    return this.http.post<TransaccionResponse>(
      `${this.apiUrl}/confirmar`,
      { id_orden, payment_intent_id },
      { headers: this.auth.getAuthHeaders() }
    );
  }
}
