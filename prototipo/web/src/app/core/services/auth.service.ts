import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/fashion.models';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = API_BASE_URL;

  currentUser = signal<LoginResponse | null>(null);

  constructor(private http: HttpClient) {
    this.loadSession();
  }

  private loadSession(): void {
    const raw = localStorage.getItem('fs_user') || sessionStorage.getItem('fs_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        this.currentUser.set(user);
      } catch (e) {
        this.clearSession();
      }
    }
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
    return user?.rol === 'ADMINISTRADOR' || user?.rol === 'SUPER_ADMIN';
  }

  isSuperAdmin(): boolean {
    const user = this.currentUser();
    return user?.rol === 'SUPER_ADMIN';
  }

  getEmpresaId(): number | null | undefined {
    return this.currentUser()?.id_empresa;
  }

  getNombreEmpresa(): string | null | undefined {
    return this.currentUser()?.nombre_empresa;
  }

  isStaff(): boolean {
    const user = this.currentUser();
    return ['SUPER_ADMIN', 'ADMINISTRADOR', 'ENCARGADO_SUCURSAL', 'CAJERO', 'LOGISTICA'].includes(user?.rol || '');
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
    sessionStorage.removeItem('fs_user');
    this.currentUser.set(null);
  }
}
