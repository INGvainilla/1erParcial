import { Component, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TenantService } from '../../../core/services/tenant.service';
import { PlanSuscripcion } from '../../../core/models/fashion.models';
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
      <div class="auth-card glass-panel" [class.auth-card-wide]="activeTab === 'saas'">
        <!-- Encabezado de Identidad -->
        <header class="auth-header">
          <div class="brand-badge">
            <i class="fas fa-crown" aria-hidden="true"></i> FashionStore
          </div>
          <h1 class="auth-title">Control de Acceso Multitenant (CU04 - P2)</h1>
          <p class="subtitle">Autenticación Segura Multitenant, RBAC y Afiliación SaaS (CU04 - P2 / CU01-CU03)</p>

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
              <span class="tab-badge">CU04 - P2</span>
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

            <button
              type="button"
              id="tab-saas"
              role="tab"
              class="tab-btn tab-btn-saas"
              [class.active]="activeTab === 'saas'"
              [attr.aria-selected]="activeTab === 'saas'"
              aria-controls="panel-saas"
              tabindex="0"
              (click)="selectTab('saas')"
              (keydown)="onTabKeydown($event, 'saas')"
            >
              <i class="fas fa-store tab-icon" aria-hidden="true"></i>
              <span class="tab-text">Afiliación SaaS (B2B)</span>
              <span class="tab-badge saas-badge">CU01/02/03 - P2</span>
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
                class="chip-btn superadmin"
                (click)="fillLogin('superadmin@fashionstore.bo', 'SuperAdmin123*')"
                title="Super Administrador SaaS - Gestión Global de Plataforma y Tenants"
              >
                ⚡ Super Admin SaaS
              </button>
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

        <!-- ==============================================
             TAB 4: AFILIACIÓN SAAS PARA EMPRESAS Y SUCURSALES (B2B)
             ============================================== -->
        <section
          *ngIf="activeTab === 'saas'"
          id="panel-saas"
          role="tabpanel"
          aria-labelledby="tab-saas"
          class="auth-content tab-pane-enter saas-content"
        >
          <!-- Banner Informativo del SaaS -->
          <div class="saas-hero-banner">
            <div class="saas-hero-header">
              <span class="saas-tag"><i class="fas fa-sparkles"></i> Solución Omnicanal para Boutiques y Marcas</span>
              <h2 class="saas-hero-title">Potencie sus Sucursales Físicas y Tienda Digital con FashionStore SaaS</h2>
              <p class="saas-hero-desc">
                La plataforma omnicanal especializada para marcas de moda: arquitectura multitenant aislada, probadores virtuales 3D e Inteligencia Artificial, puntos de venta (POS) offline-first para facturar sin interrupciones y facturación fiscal automatizada con envío directo al correo.
              </p>
            </div>

            <!-- Grilla de Beneficios / Capacidades -->
            <div class="saas-features-grid">
              <div class="saas-feature-card">
                <div class="feature-icon-wrapper purple">
                  <i class="fas fa-network-wired"></i>
                </div>
                <div class="feature-text">
                  <h3>Gobernanza Multitenant Aislada</h3>
                  <p>Esquema de base de datos independiente, subdominio propio y control de accesos RBAC para directores, cajeros y sucursales.</p>
                </div>
              </div>

              <div class="saas-feature-card">
                <div class="feature-icon-wrapper pink">
                  <i class="fas fa-vr-cardboard"></i>
                </div>
                <div class="feature-text">
                  <h3>Probador Virtual 3D & Realidad Aumentada</h3>
                  <p>Experiencia interactiva en web y app móvil para recomendación precisa de tallas y visualización 3D de prendas.</p>
                </div>
              </div>

              <div class="saas-feature-card">
                <div class="feature-icon-wrapper amber">
                  <i class="fas fa-cash-register"></i>
                </div>
                <div class="feature-text">
                  <h3>Puntos de Venta (POS) Offline-First</h3>
                  <p>Facturación física continua en caja aún si se corta internet. Sincronización automática de inventarios multitienda.</p>
                </div>
              </div>

              <div class="saas-feature-card">
                <div class="feature-icon-wrapper green">
                  <i class="fas fa-file-invoice-dollar"></i>
                </div>
                <div class="feature-text">
                  <h3>Facturación Electrónica con Envío al Correo</h3>
                  <p>Generación automática de facturas fiscales con QR y despacho inmediato por email en compras online y presenciales.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Selector Interactivo de Planes de Suscripción Oficiales -->
          <div class="saas-plans-section">
            <div class="plans-title-row">
              <h3><i class="fas fa-tags"></i> Planes de Suscripción Oficiales de la Plataforma:</h3>
              <span class="plans-subtitle">Planes oficiales del sistema multitenant - Puede escalar de plan según la expansión de sus sucursales</span>
            </div>

            <!-- Grilla Dinámica (Cargada desde la base de datos) -->
            <div class="plans-cards-grid" *ngIf="planes.length > 0">
              <div
                *ngFor="let plan of planes"
                class="plan-card"
                [class.plan-featured]="plan.codigo === 'PLAN_PRO'"
                [class.selected]="selectedPlanId === plan.id_plan"
                (click)="selectPlan(plan.id_plan)"
              >
                <div *ngIf="plan.codigo === 'PLAN_PRO'" class="popular-ribbon">
                  <i class="fas fa-crown"></i> RECOMENDADO
                </div>
                <div class="plan-header">
                  <span class="plan-badge" [class.featured-badge]="plan.codigo === 'PLAN_PRO'">{{ plan.codigo }}</span>
                  <h4>{{ plan.nombre }}</h4>
                  <div class="plan-price">Bs. {{ plan.precio_mensual }} <small>/ mes</small></div>
                  <p class="plan-desc-line" *ngIf="plan.descripcion">{{ plan.descripcion }}</p>
                </div>
                <ul class="plan-features">
                  <li><i class="fas fa-check-circle text-green"></i> Hasta <strong>{{ plan.max_sucursales }} sucursales</strong> físicas</li>
                  <li><i class="fas fa-check-circle text-green"></i> Hasta <strong>{{ plan.max_usuarios }} usuarios</strong> staff con RBAC</li>
                  <li><i class="fas fa-check-circle text-green"></i> Operación Offline-First en SQLite local</li>
                  <li [style.opacity]="plan.permite_reportes_ia ? '1' : '0.4'">
                    <i class="fas" [ngClass]="plan.permite_reportes_ia ? 'fa-check-circle text-green' : 'fa-times-circle text-muted'"></i>
                    Reportes generativos e Inteligencia Artificial
                  </li>
                  <li [style.opacity]="plan.permite_ml_dashboard ? '1' : '0.4'">
                    <i class="fas" [ngClass]="plan.permite_ml_dashboard ? 'fa-check-circle text-green' : 'fa-times-circle text-muted'"></i>
                    Dashboards analíticos de Machine Learning
                  </li>
                </ul>
                <div class="plan-select-indicator" [class.featured-indicator]="plan.codigo === 'PLAN_PRO'">
                  <i class="fas" [ngClass]="selectedPlanId === plan.id_plan ? 'fa-dot-circle' : 'fa-circle'"></i>
                  <span>{{ selectedPlanId === plan.id_plan ? 'Plan Seleccionado' : 'Elegir ' + plan.nombre }}</span>
                </div>
              </div>
            </div>

            <!-- Grilla Fallback Fidedigna a la Base de Datos -->
            <div class="plans-cards-grid" *ngIf="planes.length === 0">
              <!-- Plan Básico (Bs. 99) -->
              <div
                class="plan-card"
                [class.selected]="selectedPlanId === 1"
                (click)="selectPlan(1)"
              >
                <div class="plan-header">
                  <span class="plan-badge">PLAN_BASICO</span>
                  <h4>Básico</h4>
                  <div class="plan-price">Bs. 99.00 <small>/ mes</small></div>
                  <p class="plan-desc-line">Plan esencial para pequeñas boutiques textiles con hasta 2 sucursales y operación offline.</p>
                </div>
                <ul class="plan-features">
                  <li><i class="fas fa-check-circle text-green"></i> Hasta <strong>2 sucursales</strong> físicas y almacenes</li>
                  <li><i class="fas fa-check-circle text-green"></i> Hasta <strong>10 usuarios</strong> staff con control RBAC</li>
                  <li><i class="fas fa-check-circle text-green"></i> Operación Offline-First en SQLite local</li>
                  <li style="opacity: 0.4;"><i class="fas fa-times-circle text-muted"></i> Reportes generativos e Inteligencia Artificial</li>
                  <li style="opacity: 0.4;"><i class="fas fa-times-circle text-muted"></i> Dashboards analíticos de Machine Learning</li>
                </ul>
                <div class="plan-select-indicator">
                  <i class="fas" [ngClass]="selectedPlanId === 1 ? 'fa-dot-circle' : 'fa-circle'"></i>
                  <span>{{ selectedPlanId === 1 ? 'Plan Seleccionado' : 'Elegir Básico' }}</span>
                </div>
              </div>

              <!-- Plan Pro (Bs. 199 - Recomendado) -->
              <div
                class="plan-card plan-featured"
                [class.selected]="selectedPlanId === 2"
                (click)="selectPlan(2)"
              >
                <div class="popular-ribbon"><i class="fas fa-crown"></i> RECOMENDADO</div>
                <div class="plan-header">
                  <span class="plan-badge featured-badge">PLAN_PRO</span>
                  <h4>Profesional</h4>
                  <div class="plan-price">Bs. 199.00 <small>/ mes</small></div>
                  <p class="plan-desc-line">Plan integral con hasta 10 sucursales, reportes generativos con IA y dashboards de Machine Learning.</p>
                </div>
                <ul class="plan-features">
                  <li><i class="fas fa-check-circle text-green"></i> Hasta <strong>10 sucursales</strong> físicas y almacenes</li>
                  <li><i class="fas fa-check-circle text-green"></i> Hasta <strong>25 usuarios</strong> staff con control RBAC</li>
                  <li><i class="fas fa-check-circle text-green"></i> Operación Offline-First en SQLite local</li>
                  <li><i class="fas fa-check-circle text-green"></i> Reportes generativos e Inteligencia Artificial</li>
                  <li><i class="fas fa-check-circle text-green"></i> Dashboards analíticos de Machine Learning</li>
                </ul>
                <div class="plan-select-indicator featured-indicator">
                  <i class="fas" [ngClass]="selectedPlanId === 2 ? 'fa-dot-circle' : 'fa-circle'"></i>
                  <span>{{ selectedPlanId === 2 ? 'Plan Seleccionado' : 'Elegir Profesional' }}</span>
                </div>
              </div>

              <!-- Plan Empresarial (Bs. 399) -->
              <div
                class="plan-card"
                [class.selected]="selectedPlanId === 3"
                (click)="selectPlan(3)"
              >
                <div class="plan-header">
                  <span class="plan-badge">PLAN_ENTERPRISE</span>
                  <h4>Empresarial</h4>
                  <div class="plan-price">Bs. 399.00 <small>/ mes</small></div>
                  <p class="plan-desc-line">Plan corporativo integral con hasta 25 sucursales, bodegas centrales, analítica predictiva y soporte 24/7.</p>
                </div>
                <ul class="plan-features">
                  <li><i class="fas fa-check-circle text-green"></i> Hasta <strong>25 sucursales</strong> físicas y almacenes</li>
                  <li><i class="fas fa-check-circle text-green"></i> Hasta <strong>100 usuarios</strong> staff con control RBAC</li>
                  <li><i class="fas fa-check-circle text-green"></i> Operación Offline-First en SQLite local</li>
                  <li><i class="fas fa-check-circle text-green"></i> Reportes generativos e Inteligencia Artificial</li>
                  <li><i class="fas fa-check-circle text-green"></i> Dashboards analíticos de Machine Learning</li>
                </ul>
                <div class="plan-select-indicator">
                  <i class="fas" [ngClass]="selectedPlanId === 3 ? 'fa-dot-circle' : 'fa-circle'"></i>
                  <span>{{ selectedPlanId === 3 ? 'Plan Seleccionado' : 'Elegir Empresarial' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Banner de Error SaaS -->
          <div *ngIf="empresaServerError" class="server-error-banner" role="alert">
            <i class="fas fa-triangle-exclamation" aria-hidden="true"></i>
            <div class="server-error-text">{{ empresaServerError }}</div>
            <button
              type="button"
              class="banner-close-btn"
              (click)="empresaServerError = ''"
              aria-label="Cerrar aviso"
            >
              &times;
            </button>
          </div>

          <!-- Formulario de Registro de Empresa -->
          <div class="saas-form-wrapper">
            <div class="saas-form-header">
              <h3><i class="fas fa-file-contract"></i> Formulario de Alta y Registro B2B</h3>
              <p>Complete los datos de su marca para aprovisionar su entorno en la nube e iniciar de inmediato.</p>
            </div>

            <form [formGroup]="empresaForm" (ngSubmit)="onRegisterEmpresa()" class="auth-form" novalidate>
              <div class="form-section-title">
                <i class="fas fa-store"></i> 1. Información de la Empresa o Cadena
              </div>

              <div class="form-columns-2">
                <app-form-input
                  id="emp-nombre-comercial"
                  label="Nombre Comercial"
                  type="text"
                  icon="fas fa-store"
                  placeholder="Ej. Boutique Glamour"
                  [control]="empresaForm.get('nombre_comercial')"
                  [disabled]="loading"
                  (blurEvent)="onNombreComercialBlur()"
                ></app-form-input>

                <app-form-input
                  id="emp-razon-social"
                  label="Razón Social Legal"
                  type="text"
                  icon="fas fa-building"
                  placeholder="Ej. Glamour Moda S.R.L."
                  [control]="empresaForm.get('razon_social')"
                  [disabled]="loading"
                ></app-form-input>
              </div>

              <div class="form-columns-2">
                <app-form-input
                  id="emp-nit"
                  label="NIT / Registro Tributario"
                  type="text"
                  icon="fas fa-id-card"
                  placeholder="Ej. 1029384756"
                  [control]="empresaForm.get('nit')"
                  [disabled]="loading"
                ></app-form-input>

                <div class="slug-field-group">
                  <app-form-input
                    id="emp-dominio-slug"
                    label="Subdominio en la Plataforma"
                    type="text"
                    icon="fas fa-globe"
                    placeholder="glamour"
                    [control]="empresaForm.get('dominio_slug')"
                    [disabled]="loading"
                  ></app-form-input>
                  <span class="slug-preview-tag">.fashionstore.bo</span>
                </div>
              </div>

              <div class="form-columns-2">
                <app-form-input
                  id="emp-email-contacto"
                  label="Correo Electrónico Comercial"
                  type="email"
                  icon="fas fa-envelope"
                  placeholder="contacto@glamour.bo"
                  [control]="empresaForm.get('email_contacto')"
                  [disabled]="loading"
                ></app-form-input>

                <app-form-input
                  id="emp-telefono"
                  label="Teléfono / Celular de Contacto"
                  type="text"
                  icon="fas fa-phone"
                  placeholder="Ej. +591 70012345"
                  [control]="empresaForm.get('telefono')"
                  [disabled]="loading"
                ></app-form-input>
              </div>

              <app-form-input
                id="emp-direccion"
                label="Dirección de la Sucursal Central"
                type="text"
                icon="fas fa-map-marker-alt"
                placeholder="Ej. Av. San Martín #450, Barrio Equipetrol, Santa Cruz"
                [control]="empresaForm.get('direccion')"
                [disabled]="loading"
              ></app-form-input>

              <div class="form-section-title" style="margin-top: 0.75rem;">
                <i class="fas fa-user-shield"></i> 2. Cuenta de Administrador Titular
              </div>

              <div class="form-columns-2">
                <app-form-input
                  id="emp-admin-nombres"
                  label="Nombres del Administrador"
                  type="text"
                  icon="fas fa-user"
                  placeholder="Carlos"
                  [control]="empresaForm.get('admin_nombres')"
                  [disabled]="loading"
                ></app-form-input>

                <app-form-input
                  id="emp-admin-apellidos"
                  label="Apellidos del Administrador"
                  type="text"
                  icon="fas fa-user"
                  placeholder="Mendoza"
                  [control]="empresaForm.get('admin_apellidos')"
                  [disabled]="loading"
                ></app-form-input>
              </div>

              <app-form-input
                id="emp-admin-email"
                label="Correo Institucional del Administrador"
                type="email"
                icon="fas fa-envelope-open-text"
                placeholder="admin@glamour.bo"
                [control]="empresaForm.get('admin_email')"
                [disabled]="loading"
              ></app-form-input>

              <div class="form-columns-2">
                <app-password-field
                  id="emp-admin-password"
                  label="Contraseña de Acceso"
                  icon="fas fa-lock"
                  placeholder="Mínimo 8 caracteres"
                  autocomplete="new-password"
                  [control]="empresaForm.get('admin_password')"
                  [disabled]="loading"
                  [showChecklist]="true"
                  [userContext]="userContextForEmpresaPassword"
                  (blurEvent)="onEmpresaPasswordChanged()"
                ></app-password-field>

                <app-password-field
                  id="emp-admin-confirm"
                  label="Confirmar Contraseña"
                  icon="fas fa-check-double"
                  placeholder="Repita contraseña"
                  autocomplete="new-password"
                  [control]="empresaForm.get('confirmar_password')"
                  [disabled]="loading"
                  [isConfirmField]="true"
                ></app-password-field>
              </div>

              <!-- 3. Pasarela de Pago y Facturación de Suscripción Oficial (CU03 / CU17) -->
              <div class="form-section-title" style="margin-top: 1.25rem;">
                <i class="fas fa-credit-card"></i> 3. Cobro del Primer Mes de Suscripción & Facturación
              </div>

              <!-- Resumen del Pago -->
              <div class="saas-checkout-summary">
                <div class="checkout-summary-left">
                  <div class="summary-plan-badge">
                    <i class="fas fa-crown"></i> {{ getSelectedPlanNombre() }}
                  </div>
                  <div class="summary-plan-desc">
                    Facturación mensual oficial · Aprovisionamiento de base de datos aislada y sucursal física.
                  </div>
                </div>
                <div class="checkout-summary-right">
                  <span class="summary-price-label">Importe a Facturar:</span>
                  <span class="summary-price-val">Bs. {{ getSelectedPlanPrecio() }}.00</span>
                </div>
              </div>

              <!-- Selector de Medio de Cobro -->
              <div class="payment-method-selector">
                <button
                  type="button"
                  class="payment-option-btn"
                  [class.active]="empresaForm.get('metodo_pago')?.value === 'TARJETA'"
                  (click)="setMetodoPago('TARJETA')"
                >
                  <i class="fas fa-credit-card"></i>
                  <span>Tarjeta Débito / Crédito</span>
                  <span class="gateway-badge">Stripe</span>
                </button>

                <button
                  type="button"
                  class="payment-option-btn"
                  [class.active]="empresaForm.get('metodo_pago')?.value === 'QR'"
                  (click)="setMetodoPago('QR')"
                >
                  <i class="fas fa-qrcode"></i>
                  <span>QR Simple Interbancario</span>
                  <span class="gateway-badge qr-badge">Inmediato</span>
                </button>
              </div>

              <!-- Formulario de Tarjeta -->
              <div *ngIf="empresaForm.get('metodo_pago')?.value === 'TARJETA'" class="card-checkout-box">
                <div class="card-helper-row">
                  <span class="card-helper-title"><i class="fas fa-shield-alt"></i> Pasarela Segura Encriptada TLS</span>
                  <button type="button" class="btn-fill-card" (click)="llenarTarjetaDemo()">
                    <i class="fas fa-bolt"></i> Tarjeta de Prueba Stripe (4242)
                  </button>
                </div>

                <div class="form-columns-2">
                  <app-form-input
                    id="emp-card-num"
                    label="Número de Tarjeta"
                    type="text"
                    icon="far fa-credit-card"
                    placeholder="4242 4242 4242 4242"
                    [control]="empresaForm.get('tarjeta_numero')"
                    [disabled]="loading"
                  ></app-form-input>

                  <app-form-input
                    id="emp-card-titular"
                    label="Nombre del Titular"
                    type="text"
                    icon="fas fa-user"
                    placeholder="Andy Vallejos"
                    [control]="empresaForm.get('tarjeta_titular')"
                    [disabled]="loading"
                  ></app-form-input>
                </div>

                <div class="form-columns-2">
                  <app-form-input
                    id="emp-card-exp"
                    label="Expiración (MM/AA)"
                    type="text"
                    icon="far fa-calendar-alt"
                    placeholder="12/28"
                    [control]="empresaForm.get('tarjeta_exp')"
                    [disabled]="loading"
                  ></app-form-input>

                  <app-form-input
                    id="emp-card-cvc"
                    label="Código CVC"
                    type="password"
                    icon="fas fa-lock"
                    placeholder="123"
                    [maxlength]="4"
                    [control]="empresaForm.get('tarjeta_cvc')"
                    [disabled]="loading"
                  ></app-form-input>
                </div>
              </div>

              <!-- Pago QR -->
              <div *ngIf="empresaForm.get('metodo_pago')?.value === 'QR'" class="qr-checkout-box">
                <div class="qr-checkout-content">
                  <div class="qr-img-box">
                    <img
                      [src]="'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=FASHIONSTORE-SAAS-PLAN-' + selectedPlanId + '-BS-' + getSelectedPlanPrecio()"
                      alt="QR Bancario"
                      width="120"
                      height="120"
                    />
                  </div>
                  <div class="qr-details">
                    <h4>Escanee desde cualquier Banco de Bolivia</h4>
                    <p>Banco Nacional de Bolivia / BCP / Banco Unión / Mercantil Santa Cruz</p>
                    <div class="qr-amount-badge">Total a Pagar: <strong>Bs. {{ getSelectedPlanPrecio() }}.00</strong></div>
                    <span class="qr-ref-tag">Ref: SAAS-{{ empresaForm.get('dominio_slug')?.value || 'BOUTIQUE' }}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                [disabled]="loading"
                class="btn btn-saas btn-submit"
                style="margin-top: 1.25rem;"
              >
                <i class="fas fa-spinner fa-spin" *ngIf="loading" aria-hidden="true"></i>
                <i class="fas fa-lock" *ngIf="!loading" aria-hidden="true"></i>
                <span>{{ loading ? 'Procesando Pago y Aprovisionando...' : 'Pagar Bs. ' + getSelectedPlanPrecio() + '.00 y Activar Boutique' }}</span>
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
      <!-- MODAL DE FACTURA Y COMPROBANTE OFICIAL DE SUSCRIPCIÓN -->
      <div *ngIf="facturaModalVisible" class="modal-overlay">
        <div class="modal-card modal-invoice glass-panel">
          <div class="modal-invoice-header">
            <div class="invoice-title-group">
              <span class="invoice-badge-success"><i class="fas fa-check-circle"></i> Cobro Procesado</span>
              <h2>Factura Digital de Suscripción Oficial</h2>
              <span class="invoice-sub">FashionStore SaaS Bolivia S.R.L. · NIT 1028475029</span>
            </div>
            <button type="button" class="btn-close-modal" (click)="cerrarModalFactura()">&times;</button>
          </div>

          <div class="modal-invoice-body">
            <div class="invoice-success-banner">
              <i class="fas fa-shield-check"></i>
              <div>
                <strong>¡Suscripción Activada Exitosamente!</strong>
                <p>Su empresa <strong>{{ facturaData.nombre_empresa }}</strong> ya se encuentra activa en la nube. Se ha emitido la factura fiscal correspondiente y enviado al correo.</p>
              </div>
            </div>

            <div class="invoice-details-grid">
              <div class="inv-item">
                <span class="inv-lbl">N° de Factura:</span>
                <span class="inv-val mono highlight">{{ facturaData.numero_factura }}</span>
              </div>
              <div class="inv-item">
                <span class="inv-lbl">Fecha de Emisión:</span>
                <span class="inv-val">{{ facturaData.fecha }}</span>
              </div>
              <div class="inv-item">
                <span class="inv-lbl">Empresa / Razón Social:</span>
                <span class="inv-val">{{ facturaData.razon_social }}</span>
              </div>
              <div class="inv-item">
                <span class="inv-lbl">NIT Cliente:</span>
                <span class="inv-val mono">{{ facturaData.nit }}</span>
              </div>
              <div class="inv-item">
                <span class="inv-lbl">Plan Contratado:</span>
                <span class="inv-val">{{ facturaData.plan_nombre }}</span>
              </div>
              <div class="inv-item">
                <span class="inv-lbl">Importe Facturado:</span>
                <span class="inv-val price">Bs. {{ facturaData.monto }}.00</span>
              </div>
            </div>

            <div class="invoice-qr-row">
              <img
                [src]="'https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=' + facturaData.cuf"
                alt="QR Fiscal Impuestos"
                class="qr-fiscal-img"
              />
              <div class="qr-fiscal-text">
                <span class="cuf-title">Código Único de Facturación (CUF):</span>
                <code class="cuf-code">{{ facturaData.cuf }}</code>
                <span class="cuf-sub">Documento fiscal electrónico con validez legal tributaria en Bolivia.</span>
              </div>
            </div>

            <div class="email-audit-notice">
              <i class="fas fa-envelope-open-text"></i>
              <span>Factura enviada a: <strong>{{ facturaData.email_admin }}</strong> y <strong>{{ facturaData.email_contacto }}</strong></span>
            </div>
          </div>

          <div class="modal-invoice-footer">
            <button type="button" class="btn btn-secondary" (click)="imprimirFactura()">
              <i class="fas fa-print"></i> Imprimir / Guardar Factura
            </button>
            <button type="button" class="btn btn-primary" (click)="continuarAlDashboard()">
              <i class="fas fa-tachometer-alt"></i> Ingresar a mi Panel de Control
            </button>
          </div>
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

    .chip-btn.superadmin { border-color: rgba(168, 85, 247, 0.6); color: #e9d5ff; background: rgba(126, 34, 206, 0.25); }
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
       Estilos de Afiliación SaaS B2B
       ========================================================================== */
    .auth-card.auth-card-wide {
      max-width: 960px;
    }

    .tab-btn-saas {
      position: relative;
    }

    .saas-badge {
      background: rgba(16, 185, 129, 0.25) !important;
      color: #34d399 !important;
      border: 1px solid rgba(16, 185, 129, 0.4);
    }

    .saas-hero-banner {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.75rem;
    }

    .saas-tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.6rem;
    }

    .saas-hero-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #f8fafc;
      margin-bottom: 0.45rem;
      line-height: 1.3;
    }

    .saas-hero-desc {
      color: #94a3b8;
      font-size: 0.86rem;
      line-height: 1.5;
      margin: 0;
    }

    .saas-features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 0.85rem;
      margin-top: 1.25rem;
    }

    .saas-feature-card {
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.95rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .feature-icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
    }

    .feature-icon-wrapper.purple { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
    .feature-icon-wrapper.pink { background: rgba(236, 72, 153, 0.2); color: #f472b6; }
    .feature-icon-wrapper.amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .feature-icon-wrapper.green { background: rgba(16, 185, 129, 0.2); color: #34d399; }

    .feature-text h3 {
      font-size: 0.86rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 0.2rem 0;
    }

    .feature-text p {
      font-size: 0.77rem;
      color: #94a3b8;
      line-height: 1.4;
      margin: 0;
    }

    /* Planes de Suscripción */
    .saas-plans-section {
      margin-bottom: 1.75rem;
    }

    .plans-title-row {
      margin-bottom: 0.85rem;
    }

    .plans-title-row h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 0.2rem 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .plans-subtitle {
      font-size: 0.78rem;
      color: #64748b;
    }

    .plans-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.95rem;
    }

    .plan-card {
      position: relative;
      background: rgba(15, 23, 42, 0.65);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 1.15rem;
      cursor: pointer;
      transition: all var(--transition-smooth, 0.25s ease);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .plan-card:hover {
      transform: translateY(-2px);
      border-color: rgba(99, 102, 241, 0.4);
      background: rgba(20, 29, 53, 0.85);
    }

    .plan-card.selected {
      border-color: #6366f1;
      background: rgba(30, 41, 75, 0.85);
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.35);
    }

    .plan-card.plan-featured {
      border-color: rgba(168, 85, 247, 0.4);
    }

    .plan-card.plan-featured.selected {
      border-color: #a855f7;
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
    }

    .popular-ribbon {
      position: absolute;
      top: -10px;
      right: 12px;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
    }

    .plan-desc-line {
      font-size: 0.77rem;
      color: #94a3b8;
      line-height: 1.35;
      margin: 0.35rem 0 0 0;
    }

    .text-green { color: #10b981 !important; }
    .text-muted { color: #64748b !important; }

    .plan-header {
      margin-bottom: 0.85rem;
    }

    .plan-badge {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 0.35rem;
    }

    .plan-badge.featured-badge {
      color: #c084fc;
    }

    .plan-header h4 {
      font-size: 1.05rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 0.35rem 0;
    }

    .plan-price {
      font-size: 1.35rem;
      font-weight: 800;
      color: #38bdf8;
    }

    .plan-price small {
      font-size: 0.78rem;
      font-weight: 500;
      color: #94a3b8;
    }

    .plan-features {
      list-style: none;
      padding: 0;
      margin: 0 0 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .plan-features li {
      font-size: 0.78rem;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .plan-features li i {
      color: #10b981;
      font-size: 0.75rem;
      flex-shrink: 0;
    }

    .plan-select-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #94a3b8;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 0.65rem;
    }

    .plan-card.selected .plan-select-indicator {
      color: #818cf8;
    }

    .plan-card.plan-featured.selected .plan-select-indicator {
      color: #c084fc;
    }

    /* Formulario SaaS */
    .saas-form-wrapper {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .saas-form-header {
      margin-bottom: 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.75rem;
    }

    .saas-form-header h3 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 0.25rem 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .saas-form-header p {
      font-size: 0.82rem;
      color: #94a3b8;
      margin: 0;
    }

    .form-section-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #a5b4fc;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0.85rem 0 0.65rem 0;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 4px;
    }

    .slug-field-group {
      position: relative;
    }

    .slug-preview-tag {
      position: absolute;
      right: 14px;
      bottom: 14px;
      font-size: 0.76rem;
      color: #64748b;
      font-family: var(--font-mono, monospace);
      pointer-events: none;
    }

    .btn-saas {
      background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
    }

    .btn-saas:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
      filter: brightness(1.08);
    }


    /* Checkout & Facturación SaaS */
    .saas-checkout-summary {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: 12px;
      padding: 1.1rem 1.4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .summary-plan-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 1.05rem;
      font-weight: 800;
      color: #f8fafc;
    }

    .summary-plan-badge i { color: #f59e0b; }

    .summary-plan-desc {
      font-size: 0.8rem;
      color: #94a3b8;
      margin-top: 3px;
    }

    .checkout-summary-right {
      text-align: right;
    }

    .summary-price-label {
      display: block;
      font-size: 0.76rem;
      text-transform: uppercase;
      color: #a5b4fc;
      font-weight: 700;
    }

    .summary-price-val {
      font-size: 1.6rem;
      font-weight: 900;
      color: #38bdf8;
      font-family: var(--font-mono, monospace);
    }

    .payment-method-selector {
      display: flex;
      gap: 10px;
      margin-bottom: 1.2rem;
    }

    .payment-option-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      background: rgba(15, 23, 42, 0.65);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .payment-option-btn:hover {
      border-color: rgba(99, 102, 241, 0.4);
      color: #f1f5f9;
    }

    .payment-option-btn.active {
      border-color: #6366f1;
      background: rgba(30, 41, 75, 0.85);
      color: #ffffff;
      box-shadow: 0 0 14px rgba(99, 102, 241, 0.35);
    }

    .gateway-badge {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(99, 102, 241, 0.25);
      color: #a5b4fc;
      text-transform: uppercase;
    }

    .gateway-badge.qr-badge {
      background: rgba(16, 185, 129, 0.25);
      color: #34d399;
    }

    .card-checkout-box {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.1rem;
      margin-bottom: 1rem;
    }

    .card-helper-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .card-helper-title {
      font-size: 0.78rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .card-helper-title i { color: #10b981; }

    .btn-fill-card {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
      padding: 3px 9px;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-fill-card:hover {
      background: rgba(99, 102, 241, 0.3);
      color: #ffffff;
    }

    .qr-checkout-box {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1rem;
    }

    .qr-checkout-content {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .qr-img-box {
      background: #ffffff;
      border-radius: 10px;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .qr-details h4 {
      font-size: 1rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 0.25rem 0;
    }

    .qr-details p {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0 0 0.5rem 0;
    }

    .qr-amount-badge {
      font-size: 0.88rem;
      color: #34d399;
      margin-bottom: 0.4rem;
    }

    .qr-ref-tag {
      font-size: 0.75rem;
      color: #64748b;
      font-family: var(--font-mono, monospace);
    }

    /* Modal de Factura Oficial */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }

    .modal-invoice {
      width: 100%;
      max-width: 640px;
      border-radius: 18px;
      background: #111827;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 25px 60px rgba(0,0,0,0.8);
      overflow: hidden;
      animation: tabFadeSlide 0.2s ease-out;
    }

    .modal-invoice-header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 1.5rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(255,255,255,0.15);
    }

    .invoice-badge-success {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #6ee7b7;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 9999px;
      margin-bottom: 0.35rem;
    }

    .modal-invoice-header h2 {
      font-size: 1.35rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0;
    }

    .invoice-sub {
      font-size: 0.78rem;
      color: #c7d2fe;
    }

    .btn-close-modal {
      background: transparent;
      border: none;
      color: #ffffff;
      font-size: 1.75rem;
      line-height: 1;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.15s ease;
    }

    .btn-close-modal:hover { opacity: 1; }

    .modal-invoice-body {
      padding: 1.5rem 1.75rem;
    }

    .invoice-success-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 10px;
      padding: 0.9rem 1.1rem;
      margin-bottom: 1.25rem;
    }

    .invoice-success-banner i {
      font-size: 1.5rem;
      color: #10b981;
    }

    .invoice-success-banner strong {
      color: #6ee7b7;
      font-size: 0.92rem;
      display: block;
      margin-bottom: 2px;
    }

    .invoice-success-banner p {
      margin: 0;
      font-size: 0.8rem;
      color: #cbd5e1;
      line-height: 1.4;
    }

    .invoice-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.1rem;
      margin-bottom: 1.25rem;
    }

    .inv-item {
      display: flex;
      flex-direction: column;
    }

    .inv-lbl {
      font-size: 0.72rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
    }

    .inv-val {
      font-size: 0.88rem;
      color: #f1f5f9;
      font-weight: 600;
    }

    .inv-val.highlight { color: #38bdf8; font-weight: 800; }
    .inv-val.price { color: #10b981; font-weight: 900; font-size: 1.05rem; }

    .invoice-qr-row {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(15, 23, 42, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 10px 14px;
      margin-bottom: 1rem;
    }

    .qr-fiscal-img {
      width: 70px;
      height: 70px;
      background: #ffffff;
      border-radius: 6px;
      padding: 3px;
    }

    .qr-fiscal-text {
      flex: 1;
      font-size: 0.78rem;
    }

    .cuf-title {
      font-size: 0.72rem;
      color: #94a3b8;
      display: block;
      margin-bottom: 2px;
    }

    .cuf-code {
      display: block;
      color: #38bdf8;
      font-family: var(--font-mono, monospace);
      font-size: 0.76rem;
      word-break: break-all;
      margin-bottom: 2px;
    }

    .cuf-sub {
      font-size: 0.7rem;
      color: #64748b;
    }

    .email-audit-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: #94a3b8;
      background: rgba(99, 102, 241, 0.1);
      border: 1px dashed rgba(99, 102, 241, 0.3);
      border-radius: 8px;
      padding: 8px 12px;
    }

    .email-audit-notice i { color: #818cf8; }

    .modal-invoice-footer {
      background: #0b0f19;
      padding: 1.1rem 1.75rem;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
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
  activeTab: 'login' | 'registro' | 'recuperar' | 'saas' = 'login';
  selectedPlanId = 2;
  // Factura y Cobro de Suscripción Oficial
  facturaModalVisible = false;
  facturaData: any = {
    numero_factura: 'FAC-SAAS-2026-0001',
    fecha: '07/11/2026',
    nombre_empresa: '',
    razon_social: '',
    nit: '',
    plan_nombre: 'Profesional',
    monto: 199,
    cuf: '',
    email_admin: '',
    email_contacto: ''
  };
  planes: PlanSuscripcion[] = [];
  empresaServerError = '';
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
  empresaForm!: FormGroup;

  constructor(
    private auth: AuthService,
    private tenantService: TenantService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.cargarPlanes();
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

    // Registro B2B de Empresas y Boutiques SaaS con Cobro de Suscripción (CU01, CU03, CU17)
    this.empresaForm = new FormGroup({
      nombre_comercial: new FormControl('', [Validators.required]),
      razon_social: new FormControl('', [Validators.required]),
      nit: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/)]),
      dominio_slug: new FormControl('', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]),
      email_contacto: new FormControl('', [Validators.required, emailValidator()]),
      telefono: new FormControl('', [Validators.required]),
      direccion: new FormControl('', [Validators.required]),
      admin_nombres: new FormControl('', [Validators.required, nameValidator()]),
      admin_apellidos: new FormControl('', [Validators.required, nameValidator()]),
      admin_email: new FormControl('', [Validators.required, emailValidator()]),
      admin_password: new FormControl('', [
        Validators.required,
        securePasswordValidator(() => this.userContextForEmpresaPassword)
      ]),
      confirmar_password: new FormControl('', [Validators.required]),
      id_plan_inicial: new FormControl(2),
      metodo_pago: new FormControl('TARJETA'),
      tarjeta_numero: new FormControl('4242 4242 4242 4242'),
      tarjeta_exp: new FormControl('12/28'),
      tarjeta_cvc: new FormControl('123'),
      tarjeta_titular: new FormControl('Gerencia General')
    }, {
      validators: [passwordMatchValidator('admin_password', 'confirmar_password')]
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

  get userContextForEmpresaPassword(): { email?: string; nombres?: string; apellidos?: string } {
    return {
      email: this.empresaForm?.get('admin_email')?.value,
      nombres: this.empresaForm?.get('admin_nombres')?.value,
      apellidos: this.empresaForm?.get('admin_apellidos')?.value
    };
  }

  // =========================================================================
  // Control de Pestañas y Accesibilidad
  // =========================================================================
  selectTab(tab: 'login' | 'registro' | 'recuperar' | 'saas'): void {
    this.activeTab = tab;
    this.loginServerError = '';
    this.registerServerError = '';
    this.otpServerError = '';
    this.emailExistsError = '';
    this.empresaServerError = '';
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
    const tabs: ('login' | 'registro' | 'recuperar' | 'saas')[] = ['login', 'registro', 'recuperar', 'saas'];
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

  // CU01: Autenticar Usuario (Login RBAC), Paso 1: El actor ingresa credenciales (email y password) en la interfaz ILoginBoundary
  onLogin(): void {
    this.loginServerError = '';

    // CU01: Autenticar Usuario (Login RBAC), Paso 1.0: Validar formato de campos en el cliente
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.focusFirstInvalidField('login');
      return;
    }

    // CU01: Autenticar Usuario (Login RBAC), Paso 1.0.1: Extraer y sanitizar credenciales de acceso
    const { email, password, recordar_sesion } = this.loginForm.value;
    const cleanEmail = email.trim().toLowerCase();

    this.loading = true;
    // CU01: Autenticar Usuario (Login RBAC), Paso 1.1: ILoginBoundary invoca el método login() de AuthService
    this.auth.login({
      email: cleanEmail,
      password,
      recordar_sesion
    }).subscribe({
      // CU01: Autenticar Usuario (Login RBAC), Paso 1.7: Recibir token JWT y perfil del usuario autenticado
      next: (res) => {
        this.loading = false;
        // CU01: Autenticar Usuario (Login RBAC), Paso 1.8: Notificar autenticación exitosa mediante toast UI
        this.toast.success('Bienvenido', `Sesión iniciada correctamente como ${res.nombres} (${res.rol})`);
        // CU01: Autenticar Usuario (Login RBAC), Paso 1.9: Redirigir al catálogo / dashboard según rol
        this.router.navigate(['/catalogo']);
        this.cdr.markForCheck();
      },
      // CU01: Autenticar Usuario (Login RBAC), Paso 1.5.5: Flujo alternativo - Gestión de errores de autenticación
      error: (err) => {
        this.loading = false;
        const status = err.status;
        const detail = err.error?.detail;

        // CU01: Autenticar Usuario (Login RBAC), Paso 1.5.5.a: Manejo de HTTP 401 (Contraseña o email erróneo)
        if (status === 401) {
          this.loginServerError = detail || 'Credenciales inválidas. Verifique su correo o contraseña.';
        // CU01: Autenticar Usuario (Login RBAC), Paso 1.5.5.b: Manejo de HTTP 403 (Bloqueo preventivo por 5 intentos fallidos)
        } else if (status === 403) {
          this.loginServerError = detail || 'Cuenta bloqueada preventivamente tras superar los intentos fallidos permitidos.';
        } else if (status === 0) {
          this.loginServerError = 'No se pudo conectar con el servidor. Verifique su conexión de red.';
        } else {
          this.loginServerError = detail || 'Error de autenticación. Verifique sus credenciales.';
        }

        // CU01: Autenticar Usuario (Login RBAC), Paso 1.5.5.c: Mostrar alerta de error en la interfaz
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

  // CU02: Registrar Cliente (Sign Up), Paso 1: El cliente no autenticado ingresa datos personales en IRegistroBoundary
  onRegister(): void {
    this.registerServerError = '';
    this.emailExistsError = '';

    // CU02: Registrar Cliente (Sign Up), Paso 1.0: Validar formulario de registro en el cliente
    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched();
      this.focusFirstInvalidField('reg');
      return;
    }

    // CU02: Registrar Cliente (Sign Up), Paso 1.0.1: Preparar DTO con nombres capitalizados y email normalizado
    const { nombres, apellidos, email, password } = this.regForm.value;
    const payload = {
      nombres: capitalizeWords(nombres),
      apellidos: capitalizeWords(apellidos),
      email: email.trim().toLowerCase(),
      password
    };

    this.loading = true;
    // CU02: Registrar Cliente (Sign Up), Paso 1.1: IRegistroBoundary invoca register() en AuthService
    this.auth.register(payload).subscribe({
      // CU02: Registrar Cliente (Sign Up), Paso 1.7: Recibir token JWT y confirmar alta exitosa
      next: (res) => {
        this.loading = false;
        // CU02: Registrar Cliente (Sign Up), Paso 1.8: Notificar bienvenida al cliente
        this.toast.success(
          'Registro Exitoso (CU02)',
          `Bienvenido ${res.nombres}. Su cuenta de cliente ha sido activada.`
        );
        // CU02: Registrar Cliente (Sign Up), Paso 1.9: Redirigir al catálogo de productos
        this.router.navigate(['/catalogo']);
        this.cdr.markForCheck();
      },
      // CU02: Registrar Cliente (Sign Up), Paso 1.3: Flujo alternativo - Correo duplicado o error de validación
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

  // CU03: Recuperar Contraseña (Token OTP), Paso 1: Usuario ingresa su correo en IRecuperarClaveBoundary
  onSolicitarOtp(): void {
    this.otpServerError = '';

    // CU03: Recuperar Contraseña (Token OTP), Paso 1.0: Validar formato de correo en el cliente
    if (this.otpRequestForm.invalid) {
      this.otpRequestForm.markAllAsTouched();
      const el = document.getElementById('otp-email');
      el?.focus();
      return;
    }

    // CU03: Recuperar Contraseña (Token OTP), Paso 1.0.1: Sanitizar dirección de correo
    const email = this.otpRequestForm.get('email')?.value.trim().toLowerCase();
    this.loading = true;

    // CU03: Recuperar Contraseña (Token OTP), Paso 1.1: IRecuperarClaveBoundary invoca requestOtp() en AuthService
    this.auth.requestOtp(email).subscribe({
      // CU03: Recuperar Contraseña (Token OTP), Paso 1.6: Recibir confirmación de emisión y avanzar al paso 2
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

  // CU03: Recuperar Contraseña (Token OTP), Paso 2: Usuario introduce el código de 6 dígitos y la nueva contraseña
  onRestablecerOtp(): void {
    this.otpServerError = '';

    // CU03: Recuperar Contraseña (Token OTP), Paso 2.0: Validar código y fortaleza de la nueva clave
    if (this.otpResetForm.invalid) {
      this.otpResetForm.markAllAsTouched();
      this.focusFirstInvalidField('otp');
      return;
    }

    const email = this.otpRequestForm.get('email')?.value.trim().toLowerCase();
    const { codigo_otp, nueva_password } = this.otpResetForm.value;

    this.loading = true;
    // CU03: Recuperar Contraseña (Token OTP), Paso 2.1: IRecuperarClaveBoundary invoca resetPasswordOtp() en AuthService
    this.auth.resetPasswordOtp({
      email,
      codigo_otp: codigo_otp.trim(),
      nueva_password
    }).subscribe({
      // CU03: Recuperar Contraseña (Token OTP), Paso 2.7: Confirmación de clave cambiada y retorno al panel de login
      next: () => {
        this.loading = false;
        this.toast.success(
          'Contraseña Restablecida (CU03)',
          'Ahora puede iniciar sesión con su nueva clave.'
        );
        this.selectTab('login');
        this.otpStep = 1;
        this.otpRequestForm.reset();
        this.otpResetForm.reset();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.otpServerError = err.error?.detail || 'Error al validar OTP o actualizar contraseña.';
        this.toast.error('Error OTP', this.otpServerError);
        this.cdr.markForCheck();
      }
    });
  }

  // =========================================================================
  // Afiliación y Registro B2B de Empresas al SaaS
  // =========================================================================
  cargarPlanes(): void {
    this.tenantService.listarPlanes().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.planes = data;
          const exists = data.find(p => p.id_plan === this.selectedPlanId);
          if (!exists) {
            const proPlan = data.find(p => p.codigo === 'PLAN_PRO') || data[0];
            this.selectedPlanId = proPlan.id_plan;
            this.empresaForm.get('id_plan_inicial')?.setValue(this.selectedPlanId);
          }
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.warn('No se pudieron cargar planes dinámicos:', err);
      }
    });
  }

  selectPlan(id: number): void {
    this.selectedPlanId = id;
    this.empresaForm.get('id_plan_inicial')?.setValue(id);
    this.cdr.markForCheck();
  }

  getSelectedPlan(): PlanSuscripcion | undefined {
    return this.planes.find(p => p.id_plan === this.selectedPlanId);
  }

  getSelectedPlanNombre(): string {
    const p = this.getSelectedPlan();
    if (p) return p.nombre;
    if (this.selectedPlanId === 1) return 'Básico';
    if (this.selectedPlanId === 3) return 'Empresarial';
    return 'Profesional';
  }

  getSelectedPlanPrecio(): number {
    const p = this.getSelectedPlan();
    if (p) return Number(p.precio_mensual);
    if (this.selectedPlanId === 1) return 99;
    if (this.selectedPlanId === 3) return 399;
    return 199;
  }

  setMetodoPago(metodo: 'TARJETA' | 'QR'): void {
    this.empresaForm.get('metodo_pago')?.setValue(metodo);
    this.cdr.markForCheck();
  }

  llenarTarjetaDemo(): void {
    this.empresaForm.patchValue({
      tarjeta_numero: '4242 4242 4242 4242',
      tarjeta_exp: '12/28',
      tarjeta_cvc: '123',
      tarjeta_titular: 'Andy Vallejos'
    });
    this.toast.info('Tarjeta de Prueba Stripe', 'Datos de tarjeta de prueba Visa Stripe auto-completados.');
    this.cdr.markForCheck();
  }

  cerrarModalFactura(): void {
    this.facturaModalVisible = false;
    this.router.navigate(['/dashboard']);
  }

  continuarAlDashboard(): void {
    this.facturaModalVisible = false;
    this.router.navigate(['/dashboard']);
  }

  imprimirFactura(): void {
    window.print();
  }

  onNombreComercialBlur(): void {
    const val = this.empresaForm.get('nombre_comercial')?.value || '';
    const currentSlug = this.empresaForm.get('dominio_slug')?.value;
    if (val && !currentSlug) {
      const generated = val.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      this.empresaForm.get('dominio_slug')?.setValue(generated);
    }
    const razon = this.empresaForm.get('razon_social')?.value;
    if (val && !razon) {
      this.empresaForm.get('razon_social')?.setValue(`${val} S.R.L.`);
    }
  }

  onEmpresaPasswordChanged(): void {
    this.empresaForm.get('confirmar_password')?.updateValueAndValidity();
  }

  onRegisterEmpresa(): void {
    this.empresaServerError = '';

    if (this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      this.focusFirstInvalidField('emp');
      return;
    }

    const val = this.empresaForm.value;
    const precio = this.getSelectedPlanPrecio();
    const payload = {
      nombre_comercial: val.nombre_comercial.trim(),
      razon_social: val.razon_social.trim(),
      nit: val.nit.trim(),
      dominio_slug: val.dominio_slug.trim().toLowerCase(),
      email_contacto: val.email_contacto.trim().toLowerCase(),
      telefono: val.telefono.trim(),
      direccion: val.direccion.trim(),
      admin_nombres: capitalizeWords(val.admin_nombres),
      admin_apellidos: capitalizeWords(val.admin_apellidos),
      admin_email: val.admin_email.trim().toLowerCase(),
      admin_password: val.admin_password,
      id_plan_inicial: this.selectedPlanId,
      metodo_pago: val.metodo_pago || 'TARJETA',
      tarjeta_numero: val.tarjeta_numero || '4242424242424242',
      tarjeta_exp: val.tarjeta_exp || '12/28',
      tarjeta_cvc: val.tarjeta_cvc || '123',
      tarjeta_titular: val.tarjeta_titular || `${val.admin_nombres} ${val.admin_apellidos}`
    };

    this.loading = true;
    this.auth.registerEmpresa(payload).subscribe({
      next: (res) => {
        this.loading = false;
        const nroFactura = res.numero_factura_saas || `FAC-SAAS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        this.facturaData = {
          numero_factura: nroFactura,
          fecha: new Date().toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          nombre_empresa: res.nombre_empresa || val.nombre_comercial,
          razon_social: val.razon_social,
          nit: val.nit,
          plan_nombre: res.plan_nombre || this.getSelectedPlanNombre(),
          monto: res.monto_suscripcion_pagado || precio,
          cuf: `CUF-SAAS-${res.id_empresa || 1}-BO-${nroFactura.slice(-4)}`,
          email_admin: val.admin_email,
          email_contacto: val.email_contacto
        };

        this.toast.success(
          '¡Suscripción y Alta Confirmada!',
          `Se procesó el cobro de Bs. ${this.facturaData.monto}.00. Factura ${nroFactura} emitida.`
        );

        this.facturaModalVisible = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.empresaServerError = err.error?.detail || 'Error al procesar el alta de la empresa en la plataforma SaaS.';
        this.toast.error('Error de Afiliación', this.empresaServerError);
        this.cdr.markForCheck();
      }
    });
  }

  // =========================================================================
  // Utilidades de Enfoque y Accesibilidad
  // =========================================================================
  private focusFirstInvalidField(formType: 'login' | 'reg' | 'otp' | 'emp'): void {
    setTimeout(() => {
      const invalidInput = document.querySelector(`.auth-content input[aria-invalid="true"]`) as HTMLElement;
      if (invalidInput) {
        invalidInput.focus();
      }
    }, 50);
  }
}
