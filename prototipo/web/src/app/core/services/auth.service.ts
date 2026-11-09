import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse, Empresa } from '../models/fashion.models';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_BASE_URL;

  currentUser = signal<LoginResponse | null>(null);
  selectedTenant = signal<Empresa | null>(null);
  empresas = signal<Empresa[]>([]);

  constructor(private http: HttpClient) {
    this.loadSession();
  }

  private loadSession(): void {
    const raw = localStorage.getItem('fs_user') || sessionStorage.getItem('fs_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        this.currentUser.set(user);
        if (user.rol === 'SUPER_ADMIN') {
          this.loadEmpresas();
        } else if (user.id_empresa) {
          this.selectedTenant.set({
            id_empresa: user.id_empresa,
            nombre_comercial: user.nombre_empresa || `Empresa #${user.id_empresa}`,
            razon_social: user.nombre_empresa || `Empresa #${user.id_empresa}`,
            nit: '',
            estado: 'ACTIVA'
          } as Empresa);
        }
        // Asentar acceso de reanudación / ingreso en la bitácora inmutable (CU21)
        this.http.post(`${this.apiUrl}/auth/verificar-sesion`, {}, { headers: this.getAuthHeaders() }).subscribe({
          error: () => {}
        });
      } catch (e) {
        this.clearSession();
      }
    }
  }

  loadEmpresas(): void {
    this.http.get<Empresa[]>(`${this.apiUrl}/tenants/empresas`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: (list) => {
        this.empresas.set(list || []);
        const savedTenantId = localStorage.getItem('fs_active_tenant_id');
        if (savedTenantId && list && list.length > 0) {
          const found = list.find(e => e.id_empresa === Number(savedTenantId));
          if (found) {
            this.selectedTenant.set(found);
            return;
          }
        }
        if (this.isSuperAdmin()) {
          // Para Super Admin, mantener por defecto Modo Global (todas las empresas) salvo selección explícita
          if (!savedTenantId) {
            this.selectedTenant.set(null);
          }
        } else if (list && list.length > 0 && !this.selectedTenant()) {
          this.selectedTenant.set(list[0]);
          localStorage.setItem('fs_active_tenant_id', list[0].id_empresa.toString());
        }
      },
      error: (err) => console.error('Error cargando empresas:', err)
    });
  }

  setSelectedTenant(empresa: Empresa | null): void {
    this.selectedTenant.set(empresa);
    if (empresa) {
      localStorage.setItem('fs_active_tenant_id', empresa.id_empresa.toString());
    } else {
      localStorage.removeItem('fs_active_tenant_id');
    }
  }

  setSelectedTenantById(idEmpresa: number | null): void {
    if (idEmpresa === null) {
      this.setSelectedTenant(null);
      return;
    }
    const found = this.empresas().find(e => e.id_empresa === Number(idEmpresa));
    if (found) {
      this.setSelectedTenant(found);
    }
  }

  getActiveEmpresaId(): number | null | undefined {
    if (this.isSuperAdmin()) {
      return this.selectedTenant()?.id_empresa ?? null;
    }
    return this.currentUser()?.id_empresa;
  }

  getToken(): string | null {
    const user = this.currentUser();
    return user ? user.access_token : null;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.rol === 'ADMINISTRADOR' || user?.rol === 'ADMIN_EMPRESA' || user?.rol === 'SUPER_ADMIN';
  }

  isTenantAdmin(): boolean {
    const user = this.currentUser();
    return (user?.rol === 'ADMINISTRADOR' || user?.rol === 'ADMIN_EMPRESA') && !!user?.id_empresa;
  }

  isSuperAdmin(): boolean {
    const user = this.currentUser();
    return user?.rol === 'SUPER_ADMIN';
  }

  getEmpresaId(): number | null | undefined {
    return this.getActiveEmpresaId();
  }

  getNombreEmpresa(): string | null | undefined {
    if (this.isSuperAdmin()) {
      return this.selectedTenant()?.nombre_comercial || 'Plataforma Global SaaS';
    }
    return this.currentUser()?.nombre_empresa;
  }

  isStaff(): boolean {
    const user = this.currentUser();
    return ['SUPER_ADMIN', 'ADMINISTRADOR', 'ADMIN_EMPRESA', 'ENCARGADO_SUCURSAL', 'CAJERO', 'LOGISTICA'].includes(user?.rol || '');
  }

  isManager(): boolean {
    const user = this.currentUser();
    return user?.rol === 'ENCARGADO_SUCURSAL';
  }

  isLogistics(): boolean {
    const user = this.currentUser();
    return user?.rol === 'LOGISTICA';
  }

  isCashier(): boolean {
    const user = this.currentUser();
    return user?.rol === 'CAJERO';
  }

  isClient(): boolean {
    const user = this.currentUser();
    return user?.rol === 'CLIENTE';
  }

  // CU01: Autenticar Usuario (Login RBAC), Paso 1.1: ILoginBoundary invoca el método login() hacia AutenticacionControl
  login(credentials: { email: string; password: string; recordar_sesion?: boolean }): Observable<LoginResponse> {
    // CU01: Autenticar Usuario (Login RBAC), Paso 1.1.1: Despachar petición HTTP POST a /auth/login con credenciales
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        // CU01: Autenticar Usuario (Login RBAC), Paso 1.7: Recibir token JWT y almacenar sesión en signal reactivo
        this.currentUser.set(res);
        // CU01: Autenticar Usuario (Login RBAC), Paso 1.7.1: Persistir token en localStorage/sessionStorage según recordar_sesion
        const storage = credentials.recordar_sesion ? localStorage : sessionStorage;
        storage.setItem('fs_user', JSON.stringify(res));
        if (res.rol === 'SUPER_ADMIN') {
          this.loadEmpresas();
        } else if (res.id_empresa) {
          this.selectedTenant.set({
            id_empresa: res.id_empresa,
            nombre_comercial: res.nombre_empresa || `Empresa #${res.id_empresa}`,
            razon_social: res.nombre_empresa || `Empresa #${res.id_empresa}`,
            nit: '',
            estado: 'ACTIVA'
          } as Empresa);
        }
      })
    );
  }

  // CU02: Registrar Cliente (Sign Up), Paso 1.1: IRegistroBoundary invoca register() en AuthService hacia RegistroClienteControl
  register(data: { nombres: string; apellidos: string; email: string; password: string; telefono?: string }): Observable<LoginResponse> {
    // CU02: Registrar Cliente (Sign Up), Paso 1.1.1: Despachar petición HTTP POST a /auth/registro con datos del nuevo cliente
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/registro`, data).pipe(
      tap(res => {
        // CU02: Registrar Cliente (Sign Up), Paso 1.7: Recibir token JWT y registrar sesión en estado reactivo
        this.currentUser.set(res);
        sessionStorage.setItem('fs_user', JSON.stringify(res));
      })
    );
  }

  // Onboarding B2B: Registrar y Afiliar Empresa / Sucursales al SaaS
  registerEmpresa(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/registro-empresa`, data).pipe(
      tap(res => {
        this.currentUser.set(res);
        sessionStorage.setItem('fs_user', JSON.stringify(res));
      })
    );
  }

  // CU03: Recuperar Contraseña (Token OTP), Paso 1.1: IRecuperarPasswordBoundary invoca requestOtp() hacia RecuperacionControl
  requestOtp(email: string): Observable<{ mensaje: string; tiempo_expiracion_minutos: number; codigo_otp_simulado?: string }> {
    // CU03: Recuperar Contraseña (Token OTP), Paso 1.1.1: Despachar petición HTTP POST a /auth/recuperar-password/solicitar
    return this.http.post<any>(`${this.apiUrl}/auth/recuperar-password/solicitar`, { email });
  }

  // CU03: Recuperar Contraseña (Token OTP), Paso 2.1: IRecuperarPasswordBoundary invoca resetPasswordOtp() con código de 6 dígitos
  resetPasswordOtp(data: { email: string; codigo_otp: string; nueva_password: string }): Observable<any> {
    // CU03: Recuperar Contraseña (Token OTP), Paso 2.1.1: Despachar petición HTTP POST a /auth/recuperar-password/verificar
    return this.http.post<any>(`${this.apiUrl}/auth/recuperar-password/verificar`, data);
  }

  logout(): void {
    this.clearSession();
  }

  private clearSession(): void {
    localStorage.removeItem('fs_user');
    localStorage.removeItem('fs_active_tenant_id');
    sessionStorage.removeItem('fs_user');
    this.currentUser.set(null);
    this.selectedTenant.set(null);
    this.empresas.set([]);
  }
}
