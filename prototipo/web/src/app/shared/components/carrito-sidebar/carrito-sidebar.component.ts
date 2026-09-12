import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarritoService, CarritoItem } from '../../../core/services/carrito.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Backdrop oscuro con desenfoque -->
    <div
      class="cart-backdrop"
      *ngIf="carritoService.isOpen()"
      (click)="carritoService.closeCart()"
    ></div>

    <!-- Drawer Lateral Deslizable (Offcanvas) -->
    <aside class="cart-drawer" [class.open]="carritoService.isOpen()">
      <!-- Encabezado del Carrito -->
      <div class="cart-header">
        <div class="header-title-box">
          <div class="cart-icon-bubble">
            <i class="fas fa-shopping-bag"></i>
          </div>
          <div>
            <h2 class="cart-title">Bolsa de Compras</h2>
            <span class="cart-subtitle">CU13 — Carrito Omnicanal</span>
          </div>
        </div>

        <div class="header-actions">
          <span class="badge-count" *ngIf="carritoService.totalItems() > 0">
            {{ carritoService.totalItems() }} {{ carritoService.totalItems() === 1 ? 'prenda' : 'prendas' }}
          </span>
          <button class="btn-close-drawer" (click)="carritoService.closeCart()" title="Cerrar bolsa">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Cuerpo del Carrito -->
      <div class="cart-body">
        <!-- Estado: Cargando -->
        <div class="cart-loading-state" *ngIf="carritoService.loading()">
          <div class="spinner"></div>
          <p>Actualizando existencias y totales...</p>
        </div>

        <!-- Estado: Carrito Vacío -->
        <div
          class="cart-empty-state"
          *ngIf="!carritoService.loading() && carritoService.items().length === 0"
        >
          <div class="empty-icon-wrap">
            <i class="fas fa-shopping-cart"></i>
          </div>
          <h3>Tu carrito está vacío</h3>
          <p>Explora nuestra colección de alta sastrería masculina y añade tus prendas preferidas.</p>
          <button class="btn-explore" (click)="carritoService.closeCart()" routerLink="/catalogo">
            <i class="fas fa-compass"></i>
            Explorar Catálogo
          </button>
        </div>

        <!-- Lista de Productos en el Carrito -->
        <div class="cart-items-list" *ngIf="!carritoService.loading() && carritoService.items().length > 0">
          <div class="cart-item-card" *ngFor="let item of carritoService.items()">
            <!-- Miniatura de Imagen -->
            <div class="item-img-container">
              <img
                *ngIf="item.imagen_principal"
                [src]="item.imagen_principal"
                [alt]="item.nombre_producto"
                class="item-img"
              />
              <div *ngIf="!item.imagen_principal" class="item-fallback-icon">
                <i class="fas fa-tshirt"></i>
              </div>
            </div>

            <!-- Información del Producto -->
            <div class="item-info">
              <div class="item-top-row">
                <h4 class="item-name">{{ item.nombre_producto }}</h4>
                <button
                  class="btn-delete-item"
                  (click)="carritoService.eliminarItem(item.id_item)"
                  title="Eliminar prenda"
                  [disabled]="carritoService.actionLoadingId() === item.id_item"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>

              <!-- Atributos: SKU, Talla y Color -->
              <div class="item-attributes">
                <span class="attr-pill"><i class="fas fa-ruler"></i> Talla: <strong>{{ item.talla }}</strong></span>
                <span class="attr-pill"><i class="fas fa-palette"></i> Color: <strong>{{ item.color }}</strong></span>
              </div>

              <!-- Control de Cantidad y Precios -->
              <div class="item-bottom-row">
                <!-- Controles [ - ] [ Cant ] [ + ] -->
                <div class="quantity-controls">
                  <button
                    class="qty-btn"
                    (click)="carritoService.actualizarCantidad(item.id_item, item.cantidad - 1)"
                    [disabled]="carritoService.actionLoadingId() === item.id_item || item.cantidad <= 1"
                    title="Disminuir"
                  >
                    <i class="fas fa-minus"></i>
                  </button>

                  <span class="qty-number">
                    <i
                      *ngIf="carritoService.actionLoadingId() === item.id_item"
                      class="fas fa-spinner fa-spin mini-spin"
                    ></i>
                    <ng-container *ngIf="carritoService.actionLoadingId() !== item.id_item">
                      {{ item.cantidad }}
                    </ng-container>
                  </span>

                  <button
                    class="qty-btn"
                    (click)="carritoService.actualizarCantidad(item.id_item, item.cantidad + 1)"
                    [disabled]="carritoService.actionLoadingId() === item.id_item || item.cantidad >= item.stock_maximo_disponible"
                    [title]="item.cantidad >= item.stock_maximo_disponible ? 'Stock máximo disponible alcanzado' : 'Aumentar'"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>

                <!-- Subtotal y Precio Unitario -->
                <div class="price-container">
                  <span class="unit-price">Bs. {{ item.precio_unitario | number:'1.2-2' }} c/u</span>
                  <span class="subtotal-amount">Bs. {{ item.subtotal | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Alerta de Existencias Limitadas -->
              <div
                class="stock-warning"
                *ngIf="item.stock_maximo_disponible <= 3 && item.stock_maximo_disponible > 0"
              >
                <i class="fas fa-exclamation-triangle"></i>
                ¡Últimas {{ item.stock_maximo_disponible }} unidades en red!
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie del Carrito: Totales y Checkout -->
      <div class="cart-footer" *ngIf="carritoService.items().length > 0">
        <div class="summary-breakdown">
          <div class="summary-row">
            <span class="summary-label">Subtotal de Artículos:</span>
            <span class="summary-val">Bs. {{ carritoService.totalGeneral() | number:'1.2-2' }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Modalidad Omnicanal:</span>
            <span class="summary-val tag-omnichannel">
              <i class="fas fa-check"></i> Red Multi-Sucursal
            </span>
          </div>
          <div class="summary-row total-row">
            <span class="total-label">Total General:</span>
            <span class="total-val">Bs. {{ carritoService.totalGeneral() | number:'1.2-2' }}</span>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="cart-actions">
          <button class="btn-checkout" (click)="procederCheckout()">
            <i class="fas fa-lock"></i>
            <span>Proceder al Pago (Checkout)</span>
            <i class="fas fa-arrow-right"></i>
          </button>

          <button
            class="btn-clear-cart"
            (click)="carritoService.vaciarCarrito()"
            title="Vaciar todo el carrito"
          >
            <i class="fas fa-trash"></i>
            Vaciar Carrito
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    /* Backdrop desenfocado */
    .cart-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(10, 15, 29, 0.65);
      backdrop-filter: blur(6px);
      z-index: 9998;
      animation: fadeIn 0.25s ease-out;
    }

    /* Drawer Lateral */
    .cart-drawer {
      position: fixed;
      top: 0;
      right: 0;
      width: 440px;
      max-width: 92vw;
      height: 100vh;
      background: #0f172a;
      border-left: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: -15px 0 45px rgba(0, 0, 0, 0.6);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cart-drawer.open {
      transform: translateX(0);
    }

    /* Header */
    .cart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(15, 23, 42, 0.95);
    }
    .header-title-box {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .cart-icon-bubble {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.25));
      border: 1px solid rgba(129, 140, 248, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #a78bfa;
      font-size: 1.15rem;
    }
    .cart-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }
    .cart-subtitle {
      font-size: 0.72rem;
      color: var(--text-muted, #94a3b8);
      display: block;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .badge-count {
      padding: 0.25rem 0.65rem;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #c7d2fe;
    }
    .btn-close-drawer {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-close-drawer:hover {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
    }

    /* Body */
    .cart-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem;
    }

    /* Loading State */
    .cart-loading-state {
      text-align: center;
      padding: 4rem 1rem;
      color: #94a3b8;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #818cf8;
      border-radius: 50%;
      margin: 0 auto 1rem;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Empty State */
    .cart-empty-state {
      text-align: center;
      padding: 4rem 1.5rem;
    }
    .empty-icon-wrap {
      width: 72px;
      height: 72px;
      margin: 0 auto 1.25rem;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      color: #64748b;
    }
    .cart-empty-state h3 {
      font-size: 1.15rem;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }
    .cart-empty-state p {
      font-size: 0.85rem;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 1.75rem;
    }
    .btn-explore {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.75rem 1.4rem;
      border-radius: 10px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #ffffff;
      border: none;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
      transition: all 0.2s;
    }
    .btn-explore:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    /* Item Card */
    .cart-items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .cart-item-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 12px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: all 0.2s;
    }
    .cart-item-card:hover {
      border-color: rgba(99, 102, 241, 0.25);
      background: rgba(30, 41, 59, 0.7);
    }
    .item-img-container {
      width: 72px;
      height: 84px;
      border-radius: 8px;
      overflow: hidden;
      background: #0b0f19;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .item-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .item-fallback-icon {
      color: #475569;
      font-size: 1.6rem;
    }
    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .item-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .item-name {
      font-size: 0.92rem;
      font-weight: 600;
      color: #f8fafc;
      margin: 0;
      line-height: 1.3;
    }
    .btn-delete-item {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0.2rem;
      border-radius: 4px;
      transition: color 0.2s;
    }
    .btn-delete-item:hover {
      color: #ef4444;
    }
    .item-attributes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.1rem;
    }
    .attr-pill {
      font-size: 0.72rem;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.04);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .attr-pill strong {
      color: #cbd5e1;
    }
    .item-bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.35rem;
    }
    .quantity-controls {
      display: flex;
      align-items: center;
      background: #0b0f19;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      overflow: hidden;
    }
    .qty-btn {
      width: 28px;
      height: 28px;
      background: transparent;
      border: none;
      color: #cbd5e1;
      font-size: 0.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .qty-btn:hover:not([disabled]) {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
    .qty-btn[disabled] {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .qty-number {
      min-width: 26px;
      text-align: center;
      font-size: 0.82rem;
      font-weight: 700;
      color: #ffffff;
    }
    .mini-spin {
      font-size: 0.75rem;
      color: #818cf8;
    }
    .price-container {
      text-align: right;
    }
    .unit-price {
      display: block;
      font-size: 0.7rem;
      color: #64748b;
    }
    .subtotal-amount {
      font-size: 0.95rem;
      font-weight: 700;
      color: #38bdf8;
    }
    .stock-warning {
      font-size: 0.72rem;
      color: #f59e0b;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.2rem;
    }

    /* Footer */
    .cart-footer {
      padding: 1.25rem 1.5rem;
      background: rgba(15, 23, 42, 0.98);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .summary-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.2rem;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
      color: #94a3b8;
    }
    .tag-omnichannel {
      font-size: 0.75rem;
      color: #34d399;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 500;
    }
    .total-row {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 0.65rem;
      margin-top: 0.2rem;
    }
    .total-label {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
    }
    .total-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: -0.5px;
    }

    /* Actions */
    .cart-actions {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .btn-checkout {
      width: 100%;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #ffffff;
      border: none;
      font-size: 0.95rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(79, 70, 229, 0.35);
      transition: all 0.2s;
    }
    .btn-checkout:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(79, 70, 229, 0.5);
    }
    .btn-clear-cart {
      width: 100%;
      padding: 0.55rem;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      color: #94a3b8;
      font-size: 0.78rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      transition: all 0.2s;
    }
    .btn-clear-cart:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.2);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class CarritoSidebarComponent {
  carritoService = inject(CarritoService);
  private router = inject(Router);

  procederCheckout(): void {
    this.carritoService.closeCart();
    this.router.navigate(['/checkout']);
  }
}
