import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page-container">
      <div class="auth-card glass-panel">
        <!-- Header / Tabs -->
        <div class="auth-header">
          <div class="brand-badge">
            <i class="fas fa-crown"></i> FashionStore
          </div>
          <h2>Control de Acceso y Registro</h2>
          <p class="subtitle">Casos de Uso CU01, CU02 y CU03 (Seguridad RBAC y OTP)</p>

          <div class="tabs-nav">
            <button class="tab-btn" [class.active]="activeTab === 'login'" (click)="activeTab = 'login'">
              <i class="fas fa-sign-in-alt"></i> Iniciar Sesión (CU01)
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'registro'" (click)="activeTab = 'registro'">
              <i class="fas fa-user-plus"></i> Registrarse (CU02)
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'recuperar'" (click)="openOtpTab()">
              <i class="fas fa-key"></i> Recuperar Clave (CU03 OTP)
            </button>
          </div>
        </div>

        <!-- ==============================================
             TAB 1: INICIAR SESIÓN (CU01)
             ============================================== -->
        <div *ngIf="activeTab === 'login'" class="auth-content">
          <!-- Botones de Relleno Rápido de Prueba -->
          <div class="quick-credentials">
            <span class="quick-label"><i class="fas fa-bolt"></i> Cuentas Semilla de Prueba:</span>
            <div class="credential-chips">
              <button class="chip-btn admin" (click)="fillLogin('alberto.delgado@store.bo', 'Admin123*')">
                👑 Admin General
              </button>
              <button class="chip-btn manager" (click)="fillLogin('andy.mujica@store.bo', 'Admin123*')">
                👔 Encargado Sucursal
              </button>
              <button class="chip-btn locked" (click)="fillLogin('javier.roca@store.bo', 'Admin123*')" title="Demuestra bloqueo de 5 intentos fallidos">
                🔒 Cajero (Bloqueado)
              </button>
              <button class="chip-btn logistics" (click)="fillLogin('mateo.logistica@store.bo', 'Admin123*')">
                📦 Logística
              </button>
              <button class="chip-btn client" (click)="fillLogin('rodrigo.cliente@gmail.com', 'Admin123*')">
                👤 Cliente
              </button>
            </div>
          </div>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="auth-form">
            <div class="form-group">
              <label for="login-email"><i class="fas fa-envelope"></i> Correo Electrónico:</label>
              <input
                id="login-email"
                type="email"
                name="email"
                [(ngModel)]="loginData.email"
                required
                class="form-control"
                placeholder="ejemplo@store.bo"
              />
            </div>

            <div class="form-group">
              <label for="login-password"><i class="fas fa-lock"></i> Contraseña:</label>
              <input
                id="login-password"
                type="password"
                name="password"
                [(ngModel)]="loginData.password"
                required
                class="form-control"
                placeholder="••••••••"
              />
            </div>

            <div class="form-row-check">
              <label class="checkbox-label">
                <input type="checkbox" name="recordar" [(ngModel)]="loginData.recordar_sesion" />
                <span>Recordar sesión (30 días)</span>
              </label>
              <a class="forgot-link" (click)="openOtpTab()">
                ¿Olvidó su contraseña? (CU03 OTP)
              </a>
            </div>

            <button type="submit" [disabled]="loading || !loginForm.valid" class="btn btn-primary btn-block">
              <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
              <i class="fas fa-arrow-right" *ngIf="!loading"></i>
              {{ loading ? 'Autenticando en PostgreSQL...' : 'Acceder al Sistema' }}
            </button>
          </form>
        </div>

        <!-- ==============================================
             TAB 2: REGISTRO DE CLIENTE (CU02)
             ============================================== -->
        <div *ngIf="activeTab === 'registro'" class="auth-content">
          <form (ngSubmit)="onRegister()" #regForm="ngForm" class="auth-form">
            <div class="form-row">
              <div class="form-group col-half">
                <label for="reg-nombres"><i class="fas fa-user"></i> Nombres:</label>
                <input
                  id="reg-nombres"
                  type="text"
                  name="nombres"
                  [(ngModel)]="regData.nombres"
                  required
                  class="form-control"
                  placeholder="Carlos"
                />
              </div>
              <div class="form-group col-half">
                <label for="reg-apellidos"><i class="fas fa-user"></i> Apellidos:</label>
                <input
                  id="reg-apellidos"
                  type="text"
                  name="apellidos"
                  [(ngModel)]="regData.apellidos"
                  required
                  class="form-control"
                  placeholder="Gutiérrez"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="reg-email"><i class="fas fa-envelope"></i> Correo Electrónico:</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                [(ngModel)]="regData.email"
                required
                class="form-control"
                placeholder="cliente@ejemplo.com"
              />
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label for="reg-pwd"><i class="fas fa-key"></i> Contraseña:</label>
                <input
                  id="reg-pwd"
                  type="password"
                  name="password"
                  [(ngModel)]="regData.password"
                  required
                  minlength="8"
                  class="form-control"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div class="form-group col-half">
                <label for="reg-cpwd"><i class="fas fa-check-double"></i> Confirmar:</label>
                <input
                  id="reg-cpwd"
                  type="password"
                  name="confirmar"
                  [(ngModel)]="regData.confirmar_password"
                  required
                  class="form-control"
                  placeholder="Repita contraseña"
                />
              </div>
            </div>

            <button type="submit" [disabled]="loading || !regForm.valid" class="btn btn-success btn-block">
              <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
              <i class="fas fa-user-check" *ngIf="!loading"></i>
              {{ loading ? 'Creando cuenta...' : 'Registrar Cuenta de Cliente' }}
            </button>
          </form>
        </div>

        <!-- ==============================================
             TAB 3: RECUPERACIÓN DE CONTRASEÑA OTP (CU03)
             ============================================== -->
        <div *ngIf="activeTab === 'recuperar'" class="auth-content">
          <!-- Paso 1: Solicitar código OTP -->
          <div *ngIf="otpStep === 1" class="otp-step">
            <div class="alert alert-info">
              <i class="fas fa-info-circle"></i>
              <span><strong>Flujo CU03 (2 Pasos):</strong> Ingrese su correo electrónico para recibir un token seguro de 6 dígitos (válido por 15 min, máx 3 intentos).</span>
            </div>

            <div class="form-group">
              <label><i class="fas fa-envelope"></i> Correo Electrónico Registrado:</label>
              <div class="input-with-action">
                <input
                  type="email"
                  [(ngModel)]="otpEmail"
                  class="form-control"
                  placeholder="rodrigo.cliente@gmail.com"
                />
                <button type="button" class="btn btn-sm btn-outline" (click)="otpEmail = 'rodrigo.cliente@gmail.com'">
                  Semilla Rodrigo
                </button>
              </div>
            </div>

            <div *ngIf="otpSimulado" class="alert alert-success">
              <i class="fas fa-check-circle"></i>
              <div>
                <strong>Código OTP Generado:</strong> <code class="otp-highlight">{{ otpSimulado }}</code>
                <div class="otp-sub">Token listo para usar en el paso 2.</div>
              </div>
            </div>

            <div class="modal-actions" style="margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" (click)="activeTab = 'login'">Volver al Login</button>
              <button type="button" class="btn btn-primary" [disabled]="loading || !otpEmail" (click)="onSolicitarOtp()">
                <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
                <i class="fas fa-paper-plane" *ngIf="!loading"></i>
                {{ loading ? 'Generando OTP...' : 'Solicitar Código OTP (Paso 1)' }}
              </button>
            </div>
          </div>

          <!-- Paso 2: Validar OTP y cambiar password -->
          <div *ngIf="otpStep === 2" class="otp-step">
            <div class="alert alert-warning">
              <i class="fas fa-clock"></i> Código OTP emitido para <strong>{{ otpEmail }}</strong>. Expira en 15 minutos (Máximo 3 intentos).
            </div>

            <div class="form-group">
              <label><i class="fas fa-key"></i> Código de Verificación OTP (6 dígitos):</label>
              <input
                type="text"
                [(ngModel)]="otpCode"
                maxlength="6"
                class="form-control otp-input"
                placeholder="482915"
              />
            </div>

            <div class="form-group">
              <label><i class="fas fa-lock"></i> Nueva Contraseña Segura:</label>
              <input
                type="password"
                [(ngModel)]="otpNewPassword"
                class="form-control"
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div class="form-group">
              <label><i class="fas fa-check-double"></i> Confirmar Nueva Contraseña:</label>
              <input
                type="password"
                [(ngModel)]="otpConfirmPassword"
                class="form-control"
                placeholder="Repita la nueva contraseña"
              />
            </div>

            <div class="modal-actions" style="margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" (click)="otpStep = 1">
                <i class="fas fa-arrow-left"></i> Reenviar OTP
              </button>
              <button
                type="button"
                class="btn btn-success"
                [disabled]="loading || !otpCode || !otpNewPassword"
                (click)="onRestablecerOtp()">
                <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
                <i class="fas fa-check-circle" *ngIf="!loading"></i>
                {{ loading ? 'Restableciendo...' : 'Restablecer Clave e Iniciar Sesión (Paso 2)' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==============================================
           MODAL CU03: RECUPERAR CONTRASEÑA POR OTP
           ============================================== -->
      <div *ngIf="showOtpModal" class="modal-overlay">
        <div class="modal-card glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-shield-alt"></i> Recuperar Contraseña (CU03 - OTP)</h3>
            <button class="close-btn" (click)="showOtpModal = false">&times;</button>
          </div>

          <div class="modal-body">
            <!-- Paso 1: Solicitar código OTP -->
            <div *ngIf="otpStep === 1" class="otp-step">
              <p class="step-desc">
                Ingrese el correo de su cuenta. Se enviará un código de verificación de <strong>6 dígitos</strong> con vigencia de <strong>15 minutos</strong>.
              </p>
              <div class="form-group">
                <label><i class="fas fa-envelope"></i> Correo Electrónico:</label>
                <div class="input-with-action">
                  <input
                    type="email"
                    [(ngModel)]="otpEmail"
                    class="form-control"
                    placeholder="rodrigo.cliente@gmail.com"
                  />
                  <button type="button" class="btn btn-sm btn-outline" (click)="otpEmail = 'rodrigo.cliente@gmail.com'">
                    Semilla Rodrigo
                  </button>
                </div>
              </div>

              <div *ngIf="otpSimulado" class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <strong>Código OTP Generado:</strong> <code class="otp-highlight">{{ otpSimulado }}</code>
                <span class="otp-sub">(Para fines de evaluación académica en Ciclo 1)</span>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="showOtpModal = false">Cancelar</button>
                <button type="button" class="btn btn-primary" [disabled]="loading || !otpEmail" (click)="onSolicitarOtp()">
                  <i class="fas fa-paper-plane"></i> Solicitar Código OTP
                </button>
              </div>
            </div>

            <!-- Paso 2: Validar OTP y cambiar password -->
            <div *ngIf="otpStep === 2" class="otp-step">
              <div class="alert alert-warning">
                <i class="fas fa-clock"></i> Código enviado. Ingrese el token de 6 dígitos antes de que expiren los 15 minutos (Máximo 3 intentos).
              </div>

              <div class="form-group">
                <label><i class="fas fa-key"></i> Código de Verificación OTP (6 dígitos):</label>
                <input
                  type="text"
                  [(ngModel)]="otpCode"
                  maxlength="6"
                  class="form-control otp-input"
                  placeholder="482915"
                />
              </div>

              <div class="form-group">
                <label><i class="fas fa-lock"></i> Nueva Contraseña:</label>
                <input
                  type="password"
                  [(ngModel)]="otpNewPassword"
                  class="form-control"
                  placeholder="Nueva contraseña"
                />
              </div>

              <div class="form-group">
                <label><i class="fas fa-check-double"></i> Confirmar Nueva Contraseña:</label>
                <input
                  type="password"
                  [(ngModel)]="otpConfirmPassword"
                  class="form-control"
                  placeholder="Confirmar contraseña"
                />
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="otpStep = 1">Volver a Enviar</button>
                <button type="button" class="btn btn-success" [disabled]="loading || !otpCode || !otpNewPassword" (click)="onRestablecerOtp()">
                  <i class="fas fa-save"></i> Validar OTP y Restablecer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page-container {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .auth-card {
      width: 100%;
      max-width: 580px;
      padding: 2.5rem;
      border-radius: var(--radius-xl);
      background: rgba(17, 24, 39, 0.85);
      border: 1px solid var(--border-subtle);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      background: var(--accent-gradient-subtle);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .auth-header h2 {
      font-size: 1.6rem;
      color: var(--text-primary);
      margin-bottom: 0.35rem;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }
    .tabs-nav {
      display: flex;
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.3);
      padding: 0.35rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }
    .tab-btn {
      flex: 1;
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .tab-btn.active {
      background: var(--accent-primary);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }
    .quick-credentials {
      margin-bottom: 1.5rem;
      padding: 0.85rem;
      border-radius: var(--radius-md);
      background: rgba(15, 23, 42, 0.6);
      border: 1px dashed rgba(255, 255, 255, 0.15);
    }
    .quick-label {
      display: block;
      font-size: 0.78rem;
      color: #94a3b8;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    .credential-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .chip-btn {
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(30, 41, 59, 0.8);
      color: #f1f5f9;
      font-size: 0.75rem;
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .chip-btn:hover {
      transform: translateY(-1px);
      border-color: #818cf8;
      background: #1e293b;
    }
    .chip-btn.admin { border-color: rgba(239, 68, 68, 0.4); color: #fca5a5; }
    .chip-btn.manager { border-color: rgba(59, 130, 246, 0.4); color: #93c5fd; }
    .chip-btn.locked { border-color: rgba(245, 158, 11, 0.4); color: #fde68a; }
    .chip-btn.logistics { border-color: rgba(168, 85, 247, 0.4); color: #d8b4fe; }
    .chip-btn.client { border-color: rgba(16, 185, 129, 0.4); color: #6ee7b7; }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .form-control {
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.95rem;
      outline: none;
      transition: var(--transition-fast);
    }
    .form-control:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .form-row {
      display: flex;
      gap: 0.75rem;
    }
    .col-half {
      flex: 1;
    }
    .form-row-check {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      cursor: pointer;
    }
    .forgot-link {
      color: #818cf8;
      cursor: pointer;
      text-decoration: none;
      transition: var(--transition-fast);
    }
    .forgot-link:hover {
      text-decoration: underline;
      color: #a5b4fc;
    }
    .btn-block {
      width: 100%;
      padding: 0.85rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }
    .modal-card {
      width: 100%;
      max-width: 480px;
      padding: 2rem;
      background: #111827;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .modal-header h3 {
      font-size: 1.2rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      font-size: 1.5rem;
      cursor: pointer;
    }
    .step-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    .input-with-action {
      display: flex;
      gap: 0.5rem;
    }
    .otp-highlight {
      font-size: 1.2rem;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 2px;
      margin-left: 0.5rem;
    }
    .otp-sub {
      display: block;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.25rem;
    }
    .otp-input {
      font-size: 1.4rem;
      letter-spacing: 6px;
      text-align: center;
      font-family: monospace;
      font-weight: 700;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .alert {
      padding: 0.85rem 1rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      margin-top: 1rem;
    }
    .alert-info {
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.3);
      color: #bae6fd;
    }
    .alert-warning {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fde68a;
    }
  `]
})
export class LoginComponent {
  activeTab: 'login' | 'registro' | 'recuperar' = 'login';
  loading = false;

  loginData = {
    email: '',
    password: '',
    recordar_sesion: true
  };

  regData = {
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    confirmar_password: ''
  };

  // Modal OTP
  showOtpModal = false;
  otpStep = 1;
  otpEmail = '';
  otpCode = '';
  otpNewPassword = '';
  otpConfirmPassword = '';
  otpSimulado = '';

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  fillLogin(email: string, pass: string): void {
    this.loginData.email = email;
    this.loginData.password = pass;
  }

  onLogin(): void {
    this.loading = true;
    this.auth.login(this.loginData).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success('Bienvenido', `Sesión iniciada correctamente como ${res.nombres} (${res.rol})`);
        this.router.navigate(['/catalogo']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.detail || 'Error de autenticación. Verifique sus credenciales.';
        this.toast.error('Acceso denegado', msg);
      }
    });
  }

  onRegister(): void {
    if (this.regData.password !== this.regData.confirmar_password) {
      this.toast.warning('Contraseñas no coinciden', 'La confirmación debe coincidir exactamente.');
      return;
    }
    if (this.regData.password.length < 8) {
      this.toast.warning('Seguridad', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    this.loading = true;
    this.auth.register({
      nombres: this.regData.nombres,
      apellidos: this.regData.apellidos,
      email: this.regData.email,
      password: this.regData.password
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success('Registro Exitoso (CU02)', `Bienvenido ${res.nombres}. Su cuenta de cliente ha sido activada.`);
        this.router.navigate(['/catalogo']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.detail || 'Error en el registro.';
        this.toast.error('Error', msg);
      }
    });
  }

  openOtpTab(): void {
    this.activeTab = 'recuperar';
    this.otpStep = 1;
    this.otpEmail = this.loginData.email || 'rodrigo.cliente@gmail.com';
    this.otpSimulado = '';
    this.otpCode = '';
    this.otpNewPassword = '';
    this.otpConfirmPassword = '';
  }

  openOtpModal(): void {
    this.showOtpModal = true;
    this.otpStep = 1;
    this.otpEmail = this.loginData.email || 'rodrigo.cliente@gmail.com';
    this.otpSimulado = '';
    this.otpCode = '';
    this.otpNewPassword = '';
    this.otpConfirmPassword = '';
  }

  onSolicitarOtp(): void {
    this.loading = true;
    this.auth.requestOtp(this.otpEmail).subscribe({
      next: (res) => {
        this.loading = false;
        this.otpSimulado = res.codigo_otp_simulado || '';
        this.otpCode = this.otpSimulado;
        this.otpStep = 2;
        this.toast.info('Código OTP Generado', `Se generó el código de 6 dígitos con vigencia de 15 minutos.`);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.detail || 'Error al solicitar OTP.';
        this.toast.error('Error OTP', msg);
      }
    });
  }

  onRestablecerOtp(): void {
    if (this.otpNewPassword !== this.otpConfirmPassword) {
      this.toast.warning('Validación', 'Las contraseñas no coinciden.');
      return;
    }
    if (this.otpNewPassword.length < 8) {
      this.toast.warning('Seguridad', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    this.loading = true;
    this.auth.resetPasswordOtp({
      email: this.otpEmail,
      codigo_otp: this.otpCode,
      nueva_password: this.otpNewPassword
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.showOtpModal = false;
        this.activeTab = 'login';
        this.toast.success('Contraseña Restablecida (CU03)', 'Ahora puede iniciar sesión con su nueva clave.');
        this.loginData.email = this.otpEmail;
        this.loginData.password = this.otpNewPassword;
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.detail || 'Error al validar OTP.';
        this.toast.error('Error OTP', msg);
      }
    });
  }

}
