import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface MetodoPagoResponse {
  id_metodo: number;
  codigo: string;
  nombre: string;
  tipo: string;
  descripcion?: string;
  icono?: string;
  activo: boolean;
  requiere_credenciales: boolean;
  credenciales_enmascaradas: { [key: string]: string };
  actualizado_en?: string;
}

export interface MetodoPagoPublico {
  codigo: string;
  nombre: string;
  tipo: string;
  icono?: string;
  activo: boolean;
}

export interface MetodoPagoUpdate {
  activo?: boolean;
  credenciales?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class PagoConfigService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = '/api/v1/configuracion/pagos';

  getMetodos(): Observable<MetodoPagoResponse[]> {
    return this.http.get<MetodoPagoResponse[]>(this.apiUrl, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getMetodosActivos(): Observable<MetodoPagoPublico[]> {
    return this.http.get<MetodoPagoPublico[]>(`${this.apiUrl}/activos`);
  }

  actualizarMetodo(idMetodo: number, data: MetodoPagoUpdate): Observable<MetodoPagoResponse> {
    return this.http.patch<MetodoPagoResponse>(`${this.apiUrl}/${idMetodo}`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
