import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { AuthService } from './auth.service';

export interface BitacoraItem {
  id_bitacora: number;
  id_empresa?: number;
  id_usuario?: number;
  nombre_usuario?: string;
  email_usuario?: string;
  rol_usuario?: string;
  tipo_evento: string;
  ip_origen: string;
  user_agent?: string;
  exitoso: boolean;
  motivo?: string;
  detalles_json?: string;
  fecha_hora: string;
}

export interface MetricasSeguridad {
  id_empresa?: number;
  total_accesos_24h: number;
  total_exitosos_24h: number;
  total_fallidos_24h: number;
  tasa_exito_porcentaje: number;
  total_cuentas_bloqueadas: number;
  ips_sospechosas: Array<{
    ip: string;
    intentos_fallidos: number;
    alerta: string;
    ultimo_intento: string;
  }>;
}

export interface CuentaBloqueada {
  id_usuario: number;
  id_empresa?: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol: string;
  intentos_fallidos: number;
  bloqueado_hasta?: string;
  minutos_restantes?: number;
}

export interface RespaldoSnapshot {
  id_respaldo: number;
  id_empresa: number;
  id_usuario?: number;
  nombre_archivo: string;
  tipo_respaldo: string;
  tamano_bytes: number;
  tamano_mb: number;
  checksum_sha256: string;
  estado: string;
  tablas_incluidas?: string;
  total_registros: number;
  fecha_creacion: string;
}

export interface IntegridadResult {
  id_respaldo: number;
  checksum_registrado: string;
  checksum_calculado: string;
  integro: boolean;
  tamano_bytes: number;
  mensaje: string;
}

export interface ProgramacionRespaldo {
  id_programacion: number;
  id_empresa: number;
  nombre_empresa?: string;
  id_usuario?: number;
  nombre: string;
  fecha_hora_programada: string;
  frecuencia: string;
  hora_ejecucion?: string;
  activo: boolean;
  estado: string;
  tablas_alcance?: string;
  ultimo_respaldo_id?: number;
  fecha_ultima_ejecucion?: string;
  resultado?: string;
  creado_en: string;
}

export interface RestaurarResult {
  id_respaldo: number;
  id_empresa: number;
  exitoso: boolean;
  total_tuplas_restauradas: number;
  tablas_restauradas: string[];
  checksum_verificado: string;
  mensaje: string;
  fecha_restauracion: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditBackupService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = API_BASE_URL;

  // ==========================================
  // CU21: Auditoría y Bitácora
  // ==========================================
  getEventos(paramsObj: any = {}): Observable<BitacoraItem[]> {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach(key => {
      if (paramsObj[key] !== null && paramsObj[key] !== undefined && paramsObj[key] !== '') {
        params = params.set(key, paramsObj[key]);
      }
    });
    return this.http.get<BitacoraItem[]>(`${this.apiUrl}/auditoria/eventos`, {
      headers: this.auth.getAuthHeaders(),
      params
    });
  }

  getMetricas(idEmpresa?: number): Observable<MetricasSeguridad> {
    let params = new HttpParams();
    if (idEmpresa) params = params.set('id_empresa', idEmpresa);
    return this.http.get<MetricasSeguridad>(`${this.apiUrl}/auditoria/metricas`, {
      headers: this.auth.getAuthHeaders(),
      params
    });
  }

  getCuentasBloqueadas(idEmpresa?: number): Observable<CuentaBloqueada[]> {
    let params = new HttpParams();
    if (idEmpresa) params = params.set('id_empresa', idEmpresa);
    return this.http.get<CuentaBloqueada[]>(`${this.apiUrl}/auditoria/cuentas-bloqueadas`, {
      headers: this.auth.getAuthHeaders(),
      params
    });
  }

