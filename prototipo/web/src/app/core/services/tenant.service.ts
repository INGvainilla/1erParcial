import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../constants/api.constants';
import { AuthService } from './auth.service';
import { Empresa, PlanSuscripcion, SuscripcionEmpresa, CapacidadesEmpresa } from '../models/fashion.models';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = `${API_BASE_URL}/tenants`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // CU01: Listar Empresas Registradas (Tenants)
  listarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.apiUrl}/empresas`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // CU01: Obtener Detalle de Empresa
  obtenerEmpresa(idEmpresa: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/empresas/${idEmpresa}`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // CU01: Registrar Nueva Empresa (Tenant)
  crearEmpresa(data: Partial<Empresa>): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.apiUrl}/empresas`, data, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // CU01: Actualizar Empresa
  actualizarEmpresa(idEmpresa: number, data: Partial<Empresa>): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}/empresas/${idEmpresa}`, data, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // CU02: Listar Planes de Suscripción
  listarPlanes(): Observable<PlanSuscripcion[]> {
    return this.http.get<PlanSuscripcion[]>(`${this.apiUrl}/planes`);
  }

  // CU02: Crear Plan de Suscripción
  crearPlan(data: Partial<PlanSuscripcion>): Observable<PlanSuscripcion> {
    return this.http.post<PlanSuscripcion>(`${this.apiUrl}/planes`, data, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // CU03: Consultar Suscripción Activa de una Empresa
  obtenerSuscripcionActiva(idEmpresa: number): Observable<SuscripcionEmpresa> {
    return this.http.get<SuscripcionEmpresa>(`${this.apiUrl}/empresas/${idEmpresa}/suscripcion-activa`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // CU03: Contratar o Renovar Suscripción
  contratarSuscripcion(data: { id_empresa: number; id_plan: number; auto_renovar?: boolean }): Observable<SuscripcionEmpresa> {
    return this.http.post<SuscripcionEmpresa>(`${this.apiUrl}/suscripciones`, data, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // CU03: Consultar Capacidades y Cuotas del Plan (CU01-03 / UI Contexto)
  obtenerCapacidades(idEmpresa: number): Observable<CapacidadesEmpresa> {
    return this.http.get<CapacidadesEmpresa>(`${this.apiUrl}/empresas/${idEmpresa}/capacidades`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  // CU03: Cambiar de Plan (Upgrade / Downgrade con validación)
  cambiarPlan(data: { id_empresa: number; id_nuevo_plan: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/suscripciones/cambiar-plan`, data, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
