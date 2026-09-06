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
    return user?.rol === 'ADMINISTRADOR';
  }

  isStaff(): boolean {
    const user = this.currentUser();
    return ['ADMINISTRADOR', 'ENCARGADO_SUCURSAL', 'CAJERO', 'LOGISTICA'].includes(user?.rol || '');
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

  login(credentials: { email: string; password: string; recordar_sesion?: boolean }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        this.currentUser.set(res);
        const storage = credentials.recordar_sesion ? localStorage : sessionStorage;
        storage.setItem('fs_user', JSON.stringify(res));
      })
    );
  }

  register(data: { nombres: string; apellidos: string; email: string; password: string; telefono?: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/registro`, data).pipe(
      tap(res => {
        this.currentUser.set(res);
        sessionStorage.setItem('fs_user', JSON.stringify(res));
      })
    );
  }

  requestOtp(email: string): Observable<{ mensaje: string; tiempo_expiracion_minutos: number; codigo_otp_simulado?: string }> {
    return this.http.post<any>(`${this.apiUrl}/auth/recuperar-password/solicitar`, { email });
  }

  resetPasswordOtp(data: { email: string; codigo_otp: string; nueva_password: string }): Observable<any> {
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
