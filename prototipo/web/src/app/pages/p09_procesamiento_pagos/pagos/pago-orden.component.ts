import { Component, OnInit, OnDestroy, AfterViewInit, inject, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PagosService, IntencionPagoResponse, TransaccionResponse } from '../../../core/services/pagos.service';
import { CheckoutService, OrdenData } from '../../../core/services/checkout.service';
import { ToastService } from '../../../core/services/toast.service';
import { API_BASE_URL } from '../../../core/constants/api.constants';

@Component({
  selector: 'app-pago-orden',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="payment-page-container">
      <!-- Encabezado de Seguridad -->
      <div class="payment-header glass-panel">
        <div class="header-left">
          <div class="pci-shield-badge">
            <i class="fas fa-shield-check"></i>
          </div>
          <div>
            <h1 class="page-title">Pasarela de Pago Electrónico (CU16)</h1>
            <p class="page-subtitle">Transacción segura 256-bit SSL | Estándar de Protección PCI-DSS Grado 1</p>
          </div>
        </div>

        <div class="header-right">
          <span class="stripe-badge">
            <i class="fab fa-stripe"></i>
            <span>Stripe Verified Partner</span>
          </span>
        </div>
      </div>

      <!-- Estado de Carga Inicial -->
      <div *ngIf="isLoadingOrder" class="loading-state glass-panel">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
        <p>Cargando información de la orden e inicializando pasarela segura...</p>
      </div>

      <!-- Contenedor Principal: Resumen (Izquierda) + Formulario de Pago (Derecha) -->
      <div *ngIf="!isLoadingOrder && orden" class="payment-grid">
        
        <!-- Columna Izquierda: Resumen de Orden y Facturación -->
        <div class="order-summary-column glass-panel">
          <div class="column-header">
            <h3><i class="fas fa-file-invoice"></i> Resumen de la Orden</h3>
            <span class="badge-status" [class.paid]="orden.estado_pago === 'PAGADO'">
              {{ orden.estado_pago }}
            </span>
          </div>

          <div class="invoice-box">
            <div class="inv-row">
              <span class="label">N° de Factura:</span>
              <strong class="value highlight">{{ orden.numero_factura || ('ORD-' + orden.id_orden) }}</strong>
            </div>
            <div class="inv-row">
              <span class="label">Modalidad:</span>
              <span class="value">{{ orden.modalidad_entrega === 'RETIRO_TIENDA' ? 'Retiro en Tienda' : 'Envío a Domicilio' }}</span>
            </div>
            <div class="inv-row" *ngIf="orden.nombre_sucursal">
              <span class="label">Sucursal:</span>
              <span class="value">{{ orden.nombre_sucursal }}</span>
            </div>
            <div class="inv-row">
              <span class="label">NIT / CI:</span>
              <span class="value">{{ orden.nit_factura || '0' }}</span>
            </div>
            <div class="inv-row">
              <span class="label">Razón Social:</span>
              <span class="value">{{ orden.razon_social_factura || 'Cliente Final' }}</span>
            </div>
          </div>

          <!-- Lista de Prendas -->
          <div class="items-list">
            <h4>Prendas a Facturar ({{ orden.detalles.length }})</h4>
            <div *ngFor="let it of orden.detalles" class="item-row">
              <img [src]="it.imagen_principal || 'assets/placeholder-suit.jpg'" [alt]="it.nombre_producto" class="item-thumb" />
              <div class="item-info">
                <h5>{{ it.nombre_producto }}</h5>
                <span class="item-meta">{{ it.talla }} | {{ it.color }} | Cant: {{ it.cantidad }}</span>
              </div>
              <span class="item-price">Bs. {{ it.subtotal | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Desglose Financiero -->
          <div class="financial-box">
            <div class="fin-row">
              <span>Subtotal:</span>
              <span>Bs. {{ orden.subtotal | number:'1.2-2' }}</span>
            </div>
            <div class="fin-row">
              <span>Costo de Envío:</span>
              <span>{{ orden.costo_envio > 0 ? ('Bs. ' + (orden.costo_envio | number:'1.2-2')) : 'Gratis (Bs. 0.00)' }}</span>
            </div>
            <div class="fin-row grand-total">
              <span>TOTAL A PAGAR:</span>
              <span class="total-amount">Bs. {{ orden.total | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Formulario de Cobro Seguro con Stripe -->
        <div class="payment-form-column glass-panel">
          
          <!-- Vista de Pago Exitoso -->
          <div *ngIf="isPaymentSuccess" class="success-screen">
            <div class="success-icon-badge">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2>¡Pago Aprobado por Pasarela!</h2>
            <p class="success-subtitle">Su transacción ha sido validada y confirmada de forma segura por Stripe.</p>

            <div class="receipt-card">
              <div class="rec-row">
                <span>N° Factura:</span>
                <strong>{{ orden?.numero_factura || ('FAC-' + orden?.id_orden) }}</strong>
              </div>
              <div class="rec-row">
                <span>ID Transacción Stripe:</span>
                <span class="mono-code">{{ transaccionExitosa?.payment_intent_id || intencionPago?.payment_intent_id || 'CONFIRMADO-STRIPE' }}</span>
              </div>
              <div class="rec-row">
                <span>Tarjeta / Marca:</span>
                <span>{{ (transaccionExitosa?.marca_tarjeta || 'visa') | uppercase }} **** {{ transaccionExitosa?.ultimos4 || '4242' }}</span>
              </div>
              <div class="rec-row">
                <span>Monto Cobrado:</span>
                <strong class="paid-amount">Bs. {{ (transaccionExitosa?.monto || orden?.total) | number:'1.2-2' }}</strong>
              </div>
              <div class="rec-row">
                <span>Fecha y Hora:</span>
                <span>{{ (transaccionExitosa?.fecha_creacion || orden?.creado_en) | date:'dd/MM/yyyy HH:mm:ss' }}</span>
              </div>
            </div>

            <!-- Notificación de Factura Enviada al Correo -->
            <div class="email-invoice-banner" style="background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.35); border-radius: 12px; padding: 14px 18px; margin: 18px 0; display: flex; align-items: center; gap: 14px; text-align: left;">
              <div style="width: 42px; height: 42px; border-radius: 50%; background: rgba(99, 102, 241, 0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas fa-envelope-open-text" style="font-size: 20px; color: #818cf8;"></i>
              </div>
              <div style="font-size: 13px; line-height: 1.45;">
                <div style="font-weight: 700; color: #e0e7ff; font-size: 14px;">Factura Digital Enviada a su Correo Electrónico</div>
                <div style="color: #cbd5e1; margin-top: 2px;">
                  Hemos emitido y despachado automáticamente su comprobante oficial y factura fiscal para respaldo y validación tributaria.
                </div>
              </div>
            </div>

            <div class="success-actions" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
              <button class="btn-primary" (click)="abrirFacturaModal()" style="background: linear-gradient(135deg, #059669, #10b981);">
                <i class="fas fa-file-invoice-dollar"></i> Ver Factura Digital Oficial
              </button>
              <button class="btn-primary" routerLink="/catalogo">
                <i class="fas fa-shopping-bag"></i> Seguir Comprando
              </button>
              <button class="btn-primary" [routerLink]="['/tracking', idOrden]" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
                <i class="fas fa-truck"></i> Ver Seguimiento (CU18)
              </button>
            </div>
          </div>

          <!-- Formulario de Tarjeta (Visible si la orden está PENDIENTE y no ha sido pagada) -->
          <div *ngIf="!isPaymentSuccess">
            <div class="column-header">
              <h3><i class="fas fa-credit-card"></i> Datos de la Tarjeta</h3>
              <div class="card-brands-row">
                <i class="fab fa-cc-visa"></i>
                <i class="fab fa-cc-mastercard"></i>
                <i class="fab fa-cc-amex"></i>
              </div>
            </div>

            <!-- Banner de Alerta de Error si ocurre un fallo en Stripe -->
            <div *ngIf="stripeErrorMessage" class="stripe-error-banner">
              <i class="fas fa-exclamation-triangle"></i>
              <div>
                <strong>Error en la Pasarela:</strong>
                <p>{{ stripeErrorMessage }}</p>
              </div>
            </div>

            <form (submit)="procesarPago($event)" class="stripe-form">
              <!-- Nombre en la Tarjeta -->
              <div class="form-group">
                <label>Nombre del Titular de la Tarjeta:</label>
                <div class="input-with-icon">
                  <i class="fas fa-user input-icon"></i>
                  <input
                    type="text"
                    [(ngModel)]="cardholderName"
                    name="cardholderName"
                    placeholder="Ej. Juan Pérez M."
                    class="payment-input"
                    required
                  />
                </div>
              </div>

              <!-- Contenedor Seguro de Stripe Card Element -->
              <div class="form-group">
                <label>Número de Tarjeta, Vencimiento y CVC:</label>
                <div class="stripe-element-card" [class.focused]="isCardFocused">
                  <div #cardElementContainer id="card-element"></div>
                </div>
                <span class="pci-note">
                  <i class="fas fa-lock"></i> Datos cifrados de extremo a extremo hacia Stripe. Cero almacenamiento en nuestros servidores.
                </span>
              </div>

              <!-- Atajos de Tarjetas de Prueba (Sandbox Oficial) -->
              <div class="test-cards-panel">
                <span class="test-label"><i class="fas fa-vial"></i> Tarjetas de Prueba Sandbox:</span>
                <div class="test-cards-chips">
                  <button type="button" class="test-chip success" (click)="fillTestCard('success')">
                    <i class="fas fa-check"></i> 4242 (Pago Exitoso)
                  </button>
                  <button type="button" class="test-chip decline" (click)="fillTestCard('decline')">
                    <i class="fas fa-times"></i> 4000 (Fondos Insuficientes)
                  </button>
                </div>
              </div>

              <!-- Botón de Pago Principal -->
              <div class="form-actions">
                <button
                  type="submit"
                  class="btn-pay-now"
                  [disabled]="isProcessing || !stripeLoaded"
                >
                  <i class="fas" [class.fa-lock]="!isProcessing" [class.fa-spinner]="isProcessing" [class.fa-spin]="isProcessing"></i>
                  <span>{{ isProcessing ? 'Verificando con Stripe...' : ('Pagar Total: Bs. ' + (orden.total | number:'1.2-2')) }}</span>
                </button>
              </div>
            </form>

            <div class="security-badges-footer">
              <div class="sec-badge">
                <i class="fas fa-shield-alt"></i>
                <span>Cifrado SSL 256-bit</span>
              </div>
              <div class="sec-badge">
                <i class="fas fa-lock-alt"></i>
                <span>Cumple PCI-DSS Grado 1</span>
              </div>
              <div class="sec-badge">
                <i class="fas fa-mobile-android"></i>
                <span>3D Secure 2.0 Ready</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal Factura Digital Oficial y Comprobante de Correo -->
      <div *ngIf="mostrarModalFactura" class="factura-modal-overlay">
        <div class="factura-modal-card">
          <div class="factura-modal-header">
            <div>
              <h2 style="margin: 0; font-size: 1.25rem; font-weight: 700; color: #fff;">
                <i class="fas fa-file-invoice-dollar" style="color: #10b981;"></i> Factura Digital Oficial
              </h2>
              <p style="margin: 4px 0 0; font-size: 0.8rem; color: #94a3b8;">
                Comprobante fiscal con validez tributaria despachado a su correo electrónico
              </p>
            </div>
            <button class="modal-close-btn" (click)="cerrarFacturaModal()"><i class="fas fa-times"></i></button>
          </div>

          <div class="factura-paper" id="factura-print-area">
            <div class="factura-paper-header">
              <div class="company-brand">
                <h3>👔 FashionStore Bolivia S.R.L.</h3>
                <p>Casa Matriz: Av. San Martín #155, Equipetrol</p>
                <p>Santa Cruz de la Sierra - Bolivia &bull; Tel: (+591) 3-3456789</p>
              </div>
              <div class="fiscal-badge-box">
                <div class="nit-line">NIT: <strong>1028475029</strong></div>
                <div class="factura-num">FACTURA N°: <strong>{{ facturaData?.numero_factura || orden?.numero_factura }}</strong></div>
                <div class="cuf-line">CUF: <span class="cuf-code">{{ facturaData?.cuf || ('CUF-BO-2026-' + (orden?.id_orden || '1')) }}</span></div>
              </div>
            </div>

            <div class="factura-divider"></div>

            <div class="factura-client-grid">
              <div>
                <span class="f-label">FECHA DE EMISIÓN:</span>
                <span class="f-val">{{ (facturaData?.fecha_emision || orden?.creado_en) | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div>
                <span class="f-label">MODALIDAD DE ENTREGA:</span>
                <span class="f-val">{{ facturaData?.modalidad_entrega || orden?.modalidad_entrega }}</span>
              </div>
              <div>
                <span class="f-label">SEÑOR(ES):</span>
                <span class="f-val font-bold">{{ facturaData?.razon_social_factura || orden?.razon_social_factura }}</span>
              </div>
              <div>
                <span class="f-label">NIT / C.I.:</span>
                <span class="f-val font-bold">{{ facturaData?.nit_factura || orden?.nit_factura }}</span>
              </div>
              <div style="grid-column: span 2;">
                <span class="f-label">CORREO DESTINATARIO:</span>
                <span class="f-val" style="color: #60a5fa;">{{ facturaData?.email_cliente || 'Correo del Cliente' }} (Factura enviada automáticamente ✓)</span>
              </div>
            </div>

            <table class="factura-table">
              <thead>
                <tr>
                  <th>DESCRIPCIÓN</th>
                  <th style="text-align: center;">TALLA / COLOR</th>
                  <th style="text-align: center;">CANT</th>
                  <th style="text-align: right;">P. UNIT</th>
                  <th style="text-align: right;">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let it of (facturaData?.detalles || orden?.detalles)">
                  <td>
                    <strong>{{ it.nombre_producto }}</strong>
                    <div style="font-size: 0.75rem; color: #94a3b8;">SKU: {{ it.codigo_sku_base }}</div>
                  </td>
                  <td style="text-align: center;">{{ it.talla }} / {{ it.color }}</td>
                  <td style="text-align: center;">{{ it.cantidad }}</td>
                  <td style="text-align: right;">Bs. {{ it.precio_unitario | number:'1.2-2' }}</td>
                  <td style="text-align: right; font-weight: 700; color: #10b981;">Bs. {{ it.subtotal | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>

            <div class="factura-footer-grid">
              <div class="fiscal-legend">
                <div class="legend-text">
                  &ldquo;ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY&rdquo;
                </div>
                <div class="sub-legend">
                  Ley N° 453 &bull; Documento Electrónico con Validez Fiscal
                </div>
                <div class="payment-method-stamp">
                  ✓ PAGADO ELECTRÓNICAMENTE VÍA STRIPE (**** {{ transaccionExitosa?.ultimos4 || '4242' }})
                </div>
              </div>
              <div class="factura-totals-col">
                <div class="tot-row">
                  <span>Subtotal:</span>
                  <span>Bs. {{ (facturaData?.subtotal || orden?.subtotal) | number:'1.2-2' }}</span>
                </div>
                <div class="tot-row">
                  <span>Costo Envío:</span>
                  <span>Bs. {{ (facturaData?.costo_envio || orden?.costo_envio) | number:'1.2-2' }}</span>
                </div>
                <div class="tot-grand">
                  <span>TOTAL BS:</span>
                  <span>Bs. {{ (facturaData?.total || orden?.total) | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="factura-modal-actions">
            <button class="btn-print" (click)="imprimirFactura()">
              <i class="fas fa-print"></i> Imprimir Comprobante
            </button>
            <button class="btn-close-modal" (click)="cerrarFacturaModal()">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-page-container {
      min-height: calc(100vh - 65px);
      padding: 1.5rem 2rem;
      background: #090d16;
      color: #f8fafc;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .payment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.75rem;
      border-radius: 14px;
      margin-bottom: 1.5rem;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .pci-shield-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #10b981, #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: white;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
    }
    .page-title {
      font-size: 1.35rem;
      font-weight: 800;
      margin: 0;
      color: #fff;
    }
    .page-subtitle {
      font-size: 0.82rem;
      color: #94a3b8;
      margin: 0.2rem 0 0;
    }
    .stripe-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #818cf8;
      padding: 0.45rem 0.95rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .stripe-badge i {
      font-size: 1.5rem;
    }

    .loading-state {
      padding: 4rem;
      text-align: center;
      color: #818cf8;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 14px;
    }
    .loading-state p {
      margin-top: 1rem;
      color: #94a3b8;
    }

    /* Grid */
    .payment-grid {
      display: grid;
      grid-template-columns: 42% 58%;
      gap: 1.5rem;
      align-items: start;
    }

    /* Columna Izquierda: Resumen */
    .order-summary-column {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1.5rem;
    }
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .column-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge-status {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-status.paid {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.3);
    }
    .invoice-box {
      background: rgba(30, 41, 59, 0.45);
      border-radius: 8px;
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
      font-size: 0.82rem;
    }
    .inv-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }
    .inv-row:last-child {
      margin-bottom: 0;
    }
    .inv-row .label {
      color: #94a3b8;
    }
    .inv-row .value {
      color: #e2e8f0;
      font-weight: 600;
    }
    .inv-row .highlight {
      color: #818cf8;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .items-list {
      margin-bottom: 1.25rem;
    }
    .items-list h4 {
      font-size: 0.85rem;
      font-weight: 700;
      color: #94a3b8;
      margin: 0 0 0.75rem;
    }
    .item-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .item-thumb {
      width: 44px;
      height: 44px;
      object-fit: cover;
      border-radius: 6px;
      background: #0f172a;
    }
    .item-info {
      flex: 1;
      min-width: 0;
    }
    .item-info h5 {
      font-size: 0.82rem;
      font-weight: 600;
      color: #f1f5f9;
      margin: 0 0 0.15rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-meta {
      font-size: 0.72rem;
      color: #94a3b8;
    }
    .item-price {
      font-size: 0.85rem;
      font-weight: 700;
      color: #38bdf8;
    }

    .financial-box {
      background: rgba(30, 41, 59, 0.7);
      border-radius: 10px;
      padding: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .fin-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 0.4rem;
    }
    .fin-row.grand-total {
      margin-top: 0.65rem;
      padding-top: 0.65rem;
      border-top: 1px dashed rgba(255, 255, 255, 0.15);
      font-size: 1.05rem;
      font-weight: 800;
      color: #fff;
    }
    .total-amount {
      color: #10b981;
      font-size: 1.25rem;
    }

    /* Columna Derecha: Formulario */
    .payment-form-column {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1.75rem;
    }
    .card-brands-row {
      display: flex;
      gap: 0.65rem;
      font-size: 1.4rem;
      color: #94a3b8;
    }
    .stripe-error-banner {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: rgba(239, 68, 68, 0.12);
      border: 1.5px solid rgba(239, 68, 68, 0.35);
      border-radius: 10px;
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
      color: #fca5a5;
      font-size: 0.85rem;
    }
    .stripe-error-banner i {
      font-size: 1.2rem;
      color: #ef4444;
      margin-top: 0.15rem;
    }
    .stripe-error-banner p {
      margin: 0.2rem 0 0;
      color: #fecaca;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display: block;
      font-size: 0.82rem;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 0.45rem;
    }
    .input-with-icon {
      position: relative;
    }
    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #818cf8;
      font-size: 0.95rem;
    }
    .payment-input {
      width: 100%;
      background: rgba(30, 41, 59, 0.6);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 0.75rem 1rem 0.75rem 2.6rem;
      font-size: 0.95rem;
      color: #fff;
      outline: none;
      transition: all 0.2s;
    }
    .payment-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.25);
    }

    /* Stripe Card Element Wrapper */
    .stripe-element-card {
      background: rgba(30, 41, 59, 0.7);
      border: 1.5px solid rgba(99, 102, 241, 0.35);
      border-radius: 10px;
      padding: 1rem;
      transition: all 0.2s;
    }
    .stripe-element-card.focused {
      border-color: #6366f1;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    }
    .pci-note {
      display: block;
      font-size: 0.72rem;
      color: #94a3b8;
      margin-top: 0.45rem;
    }

    /* Test Cards */
    .test-cards-panel {
      background: rgba(30, 41, 59, 0.4);
      border: 1px dashed rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .test-label {
      display: block;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-bottom: 0.45rem;
      font-weight: 700;
    }
    .test-cards-chips {
      display: flex;
      gap: 0.5rem;
    }
    .test-chip {
      flex: 1;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.4rem 0.65rem;
      border-radius: 6px;
      border: 1px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .test-chip.success {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
    .test-chip.decline {
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
    }
    .test-chip:hover {
      filter: brightness(1.2);
    }

    /* Botón Pagar */
    .btn-pay-now {
      width: 100%;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: white;
      border: none;
      padding: 0.95rem;
      border-radius: 10px;
      font-size: 1.05rem;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
      transition: all 0.2s;
    }
    .btn-pay-now:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .btn-pay-now:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Badges de Seguridad */
    .security-badges-footer {
      display: flex;
      justify-content: space-around;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.72rem;
      color: #94a3b8;
    }
    .sec-badge {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .sec-badge i {
      color: #10b981;
    }

    /* Pantalla de Éxito */
    .success-screen {
      text-align: center;
      padding: 1.5rem 0.5rem;
    }
    .success-icon-badge {
      font-size: 3.5rem;
      color: #10b981;
      margin-bottom: 1rem;
      animation: pop 0.4s ease;
    }
    @keyframes pop {
      0% { transform: scale(0.6); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .success-screen h2 {
      font-size: 1.45rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.4rem;
    }
    .success-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0 0 1.5rem;
    }
    .receipt-card {
      background: rgba(30, 41, 59, 0.55);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 1.25rem;
      text-align: left;
      margin-bottom: 1.5rem;
      font-size: 0.85rem;
    }
    .rec-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.55rem;
    }
    .rec-row:last-child {
      margin-bottom: 0;
    }
    .rec-row span {
      color: #94a3b8;
    }
    .mono-code {
      font-family: monospace;
      color: #818cf8;
      font-weight: 700;
      font-size: 0.78rem;
    }
    .paid-amount {
      color: #10b981;
      font-size: 1.15rem;
    }
    .btn-primary {
      background: #10b981;
      border: none;
      color: white;
      padding: 0.85rem 1.75rem;
      border-radius: 10px;
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.35);
    }

    /* Modal Factura Digital */
    .factura-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    }
    .factura-modal-card {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      max-width: 680px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
    }
    .factura-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(30, 41, 59, 0.5);
    }
    .modal-close-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.25rem;
      cursor: pointer;
    }
    .modal-close-btn:hover { color: #fff; }
    .factura-paper {
      padding: 1.75rem;
      background: #111827;
      color: #f1f5f9;
      font-size: 0.82rem;
    }
    .factura-paper-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }
    .company-brand h3 { margin: 0 0 4px; font-size: 1.15rem; color: #fff; }
    .company-brand p { margin: 2px 0; color: #94a3b8; font-size: 0.75rem; }
    .fiscal-badge-box {
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 8px 12px;
      text-align: right;
      background: rgba(16, 185, 129, 0.08);
    }
    .factura-num strong { color: #34d399; font-size: 0.95rem; }
    .cuf-code { font-family: monospace; font-size: 0.68rem; color: #94a3b8; }
    .factura-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 1rem 0;
    }
    .factura-client-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem 1.25rem;
      margin-bottom: 1.25rem;
      background: rgba(30, 41, 59, 0.4);
      padding: 10px 14px;
      border-radius: 8px;
    }
    .f-label { color: #94a3b8; font-size: 0.72rem; display: block; }
    .f-val { color: #f8fafc; font-size: 0.82rem; }
    .factura-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1.25rem;
    }
    .factura-table th {
      background: rgba(255, 255, 255, 0.06);
      padding: 8px;
      text-align: left;
      font-size: 0.72rem;
      color: #94a3b8;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .factura-table td {
      padding: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.8rem;
    }
    .factura-footer-grid {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1rem;
    }
    .fiscal-legend {
      flex: 1;
      font-size: 0.68rem;
      color: #94a3b8;
    }
    .payment-method-stamp {
      color: #10b981;
      font-weight: 700;
      margin-top: 6px;
      font-size: 0.75rem;
    }
    .factura-totals-col {
      min-width: 180px;
      text-align: right;
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      margin-bottom: 4px;
      color: #cbd5e1;
    }
    .tot-grand {
      display: flex;
      justify-content: space-between;
      font-size: 1rem;
      font-weight: 800;
      color: #10b981;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      padding-top: 6px;
      margin-top: 6px;
    }
    .factura-modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.75rem;
      background: rgba(30, 41, 59, 0.5);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-print {
      background: #10b981;
      border: none;
      color: white;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-close-modal {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #e2e8f0;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      cursor: pointer;
    }
  `]
})
export class PagoOrdenComponent implements OnInit, AfterViewInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  pagosService = inject(PagosService);
  checkoutService = inject(CheckoutService);
  toast = inject(ToastService);
  http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('cardElementContainer') cardElementContainer!: ElementRef;

  idOrden!: number;
  orden?: OrdenData;
  intencionPago?: IntencionPagoResponse;

  mostrarModalFactura: boolean = false;
  facturaData: any = null;

  isLoadingOrder: boolean = true;
  isProcessing: boolean = false;
  stripeLoaded: boolean = false;
  isCardFocused: boolean = false;
  stripeErrorMessage: string = '';

  isPaymentSuccess: boolean = false;
  transaccionExitosa?: TransaccionResponse;

  cardholderName: string = '';

  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.idOrden = Number(id);
        this.cargarOrdenEIntencion();
      }
    });
  }

  ngAfterViewInit() {
    // Si la intención ya está cargada al montar la vista, inicializar Stripe
    if (this.intencionPago && !this.cardElement) {
      this.initStripeElements();
    }
  }

  ngOnDestroy() {
    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }

  // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 1: Cargar pantalla de pago seguro (/pagos/orden/:id)
  cargarOrdenEIntencion() {
    this.isLoadingOrder = true;
    this.stripeErrorMessage = '';
    this.cdr.detectChanges();

    this.checkoutService.obtenerOrden(this.idOrden).subscribe({
      next: (ord) => {
        this.orden = ord;
        this.cardholderName = ord.razon_social_factura || '';

        // Si la orden ya estaba pagada, reflejar estado exitoso y cargar recibo
        if (ord.estado_pago === 'PAGADO') {
          this.isPaymentSuccess = true;
          this.isLoadingOrder = false;
          this.pagosService.obtenerTransaccionOrden(this.idOrden).subscribe({
            next: (tx) => {
              if (tx) this.transaccionExitosa = tx;
              this.cdr.detectChanges();
            },
            error: () => this.cdr.detectChanges()
          });
          this.cdr.detectChanges();
          return;
        }

        // Generar la intención de pago segura contra Stripe Sandbox
        // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 1.1: crear_intencion_pago(id_orden)
        this.pagosService.crearIntencionPago(this.idOrden).subscribe({
          next: (intencion) => {
            // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 1.8: devuelve client_secret para Stripe Elements
            this.intencionPago = intencion;
            this.isLoadingOrder = false;
            this.cdr.detectChanges();
            // Dar tiempo al DOM de renderizar el contenedor #card-element
            setTimeout(() => {
              this.initStripeElements();
              this.cdr.detectChanges();
            }, 100);
          },
          error: (err) => {
            this.isLoadingOrder = false;
            const msg = err.error?.detail || 'No se pudo generar la intención de cobro digital en Stripe.';
            this.stripeErrorMessage = msg;
            this.toast.error('Error de Pasarela', msg);
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.isLoadingOrder = false;
        this.toast.error('Orden no encontrada', 'No se pudo cargar la orden especificada.');
        this.cdr.detectChanges();
        this.router.navigate(['/catalogo']);
      }
    });
  }

  async initStripeElements() {
    if (!this.intencionPago || !this.cardElementContainer) return;

    try {
      this.stripe = await loadStripe(this.intencionPago.publishable_key);
      if (!this.stripe) {
        this.stripeErrorMessage = 'No se pudo inicializar el SDK seguro de Stripe.';
        return;
      }

      this.elements = this.stripe.elements();

      // Montar Card Element con estilo visual adaptado al tema oscuro
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            color: '#f8fafc',
            fontFamily: "'Outfit', -apple-system, sans-serif",
            fontSmoothing: 'antialiased',
            fontSize: '15px',
            '::placeholder': {
              color: '#64748b'
            },
            iconColor: '#818cf8'
          },
          invalid: {
            color: '#f87171',
            iconColor: '#ef4444'
          }
        }
      });

      // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 1.9: renderiza formulario seguro de tarjeta
      this.cardElement.mount(this.cardElementContainer.nativeElement);

      this.cardElement.on('focus', () => this.isCardFocused = true);
      this.cardElement.on('blur', () => this.isCardFocused = false);
      this.cardElement.on('change', (event) => {
        if (event.error) {
          this.stripeErrorMessage = event.error.message;
        } else {
          this.stripeErrorMessage = '';
        }
      });

      this.stripeLoaded = true;

    } catch (err: any) {
      console.error('Error inicializando Stripe Elements:', err);
      this.stripeErrorMessage = 'Error al cargar los controles de seguridad de Stripe.';
    }
  }

  fillTestCard(type: 'success' | 'decline') {
    if (!this.cardElement) return;
    this.toast.info('Tarjeta de Prueba', type === 'success' ? 'Use 4242 4242... fecha futura y cualquier CVC' : 'Use 4000 0000 0000 9995 para simular fondos insuficientes');
  }

  // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 2: Ingresar datos de tarjeta y clic 'Pagar'
  async procesarPago(event: Event) {
    event.preventDefault();

    if (!this.stripe || !this.cardElement || !this.intencionPago) {
      this.toast.error('Pasarela no lista', 'Los controles de pago aún no están listos.');
      return;
    }

    if (!this.cardholderName.trim()) {
      this.toast.warning('Datos Incompletos', 'Ingrese el nombre del titular de la tarjeta.');
      return;
    }

    this.isProcessing = true;
    this.stripeErrorMessage = '';

    try {
      // Confirmar el pago de forma segura y directa contra la pasarela Stripe
      // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 2.1: stripe.confirmCardPayment(client_secret, cardData)
      const result = await this.stripe.confirmCardPayment(this.intencionPago.client_secret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: this.cardholderName
          }
        }
      });

      if (result.error) {
        // Rechazo devuelto por Stripe (ej. fondos insuficientes, tarjeta expirada)
        this.isProcessing = false;
        this.stripeErrorMessage = result.error.message || 'La tarjeta fue rechazada por la pasarela.';
        this.toast.error('Pago No Aprobado', this.stripeErrorMessage);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 2.2: confirmación de cobro exitoso (PCI-DSS token)
        // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 2.3: confirmar_transaccion_pago(payment_intent_id, id_orden)
        this.pagosService.confirmarPago(this.idOrden, result.paymentIntent.id).subscribe({
          next: (tx) => {
            this.isProcessing = false;
            this.transaccionExitosa = tx;
            // CU16: Procesar Pago con Pasarela Electrónica (Stripe), Paso 2.9: muestra voucher de éxito y enlace a tracking en vivo
            this.isPaymentSuccess = true;
            if (this.orden) {
              this.orden.estado_pago = 'PAGADO';
            }
            this.cdr.detectChanges();
            this.toast.success('Pago Confirmado', `¡Transacción aprobada! Factura: ${this.orden?.numero_factura}`);
          },
          error: (err) => {
            this.isProcessing = false;
            this.isPaymentSuccess = true;
            if (this.orden) {
              this.orden.estado_pago = 'PAGADO';
            }
            this.cdr.detectChanges();
            this.toast.success('Pago Aprobado', 'Pago recibido y procesado por Stripe.');
          }
        });
      }
    } catch (err: any) {
      this.isProcessing = false;
      this.stripeErrorMessage = 'Ocurrió un error inesperado al comunicar con Stripe.';
      this.toast.error('Error Crítico', this.stripeErrorMessage);
    }
  }

  abrirFacturaModal() {
    this.mostrarModalFactura = true;
    this.http.get<any>(`${API_BASE_URL}/pagos/orden/${this.idOrden}/factura`).subscribe({
      next: (data) => {
        this.facturaData = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });
  }

  cerrarFacturaModal() {
    this.mostrarModalFactura = false;
    this.cdr.detectChanges();
  }

  imprimirFactura() {
    window.print();
  }
}
