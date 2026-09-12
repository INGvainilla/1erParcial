import { Component, OnInit, OnDestroy, AfterViewInit, inject, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { PagosService, IntencionPagoResponse, TransaccionResponse } from '../../core/services/pagos.service';
import { CheckoutService, OrdenData } from '../../core/services/checkout.service';
import { ToastService } from '../../core/services/toast.service';

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
          <div *ngIf="isPaymentSuccess && transaccionExitosa" class="success-screen">
            <div class="success-icon-badge">
              <i class="fas fa-check-circle"></i>
            </div>
            <h2>¡Pago Aprobado por Pasarela!</h2>
            <p class="success-subtitle">Su transacción ha sido validada y confirmada de forma segura por Stripe.</p>

            <div class="receipt-card">
              <div class="rec-row">
                <span>N° Factura:</span>
                <strong>{{ orden.numero_factura }}</strong>
              </div>
              <div class="rec-row">
                <span>ID Transacción Stripe:</span>
                <span class="mono-code">{{ transaccionExitosa.payment_intent_id }}</span>
              </div>
              <div class="rec-row">
                <span>Tarjeta / Marca:</span>
                <span>{{ (transaccionExitosa.marca_tarjeta || 'visa') | uppercase }} **** {{ transaccionExitosa.ultimos4 || '4242' }}</span>
              </div>
              <div class="rec-row">
                <span>Monto Cobrado:</span>
                <strong class="paid-amount">Bs. {{ transaccionExitosa.monto | number:'1.2-2' }}</strong>
              </div>
              <div class="rec-row">
                <span>Fecha y Hora:</span>
                <span>{{ transaccionExitosa.fecha_creacion | date:'dd/MM/yyyy HH:mm:ss' }}</span>
              </div>
            </div>

            <div class="success-actions">
              <button class="btn-primary" routerLink="/catalogo">
                <i class="fas fa-shopping-bag"></i> Seguir Comprando
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
  `]
})
export class PagoOrdenComponent implements OnInit, AfterViewInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  pagosService = inject(PagosService);
  checkoutService = inject(CheckoutService);
  toast = inject(ToastService);

  @ViewChild('cardElementContainer') cardElementContainer!: ElementRef;

  idOrden!: number;
  orden?: OrdenData;
  intencionPago?: IntencionPagoResponse;

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

  cargarOrdenEIntencion() {
    this.isLoadingOrder = true;
    this.stripeErrorMessage = '';

    this.checkoutService.obtenerOrden(this.idOrden).subscribe({
      next: (ord) => {
        this.orden = ord;
        this.cardholderName = ord.razon_social_factura || '';

        // Si la orden ya estaba pagada, reflejar estado exitoso
        if (ord.estado_pago === 'PAGADO') {
          this.isPaymentSuccess = true;
          this.isLoadingOrder = false;
          return;
        }

        // Generar la intención de pago segura contra Stripe Sandbox
        this.pagosService.crearIntencionPago(this.idOrden).subscribe({
          next: (intencion) => {
            this.intencionPago = intencion;
            this.isLoadingOrder = false;
            // Dar tiempo al DOM de renderizar el contenedor #card-element
            setTimeout(() => this.initStripeElements(), 150);
          },
          error: (err) => {
            this.isLoadingOrder = false;
            const msg = err.error?.detail || 'No se pudo generar la intención de cobro digital en Stripe.';
            this.stripeErrorMessage = msg;
            this.toast.error('Error de Pasarela', msg);
          }
        });
      },
      error: () => {
        this.isLoadingOrder = false;
        this.toast.error('Orden no encontrada', 'No se pudo cargar la orden especificada.');
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
        // Pago exitoso en Stripe -> Confirmar y asentar en el backend
        this.pagosService.confirmarPago(this.idOrden, result.paymentIntent.id).subscribe({
          next: (tx) => {
            this.isProcessing = false;
            this.transaccionExitosa = tx;
            this.isPaymentSuccess = true;
            this.toast.success('Pago Confirmado', `¡Transacción aprobada! Factura: ${this.orden?.numero_factura}`);
          },
          error: (err) => {
            this.isProcessing = false;
            // Aun si el endpoint local demora, el webhook asíncrono confirmará la orden
            this.isPaymentSuccess = true;
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
}
