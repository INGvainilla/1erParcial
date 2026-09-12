import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LogisticaService, TrackingOrden } from '../../core/services/logistica.service';

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tracking-page">
      <div class="tracking-container" *ngIf="tracking; else loadingOrError">
        <!-- HEADER -->
        <div class="tracking-header">
          <div class="header-left">
            <a routerLink="/catalogo" class="btn-back">
              <i class="fas fa-arrow-left"></i> Volver a la Tienda
            </a>
            <h1 class="page-title">
              <i class="fas fa-shipping-fast text-sky"></i> Seguimiento en Vivo
            </h1>
            <p class="order-subtitle">
              Orden <strong>#{{ tracking.id_orden }}</strong> &bull; Factura <strong>{{ tracking.numero_factura || 'En Emisión' }}</strong>
            </p>
          </div>

          <div class="live-pulse">
            <span class="pulse-dot"></span>
            <span>Actualización en tiempo real</span>
          </div>
        </div>

        <!-- PROGRESS STEPPER -->
        <div class="stepper-card">
          <div class="stepper-progress-bar">
            <div class="progress-fill" [style.width.%]="tracking.porcentaje_progreso"></div>
          </div>

          <div class="stepper-steps">
            <div *ngFor="let p of tracking.pasos; let i = index" class="step-item"
                 [class.completed]="p.completado"
                 [class.active]="p.activo">
              <div class="step-icon-wrap">
                <i [class]="p.icono" [class.fa-bounce]="p.activo && p.codigo === 'EN_TRANSITO'"></i>
              </div>
              <div class="step-label">{{ p.titulo }}</div>
              <div class="step-desc" *ngIf="p.activo">{{ p.descripcion }}</div>
            </div>
          </div>
        </div>

        <!-- MAIN DETAILS GRID -->
        <div class="details-grid">
          <!-- COURIER & REPARTIDOR CARD -->
          <div class="detail-card courier-card">
            <div class="card-head">
              <div class="head-title">
                <i class="fas fa-id-card-alt text-purple"></i>
                <h3>Datos del Conductor / Repartidor</h3>
              </div>
              <span class="badge-status" [class.badge-transit]="tracking.estado_logistica === 'EN_TRANSITO'">
                {{ tracking.estado_logistica }}
              </span>
            </div>

            <div class="courier-body" *ngIf="tracking.nombre_repartidor; else noCourier">
              <div class="courier-avatar">
                <i class="fas fa-motorcycle"></i>
              </div>
              <div class="courier-info">
                <h4 class="courier-name">{{ tracking.nombre_repartidor }}</h4>
                <p class="courier-role">Encargado de Entrega a Domicilio</p>
                <div class="courier-contact" *ngIf="tracking.telefono_repartidor">
                  <a [href]="'tel:' + tracking.telefono_repartidor" class="btn-contact-action">
                    <i class="fas fa-phone-alt"></i> Llamar ({{ tracking.telefono_repartidor }})
                  </a>
                  <a [href]="'https://wa.me/591' + tracking.telefono_repartidor" target="_blank" class="btn-contact-action btn-wa">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                  </a>
                </div>
              </div>
            </div>

            <ng-template #noCourier>
              <div class="courier-pending">
                <i class="fas fa-warehouse text-amber"></i>
                <p>Tu orden está siendo empaquetada en el centro logístico. Te asignaremos un conductor en breve.</p>
              </div>
            </ng-template>

            <!-- DIRECCIÓN Y DISTANCIA -->
            <div class="delivery-destination">
              <div class="dest-item">
                <i class="fas fa-map-marker-alt text-red"></i>
                <div>
                  <span class="dest-lbl">Dirección de Destino</span>
                  <p class="dest-val">{{ tracking.direccion_envio }}</p>
                </div>
              </div>
              <div class="dest-item" *ngIf="tracking.distancia_km">
                <i class="fas fa-route text-sky"></i>
                <div>
                  <span class="dest-lbl">Distancia Estimada (Haversine)</span>
                  <p class="dest-val">{{ tracking.distancia_km }} Kilómetros</p>
                </div>
              </div>
            </div>
          </div>

          <!-- RESUMEN DE ARTÍCULOS EN EL PAQUETE -->
          <div class="detail-card items-card">
            <div class="card-head">
              <div class="head-title">
                <i class="fas fa-tshirt text-sky"></i>
                <h3>Prendas en este Envío</h3>
              </div>
              <span class="items-count">{{ tracking.prendas.length }} Artículo(s)</span>
            </div>

            <div class="items-list">
              <div *ngFor="let it of tracking.prendas" class="item-row">
                <div class="item-img-placeholder">
                  <img *ngIf="it.imagen_principal; else defaultIcon" [src]="it.imagen_principal" [alt]="it.nombre_producto" />
                  <ng-template #defaultIcon>
                    <i class="fas fa-box"></i>
                  </ng-template>
                </div>
                <div class="item-info">
                  <h5 class="item-title">{{ it.nombre_producto }}</h5>
                  <div class="item-meta">
                    <span class="spec-badge">Talla {{ it.talla }}</span>
                    <span class="spec-badge">Color {{ it.color }}</span>
                    <span class="qty-badge">Cant: {{ it.cantidad }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="payment-summary">
              <div class="pay-row">
                <span>Costo de Despacho (Delivery):</span>
                <span>Bs. {{ tracking.costo_envio.toFixed(2) }}</span>
              </div>
              <div class="pay-row total-row">
                <span>Total Pagado:</span>
                <span class="total-highlight">Bs. {{ tracking.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LOADING / ERROR TEMPLATE -->
      <ng-template #loadingOrError>
        <div class="loading-state">
          <div *ngIf="cargando" class="spinner-box">
            <i class="fas fa-circle-notch fa-spin"></i>
            <p>Localizando orden en el sistema logístico...</p>
          </div>
          <div *ngIf="!cargando && errorMsg" class="error-box">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>No pudimos encontrar esta orden</h3>
            <p>{{ errorMsg }}</p>
            <a routerLink="/catalogo" class="btn-action">Ir al Catálogo</a>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .tracking-page {
      min-height: calc(100vh - 64px);
      background: radial-gradient(circle at 50% 0%, #1e293b 0%, #090d16 85%);
      padding: 2.5rem 1.5rem;
      color: #f8fafc;
      font-family: 'Outfit', -apple-system, sans-serif;
    }

    .tracking-container {
      max-width: 960px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    /* HEADER */
    .tracking-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 1.25rem;
    }

    .btn-back {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.75rem;
      transition: color 0.2s;
    }

    .btn-back:hover { color: #38bdf8; }

    .page-title {
      font-size: 2rem;
      font-weight: 800;
      margin: 0 0 0.25rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .text-sky { color: #38bdf8; }
    .text-purple { color: #c084fc; }
    .text-red { color: #f87171; }
    .text-amber { color: #fbbf24; }

    .order-subtitle {
      color: #94a3b8;
      font-size: 0.95rem;
      margin: 0;
    }

    .live-pulse {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 0.4rem 0.9rem;
      border-radius: 20px;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      background: #38bdf8;
      border-radius: 50%;
      box-shadow: 0 0 8px #38bdf8;
      animation: pulse 1.8s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(56, 189, 248, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
    }

    /* STEPPER CARD */
    .stepper-card {
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 2.2rem 2rem;
      position: relative;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }

    .stepper-progress-bar {
      position: absolute;
      top: 52px;
      left: 60px;
      right: 60px;
      height: 4px;
      background: rgba(255,255,255,0.1);
      z-index: 1;
      border-radius: 2px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #a855f7);
      border-radius: 2px;
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stepper-steps {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 2;
    }

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 140px;
    }

    .step-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #1e293b;
      border: 2px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      color: #64748b;
      margin-bottom: 0.65rem;
      transition: all 0.3s ease;
    }

    .step-item.completed .step-icon-wrap {
      background: #0284c7;
      border-color: #38bdf8;
      color: #ffffff;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
    }

    .step-item.active .step-icon-wrap {
      background: #7e22ce;
      border-color: #c084fc;
      color: #ffffff;
      box-shadow: 0 0 16px rgba(168, 85, 247, 0.6);
      transform: scale(1.15);
    }

    .step-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: #94a3b8;
      margin-bottom: 0.25rem;
    }

    .step-item.completed .step-label { color: #f1f5f9; }
    .step-item.active .step-label { color: #c084fc; font-weight: 800; }

    .step-desc {
      font-size: 0.72rem;
      color: #cbd5e1;
      line-height: 1.2;
    }

    /* DETAILS GRID */
    .details-grid {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 1.5rem;
    }

    .detail-card {
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding-bottom: 0.85rem;
    }

    .head-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .head-title h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
    }

    .badge-status {
      font-size: 0.72rem;
      font-weight: 800;
      background: rgba(255,255,255,0.06);
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      color: #94a3b8;
    }

    .badge-transit {
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .courier-body {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 1rem 1.25rem;
    }

    .courier-avatar {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: rgba(168, 85, 247, 0.15);
      border: 2px solid rgba(168, 85, 247, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: #c084fc;
    }

    .courier-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .courier-name {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 800;
      color: #ffffff;
    }

    .courier-role {
      margin: 0;
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .courier-contact {
      display: flex;
      gap: 0.6rem;
      margin-top: 0.4rem;
    }

    .btn-contact-action {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      text-decoration: none;
      background: rgba(255,255,255,0.08);
      color: #ffffff;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: background 0.2s;
    }

    .btn-contact-action:hover {
      background: rgba(255,255,255,0.15);
    }

    .btn-wa {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }

    .btn-wa:hover {
      background: rgba(34, 197, 94, 0.35);
    }

    .courier-pending {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(251, 191, 36, 0.08);
      border: 1px solid rgba(251, 191, 36, 0.2);
      border-radius: 10px;
      padding: 1rem;
    }

    .courier-pending i { font-size: 1.8rem; }
    .courier-pending p { margin: 0; font-size: 0.82rem; color: #fde68a; }

    .delivery-destination {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      background: rgba(0,0,0,0.25);
      border-radius: 10px;
      padding: 1rem;
    }

    .dest-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .dest-lbl {
      display: block;
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .dest-val {
      margin: 0.15rem 0 0 0;
      font-size: 0.85rem;
      color: #f1f5f9;
      font-weight: 500;
    }

    /* ITEMS LIST */
    .items-count {
      font-size: 0.75rem;
      color: #94a3b8;
      background: rgba(255,255,255,0.06);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 240px;
      overflow-y: auto;
    }

    .item-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 8px;
      padding: 0.6rem 0.8rem;
    }

    .item-img-placeholder {
      width: 44px;
      height: 44px;
      border-radius: 6px;
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      color: #64748b;
    }

    .item-img-placeholder img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-info {
      flex: 1;
    }

    .item-title {
      margin: 0 0 0.3rem 0;
      font-size: 0.85rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .item-meta {
      display: flex;
      gap: 0.4rem;
    }

    .spec-badge {
      font-size: 0.68rem;
      background: rgba(255,255,255,0.06);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      color: #cbd5e1;
    }

    .qty-badge {
      font-size: 0.68rem;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-weight: 700;
    }

    .payment-summary {
      border-top: 1px solid rgba(255,255,255,0.08);
      padding-top: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .pay-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      color: #94a3b8;
    }

    .total-row {
      font-size: 0.95rem;
      font-weight: 800;
      color: #ffffff;
      margin-top: 0.2rem;
    }

    .total-highlight {
      color: #22c55e;
    }

    /* LOADING & ERROR */
    .loading-state {
      padding: 5rem 1rem;
      text-align: center;
    }

    .spinner-box i {
      font-size: 2.5rem;
      color: #38bdf8;
      margin-bottom: 1rem;
    }

    .error-box {
      background: #0f172a;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 14px;
      max-width: 460px;
      margin: 0 auto;
      padding: 2.5rem 2rem;
    }

    .error-box i {
      font-size: 2.5rem;
      color: #ef4444;
      margin-bottom: 1rem;
    }

    .error-box h3 { margin: 0 0 0.5rem 0; font-size: 1.25rem; }
    .error-box p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem; }

    .btn-action {
      background: #0284c7;
      color: #ffffff;
      text-decoration: none;
      padding: 0.65rem 1.4rem;
      border-radius: 8px;
      font-weight: 700;
    }
  `]
})
export class TrackingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private logisticaService = inject(LogisticaService);

  idOrden: number = 0;
  tracking: TrackingOrden | null = null;
  cargando = true;
  errorMsg: string | null = null;
  private pollTimer: any = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.idOrden = Number(idParam);
      this.cargarTracking();
      // Short-polling cada 8 segundos para tracking en tiempo real
      this.pollTimer = setInterval(() => {
        this.cargarTracking(false);
      }, 8000);
    } else {
      this.cargando = false;
      this.errorMsg = 'Identificador de orden inválido';
    }
  }

  ngOnDestroy(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  cargarTracking(mostrarSpinner = true): void {
    if (mostrarSpinner) this.cargando = true;
    this.logisticaService.getTracking(this.idOrden).subscribe({
      next: (data) => {
        this.tracking = data;
        this.cargando = false;
      },
      error: (err) => {
        this.errorMsg = err.error?.detail || 'No se pudo cargar la información de tracking.';
        this.cargando = false;
      }
    });
  }
}
