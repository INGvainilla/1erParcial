import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CarritoService } from '../../core/services/carrito.service';
import { CheckoutService, OrdenCreateRequest } from '../../core/services/checkout.service';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Sucursal } from '../../core/models/fashion.models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="checkout-page-container">
      <!-- Encabezado de la Pantalla -->
      <div class="checkout-header glass-panel">
        <div class="header-breadcrumb">
          <a routerLink="/catalogo"><i class="fas fa-arrow-left"></i> Seguir Comprando</a>
          <span class="sep">/</span>
          <span>Checkout Digital (CU14)</span>
        </div>
        <h1 class="page-title">
          <i class="fas fa-cash-register"></i>
          Finalizar Compra y Facturación
        </h1>
        <p class="page-subtitle">Paso formal de selección de entrega y emisión de orden de venta en línea.</p>
      </div>

      <!-- Contenedor Principal: Stepper (Izquierda) + Resumen de Pedido (Derecha) -->
      <div class="checkout-grid">
        <!-- Columna Izquierda: Stepper Wizard -->
        <div class="stepper-column glass-panel">
          <!-- Stepper Navigation Bar -->
          <div class="stepper-nav">
            <div class="step-indicator" [class.active]="currentStep === 1" [class.completed]="currentStep > 1" (click)="goToStep(1)">
              <div class="step-circle">
                <i *ngIf="currentStep > 1" class="fas fa-check"></i>
                <span *ngIf="currentStep <= 1">1</span>
              </div>
              <div class="step-text">
                <span class="step-name">Entrega</span>
                <span class="step-desc">Modalidad</span>
              </div>
            </div>

            <div class="step-divider" [class.completed]="currentStep > 1"></div>

            <div class="step-indicator" [class.active]="currentStep === 2" [class.completed]="currentStep > 2" (click)="goToStep(2)">
              <div class="step-circle">
                <i *ngIf="currentStep > 2" class="fas fa-check"></i>
                <span *ngIf="currentStep <= 2">2</span>
              </div>
              <div class="step-text">
                <span class="step-name">Facturación</span>
                <span class="step-desc">Datos Fiscales</span>
              </div>
            </div>

            <div class="step-divider" [class.completed]="currentStep > 2"></div>

            <div class="step-indicator" [class.active]="currentStep === 3" (click)="goToStep(3)">
              <div class="step-circle">
                <span>3</span>
              </div>
              <div class="step-text">
                <span class="step-name">Confirmación</span>
                <span class="step-desc">Revisión Final</span>
              </div>
            </div>
          </div>

          <!-- Contenido del Paso 1: Modalidad de Entrega -->
          <div class="step-content" *ngIf="currentStep === 1">
            <h3 class="section-title"><i class="fas fa-shipping-fast"></i> Seleccione la Modalidad de Entrega</h3>
            <p class="section-desc">¿Cómo desea recibir sus prendas de sastrería masculina?</p>

            <div class="delivery-options-grid">
              <!-- Tarjeta: Retiro en Sucursal -->
              <div
                class="option-card"
                [class.selected]="modalidad === 'RETIRO_TIENDA'"
                (click)="setModalidad('RETIRO_TIENDA')"
              >
                <div class="option-radio">
                  <div class="radio-dot" *ngIf="modalidad === 'RETIRO_TIENDA'"></div>
                </div>
                <div class="option-icon-box">
                  <i class="fas fa-store"></i>
                </div>
                <div class="option-details">
                  <h4>Retiro en Sucursal Física</h4>
                  <p>Pick-up sin costo en cualquiera de nuestras sucursales con probador asignado.</p>
                  <span class="price-pill free">GRATIS</span>
                </div>
              </div>

              <!-- Tarjeta: Envío a Domicilio -->
              <div
                class="option-card"
                [class.selected]="modalidad === 'DELIVERY'"
                (click)="setModalidad('DELIVERY')"
              >
                <div class="option-radio">
                  <div class="radio-dot" *ngIf="modalidad === 'DELIVERY'"></div>
                </div>
                <div class="option-icon-box delivery">
                  <i class="fas fa-motorcycle"></i>
                </div>
                <div class="option-details">
                  <h4>Envío a Domicilio (Delivery)</h4>
                  <p>Despacho directo hasta la puerta de su residencia u oficina en paquete sellado.</p>
                  <span class="price-pill cost">Bs. 25.00</span>
                </div>
              </div>
            </div>

            <!-- Formulario si es Retiro en Tienda -->
            <div class="sub-form-box animate-fade" *ngIf="modalidad === 'RETIRO_TIENDA'">
              <label class="form-label" for="select-sucursal">
                <i class="fas fa-map-marker-alt"></i> Elija la Sucursal para Retiro:
              </label>
              <select id="select-sucursal" [(ngModel)]="selectedSucursalId" class="form-select">
                <option [ngValue]="null" disabled>-- Seleccione una sucursal física --</option>
                <option *ngFor="let s of sucursales" [ngValue]="s.id_sucursal">
                  📍 {{ s.nombre_sucursal }} — {{ s.direccion }} ({{ s.horario_apertura }} a {{ s.horario_cierre }})
                </option>
              </select>

              <div class="info-alert" *ngIf="selectedSucursal">
                <i class="fas fa-info-circle"></i>
                <div>
                  <strong>Dirección:</strong> {{ selectedSucursal.direccion }}<br>
                  <strong>Contacto:</strong> {{ selectedSucursal.telefono || '3-3445566' }} | <strong>Horario:</strong> {{ selectedSucursal.horario_apertura }} - {{ selectedSucursal.horario_cierre }}
                </div>
              </div>
            </div>

            <!-- Formulario si es Delivery -->
            <div class="sub-form-box animate-fade" *ngIf="modalidad === 'DELIVERY'">
              <div class="form-group">
                <label class="form-label" for="direccion-envio">
                  <i class="fas fa-home"></i> Dirección Completa de Entrega: *
                </label>
                <input
                  id="direccion-envio"
                  type="text"
                  [(ngModel)]="direccionEnvio"
                  placeholder="Ej: Av. San Martín #450, Edificio Royal Tower, Depto 4B"
                  class="form-input"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="telefono-contacto">
                    <i class="fas fa-phone"></i> Teléfono Móvil de Contacto: *
                  </label>
                  <input
                    id="telefono-contacto"
                    type="text"
                    [(ngModel)]="telefonoContacto"
                    placeholder="Ej: 77334455"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="notas-entrega">
                    <i class="fas fa-comment-alt"></i> Instrucciones / Referencias:
                  </label>
                  <input
                    id="notas-entrega"
                    type="text"
                    [(ngModel)]="notasEntrega"
                    placeholder="Ej: Portón café frente a la plaza"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div class="step-actions">
              <div></div>
              <button class="btn-primary" (click)="validarPaso1()">
                <span>Continuar a Facturación</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- Contenido del Paso 2: Facturación Fiscal -->
          <div class="step-content" *ngIf="currentStep === 2">
            <h3 class="section-title"><i class="fas fa-file-invoice-dollar"></i> Datos para Emisión de Factura Fiscal</h3>
            <p class="section-desc">Ingrese el NIT/CI y la razón social que aparecerán en su factura oficial.</p>

            <div class="form-card">
              <div class="quick-fill-box" *ngIf="auth.currentUser()">
                <label class="checkbox-container">
                  <input type="checkbox" [(ngModel)]="usarMisDatos" (change)="aplicarDatosUsuario()" />
                  <span class="checkmark"></span>
                  <span>Usar mis datos de usuario registrado ({{ auth.currentUser()?.nombres }} {{ auth.currentUser()?.apellidos }})</span>
                </label>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="nit-input">
                    <i class="fas fa-id-card"></i> NIT o Carnet de Identidad (CI): *
                  </label>
                  <input
                    id="nit-input"
                    type="text"
                    [(ngModel)]="nitFactura"
                    placeholder="Ej: 8452109017 o 5493201"
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label" for="razon-input">
                    <i class="fas fa-user-tie"></i> Razón Social o Nombre Completo: *
                  </label>
                  <input
                    id="razon-input"
                    type="text"
                    [(ngModel)]="razonSocialFactura"
                    placeholder="Ej: Delgado & Mujica S.R.L. o Rodrigo Paz"
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn-secondary" (click)="currentStep = 1">
                <i class="fas fa-arrow-left"></i>
                <span>Atrás</span>
              </button>
              <button class="btn-primary" (click)="validarPaso2()">
                <span>Continuar a Revisión</span>
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- Contenido del Paso 3: Confirmación Final -->
          <div class="step-content" *ngIf="currentStep === 3">
            <h3 class="section-title"><i class="fas fa-clipboard-check"></i> Revisión y Confirmación de Orden</h3>
            <p class="section-desc">Verifique todos los detalles antes de emitir su orden de venta oficial.</p>

            <div class="review-grid">
              <!-- Bloque: Entrega -->
              <div class="review-card">
                <div class="review-card-header">
                  <i class="fas fa-map-marked-alt"></i>
                  <h4>Logística de Entrega</h4>
                  <button class="btn-edit" (click)="currentStep = 1">Editar</button>
                </div>
                <div class="review-card-body">
                  <p><strong>Modalidad:</strong> {{ modalidad === 'DELIVERY' ? 'Envío a Domicilio (Delivery)' : 'Retiro en Sucursal Física' }}</p>
                  <p *ngIf="modalidad === 'DELIVERY'"><strong>Dirección:</strong> {{ direccionEnvio }}</p>
                  <p *ngIf="modalidad === 'DELIVERY'"><strong>Teléfono:</strong> {{ telefonoContacto }}</p>
                  <p *ngIf="modalidad === 'DELIVERY' && notasEntrega"><strong>Notas:</strong> {{ notasEntrega }}</p>
                  <p *ngIf="modalidad === 'RETIRO_TIENDA'"><strong>Sucursal:</strong> {{ selectedSucursal?.nombre_sucursal }} ({{ selectedSucursal?.direccion }})</p>
                  <p><strong>Costo de Envío:</strong> {{ costoEnvio === 0 ? 'GRATIS (Bs. 0.00)' : 'Bs. ' + (costoEnvio | number:'1.2-2') }}</p>
                </div>
              </div>

              <!-- Bloque: Facturación -->
              <div class="review-card">
                <div class="review-card-header">
                  <i class="fas fa-file-invoice"></i>
                  <h4>Facturación Fiscal</h4>
                  <button class="btn-edit" (click)="currentStep = 2">Editar</button>
                </div>
                <div class="review-card-body">
                  <p><strong>NIT / CI:</strong> {{ nitFactura }}</p>
                  <p><strong>Razón Social:</strong> {{ razonSocialFactura }}</p>
                  <p><strong>Canal de Venta:</strong> Tienda Digital Web (Omnicanal)</p>
                </div>
              </div>
            </div>

            <div class="confirm-notice">
              <i class="fas fa-shield-alt"></i>
              <span>Al presionar el botón inferior, su pedido será formalizado en estado <strong>PENDIENTE DE PAGO</strong> y su carrito se vaciará de manera transaccional.</span>
            </div>

            <div class="step-actions">
              <button class="btn-secondary" (click)="currentStep = 2" [disabled]="submitting">
                <i class="fas fa-arrow-left"></i>
                <span>Atrás</span>
              </button>
              <button class="btn-confirm-order" (click)="confirmarOrden()" [disabled]="submitting">
                <i *ngIf="submitting" class="fas fa-spinner fa-spin"></i>
                <i *ngIf="!submitting" class="fas fa-check-circle"></i>
                <span>{{ submitting ? 'Generando Orden...' : 'Confirmar Orden y Proceder al Pago' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Resumen de Pedido (Sticky) -->
        <div class="summary-column glass-panel">
          <div class="summary-header">
            <h3><i class="fas fa-shopping-bag"></i> Resumen de tu Compra</h3>
            <span class="badge-items">{{ carritoService.totalItems() }} {{ carritoService.totalItems() === 1 ? 'prenda' : 'prendas' }}</span>
          </div>

          <!-- Lista de Prendas en el Checkout -->
          <div class="summary-items-scroll">
            <div class="summary-item-card" *ngFor="let it of carritoService.items()">
              <div class="summary-img-box">
                <img *ngIf="it.imagen_principal" [src]="it.imagen_principal" [alt]="it.nombre_producto" />
                <i *ngIf="!it.imagen_principal" class="fas fa-tshirt fallback-icon"></i>
              </div>
              <div class="summary-item-info">
                <h5 class="summary-item-title">{{ it.nombre_producto }}</h5>
                <span class="summary-item-attrs">Talla: <strong>{{ it.talla }}</strong> | Color: <strong>{{ it.color }}</strong></span>
                <div class="summary-item-price-row">
                  <span class="qty-tag">Cant: {{ it.cantidad }}</span>
                  <span class="subtotal-val">Bs. {{ it.subtotal | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Desglose de Totales -->
          <div class="summary-totals-box">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>Bs. {{ carritoService.totalGeneral() | number:'1.2-2' }}</span>
            </div>
            <div class="total-line">
              <span>Tarifa de Entrega:</span>
              <span [class.free-green]="costoEnvio === 0">
                {{ costoEnvio === 0 ? 'GRATIS' : 'Bs. ' + (costoEnvio | number:'1.2-2') }}
              </span>
            </div>
            <div class="total-line grand-total">
              <span>Total a Pagar:</span>
              <span class="total-highlight">Bs. {{ (carritoService.totalGeneral() + costoEnvio) | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page-container {
      padding: 1.5rem 2.5rem 3.5rem;
      max-width: 1350px;
      margin: 0 auto;
    }

    /* Header */
    .checkout-header {
      padding: 1.5rem 2rem;
      border-radius: var(--radius-lg, 16px);
      margin-bottom: 2rem;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .header-breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 0.75rem;
    }
    .header-breadcrumb a {
      color: #818cf8;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .header-breadcrumb a:hover {
      text-decoration: underline;
    }
    .sep { color: #475569; }
    .page-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .page-title i { color: #818cf8; }
    .page-subtitle {
      font-size: 0.88rem;
      color: #94a3b8;
      margin: 0;
    }

    /* Grid Layout */
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
      align-items: flex-start;
    }

    /* Stepper Column */
    .stepper-column {
      padding: 2rem;
      border-radius: var(--radius-lg, 16px);
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Stepper Bar */
    .stepper-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .step-indicator {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      cursor: pointer;
    }
    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: 2px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #94a3b8;
      font-size: 0.95rem;
      transition: all 0.25s;
    }
    .step-indicator.active .step-circle {
      background: #4f46e5;
      border-color: #818cf8;
      color: #ffffff;
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.5);
    }
    .step-indicator.completed .step-circle {
      background: #10b981;
      border-color: #34d399;
      color: #ffffff;
    }
    .step-text {
      display: flex;
      flex-direction: column;
    }
    .step-name {
      font-size: 0.9rem;
      font-weight: 700;
      color: #e2e8f0;
    }
    .step-desc {
      font-size: 0.72rem;
      color: #64748b;
    }
    .step-indicator.active .step-name { color: #818cf8; }
    .step-divider {
      flex: 1;
      height: 2px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 1rem;
      transition: background 0.3s;
    }
    .step-divider.completed {
      background: #10b981;
    }

    /* Step Content */
    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 0.4rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .section-title i { color: #a78bfa; }
    .section-desc {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 1.75rem;
    }

    /* Delivery Options Cards */
    .delivery-options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .option-card {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 12px;
      background: rgba(30, 41, 59, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
    }
    .option-card:hover {
      background: rgba(30, 41, 59, 0.7);
      border-color: rgba(129, 140, 248, 0.4);
    }
    .option-card.selected {
      background: rgba(99, 102, 241, 0.12);
      border-color: #6366f1;
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
    }
    .option-radio {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.2rem;
      flex-shrink: 0;
    }
    .option-card.selected .option-radio {
      border-color: #818cf8;
    }
    .radio-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #818cf8;
    }
    .option-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .option-icon-box.delivery {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
    }
    .option-details h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.35rem;
    }
    .option-details p {
      font-size: 0.78rem;
      color: #94a3b8;
      line-height: 1.4;
      margin: 0 0 0.65rem;
    }
    .price-pill {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 800;
    }
    .price-pill.free {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }
    .price-pill.cost {
      background: rgba(168, 85, 247, 0.2);
      color: #e9d5ff;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }

    /* Sub Forms */
    .sub-form-box {
      background: rgba(30, 41, 59, 0.5);
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 2rem;
    }
    .form-group {
      margin-bottom: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    .form-label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .form-input, .form-select {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      color: #ffffff;
      font-size: 0.88rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .form-input:focus, .form-select:focus {
      border-color: #818cf8;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
    }
    .info-alert {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 8px;
      color: #93c5fd;
      font-size: 0.82rem;
      margin-top: 1rem;
    }

    /* Quick Fill Checkbox */
    .quick-fill-box {
      margin-bottom: 1.5rem;
      padding: 0.75rem 1rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px dashed rgba(99, 102, 241, 0.3);
      border-radius: 8px;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      color: #c7d2fe;
      cursor: pointer;
    }

    /* Review Grid */
    .review-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .review-card {
      background: rgba(30, 41, 59, 0.5);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }
    .review-card-header {
      padding: 0.85rem 1.2rem;
      background: rgba(15, 23, 42, 0.8);
      display: flex;
      align-items: center;
      gap: 0.6rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .review-card-header h4 {
      font-size: 0.9rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      flex: 1;
    }
    .btn-edit {
      background: transparent;
      border: none;
      color: #818cf8;
      font-size: 0.78rem;
      cursor: pointer;
      text-decoration: underline;
    }
    .review-card-body {
      padding: 1.2rem;
      font-size: 0.82rem;
      color: #cbd5e1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .confirm-notice {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1.2rem;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 8px;
      color: #fde68a;
      font-size: 0.8rem;
      margin-bottom: 2rem;
    }

    /* Step Actions */
    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1.65rem;
      border-radius: 10px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #ffffff;
      border: none;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(79, 70, 229, 0.4);
      transition: all 0.2s;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(79, 70, 229, 0.6);
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.2rem;
      border-radius: 8px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
    }
    .btn-confirm-order {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.95rem 2rem;
      border-radius: 12px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
      transition: all 0.2s;
    }
    .btn-confirm-order:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 6px 26px rgba(16, 185, 129, 0.6);
    }
    .btn-confirm-order[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Summary Column */
    .summary-column {
      padding: 1.75rem;
      border-radius: var(--radius-lg, 16px);
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 1.5rem;
    }
    .summary-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .summary-header h3 {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge-items {
      font-size: 0.72rem;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      background: rgba(99, 102, 241, 0.15);
      color: #c7d2fe;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .summary-items-scroll {
      max-height: 280px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      margin-bottom: 1.5rem;
      padding-right: 0.35rem;
    }
    .summary-item-card {
      display: flex;
      gap: 0.75rem;
      padding: 0.65rem;
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .summary-img-box {
      width: 48px;
      height: 56px;
      border-radius: 6px;
      background: #0b0f19;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .summary-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .fallback-icon {
      color: #475569;
      font-size: 1.2rem;
    }
    .summary-item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .summary-item-title {
      font-size: 0.82rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0;
      line-height: 1.25;
    }
    .summary-item-attrs {
      font-size: 0.7rem;
      color: #94a3b8;
    }
    .summary-item-price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.2rem;
    }
    .qty-tag {
      font-size: 0.7rem;
      color: #a5b4fc;
      background: rgba(99, 102, 241, 0.1);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
    }
    .subtotal-val {
      font-size: 0.85rem;
      font-weight: 700;
      color: #38bdf8;
    }
    .summary-totals-box {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      color: #94a3b8;
    }
    .free-green {
      color: #34d399;
      font-weight: 700;
    }
    .total-line.grand-total {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 0.75rem;
      margin-top: 0.25rem;
      font-size: 1.05rem;
      font-weight: 800;
      color: #ffffff;
    }
    .total-highlight {
      font-size: 1.35rem;
      color: #38bdf8;
      letter-spacing: -0.5px;
    }

    .animate-fade {
      animation: fadeIn 0.25s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 950px) {
      .checkout-grid { grid-template-columns: 1fr; }
      .summary-column { position: static; }
      .delivery-options-grid { grid-template-columns: 1fr; }
      .form-row, .review-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  carritoService = inject(CarritoService);
  checkoutService = inject(CheckoutService);
  api = inject(FashionApiService);
  auth = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);

  currentStep = 1;
  submitting = false;

  // Paso 1: Entrega
  modalidad: 'RETIRO_TIENDA' | 'DELIVERY' = 'RETIRO_TIENDA';
  costoEnvio = 0.0;
  sucursales: Sucursal[] = [];
  selectedSucursalId: number | null = null;
  direccionEnvio = '';
  telefonoContacto = '';
  notasEntrega = '';

  // Paso 2: Facturación
  nitFactura = '';
  razonSocialFactura = '';
  usarMisDatos = false;

  get selectedSucursal(): Sucursal | undefined {
    return this.sucursales.find(s => s.id_sucursal === this.selectedSucursalId);
  }

  ngOnInit(): void {
    // Si no está autenticado, redirigir a login
    if (!this.auth.isAuthenticated()) {
      this.toast.info('Sesión requerida', 'Inicie sesión para completar su compra.');
      this.router.navigate(['/login']);
      return;
    }

    // Cargar sucursales físicas
    this.api.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        if (this.sucursales.length > 0 && !this.selectedSucursalId) {
          this.selectedSucursalId = this.sucursales[0].id_sucursal;
        }
      }
    });

    // Cargar carrito activo
    this.carritoService.cargarCarrito();

    // Validar si el carrito está vacío
    setTimeout(() => {
      if (this.carritoService.items().length === 0) {
        this.toast.warning('Carrito Vacío', 'No tienes prendas en tu bolsa de compras.');
        this.router.navigate(['/catalogo']);
      }
    }, 400);

    // Pre-cargar nombre si el usuario existe
    const u = this.auth.currentUser();
    if (u) {
      this.razonSocialFactura = `${u.nombres} ${u.apellidos}`.trim();
    }
  }

  goToStep(step: number): void {
    if (step === 2 && !this.validarPaso1(false)) return;
    if (step === 3 && (!this.validarPaso1(false) || !this.validarPaso2(false))) return;
    this.currentStep = step;
  }

  setModalidad(mode: 'RETIRO_TIENDA' | 'DELIVERY'): void {
    this.modalidad = mode;
    this.costoEnvio = mode === 'DELIVERY' ? 25.0 : 0.0;
  }

  validarPaso1(advance = true): boolean {
    if (this.modalidad === 'RETIRO_TIENDA') {
      if (!this.selectedSucursalId) {
        this.toast.warning('Selección requerida', 'Por favor selecciona la sucursal física de retiro.');
        return false;
      }
    } else {
      if (!this.direccionEnvio || !this.direccionEnvio.trim()) {
        this.toast.warning('Dirección requerida', 'Por favor ingresa la dirección de entrega a domicilio.');
        return false;
      }
      if (!this.telefonoContacto || !this.telefonoContacto.trim()) {
        this.toast.warning('Contacto requerido', 'Por favor ingresa un teléfono móvil de contacto.');
        return false;
      }
    }
    if (advance) this.currentStep = 2;
    return true;
  }

  validarPaso2(advance = true): boolean {
    if (!this.nitFactura || !this.nitFactura.trim()) {
      this.toast.warning('NIT / CI requerido', 'Ingrese el número de NIT o Carnet para la factura.');
      return false;
    }
    if (!this.razonSocialFactura || !this.razonSocialFactura.trim()) {
      this.toast.warning('Razón Social requerida', 'Ingrese el nombre o razón social para la factura.');
      return false;
    }
    if (advance) this.currentStep = 3;
    return true;
  }

  aplicarDatosUsuario(): void {
    if (this.usarMisDatos) {
      const u = this.auth.currentUser();
      if (u) {
        this.razonSocialFactura = `${u.nombres} ${u.apellidos}`.trim();
      }
    }
  }

  confirmarOrden(): void {
    if (!this.validarPaso1(false) || !this.validarPaso2(false)) {
      return;
    }

    this.submitting = true;
    const payload: OrdenCreateRequest = {
      modalidad_entrega: this.modalidad,
      id_sucursal: this.modalidad === 'RETIRO_TIENDA' ? this.selectedSucursalId : null,
      direccion_envio: this.modalidad === 'DELIVERY' ? this.direccionEnvio : null,
      telefono_contacto: this.telefonoContacto || null,
      nit_factura: this.nitFactura.trim(),
      razon_social_factura: this.razonSocialFactura.trim(),
      notas_entrega: this.notasEntrega || null
    };

    this.checkoutService.procesarCheckout(payload).subscribe({
      next: (ordenCreada) => {
        this.submitting = false;
        this.toast.success('¡Orden Formalizada!', `Orden #${ordenCreada.id_orden} registrada exitosamente.`);
        // Recargar carrito (ahora vacío)
        this.carritoService.cargarCarrito();
        // Redirigir a la pantalla de confirmación
        this.router.navigate(['/checkout/confirmacion', ordenCreada.id_orden]);
      },
      error: (err) => {
        this.submitting = false;
        const msg = err.error?.detail || 'Ocurrió un error al procesar el checkout.';
        this.toast.error('Error de Checkout', msg);
      }
    });
  }
}
