import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CarritoService, CarritoItem } from '../../../core/services/carrito.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-carrito-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container cart-page">
      <!-- Cabecera de la Página de Carrito -->
      <div class="view-header glass-panel">
        <div class="header-titles">
          <div class="badges-row">
            <span class="badge-pu"><i class="fas fa-shopping-bag"></i> Venta Digital (CU08/CU19 - P2)</span>
            <span class="badge-tag"><i class="fas fa-shield-alt"></i> Stock Atómico Validado</span>
            <span class="badge-tag highlight"><i class="fas fa-store"></i> Multi-Sucursal</span>
          </div>
          <h2><i class="fas fa-shopping-bag text-indigo"></i> Bolsa de Compras Omnicanal (CU08/CU19 - P2)</h2>
          <p class="subtitle">
            Revisa las prendas seleccionadas, modifica cantidades o procede al pago digital y reserva en tienda.
          </p>
        </div>
        <div class="header-actions" *ngIf="carritoService.items().length > 0">
          <button class="btn-clear" (click)="carritoService.vaciarCarrito()" [disabled]="carritoService.loading()">
            <i class="fas fa-trash-alt"></i> Vaciar Bolsa
          </button>
        </div>
      </div>

      <!-- Estado: Cargando Carrito -->
      <div class="loading-state glass-panel" *ngIf="carritoService.loading()">
        <div class="spinner"></div>
        <p>Sincronizando existencias y precios con el catálogo central...</p>
      </div>

      <!-- Estado: Carrito Vacío -->
      <div class="empty-cart-card glass-panel" *ngIf="!carritoService.loading() && carritoService.items().length === 0">
        <div class="empty-icon-bubble">
          <i class="fas fa-shopping-bag"></i>
        </div>
        <h3>Tu bolsa de compras está vacía</h3>
        <p>Explora nuestras colecciones masculinas de sastrería, camisas y calzado para agregar tus prendas preferidas.</p>
        <div class="empty-actions">
          <a routerLink="/catalogo" class="btn-primary">
            <i class="fas fa-compass"></i> Explorar Catálogo Digital
          </a>
        </div>
      </div>

      <!-- Grid Principal: Lista de Artículos + Resumen de Orden -->
      <div class="cart-layout" *ngIf="!carritoService.loading() && carritoService.items().length > 0">
        <!-- Columna Izquierda: Lista de Prendas -->
        <div class="cart-items-column">
          <div class="items-header-bar">
            <span>Prendas en Bolsa ({{ carritoService.totalItems() }} {{ carritoService.totalItems() === 1 ? 'unidad' : 'unidades' }})</span>
            <span class="tenant-label">Tenant: <strong>{{ auth.getNombreEmpresa() || 'FashionStore' }}</strong></span>
          </div>

          <div class="cart-item-card glass-panel" *ngFor="let item of carritoService.items()">
            <!-- Imagen / Miniatura -->
            <div class="item-media">
              <img
                *ngIf="item.imagen_principal"
                [src]="item.imagen_principal"
                [alt]="item.nombre_producto"
                class="item-img"
              />
              <div *ngIf="!item.imagen_principal" class="fallback-img">
                <i class="fas fa-shirt"></i>
              </div>
            </div>

            <!-- Detalles del Producto -->
            <div class="item-details">
              <div class="item-title-row">
                <h3 class="item-name">{{ item.nombre_producto }}</h3>
                <button
                  type="button"
                  class="btn-delete"
                  (click)="carritoService.eliminarItem(item.id_item)"
                  title="Eliminar prenda de la bolsa"
                  [disabled]="carritoService.actionLoadingId() === item.id_item"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="item-sku">SKU: {{ item.codigo_sku_base }}</div>

              <!-- Badges de Variante (Talla y Color) -->
              <div class="variants-pills">
                <span class="variant-pill">
                  <i class="fas fa-ruler-horizontal"></i> Talla: <strong>{{ item.talla }}</strong>
                </span>
                <span class="variant-pill">
                  <i class="fas fa-palette"></i> Color: <strong>{{ item.color }}</strong>
                </span>
                <span class="variant-pill stock-pill" *ngIf="item.stock_maximo_disponible <= 5">
                  <i class="fas fa-exclamation-triangle text-amber"></i> Stock Red: {{ item.stock_maximo_disponible }} uds
                </span>
              </div>

              <!-- Fila Inferior: Controles de Cantidad y Subtotal -->
              <div class="item-footer-row">
                <div class="qty-control-box">
                  <button
                    type="button"
                    class="btn-qty"
                    (click)="carritoService.actualizarCantidad(item.id_item, item.cantidad - 1)"
                    [disabled]="carritoService.actionLoadingId() === item.id_item || item.cantidad <= 1"
                    title="Disminuir cantidad"
                  >
                    <i class="fas fa-minus"></i>
                  </button>

                  <span class="qty-display">
                    <i *ngIf="carritoService.actionLoadingId() === item.id_item" class="fas fa-spinner fa-spin"></i>
                    <span *ngIf="carritoService.actionLoadingId() !== item.id_item">{{ item.cantidad }}</span>
                  </span>

                  <button
                    type="button"
                    class="btn-qty"
                    (click)="carritoService.actualizarCantidad(item.id_item, item.cantidad + 1)"
                    [disabled]="carritoService.actionLoadingId() === item.id_item || item.cantidad >= item.stock_maximo_disponible"
                    title="Aumentar cantidad"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>

                <div class="pricing-box">
                  <span class="unit-price">Bs. {{ item.precio_unitario | number:'1.2-2' }} c/u</span>
                  <span class="item-subtotal">Bs. {{ item.subtotal | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Resumen de Orden y Acciones -->
        <div class="order-summary-column">
          <div class="summary-card glass-panel">
            <h3 class="summary-title"><i class="fas fa-receipt"></i> Resumen de Compra</h3>

            <div class="summary-rows">
              <div class="summary-line">
                <span>Subtotal ({{ carritoService.totalItems() }} prendas)</span>
                <span class="font-mono">Bs. {{ carritoService.totalGeneral() | number:'1.2-2' }}</span>
              </div>
              <div class="summary-line">
                <span>Aprovisionamiento Omnicanal</span>
                <span class="text-emerald"><i class="fas fa-check-circle"></i> Red Multi-Sucursal</span>
              </div>
              <div class="summary-line">
                <span>Costos de Envío / Retiro</span>
                <span class="text-cyan font-mono">Gratuito en Tienda</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-line total-line">
                <span>Total a Pagar:</span>
                <span class="total-amount font-mono">Bs. {{ carritoService.totalGeneral() | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="summary-actions">
              <button class="btn-checkout-primary" (click)="irACheckout()">
                <i class="fas fa-lock"></i>
                <span>Proceder al Pago (Checkout)</span>
                <i class="fas fa-arrow-right"></i>
              </button>

              <button class="btn-reserve-secondary" (click)="reservarEnSucursal()">
                <i class="fas fa-calendar-check"></i>
                <span>Reservar en Sucursal Física (CU11)</span>
              </button>

              <a routerLink="/catalogo" class="btn-continue-shopping">
                <i class="fas fa-arrow-left"></i> Seguir Comprando
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cart-page {
      padding: 1.5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
      color: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .glass-panel {
      background: rgba(17, 24, 39, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
    }

    .view-header {
      padding: 1.25rem 1.75rem;
      margin-bottom: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .badges-row {
      display: flex;
      gap: 8px;
      margin-bottom: 0.4rem;
    }

    .badge-pu {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .badge-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
    }

    .badge-tag.highlight {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }

    .view-header h2 {
      font-size: 1.4rem;
      font-weight: 700;
      color: #fff;
      margin: 0.2rem 0;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 0.85rem;
      margin: 0;
    }

    .btn-clear {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #fca5a5;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .btn-clear:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.25);
      color: #fff;
    }

    /* Layout de Carrito */
    .cart-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;
      align-items: start;
    }

    @media (max-width: 992px) {
      .cart-layout {
        grid-template-columns: 1fr;
      }
    }

    .items-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: #94a3b8;
      margin-bottom: 0.85rem;
      padding: 0 4px;
    }

    .tenant-label strong {
      color: #c7d2fe;
    }

    .cart-items-column {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cart-item-card {
      padding: 1.25rem;
      display: flex;
      gap: 1.25rem;
      align-items: center;
      transition: border-color 0.2s ease;
    }

    .cart-item-card:hover {
      border-color: rgba(99, 102, 241, 0.35);
    }

    .item-media {
      width: 90px;
      height: 90px;
      border-radius: 10px;
      overflow: hidden;
      background: #020617;
      border: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .item-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .fallback-img {
      font-size: 2rem;
      color: #475569;
    }

    .item-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      overflow: hidden;
    }

    .item-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .item-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: #fff;
      margin: 0;
    }

    .btn-delete {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 1rem;
      padding: 2px 6px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .btn-delete:hover:not(:disabled) {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }

    .item-sku {
      font-size: 0.75rem;
      color: #64748b;
      font-family: ui-monospace, monospace;
    }

    .variants-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 4px 0;
    }

    .variant-pill {
      font-size: 0.74rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2px 8px;
      border-radius: 6px;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .variant-pill strong {
      color: #e2e8f0;
    }

    .stock-pill {
      border-color: rgba(245, 158, 11, 0.3);
      color: #fde68a;
    }

    .item-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .qty-control-box {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #020617;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 2px 6px;
    }

    .btn-qty {
      background: transparent;
      border: none;
      color: #94a3b8;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.15s;
    }

    .btn-qty:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .btn-qty:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .qty-display {
      font-size: 0.9rem;
      font-weight: 700;
      color: #fff;
      min-width: 24px;
      text-align: center;
      font-family: ui-monospace, monospace;
    }

    .pricing-box {
      text-align: right;
    }

    .unit-price {
      display: block;
      font-size: 0.72rem;
      color: #64748b;
    }

    .item-subtotal {
      font-size: 1.15rem;
      font-weight: 800;
      color: #10b981;
      font-family: ui-monospace, monospace;
    }

    /* Resumen de Orden */
    .summary-card {
      padding: 1.5rem;
      position: sticky;
      top: 1.5rem;
    }

    .summary-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 1.25rem 0;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.75rem;
    }

    .summary-rows {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .summary-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 0.5rem 0;
    }

    .total-line {
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
    }

    .total-amount {
      font-size: 1.4rem;
      font-weight: 800;
      color: #38bdf8;
    }

    .summary-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .btn-checkout-primary {
      width: 100%;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff;
      border: none;
      padding: 12px 18px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
      transition: all 0.2s ease;
    }

    .btn-checkout-primary:hover {
      background: linear-gradient(135deg, #4338ca, #6d28d9);
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(79, 70, 229, 0.55);
    }

    .btn-reserve-secondary {
      width: 100%;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #6ee7b7;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
    }

    .btn-reserve-secondary:hover {
      background: rgba(16, 185, 129, 0.25);
      color: #fff;
    }

    .btn-continue-shopping {
      display: block;
      text-align: center;
      font-size: 0.8rem;
      color: #94a3b8;
      text-decoration: none;
      padding: 6px;
      transition: color 0.2s;
    }

    .btn-continue-shopping:hover {
      color: #fff;
    }

    /* Estados de Vacío y Carga */
    .empty-cart-card {
      padding: 4rem 2rem;
      text-align: center;
      max-width: 600px;
      margin: 2rem auto;
    }

    .empty-icon-bubble {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.12);
      border: 1px dashed rgba(99, 102, 241, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.2rem;
      color: #818cf8;
      margin: 0 auto 1.5rem;
    }

    .empty-cart-card h3 {
      font-size: 1.35rem;
      color: #fff;
      margin: 0 0 0.5rem 0;
    }

    .empty-cart-card p {
      color: #94a3b8;
      font-size: 0.88rem;
      margin-bottom: 1.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff;
      padding: 10px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .loading-state {
      padding: 4rem 2rem;
      text-align: center;
      color: #94a3b8;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      margin: 0 auto 1rem;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .text-emerald { color: #10b981; }
    .text-cyan { color: #38bdf8; }
    .text-indigo { color: #818cf8; }
    .text-amber { color: #fbbf24; }
    .font-mono { font-family: ui-monospace, monospace; }
  `]
})
export class CarritoPageComponent implements OnInit {
  public carritoService = inject(CarritoService);
  public auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.carritoService.cargarCarrito();
  }

  irACheckout(): void {
    if (this.carritoService.items().length === 0) {
      this.toast.warning('Bolsa Vacía', 'Añade al menos una prenda antes de proceder al pago.');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  reservarEnSucursal(): void {
    const items = this.carritoService.items().map(it => ({
      id_producto: it.id_producto,
      nombre_producto: it.nombre_producto,
      codigo_sku_base: it.codigo_sku_base,
      talla: it.talla,
      color: it.color,
      cantidad: it.cantidad,
      imagen_principal: it.imagen_principal
    }));
    this.router.navigate(['/reservas/crear'], {
      state: { items }
    });
  }
}

