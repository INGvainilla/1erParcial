import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CheckoutService, OrdenData } from '../../core/services/checkout.service';

@Component({
  selector: 'app-checkout-confirmacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="confirm-container">
      <div class="confirm-card glass-panel" *ngIf="orden">
        <!-- Badge de Éxito Superior -->
        <div class="success-icon-wrap">
          <div class="icon-pulse"></div>
          <i class="fas fa-check"></i>
        </div>

        <h1 class="confirm-title">¡Orden Registrada con Éxito!</h1>
        <p class="confirm-subtitle">
          Su compra ha sido formalizada en la plataforma digital omnicanal.
        </p>

        <!-- Píldoras de Estado y Factura -->
        <div class="meta-badges">
          <span class="meta-badge order-id">
            <i class="fas fa-hashtag"></i> Orden #{{ orden.id_orden }}
          </span>
          <span class="meta-badge invoice-num" *ngIf="orden.numero_factura">
            <i class="fas fa-file-invoice"></i> {{ orden.numero_factura }}
          </span>
          <span class="meta-badge status-pending">
            <i class="fas fa-clock"></i> {{ orden.estado_pago }} DE PAGO
          </span>
        </div>

        <!-- Secciones de Resumen -->
        <div class="details-grid">
          <!-- Datos de Entrega -->
          <div class="detail-box">
            <h4><i class="fas fa-map-marker-alt"></i> Destino de Entrega</h4>
            <p *ngIf="orden.modalidad_entrega === 'RETIRO_TIENDA'">
              <strong>Modalidad:</strong> Retiro en Sucursal Física<br>
              <strong>Sucursal:</strong> {{ orden.nombre_sucursal || 'Sucursal Asignada' }}
            </p>
            <p *ngIf="orden.modalidad_entrega === 'DELIVERY'">
              <strong>Modalidad:</strong> Envío a Domicilio (Delivery)<br>
              <strong>Dirección:</strong> {{ orden.direccion_envio }}<br>
              <strong>Contacto:</strong> {{ orden.telefono_contacto || 'No especificado' }}
            </p>
          </div>

          <!-- Datos de Facturación -->
          <div class="detail-box">
            <h4><i class="fas fa-receipt"></i> Datos Fiscales</h4>
            <p>
              <strong>Razón Social:</strong> {{ orden.razon_social_factura }}<br>
              <strong>NIT / CI:</strong> {{ orden.nit_factura }}<br>
              <strong>Canal:</strong> Venta Web Oficial
            </p>
          </div>
        </div>

        <!-- Desglose de Prendas -->
        <div class="items-table-card">
          <h4><i class="fas fa-tshirt"></i> Prendas en la Orden</h4>
          <div class="items-table-wrap">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Prenda</th>
                  <th>Variante</th>
                  <th>Cant.</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let det of orden.detalles">
                  <td class="item-name-cell">
                    <strong>{{ det.nombre_producto }}</strong>
                    <span class="sku-sub">SKU: {{ det.codigo_sku_base }}</span>
                  </td>
                  <td>
                    <span class="variant-pill">{{ det.talla }} / {{ det.color }}</span>
                  </td>
                  <td>{{ det.cantidad }}</td>
                  <td>Bs. {{ det.precio_unitario | number:'1.2-2' }}</td>
                  <td class="subtotal-cell">Bs. {{ det.subtotal | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Totales -->
          <div class="totals-breakdown">
            <div class="totals-row">
              <span>Subtotal Artículos:</span>
              <span>Bs. {{ orden.subtotal | number:'1.2-2' }}</span>
            </div>
            <div class="totals-row">
              <span>Costo de Envío:</span>
              <span>{{ orden.costo_envio === 0 ? 'GRATIS' : 'Bs. ' + (orden.costo_envio | number:'1.2-2') }}</span>
            </div>
            <div class="totals-row grand-total-row">
              <span>Importe Total:</span>
              <span class="grand-total-val">Bs. {{ orden.total | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Acciones Siguientes -->
        <div class="confirm-actions">
          <a routerLink="/catalogo" class="btn-continue-shopping">
            <i class="fas fa-store"></i>
            <span>Volver al Catálogo</span>
          </a>
          <button class="btn-proceed-payment" (click)="irAPago()">
            <i class="fas fa-credit-card"></i>
            <span>Proceder a Pago Electrónico (CU16)</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- Estado: Cargando -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Cargando información de su orden...</p>
      </div>
    </div>
  `,
  styles: [`
    .confirm-container {
      padding: 2.5rem 1.5rem 4rem;
      max-width: 900px;
      margin: 0 auto;
    }
    .confirm-card {
      padding: 2.5rem;
      border-radius: 20px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    .success-icon-wrap {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #ffffff;
      margin: 0 auto 1.5rem;
      position: relative;
      box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
    }
    .confirm-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.5rem;
    }
    .confirm-subtitle {
      font-size: 0.95rem;
      color: #94a3b8;
      margin: 0 0 1.75rem;
    }
    .meta-badges {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .meta-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
    }
    .meta-badge.order-id {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.35);
    }
    .meta-badge.invoice-num {
      background: rgba(168, 85, 247, 0.15);
      color: #d8b4fe;
      border: 1px solid rgba(168, 85, 247, 0.35);
    }
    .meta-badge.status-pending {
      background: rgba(245, 158, 11, 0.15);
      color: #fcd34d;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      text-align: left;
      margin-bottom: 2rem;
    }
    .detail-box {
      background: rgba(30, 41, 59, 0.5);
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .detail-box h4 {
      font-size: 0.92rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 0.65rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .detail-box p {
      font-size: 0.82rem;
      color: #94a3b8;
      line-height: 1.5;
      margin: 0;
    }

    .items-table-card {
      background: rgba(30, 41, 59, 0.4);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 1.25rem;
      margin-bottom: 2.25rem;
      text-align: left;
    }
    .items-table-card h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .items-table-wrap {
      overflow-x: auto;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    .items-table th {
      color: #64748b;
      font-weight: 600;
      padding: 0.6rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .items-table td {
      padding: 0.75rem 0.6rem;
      color: #cbd5e1;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    .item-name-cell strong {
      color: #ffffff;
      display: block;
    }
    .sku-sub {
      font-size: 0.72rem;
      color: #64748b;
    }
    .variant-pill {
      font-size: 0.75rem;
      color: #a5b4fc;
      background: rgba(99, 102, 241, 0.1);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }
    .subtotal-cell {
      font-weight: 700;
      color: #38bdf8;
    }

    .totals-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      max-width: 320px;
      margin-left: auto;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .grand-total-row {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      margin-top: 0.4rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    .grand-total-val {
      color: #38bdf8;
    }

    .confirm-actions {
      display: flex;
      justify-content: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .btn-continue-shopping {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.85rem 1.4rem;
      border-radius: 10px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-continue-shopping:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
    }
    .btn-proceed-payment {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1.85rem;
      border-radius: 10px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #ffffff;
      border: none;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(79, 70, 229, 0.4);
      transition: all 0.2s;
    }
    .btn-proceed-payment:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(79, 70, 229, 0.6);
    }

    .loading-state {
      text-align: center;
      padding: 4rem;
      color: #94a3b8;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #818cf8;
      border-radius: 50%;
      margin: 0 auto 1rem;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 700px) {
      .details-grid { grid-template-columns: 1fr; }
      .confirm-actions { flex-direction: column; }
    }
  `]
})
export class CheckoutConfirmacionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);

  orden: OrdenData | null = null;
  loading = true;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      this.checkoutService.obtenerOrden(id).subscribe({
        next: (data) => {
          this.orden = data;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          console.error('Error cargando orden', err);
        }
      });
    }
  }

  irAPago(): void {
    if (this.orden) {
      this.router.navigate(['/pagos', this.orden.id_orden]);
    }
  }
}