  desbloquearCuenta(idUsuario: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/auditoria/desbloquear-cuenta/${idUsuario}`, {}, {
      headers: this.auth.getAuthHeaders()
    });
  }

  exportarCsv(paramsObj: any = {}): Observable<Blob> {
    let params = new HttpParams();
    Object.keys(paramsObj).forEach(key => {
      if (paramsObj[key] !== null && paramsObj[key] !== undefined && paramsObj[key] !== '') {
        params = params.set(key, paramsObj[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/auditoria/exportar`, {
      headers: this.auth.getAuthHeaders(),
      params,
      responseType: 'blob'
    });
  }

  exportarCsvUrl(paramsObj: any = {}): string {
    let queryParts: string[] = ['formato=csv'];
    Object.keys(paramsObj).forEach(k => {
      if (paramsObj[k]) queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(paramsObj[k])}`);
    });
    return `${this.apiUrl}/auditoria/exportar?${queryParts.join('&')}`;
  }

  // ==========================================
  // CU22: Respaldos y Restauración Multitenant
  // ==========================================
  getHistorialRespaldos(idEmpresa?: number): Observable<RespaldoSnapshot[]> {
    let params = new HttpParams();
    if (idEmpresa) params = params.set('id_empresa', idEmpresa);
    return this.http.get<RespaldoSnapshot[]>(`${this.apiUrl}/backups/historial`, {
      headers: this.auth.getAuthHeaders(),
      params
    });
  }

  generarSnapshot(comentario?: string, idEmpresa?: number, tablas?: string[]): Observable<RespaldoSnapshot> {
    const payload: any = {
      tablas_alcance: tablas || null,
      comentario: comentario || 'Snapshot a demanda desde Web Desktop'
    };
    if (idEmpresa) payload.id_empresa = idEmpresa;
    return this.http.post<RespaldoSnapshot>(`${this.apiUrl}/backups/snapshot`, payload, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getProgramaciones(idEmpresa?: number): Observable<ProgramacionRespaldo[]> {
    let params = new HttpParams();
    if (idEmpresa) params = params.set('id_empresa', idEmpresa);
    return this.http.get<ProgramacionRespaldo[]>(`${this.apiUrl}/backups/programaciones`, {
      headers: this.auth.getAuthHeaders(),
      params
    });
  }

  crearProgramacion(data: {
    id_empresa?: number;
    nombre: string;
    fecha_hora_programada: string;
    frecuencia: string;
    hora_ejecucion?: string;
    tablas_alcance?: string[];
  }): Observable<ProgramacionRespaldo> {
    return this.http.post<ProgramacionRespaldo>(`${this.apiUrl}/backups/programaciones`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  cancelarProgramacion(idProgramacion: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/backups/programaciones/${idProgramacion}`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  ejecutarProgramacion(idProgramacion: number): Observable<RespaldoSnapshot> {
    return this.http.post<RespaldoSnapshot>(`${this.apiUrl}/backups/programaciones/${idProgramacion}/ejecutar`, {}, {
      headers: this.auth.getAuthHeaders()
    });
  }

  restaurarRespaldo(idRespaldo: number): Observable<RestaurarResult> {
    return this.http.post<RestaurarResult>(`${this.apiUrl}/backups/${idRespaldo}/restaurar`, {
      confirmar: true
    }, {
      headers: this.auth.getAuthHeaders()
    });
  }

  verificarIntegridad(idRespaldo: number): Observable<IntegridadResult> {
    return this.http.post<IntegridadResult>(`${this.apiUrl}/backups/${idRespaldo}/verificar-integridad`, {}, {
      headers: this.auth.getAuthHeaders()
    });
  }

  descargarRespaldo(idRespaldo: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/backups/${idRespaldo}/descargar`, {
      headers: this.auth.getAuthHeaders(),
      responseType: 'blob'
    });
  }

  descargarRespaldoUrl(idRespaldo: number): string {
    return `${this.apiUrl}/backups/${idRespaldo}/descargar`;
  }

  dispararWalGlobal(): Observable<any> {
    return this.http.post(`${this.apiUrl}/backups/global-wal`, {}, {
      headers: this.auth.getAuthHeaders()
    });
  }
}
