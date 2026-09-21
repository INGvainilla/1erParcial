import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormInputComponent } from './components/form-input/form-input.component';
import { PasswordFieldComponent } from './components/password-field/password-field.component';
import {
  nameValidator,
  emailValidator,
  otpValidator,
  securePasswordValidator,
  passwordMatchValidator,
  capitalizeWords
} from './auth-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, PasswordFieldComponent],
  template: `
    <div class="auth-page-container">
      <div class="auth-card glass-panel">
        <!-- Encabezado de Identidad -->
        <header class="auth-header">
          <div class="brand-badge">
            <i class="fas fa-crown" aria-hidden="true"></i> FashionStore
          </div>
          <h1 class="auth-title">Control de Acceso y Registro</h1>
          <p class="subtitle">Casos de Uso CU01, CU02 y CU03 (Seguridad RBAC y OTP)</p>

          <!-- Segmented Control Tabs (Accessible Tablist) -->
          <div class="tabs-nav" role="tablist" aria-label="Opciones de acceso y registro">
            <button
              type="button"
              id="tab-login"
              role="tab"
              class="tab-btn"
              [class.active]="activeTab === 'login'"
              [attr.aria-selected]="activeTab === 'login'"
              aria-controls="panel-login"
              tabindex="0"
              (click)="selectTab('login')"
              (keydown)="onTabKeydown($event, 'login')"
            >
              <i class="fas fa-sign-in-alt tab-icon" aria-hidden="true"></i>
              <span class="tab-text">Iniciar Sesión</span>
              <span class="tab-badge">CU01</span>
            </button>

            <button
              type="button"
              id="tab-registro"
              role="tab"
              class="tab-btn"
              [class.active]="activeTab === 'registro'"
              [attr.aria-selected]="activeTab === 'registro'"
              aria-controls="panel-registro"
              tabindex="0"
              (click)="selectTab('registro')"
              (keydown)="onTabKeydown($event, 'registro')"
            >
              <i class="fas fa-user-plus tab-icon" aria-hidden="true"></i>
              <span class="tab-text">Registrarse</span>
              <span class="tab-badge">CU02</span>
            </button>

            <button
              type="button"
              id="tab-recuperar"
              role="tab"
              class="tab-btn"
              [class.active]="activeTab === 'recuperar'"
              [attr.aria-selected]="activeTab === 'recuperar'"
              aria-controls="panel-recuperar"
              tabindex="0"
              (click)="openOtpTab()"
              (keydown)="onTabKeydown($event, 'recuperar')"
            >
              <i class="fas fa-key tab-icon" aria-hidden="true"></i>
              <span class="tab-text">Recuperar Clave</span>
              <span class="tab-badge">CU03 · OTP</span>
            </button>
          </div>
        </header>

        <!-- ==============================================
             TAB 1: INICIAR SESIÓN (CU01)
             ============================================== -->
        <section
          *ngIf="activeTab === 'login'"
          id="panel-login"
          role="tabpanel"
          aria-labelledby="tab-login"
          class="auth-content tab-pane-enter"
        >
          <!-- Cuentas Semilla de Prueba -->
          <div class="quick-credentials">
            <div class="quick-label">
              <i class="fas fa-bolt" aria-hidden="true"></i> Cuentas Semilla de Prueba:
            </div>
            <div class="credential-chips">
              <button
                type="button"
                class="chip-btn admin"
                (click)="fillLogin('alberto.delgado@store.bo', 'Admin123*')"
                title="Admin General - Acceso completo"
              >
                👑 Admin General
              </button>
              <button
                type="button"
                class="chip-btn manager"
                (click)="fillLogin('andy.mujica@store.bo', 'Admin123*')"
                title="Encargado Sucursal"
              >
                👔 Encargado Sucursal
              </button>
              <button
                type="button"
                class="chip-btn cashier"
                (click)="fillLogin('javier.roca@store.bo', 'Admin123*')"
                title="Cajero (Sucursal Equipetrol) - Terminal POS"
              >
                💳 Cajero
              </button>
              <button
                type="button"
                class="chip-btn logistics"
                (click)="fillLogin('mateo.logistica@store.bo', 'Admin123*')"
                title="Logística y Envíos"
              >
                📦 Logística
              </button>
              <button
                type="button"
                class="chip-btn client"
                (click)="fillLogin('rodrigo.cliente@gmail.com', 'Admin123*')"
                title="Cliente autoservicio"
              >
                👤 Cliente
              </button>
            </div>
          </div>

          <!-- Banner de Error de Servidor -->
          <div *ngIf="loginServerError" class="server-error-banner" role="alert">
            <i class="fas fa-triangle-exclamation" aria-hidden="true"></i>
            <div class="server-error-text">{{ loginServerError }}</div>
            <button
              type="button"
              class="banner-close-btn"
              (click)="loginServerError = ''"
              aria-label="Cerrar aviso"
            >
              &times;
            </button>
          </div>

          <!-- Formulario Login -->
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="auth-form" novalidate>
            <app-form-input
              id="login-email"
              label="Correo Electrónico"
              type="email"
              icon="fas fa-envelope"
              placeholder="ejemplo@store.bo"
              autocomplete="username"
              [control]="loginForm.get('email')"
              [disabled]="loading"
              (blurEvent)="normalizeLoginEmail()"
            ></app-form-input>

            <app-password-field
              id="login-password"
              label="Contraseña"
              icon="fas fa-lock"
              placeholder="••••••••"
              autocomplete="current-password"
              [control]="loginForm.get('password')"
              [disabled]="loading"
            ></app-password-field>

            <div class="form-row-check">
              <label class="custom-checkbox-label">
                <input
                  type="checkbox"
                  formControlName="recordar_sesion"
                  class="custom-checkbox"
                />
                <span class="checkbox-box">
                  <i class="fas fa-check checkbox-tick"></i>
                </span>
                <span class="checkbox-text">Recordar sesión (30 días)</span>
              </label>

              <button
                type="button"
                class="forgot-link-btn"
                (click)="openOtpTab()"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="btn btn-primary btn-submit"
            >
              <i class="fas fa-spinner fa-spin" *ngIf="loading" aria-hidden="true"></i>
              <i class="fas fa-arrow-right" *ngIf="!loading" aria-hidden="true"></i>
              <span>{{ loading ? 'Ingresando...' : 'Acceder al Sistema' }}</span>
            </button>
          </form>
        </section>

        <!-- ==============================================
             TAB 2: REGISTRO DE CLIENTE (CU02)
             ============================================== -->
        <section
          *ngIf="activeTab === 'registro'"
          id="panel-registro"
          role="tabpanel"
          aria-labelledby="tab-registro"
          class="auth-content tab-pane-enter"
        >
          <!-- Banner de Error de Servidor para Registro -->
          <div *ngIf="registerServerError" class="server-error-banner" role="alert">
            <i class="fas fa-triangle-exclamation" aria-hidden="true"></i>
            <div class="server-error-text">{{ registerServerError }}</div>
            <button
              type="button"
              class="banner-close-btn"
              (click)="registerServerError = ''"
              aria-label="Cerrar aviso"
            >
              &times;
            </button>
          </div>

          <form [formGroup]="regForm" (ngSubmit)="onRegister()" class="auth-form" novalidate>
            <!-- 2 Columnas para Nombres y Apellidos -->
            <div class="form-columns-2">
              <app-form-input
                id="reg-nombres"
                label="Nombres"
                type="text"
                icon="fas fa-user"
                placeholder="Carlos"
                autocomplete="given-name"
                [control]="regForm.get('nombres')"
                [disabled]="loading"
                (blurEvent)="formatNameField('nombres')"
              ></app-form-input>

              <app-form-input
                id="reg-apellidos"
                label="Apellidos"
                type="text"
                icon="fas fa-user"
                placeholder="Gutiérrez"
                autocomplete="family-name"
                [control]="regForm.get('apellidos')"
                [disabled]="loading"
                (blurEvent)="formatNameField('apellidos')"
              ></app-form-input>
            </div>

            <app-form-input
              id="reg-email"
              label="Correo Electrónico"
              type="email"
              icon="fas fa-envelope"
              placeholder="cliente@ejemplo.com"
              autocomplete="email"
              [control]="regForm.get('email')"
              [disabled]="loading"
              [customErrorMessage]="emailExistsError"
              (blurEvent)="normalizeRegEmail()"
            ></app-form-input>

            <!-- 2 Columnas para Contraseña y Confirmar -->
            <div class="form-columns-2">
              <app-password-field
                id="reg-pwd"
                label="Contraseña"
                icon="fas fa-key"
                placeholder="Mínimo 8 caracteres"
                autocomplete="new-password"
                [control]="regForm.get('password')"
                [disabled]="loading"
                [showChecklist]="true"
                [userContext]="userContextForPassword"
                (blurEvent)="onPasswordChanged()"
              ></app-password-field>

              <app-password-field
                id="reg-cpwd"
                label="Confirmar"
                icon="fas fa-check-double"
                placeholder="Repita contraseña"
                autocomplete="new-password"
                [control]="regForm.get('confirmar_password')"
                [disabled]="loading"
                [isConfirmField]="true"
              ></app-password-field>
            </div>

            <button
              type="submit"
              [disabled]="loading"
              class="btn btn-success btn-submit"
            >
              <i class="fas fa-spinner fa-spin" *ngIf="loading" aria-hidden="true"></i>
              <i class="fas fa-user-check" *ngIf="!loading" aria-hidden="true"></i>
              <span>{{ loading ? 'Registrando...' : 'Registrar Cuenta de Cliente' }}</span>
            </button>
          </form>
        </section>

        <!-- ==============================================
             TAB 3: RECUPERACIÓN DE CONTRASEÑA OTP (CU03)
             ============================================== -->
        <section
          *ngIf="activeTab === 'recuperar'"
          id="panel-recuperar"
          role="tabpanel"
          aria-labelledby="tab-recuperar"
          class="auth-content tab-pane-enter"
        >
          <!-- Paso 1: Solicitar código OTP -->
          <div *ngIf="otpStep === 1" class="otp-flow-step">
            <div class="alert-box alert-info" role="status">
              <i class="fas fa-info-circle alert-icon" aria-hidden="true"></i>
              <div class="alert-content">
                <strong>Flujo CU03 (2 Pasos):</strong> Ingrese su correo electrónico para recibir un token seguro de 6 dígitos (válido por 15 min, máx 3 intentos).
              </div>
            </div>

            <!-- Banner de Error OTP -->
            <div *ngIf="otpServerError" class="server-error-banner" role="alert">
              <i class="fas fa-triangle-exclamation" aria-hidden="true"></i>
              <div class="server-error-text">{{ otpServerError }}</div>
              <button
                type="button"
                class="banner-close-btn"
                (click)="otpServerError = ''"
                aria-label="Cerrar aviso"
              >
                &times;
              </button>
            </div>

            <form [formGroup]="otpRequestForm" (ngSubmit)="onSolicitarOtp()" class="auth-form" novalidate>
              <div class="field-with-addon">
                <app-form-input
                  id="otp-email"
                  label="Correo Electrónico Registrado"
                  type="email"
                  icon="fas fa-envelope"
                  placeholder="rodrigo.cliente@gmail.com"
                  autocomplete="email"
                  [control]="otpRequestForm.get('email')"
                  [disabled]="loading"
                ></app-form-input>

                <button
                  type="button"
                  class="btn-addon-seed"
                  (click)="fillOtpEmailSeed()"
                  title="Usar correo semilla de prueba"
                >
                  <i class="fas fa-seedling"></i> Semilla Rodrigo
                </button>
              </div>

              <div *ngIf="otpSimulado" class="alert-box alert-success" role="status">
                <i class="fas fa-check-circle alert-icon" aria-hidden="true"></i>
                <div class="alert-content">
                  <div class="otp-token-row">
                    <span>Código OTP Generado:</span>
                    <code class="otp-highlight-badge">{{ otpSimulado }}</code>
                  </div>
                  <span class="otp-sub-note">Token listo y precargado para el paso 2.</span>
                </div>
              </div>

              <div class="flow-actions-row">
                <button
                  type="button"
                  class="btn btn-secondary btn-action-half"
                  (click)="selectTab('login')"
                >
                  <i class="fas fa-arrow-left"></i> Volver al Login
                </button>
                <button
                  type="submit"
                  class="btn btn-primary btn-action-half"
                  [disabled]="loading"
                >
                  <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
                  <i class="fas fa-paper-plane" *ngIf="!loading"></i>
                  <span>{{ loading ? 'Generando OTP...' : 'Solicitar Código OTP (Paso 1)' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Paso 2: Validar OTP y cambiar password -->
          <div *ngIf="otpStep === 2" class="otp-flow-step">
            <div class="alert-box alert-warning" role="status">
              <i class="fas fa-clock alert-icon" aria-hidden="true"></i>
              <div class="alert-content">
                Código OTP emitido para <strong>{{ otpRequestForm.get('email')?.value }}</strong>. Expira en 15 minutos (Máximo 3 intentos).
              </div>
            </div>

            <!-- Banner de Error OTP Paso 2 -->
            <div *ngIf="otpServerError" class="server-error-banner" role="alert">
              <i class="fas fa-triangle-exclamation" aria-hidden="true"></i>
              <div class="server-error-text">{{ otpServerError }}</div>
              <button
                type="button"
                class="banner-close-btn"
                (click)="otpServerError = ''"
                aria-label="Cerrar aviso"
              >
                &times;
              </button>
            </div>

            <form [formGroup]="otpResetForm" (ngSubmit)="onRestablecerOtp()" class="auth-form" novalidate>
              <div class="otp-input-container">
                <app-form-input
                  id="otp-code"
                  label="Código de Verificación OTP (6 dígitos)"
                  type="text"
                  icon="fas fa-shield-halved"
                  placeholder="482915"
                  [maxlength]="6"
                  [control]="otpResetForm.get('codigo_otp')"
                  [disabled]="loading"
                ></app-form-input>
              </div>

              <div class="form-columns-2">
                <app-password-field
                  id="otp-new-password"
                  label="Nueva Contraseña"
                  icon="fas fa-lock"
                  placeholder="Nueva clave segura"
                  autocomplete="new-password"
                  [control]="otpResetForm.get('nueva_password')"
                  [disabled]="loading"
                  [showChecklist]="true"
                  [userContext]="userContextForOtpPassword"
                ></app-password-field>

                <app-password-field
                  id="otp-confirm-password"
                  label="Confirmar Contraseña"
                  icon="fas fa-check-double"
                  placeholder="Confirmar nueva clave"
                  autocomplete="new-password"
                  [control]="otpResetForm.get('confirmar_password')"
                  [disabled]="loading"
                  [isConfirmField]="true"
                ></app-password-field>
              </div>

              <div class="flow-actions-row">
                <button
                  type="button"
                  class="btn btn-secondary btn-action-half"
                  [disabled]="resendCountdown > 0 || loading"
                  (click)="onReenviarOtp()"
                >
                  <i class="fas fa-rotate-right"></i>
                  <span>{{ resendCountdown > 0 ? 'Reenviar en ' + resendCountdown + 's' : 'Reenviar OTP' }}</span>
                </button>

                <button
                  type="submit"
                  class="btn btn-success btn-action-half"
                  [disabled]="loading"
                >
                  <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
                  <i class="fas fa-check-circle" *ngIf="!loading"></i>
                  <span>{{ loading ? 'Restableciendo...' : 'Restablecer Clave e Ingresar (Paso 2)' }}</span>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    /* ==========================================================================
       Contenedor y Tarjeta Principal
       ========================================================================== */
    .auth-page-container {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1.5rem;
    }

    .auth-card {
      width: 100%;
      max-width: 620px;
      padding: 2.75rem 2.5rem;
      border-radius: var(--radius-xl, 24px);
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: var(--glass-blur, blur(16px));
      -webkit-backdrop-filter: var(--glass-blur, blur(16px));
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.04);
      transition: all var(--transition-smooth, 0.25s ease);
    }

    /* Encabezado */
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 1.1rem;
      border-radius: 9999px;
      background: var(--accent-gradient-subtle, linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%));
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #818cf8;
      font-size: 0.82rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 0.9rem;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
    }

    .auth-title {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--text-primary, #f8fafc);
      letter-spacing: -0.4px;
      margin-bottom: 0.35rem;
      line-height: 1.25;
    }

    .subtitle {
      color: var(--text-muted, #64748b);
      font-size: 0.88rem;
      margin-bottom: 1.5rem;
      line-height: 1.4;
    }

    /* ==========================================================================
       Segmented Control: Tabs Uniformes en 1 Línea
       ========================================================================== */
    .tabs-nav {
      display: flex;
      gap: 6px;
      background: rgba(11, 15, 25, 0.65);
      padding: 5px;
      border-radius: var(--radius-md, 10px);
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    }

    .tab-btn {
      flex: 1;
      min-width: 0;
      padding: 0.65rem 0.5rem;
      border: none;
      background: transparent;
      color: var(--text-secondary, #94a3b8);
      border-radius: var(--radius-sm, 6px);
      cursor: pointer;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-weight: 600;
      font-size: 0.84rem;
      transition: all var(--transition-fast, 0.15s ease);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
      user-select: none;
    }

    .tab-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary, #f8fafc);
    }

    .tab-btn:focus-visible {
      outline: 2px solid var(--accent-primary, #6366f1);
      outline-offset: 2px;
    }

    .tab-btn.active {
      background: var(--accent-primary, #6366f1);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }

    .tab-icon {
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .tab-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tab-badge {
      font-size: 0.68rem;
      padding: 2px 5px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.25);
      color: inherit;
      font-weight: 700;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }

    .tab-btn.active .tab-badge {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Animación suave al cambiar de pestaña (150-200ms) */
    .tab-pane-enter {
      animation: tabFadeSlide 0.18s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes tabFadeSlide {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ==========================================================================
       Sección Compacta: Cuentas Semilla
       ========================================================================== */
    .quick-credentials {
      margin-bottom: 1.5rem;
      padding: 0.9rem 1rem;
      border-radius: var(--radius-md, 10px);
      background: rgba(15, 23, 42, 0.6);
      border: 1px dashed rgba(255, 255, 255, 0.14);
    }

    .quick-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      color: var(--text-secondary, #94a3b8);
      margin-bottom: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .quick-label i {
      color: #f59e0b;
    }

    .credential-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .chip-btn {
      padding: 0.38rem 0.65rem;
      border-radius: var(--radius-sm, 6px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(30, 41, 59, 0.75);
      color: #f1f5f9;
      font-size: 0.76rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast, 0.15s ease);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .chip-btn:hover {
      transform: translateY(-1px);
      background: #1e293b;
    }

    .chip-btn.admin { border-color: rgba(239, 68, 68, 0.4); color: #fca5a5; }
    .chip-btn.manager { border-color: rgba(59, 130, 246, 0.4); color: #93c5fd; }
    .chip-btn.locked, .chip-btn.cashier { border-color: rgba(245, 158, 11, 0.4); color: #fde68a; }
    .chip-btn.logistics { border-color: rgba(168, 85, 247, 0.4); color: #d8b4fe; }
    .chip-btn.client { border-color: rgba(16, 185, 129, 0.4); color: #6ee7b7; }

    /* ==========================================================================
       Banner de Error del Servidor
       ========================================================================== */
    .server-error-banner {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 0.85rem 1rem;
      border-radius: var(--radius-md, 10px);
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #fca5a5;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      animation: bannerSlide 0.2s ease-out;
    }

    .server-error-banner i {
      font-size: 1.1rem;
      color: var(--color-danger, #ef4444);
      margin-top: 1px;
      flex-shrink: 0;
    }

    .server-error-text {
      flex: 1;
      line-height: 1.45;
    }

    .banner-close-btn {
      background: transparent;
      border: none;
      color: #fca5a5;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
    }

    @keyframes bannerSlide {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ==========================================================================
       Formularios y Controles
       ========================================================================== */
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .form-columns-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    /* Checkbox personalizado */
    .form-row-check {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.1rem 0;
    }

    .custom-checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      color: var(--text-secondary, #94a3b8);
      user-select: none;
    }

    .custom-checkbox {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .checkbox-box {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.15));
      background: rgba(15, 23, 42, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast, 0.15s ease);
    }

    .checkbox-tick {
      font-size: 0.68rem;
      color: #ffffff;
      opacity: 0;
      transform: scale(0.6);
      transition: all var(--transition-fast, 0.15s ease);
    }

    .custom-checkbox:checked + .checkbox-box {
      background: var(--accent-primary, #6366f1);
      border-color: var(--accent-primary, #6366f1);
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
    }

    .custom-checkbox:checked + .checkbox-box .checkbox-tick {
      opacity: 1;
      transform: scale(1);
    }

    .forgot-link-btn {
      background: transparent;
      border: none;
      color: #818cf8;
      font-size: 0.85rem;
      cursor: pointer;
      font-weight: 500;
      padding: 0;
      transition: color var(--transition-fast, 0.15s ease);
    }

    .forgot-link-btn:hover {
      color: #a5b4fc;
      text-decoration: underline;
    }

    /* ==========================================================================
       Botones de Envío (~50px)
       ========================================================================== */
    .btn-submit {
      width: 100%;
      height: 50px;
      padding: 0 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border-radius: var(--radius-md, 10px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      letter-spacing: 0.2px;
      border: none;
      cursor: pointer;
      transition: all var(--transition-smooth, 0.25s ease);
    }

    .btn-primary.btn-submit {
      background: var(--accent-gradient, linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%));
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }

    .btn-primary.btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(99, 102, 241, 0.45);
      filter: brightness(1.08);
    }

    .btn-success.btn-submit {
      background: var(--color-success, #10b981);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
    }

    .btn-success.btn-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
      filter: brightness(1.08);
    }

    .btn-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    /* ==========================================================================
       Flujo OTP CU03
       ========================================================================== */
    .otp-flow-step {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .alert-box {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 0.9rem 1rem;
      border-radius: var(--radius-md, 10px);
      font-size: 0.85rem;
      line-height: 1.45;
    }

    .alert-icon {
      font-size: 1.1rem;
      margin-top: 1px;
      flex-shrink: 0;
    }

    .alert-info {
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.35);
      color: #bae6fd;
    }

    .alert-warning {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fde68a;
    }

    .alert-success {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #a7f3d0;
    }

    .field-with-addon {
      position: relative;
    }

    .btn-addon-seed {
      position: absolute;
      top: 0;
      right: 0;
      padding: 0.2rem 0.6rem;
      font-size: 0.74rem;
      font-weight: 600;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #a5b4fc;
      border-radius: var(--radius-sm, 6px);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all var(--transition-fast, 0.15s ease);
    }

    .btn-addon-seed:hover {
      background: rgba(99, 102, 241, 0.28);
      color: #ffffff;
    }

    .otp-token-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .otp-highlight-badge {
      font-size: 1.25rem;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 3px;
      background: rgba(0, 0, 0, 0.35);
      padding: 2px 10px;
      border-radius: 6px;
      border: 1px solid rgba(56, 189, 248, 0.35);
      font-family: var(--font-mono, 'Fira Code', monospace);
    }

    .otp-sub-note {
      display: block;
      font-size: 0.76rem;
      color: #94a3b8;
      margin-top: 4px;
    }

    .otp-input-container {
      width: 100%;
    }

    .flow-actions-row {
      display: flex;
      gap: 0.85rem;
      margin-top: 0.5rem;
    }

    .btn-action-half {
      flex: 1;
      height: 50px;
      font-size: 0.92rem;
      font-weight: 600;
      border-radius: var(--radius-md, 10px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      border: none;
      transition: all var(--transition-smooth, 0.25s ease);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: var(--text-primary, #f8fafc);
      border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-secondary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ==========================================================================
       Responsive Design (Desde 360px)
       ========================================================================== */
    @media (max-width: 640px) {
      .auth-page-container {
        padding: 1rem;
      }

      .auth-card {
        padding: 1.75rem 1.25rem;
      }

      .auth-title {
        font-size: 1.35rem;
      }

      .tabs-nav {
        gap: 3px;
        padding: 3px;
      }

      .tab-btn {
        padding: 0.55rem 0.35rem;
        font-size: 0.76rem;
        gap: 4px;
      }

      .tab-icon {
        display: none;
      }

      .tab-badge {
        display: none;
      }

      .form-columns-2 {
        grid-template-columns: 1fr;
        gap: 1.1rem;
      }

      .flow-actions-row {
        flex-direction: column;
      }

      .btn-action-half {
        width: 100%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tab-pane-enter, .server-error-banner, .btn-submit, .chip-btn {
        transition: none !important;
        animation: none !important;
        transform: none !important;
      }
    }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  activeTab: 'login' | 'registro' | 'recuperar' = 'login';
  loading = false;

  // Servidor errores
  loginServerError = '';
  registerServerError = '';
  otpServerError = '';
  emailExistsError = '';

  // Temporizador de reenvío OTP
  resendCountdown = 0;
  private timerId: any = null;

  // Paso de OTP (1: solicitar, 2: canjear y reset)
  otpStep = 1;
  otpSimulado = '';

  // Formularios Reactivos
  loginForm!: FormGroup;
  regForm!: FormGroup;
  otpRequestForm!: FormGroup;
  otpResetForm!: FormGroup;

  constructor(
    private auth: AuthService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  private initForms(): void {
    // CU01: Iniciar Sesión (Sin reglas de complejidad en contraseña para permitir cuentas semilla)
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, emailValidator()]),
      password: new FormControl('', [Validators.required]),
      recordar_sesion: new FormControl(true)
    });

    // CU02: Registro de Cliente (Validaciones estrictas y reglas de contraseña)
    this.regForm = new FormGroup({
      nombres: new FormControl('', [Validators.required, nameValidator()]),
      apellidos: new FormControl('', [Validators.required, nameValidator()]),
      email: new FormControl('', [Validators.required, emailValidator()]),
      password: new FormControl('', [
        Validators.required,
        securePasswordValidator(() => this.userContextForPassword)
      ]),
      confirmar_password: new FormControl('', [Validators.required])
    }, {
      validators: [passwordMatchValidator('password', 'confirmar_password')]
    });

    // CU03: Recuperar Contraseña - Paso 1
    this.otpRequestForm = new FormGroup({
      email: new FormControl('rodrigo.cliente@gmail.com', [Validators.required, emailValidator()])
    });

    // CU03: Recuperar Contraseña - Paso 2
    this.otpResetForm = new FormGroup({
      codigo_otp: new FormControl('', [Validators.required, otpValidator()]),
      nueva_password: new FormControl('', [
        Validators.required,
        securePasswordValidator(() => this.userContextForOtpPassword)
      ]),
      confirmar_password: new FormControl('', [Validators.required])
    }, {
      validators: [passwordMatchValidator('nueva_password', 'confirmar_password')]
    });
  }

  // Contextos de usuario para validación de contraseña no inclusiva de datos
  get userContextForPassword(): { email?: string; nombres?: string; apellidos?: string } {
    return {
      email: this.regForm?.get('email')?.value,
      nombres: this.regForm?.get('nombres')?.value,
      apellidos: this.regForm?.get('apellidos')?.value
    };
  }

  get userContextForOtpPassword(): { email?: string; nombres?: string; apellidos?: string } {
    return {
      email: this.otpRequestForm?.get('email')?.value
    };
  }

  // =========================================================================
  // Control de Pestañas y Accesibilidad
  // =========================================================================
  selectTab(tab: 'login' | 'registro' | 'recuperar'): void {
    this.activeTab = tab;
    this.loginServerError = '';
    this.registerServerError = '';
    this.otpServerError = '';
    this.emailExistsError = '';
  }

  openOtpTab(): void {
    this.selectTab('recuperar');
    this.otpStep = 1;
    this.otpServerError = '';
    const loginEmail = this.loginForm?.get('email')?.value;
    if (loginEmail) {
      this.otpRequestForm.patchValue({ email: loginEmail });
    }
  }

  onTabKeydown(event: KeyboardEvent, currentTab: string): void {
    const tabs: ('login' | 'registro' | 'recuperar')[] = ['login', 'registro', 'recuperar'];
    const idx = tabs.indexOf(currentTab as any);

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      const nextTab = tabs[(idx + 1) % tabs.length];
      this.selectTab(nextTab);
      const nextBtn = document.getElementById(`tab-${nextTab}`);
      nextBtn?.focus();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      const prevTab = tabs[(idx - 1 + tabs.length) % tabs.length];
      this.selectTab(prevTab);
      const prevBtn = document.getElementById(`tab-${prevTab}`);
      prevBtn?.focus();
    }
  }

  // =========================================================================
  // CU01: Iniciar Sesión
  // =========================================================================
  fillLogin(email: string, pass: string): void {
    this.loginServerError = '';
    const cleanEmail = email.trim().toLowerCase();
    this.loginForm.patchValue({
      email: cleanEmail,
      password: pass
    });
    this.loginForm.markAsDirty();
    this.loginForm.markAsTouched();
    this.loginForm.get('email')?.markAsTouched();
    this.loginForm.get('password')?.markAsTouched();
    this.loginForm.get('email')?.updateValueAndValidity();
    this.loginForm.get('password')?.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  normalizeLoginEmail(): void {
    const control = this.loginForm.get('email');
    if (control && control.value) {
      control.setValue(control.value.trim().toLowerCase());
    }
  }

  onLogin(): void {
    this.loginServerError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.focusFirstInvalidField('login');
      return;
    }

    const { email, password, recordar_sesion } = this.loginForm.value;
    const cleanEmail = email.trim().toLowerCase();

    this.loading = true;
    this.auth.login({
      email: cleanEmail,
      password,
      recordar_sesion
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success('Bienvenido', `Sesión iniciada correctamente como ${res.nombres} (${res.rol})`);
        this.router.navigate(['/catalogo']);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        const status = err.status;
        const detail = err.error?.detail;

        if (status === 401) {
          this.loginServerError = detail || 'Credenciales inválidas. Verifique su correo o contraseña.';
        } else if (status === 403) {
          this.loginServerError = detail || 'Cuenta bloqueada preventivamente tras superar los intentos fallidos permitidos.';
        } else if (status === 0) {
          this.loginServerError = 'No se pudo conectar con el servidor. Verifique su conexión de red.';
        } else {
          this.loginServerError = detail || 'Error de autenticación. Verifique sus credenciales.';
        }

        this.toast.error('Acceso denegado', this.loginServerError);
        this.cdr.markForCheck();
      }
    });
  }

  // =========================================================================
  // CU02: Auto-registro de Cliente
  // =========================================================================
  formatNameField(field: 'nombres' | 'apellidos'): void {
    const control = this.regForm.get(field);
    if (control && control.value) {
      control.setValue(capitalizeWords(control.value));
    }
  }

  normalizeRegEmail(): void {
    this.emailExistsError = '';
    const control = this.regForm.get('email');
    if (control && control.value) {
      control.setValue(control.value.trim().toLowerCase());
    }
  }

  onPasswordChanged(): void {
    this.regForm.get('confirmar_password')?.updateValueAndValidity();
  }

  onRegister(): void {
    this.registerServerError = '';
    this.emailExistsError = '';

    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched();
      this.focusFirstInvalidField('reg');
      return;
    }

    const { nombres, apellidos, email, password } = this.regForm.value;
    const payload = {
      nombres: capitalizeWords(nombres),
      apellidos: capitalizeWords(apellidos),
      email: email.trim().toLowerCase(),
      password
    };

    this.loading = true;
    this.auth.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.toast.success(
          'Registro Exitoso (CU02)',
          `Bienvenido ${res.nombres}. Su cuenta de cliente ha sido activada.`
        );
        this.router.navigate(['/catalogo']);
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        const detail = err.error?.detail || '';
        if (err.status === 400 && (detail.toLowerCase().includes('registrado') || detail.toLowerCase().includes('correo'))) {
          this.emailExistsError = 'Este correo ya está registrado';
          this.registerServerError = detail;
        } else {
          this.registerServerError = detail || 'Error al procesar el registro. Revise los datos ingresados.';
        }
        this.toast.error('Error en Registro', this.registerServerError);
        this.cdr.markForCheck();
      }
    });
  }

  // =========================================================================
  // CU03: Recuperación de Contraseña por OTP
  // =========================================================================
  fillOtpEmailSeed(): void {
    this.otpRequestForm.patchValue({ email: 'rodrigo.cliente@gmail.com' });
    this.otpRequestForm.markAsDirty();
    this.otpRequestForm.markAsTouched();
    this.otpRequestForm.get('email')?.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  onSolicitarOtp(): void {
    this.otpServerError = '';

    if (this.otpRequestForm.invalid) {
      this.otpRequestForm.markAllAsTouched();
      const el = document.getElementById('otp-email');
      el?.focus();
      return;
    }

    const email = this.otpRequestForm.get('email')?.value.trim().toLowerCase();
    this.loading = true;

    this.auth.requestOtp(email).subscribe({
      next: (res) => {
        this.loading = false;
        this.otpSimulado = res.codigo_otp_simulado || '';
        this.otpResetForm.patchValue({ codigo_otp: this.otpSimulado });
        this.otpStep = 2;
        this.startResendTimer(60);
        this.toast.info(
          'Código OTP Generado',
          'Se generó el código de 6 dígitos con vigencia de 15 minutos.'
        );
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.otpServerError = err.error?.detail || 'Error al solicitar OTP. Verifique que el correo exista.';
        this.toast.error('Error OTP', this.otpServerError);
        this.cdr.markForCheck();
      }
    });
  }

  onReenviarOtp(): void {
    if (this.resendCountdown > 0) return;
    this.onSolicitarOtp();
  }

  private startResendTimer(seconds: number): void {
    this.resendCountdown = seconds;
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
      this.cdr.markForCheck();
    }, 1000);
  }

  onRestablecerOtp(): void {
    this.otpServerError = '';

    if (this.otpResetForm.invalid) {
      this.otpResetForm.markAllAsTouched();
      this.focusFirstInvalidField('otp');
      return;
    }

    const email = this.otpRequestForm.get('email')?.value.trim().toLowerCase();
    const { codigo_otp, nueva_password } = this.otpResetForm.value;

    this.loading = true;
    this.auth.resetPasswordOtp({
      email,
      codigo_otp: codigo_otp.trim(),
      nueva_password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.toast.success(
          'Contraseña Restablecida (CU03)',
          'Ahora puede iniciar sesión con su nueva clave.'
        );
        this.activeTab = 'login';
        this.loginForm.patchValue({
          email,
          password: nueva_password
        });
        this.otpResetForm.reset();
        this.otpSimulado = '';
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.otpServerError = err.error?.detail || 'Error al validar OTP. El código puede ser inválido o haber expirado.';
        this.toast.error('Error OTP', this.otpServerError);
        this.cdr.markForCheck();
      }
    });
  }

  // =========================================================================
  // Utilidades de Enfoque y Accesibilidad
  // =========================================================================
  private focusFirstInvalidField(formType: 'login' | 'reg' | 'otp'): void {
    setTimeout(() => {
      const invalidInput = document.querySelector(`.auth-content input[aria-invalid="true"]`) as HTMLElement;
      if (invalidInput) {
        invalidInput.focus();
      }
    }, 50);
  }
}
