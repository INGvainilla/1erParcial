import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { LogisticaService, TrackingOrden } from '../../../core/services/logistica.service';
import { AuthService } from '../../../core/services/auth.service';

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
              <ng-container *ngIf="tracking.modalidad_entrega === 'RETIRO_TIENDA'; else deliveryTitle">
                <i class="fas fa-store text-emerald"></i> Seguimiento — Retiro en Tienda
              </ng-container>
              <ng-template #deliveryTitle>
                <i class="fas fa-shipping-fast text-sky"></i> Seguimiento en Vivo — Delivery
              </ng-template>
            </h1>
            <p class="order-subtitle">
              Orden <strong>#{{ tracking.id_orden }}</strong> &bull; Factura <strong>{{ tracking.numero_factura || 'En Emisión' }}</strong>
              <span *ngIf="tracking.nombre_sucursal"> &bull; {{ tracking.nombre_sucursal }}</span>
            </p>
          </div>

          <div class="header-right">
            <div class="modality-pill" [class.modality-pickup]="tracking.modalidad_entrega === 'RETIRO_TIENDA'">
              <i [class]="tracking.modalidad_entrega === 'RETIRO_TIENDA' ? 'fas fa-store' : 'fas fa-motorcycle'"></i>
              <span>{{ tracking.modalidad_entrega === 'RETIRO_TIENDA' ? 'Retiro en Tienda' : 'Envío a Domicilio' }}</span>
            </div>
            <div class="live-pulse">
              <span class="pulse-dot"></span>
              <span>Actualización en tiempo real</span>
            </div>
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
                <i [class]="p.icono" [class.fa-bounce]="p.activo && (p.codigo === 'EN_TRANSITO' || p.codigo === 'PREPARACION')"></i>
              </div>
              <div class="step-label">{{ p.titulo }}</div>
              <div class="step-desc" *ngIf="p.activo">{{ p.descripcion }}</div>
            </div>
          </div>
        </div>

        <!-- MAIN DETAILS GRID -->
        <div class="details-grid">
          <!-- CARD IZQUIERDA: RETIRO EN TIENDA O COURIER DELIVERY -->
          <ng-container *ngIf="tracking.modalidad_entrega === 'RETIRO_TIENDA'; else courierCardTpl">
            <div class="detail-card pickup-card">
              <div class="card-head">
                <div class="head-title">
                  <i class="fas fa-store text-emerald"></i>
                  <h3>Punto de Retiro en Tienda</h3>
                </div>
                <span class="badge-status badge-pickup">
                  {{ tracking.estado_logistica === 'LISTO_DESPACHO' ? 'LISTO PARA RETIRO' : tracking.estado_logistica }}
                </span>
              </div>

              <!-- BANNERS DE ESTADO DINÁMICOS -->
              <div *ngIf="tracking.estado_logistica === 'LISTO_DESPACHO'" class="pickup-banner ready">
                <i class="fas fa-check-circle"></i>
                <div>
                  <h4>¡Tus prendas están listas para recoger!</h4>
                  <p>Pasa por el mostrador de <strong>{{ tracking.nombre_sucursal || 'Sucursal Equipetrol' }}</strong> presentando tu Cédula o tu Factura <strong>{{ tracking.numero_factura }}</strong>.</p>
                </div>
              </div>

              <div *ngIf="tracking.estado_logistica === 'PREPARACION'" class="pickup-banner prep">
                <i class="fas fa-box-open"></i>
                <div>
                  <h4>En Preparación en Tienda</h4>
                  <p>El personal de la sucursal está alistando, doblando e inspeccionando tus prendas en bodega.</p>
                </div>
              </div>

              <div *ngIf="tracking.estado_logistica === 'CREADA' || tracking.estado_logistica === 'PAGADO'" class="pickup-banner wait">
                <i class="fas fa-receipt"></i>
                <div>
                  <h4>Pago Aprobado</h4>
                  <p>Tu orden ingresó al centro de atención de la sucursal. Comenzaremos la preparación de inmediato.</p>
                </div>
              </div>

              <div *ngIf="tracking.estado_logistica === 'ENTREGADA'" class="pickup-banner done">
                <i class="fas fa-handshake"></i>
                <div>
                  <h4>¡Orden Retirada Satisfactoriamente!</h4>
                  <p>Las prendas fueron entregadas al cliente en mostrador. ¡Gracias por tu compra!</p>
                </div>
              </div>

              <!-- DETALLES DE SUCURSAL -->
              <div class="pickup-details-list">
                <div class="info-row">
                  <i class="fas fa-building text-emerald"></i>
                  <div>
                    <span class="info-lbl">Sucursal Seleccionada</span>
                    <p class="info-val">{{ tracking.nombre_sucursal || 'Sucursal Equipetrol' }}</p>
                  </div>
                </div>

                <div class="info-row">
                  <i class="fas fa-map-marker-alt text-red"></i>
                  <div>
                    <span class="info-lbl">Dirección de Retiro</span>
                    <p class="info-val">{{ tracking.direccion_sucursal || 'Av. San Martín #450, entre 3er y 4to anillo' }}</p>
                  </div>
                </div>

                <div class="info-row">
                  <i class="fas fa-clock text-amber"></i>
                  <div>
                    <span class="info-lbl">Horario de Atención</span>
                    <p class="info-val">Lunes a Sábado: 09:00 – 20:00 | Domingo: 10:00 – 16:00</p>
                  </div>
                </div>

                <div class="info-row" *ngIf="tracking.nombre_cliente">
                  <i class="fas fa-user-check text-sky"></i>
                  <div>
                    <span class="info-lbl">Titular / Cliente</span>
                    <p class="info-val">{{ tracking.nombre_cliente }}</p>
                  </div>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- PLANTILLA COURIER (DELIVERY) -->
          <ng-template #courierCardTpl>
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
                    <p class="dest-val">{{ tracking.direccion_envio || 'Dirección registrada en pedido' }}</p>
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
          </ng-template>

          <!-- RESUMEN DE ARTÍCULOS EN LA ORDEN -->
          <div class="detail-card items-card">
            <div class="card-head">
              <div class="head-title">
                <i class="fas fa-tshirt text-sky"></i>
                <h3>Prendas en esta Orden</h3>
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
                <span>Modalidad de Despacho:</span>
                <span class="fw-bold text-sky">{{ tracking.modalidad_entrega === 'RETIRO_TIENDA' ? 'Retiro en Sucursal' : 'Envío a Domicilio' }}</span>
              </div>
              <div class="pay-row">
                <span>Costo de Despacho:</span>
                <span>{{ tracking.costo_envio === 0 ? 'Gratis (Bs. 0.00)' : ('Bs. ' + (tracking.costo_envio | number:'1.2-2')) }}</span>
              </div>
              <div class="pay-row">
                <span>Estado de Pago:</span>
                <span class="badge-paid"><i class="fas fa-check-circle"></i> PAGADO</span>
              </div>
              <div class="pay-row total-row">
                <span>Total Abonado:</span>
                <span class="total-highlight">Bs. {{ (tracking.total || 0) | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ACCIONES INFERIORES -->
        <div class="footer-actions">
          <a routerLink="/catalogo" class="btn-action-outline">
            <i class="fas fa-shopping-bag"></i> Seguir Comprando
          </a>
          <a *ngIf="auth.isAdmin() || auth.isLogistics() || auth.isManager()" routerLink="/logistica/dashboard" class="btn-action-admin">
            <i class="fas fa-shipping-fast"></i> Abrir Tablero de Despacho (CU18)
          </a>
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
      max-width: 980px;
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
      flex-wrap: wrap;
      gap: 1rem;
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
      font-size: 1.85rem;
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
    .text-emerald { color: #34d399; }
    .fw-bold { font-weight: 700; }

    .order-subtitle {
      color: #94a3b8;
      font-size: 0.95rem;
      margin: 0;
    }

    .header-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .modality-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(56, 189, 248, 0.12);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
      padding: 0.35rem 0.85rem;
      border-radius: 20px;
      font-size: 0.82rem;
      font-weight: 700;
    }

    .modality-pill.modality-pickup {
      background: rgba(52, 211, 153, 0.12);
      color: #34d399;
      border-color: rgba(52, 211, 153, 0.3);
    }

    .live-pulse {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.78rem;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.3rem 0.75rem;
      border-radius: 20px;
    }

    .pulse-dot {
      width: 7px;
      height: 7px;
      background: #34d399;
      border-radius: 50%;
      box-shadow: 0 0 6px #34d399;
      animation: pulse 1.8s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.5; }
    }

    /* STEPPER CARD */
    .stepper-card {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 2rem 1.5rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    }

    .stepper-progress-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      margin: 0 2rem 2.2rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #818cf8, #34d399);
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stepper-steps {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .step-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      opacity: 0.45;
      transition: all 0.3s ease;
    }

    .step-item.completed {
      opacity: 0.9;
    }

    .step-item.active {
      opacity: 1;
      transform: scale(1.05);
    }

    .step-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #1e293b;
      border: 2px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      color: #94a3b8;
      margin-bottom: 0.6rem;
      transition: all 0.3s;
    }

    .step-item.completed .step-icon-wrap {
      background: #0284c7;
      border-color: #38bdf8;
      color: #ffffff;
    }

    .step-item.active .step-icon-wrap {
      background: #059669;
      border-color: #34d399;
      color: #ffffff;
      box-shadow: 0 0 16px rgba(52, 211, 153, 0.5);
    }

    .step-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: #cbd5e1;
      margin-bottom: 0.25rem;
    }

    .step-desc {
      font-size: 0.72rem;
      color: #94a3b8;
      max-width: 140px;
      line-height: 1.3;
    }

    /* DETAILS GRID */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    @media (max-width: 768px) {
      .details-grid {
        grid-template-columns: 1fr;
      }
    }

    .detail-card {
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 0.85rem;
    }

    .head-title {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .head-title h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
      color: #f1f5f9;
    }

    .badge-status {
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      text-transform: uppercase;
    }

    .badge-status.badge-transit {
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }

    .badge-status.badge-pickup {
      background: rgba(52, 211, 153, 0.18);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.35);
    }

    /* PICKUP BANNERS */
    .pickup-banner {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      padding: 1rem 1.1rem;
      border-radius: 10px;
    }

    .pickup-banner i {
      font-size: 1.4rem;
      margin-top: 0.1rem;
    }

    .pickup-banner h4 {
      margin: 0 0 0.25rem 0;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .pickup-banner p {
      margin: 0;
      font-size: 0.82rem;
      line-height: 1.4;
    }

    .pickup-banner.ready {
      background: rgba(52, 211, 153, 0.15);
      border: 1.5px solid rgba(52, 211, 153, 0.4);
      color: #a7f3d0;
    }
    .pickup-banner.ready i { color: #34d399; }
    .pickup-banner.ready h4 { color: #6ee7b7; }

    .pickup-banner.prep {
      background: rgba(251, 191, 36, 0.12);
      border: 1px solid rgba(251, 191, 36, 0.3);
      color: #fef3c7;
    }
    .pickup-banner.prep i { color: #fbbf24; }
    .pickup-banner.prep h4 { color: #fde68a; }

    .pickup-banner.wait {
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #e0f2fe;
    }
    .pickup-banner.wait i { color: #38bdf8; }
    .pickup-banner.wait h4 { color: #bae6fd; }

    .pickup-banner.done {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #d1fae5;
    }
    .pickup-banner.done i { color: #10b981; }
    .pickup-banner.done h4 { color: #a7f3d0; }

    .pickup-details-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 1rem;
    }

    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .info-row i {
      font-size: 1rem;
      margin-top: 0.2rem;
    }

    .info-lbl {
      display: block;
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .info-val {
      margin: 0.15rem 0 0 0;
      font-size: 0.88rem;
      color: #f1f5f9;
      font-weight: 500;
    }

    /* COURIER CARD (DELIVERY) */
    .courier-body {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      padding: 1rem;
    }

    .courier-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: #fff;
    }

    .courier-name {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
    }

    .courier-role {
      margin: 0.15rem 0 0.5rem 0;
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .courier-contact {
      display: flex;
      gap: 0.5rem;
    }

    .btn-contact-action {
      font-size: 0.75rem;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    .btn-wa {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      border-color: rgba(34, 197, 94, 0.3);
    }

    .courier-pending {
      padding: 1.25rem;
      background: rgba(251, 191, 36, 0.08);
      border: 1px dashed rgba(251, 191, 36, 0.25);
      border-radius: 10px;
      text-align: center;
      color: #cbd5e1;
      font-size: 0.85rem;
    }

    .courier-pending i {
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }

    .delivery-destination {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
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
      font-size: 0.88rem;
      color: #f1f5f9;
      font-weight: 500;
    }

    /* ITEMS LIST */
    .items-count {
      font-size: 0.75rem;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.06);
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
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
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
      background: rgba(255, 255, 255, 0.06);
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
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .pay-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      color: #94a3b8;
    }

    .badge-paid {
      color: #34d399;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .total-row {
      font-size: 0.98rem;
      font-weight: 800;
      color: #ffffff;
      margin-top: 0.2rem;
      padding-top: 0.4rem;
      border-top: 1px dashed rgba(255,255,255,0.08);
    }

    .total-highlight {
      color: #22c55e;
      font-size: 1.1rem;
    }

    /* FOOTER ACTIONS */
    .footer-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-top: 1rem;
    }

    .btn-action-outline {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #f1f5f9;
      text-decoration: none;
      padding: 0.75rem 1.6rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-action-outline:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .btn-action-admin {
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      text-decoration: none;
      padding: 0.75rem 1.6rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.35);
      transition: all 0.2s;
    }

    .btn-action-admin:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(2, 132, 199, 0.45);
    }

    /* LOADING & ERROR */
    .loading-state {
      padding: 5rem 1rem;
      text-align: center;
    }

    .spinner-box i {
      font-size: 2.8rem;
      color: #38bdf8;
      margin-bottom: 1rem;
    }

    .spinner-box p {
      color: #cbd5e1;
      font-size: 1.05rem;
      font-weight: 500;
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
  private cdr = inject(ChangeDetectorRef);
  public auth = inject(AuthService);

  idOrden: number = 0;
  tracking: TrackingOrden | null = null;
  cargando = true;
  errorMsg: string | null = null;
  private pollTimer: any = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && !isNaN(Number(idParam))) {
      this.idOrden = Number(idParam);
      this.cargarTracking();
      // Polling cada 7 segundos para tracking en tiempo real
      this.pollTimer = setInterval(() => {
        this.cargarTracking(false);
      }, 7000);
    } else {
      this.cargando = false;
      this.errorMsg = 'Identificador de orden inválido';
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  cargarTracking(mostrarSpinner = true): void {
    if (mostrarSpinner) {
      this.cargando = true;
      this.cdr.detectChanges();
    }
    this.logisticaService.getTracking(this.idOrden).subscribe({
      next: (data) => {
        this.tracking = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMsg = err.error?.detail || 'No se pudo cargar la información de tracking de esta orden.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
