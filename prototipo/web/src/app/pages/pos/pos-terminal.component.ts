import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PosService, PosItemInput, PosVentaCreate, PosProductoLookupResponse, PosTicketResponse } from '../../core/services/pos.service';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Sucursal, Producto } from '../../core/models/fashion.models';

interface TicketItem extends PosItemInput {
  stock_max: number;
  imagen?: string;
}

@Component({
  selector: 'app-pos-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="pos-container">
      <!-- Top Bar: Información de Caja, Sucursal y Reloj -->
      <header class="pos-topbar glass-panel">
        <div class="pos-brand">
          <div class="pos-icon-badge">
            <i class="fas fa-cash-register"></i>
          </div>
          <div>
            <h1 class="pos-title">Terminal Punto de Venta (POS)</h1>
            <span class="pos-subtitle">CU15 - Facturación y Venta Presencial en Mostrador</span>
          </div>
        </div>

        <div class="pos-status-bar">
          <!-- Selector / Información de Sucursal -->
          <div class="status-chip branch-chip">
            <i class="fas fa-store-alt"></i>
            <span *ngIf="!auth.isAdmin()">{{ sucursalActual?.nombre_sucursal || 'Sucursal Asignada' }}</span>
            <select *ngIf="auth.isAdmin()" [(ngModel)]="selectedSucursalId" (change)="onSucursalChange()" class="branch-select">
              <option *ngFor="let s of sucursales" [value]="s.id_sucursal">{{ s.nombre_sucursal }} ({{ s.nombre_ciudad || 'Central' }})</option>
            </select>
          </div>

          <!-- Información de Cajero -->
          <div class="status-chip user-chip">
            <i class="fas fa-user-check"></i>
            <span>Cajero: <strong>{{ auth.currentUser()?.nombre_completo || 'Cajero de Turno' }}</strong></span>
          </div>

          <!-- Reloj En Vivo -->
          <div class="status-chip clock-chip">
            <i class="fas fa-clock"></i>
            <span>{{ currentTime }}</span>
          </div>

          <!-- Indicador En Línea -->
          <div class="status-chip online-chip">
            <span class="pulse-dot"></span>
            <span>CAJA ABIERTA</span>
          </div>
        </div>
      </header>

      <!-- Grid Principal: Catálogo/Búsqueda (Izquierda) + Ticket Virtual (Derecha) -->
      <div class="pos-main-grid">
        <!-- Columna Izquierda: Escáner y Selección de Prendas -->
        <div class="pos-catalog-column glass-panel">
          <!-- Barra de Búsqueda Rápida / Código de Barras -->
          <div class="pos-search-box">
            <div class="search-input-wrap">
              <i class="fas fa-barcode scanner-icon"></i>
              <input
                #barcodeInput
                type="text"
                [(ngModel)]="skuSearchTerm"
                (keyup.enter)="onBarcodeScan()"
                placeholder="Escanear código de barras o teclear SKU (ej: SHIRT-SLIM-001)..."
                class="pos-scanner-input"
                autofocus
              />
              <button class="btn-scan" (click)="onBarcodeScan()" [disabled]="isLoadingScan">
                <i class="fas" [class.fa-search]="!isLoadingScan" [class.fa-spinner]="isLoadingScan" [class.fa-spin]="isLoadingScan"></i>
                <span>Buscar / Escanear</span>
              </button>
            </div>

            <!-- Botón para importar Reserva QR previa (CU11/CU12) -->
            <button class="btn-load-rsv" (click)="openReservaModal()">
              <i class="fas fa-qrcode"></i>
              <span>Cargar Reserva (QR)</span>
            </button>
          </div>

          <!-- Indicador de Reserva Vinculada si está activa -->
          <div *ngIf="reservaVinculada" class="rsv-badge-banner">
            <div class="rsv-badge-info">
              <i class="fas fa-calendar-check"></i>
              <span>Reserva Asociada: <strong>#{{ reservaVinculada.id_reserva }}</strong> ({{ reservaVinculada.nombre_cliente }})</span>
            </div>
            <button class="btn-rsv-clear" (click)="desvincularReserva()" title="Desvincular reserva">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Catálogo Rápido / Galería de Prendas Frecuentes -->
          <div class="catalog-section">
            <div class="section-header">
              <h3><i class="fas fa-tshirt"></i> Prendas Disponibles en Sucursal</h3>
              <div class="catalog-filter">
                <input
                  type="text"
                  [(ngModel)]="catalogFilter"
                  placeholder="Filtrar por nombre o categoría..."
                  class="catalog-filter-input"
                />
              </div>
            </div>

            <!-- Grid de Prendas -->
            <div class="products-grid">
              <div
                *ngFor="let prod of filteredCatalog"
                class="pos-product-card"
                (click)="selectCatalogProduct(prod)"
              >
                <div class="card-img-wrap">
                  <img [src]="prod.imagen_principal || 'assets/placeholder-suit.jpg'" [alt]="prod.nombre" />
                  <span class="stock-pill">
                    {{ prod.tallas?.length || 1 }} tallas
                  </span>
                </div>
                <div class="card-info">
                  <span class="sku-tag">{{ prod.codigo_sku_base }}</span>
                  <h4 class="prod-name" [title]="prod.nombre">{{ prod.nombre }}</h4>
                  <div class="prod-bottom">
                    <span class="prod-price">Bs. {{ prod.precio_base | number:'1.2-2' }}</span>
                    <button class="btn-add-mini" title="Agregar al ticket">
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="filteredCatalog.length === 0" class="empty-catalog">
              <i class="fas fa-box-open"></i>
              <p>No se encontraron prendas con el filtro actual.</p>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Virtual POS Ticket & Facturación -->
        <div class="pos-ticket-column glass-panel">
          <!-- Encabezado del Ticket -->
          <div class="ticket-header">
            <div class="ticket-title-row">
              <h2><i class="fas fa-receipt"></i> Ticket de Venta Mostrador</h2>
              <span class="items-count-badge">{{ ticketItems.length }} ítems</span>
            </div>
            <button class="btn-clear-ticket" (click)="clearTicket()" [disabled]="ticketItems.length === 0">
              <i class="fas fa-trash-alt"></i> Limpiar
            </button>
          </div>

          <!-- Lista Scrollable de Prendas en el Ticket -->
          <div class="ticket-items-scroll">
            <div *ngIf="ticketItems.length === 0" class="ticket-empty-state">
              <div class="empty-icon-circle">
                <i class="fas fa-barcode"></i>
              </div>
              <h4>Ticket Vacío</h4>
              <p>Escanee una etiqueta o elija prendas del catálogo para iniciar el cobro.</p>
            </div>

            <div *ngFor="let item of ticketItems; let i = index" class="ticket-item-row">
              <div class="item-desc">
                <h4 class="item-title">{{ item.nombre_producto }}</h4>
                <div class="item-meta">
                  <span class="badge-sku">{{ item.sku }}</span>
                  <span class="badge-attr">Talla: <strong>{{ item.talla }}</strong></span>
                  <span class="badge-attr">Color: <strong>{{ item.color }}</strong></span>
                </div>
                <span class="item-unit-price">Bs. {{ item.precio_unitario | number:'1.2-2' }} c/u</span>
              </div>

              <!-- Controles de Cantidad -->
              <div class="item-qty-controls">
                <button class="qty-btn" (click)="decrementItem(i)">
                  <i class="fas fa-minus"></i>
                </button>
                <span class="qty-num">{{ item.cantidad }}</span>
                <button class="qty-btn" (click)="incrementItem(i)" [disabled]="item.cantidad >= item.stock_max">
                  <i class="fas fa-plus"></i>
                </button>
              </div>

              <!-- Subtotal y Eliminar -->
              <div class="item-subtotal-box">
                <span class="item-subtotal-val">Bs. {{ (item.precio_unitario * item.cantidad) | number:'1.2-2' }}</span>
                <button class="btn-item-delete" (click)="removeItem(i)" title="Quitar ítem">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Resumen Numérico de la Venta -->
          <div class="ticket-totals-box">
            <div class="total-line subtotal">
              <span>Subtotal Venta:</span>
              <span>Bs. {{ totalTicket | number:'1.2-2' }}</span>
            </div>
            <div class="total-line discount">
              <span>Descuento Promocional:</span>
              <span>Bs. 0.00</span>
            </div>
            <div class="total-line grand-total">
              <span>TOTAL A COBRAR:</span>
              <span class="total-amount">Bs. {{ totalTicket | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Datos de Facturación (NIT / Razón Social) -->
          <div class="ticket-customer-box">
            <div class="customer-row">
              <div class="customer-field">
                <label>NIT / CI del Cliente:</label>
                <div class="input-with-action">
                  <input
                    type="text"
                    [(ngModel)]="nitCliente"
                    placeholder="Ej: 10293847"
                    class="pos-input-sm"
                  />
                  <button type="button" class="btn-cf" (click)="setSinNombre()" title="Sin Nombre / Control Fiscal">
                    C/F
                  </button>
                </div>
              </div>

              <div class="customer-field">
                <label>Nombre / Razón Social:</label>
                <input
                  type="text"
                  [(ngModel)]="nombreCliente"
                  placeholder="Ej: Juan Pérez"
                  class="pos-input-sm"
                />
              </div>
            </div>
          </div>

          <!-- Métodos de Pago Disponibles -->
          <div class="payment-section">
            <label class="section-label">Modalidad de Pago:</label>
            <div class="payment-tabs">
              <button
                class="pay-tab"
                [class.active]="metodoPago === 'EFECTIVO'"
                (click)="selectMetodoPago('EFECTIVO')"
              >
                <i class="fas fa-money-bill-wave"></i>
                <span>Efectivo</span>
              </button>
              <button
                class="pay-tab"
                [class.active]="metodoPago === 'TARJETA'"
                (click)="selectMetodoPago('TARJETA')"
              >
                <i class="fas fa-credit-card"></i>
                <span>Tarjeta POS</span>
              </button>
              <button
                class="pay-tab"
                [class.active]="metodoPago === 'QR'"
                (click)="selectMetodoPago('QR')"
              >
                <i class="fas fa-qrcode"></i>
                <span>QR Simple</span>
              </button>
            </div>

            <!-- Panel Específico de Efectivo y Calculadora de Cambio -->
            <div *ngIf="metodoPago === 'EFECTIVO'" class="cash-calculator-panel">
              <div class="cash-input-row">
                <div class="cash-input-wrap">
                  <label>Efectivo Recibido (Bs.):</label>
                  <div class="input-bs">
                    <span class="bs-prefix">Bs.</span>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      [(ngModel)]="montoRecibido"
                      placeholder="0.00"
                      class="pos-cash-input"
                    />
                  </div>
                </div>

                <!-- Resultado de Cambio / Vuelto -->
                <div class="change-display" [class.has-change]="cambioCalculado >= 0" [class.negative-change]="cambioCalculado < 0">
                  <span class="change-label">{{ cambioCalculado >= 0 ? 'Vuelto a Entregar:' : 'Monto Faltante:' }}</span>
                  <span class="change-amount">Bs. {{ (cambioCalculado >= 0 ? cambioCalculado : -cambioCalculado) | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Atajos de Billetes Rápidos -->
              <div class="quick-cash-chips">
                <button type="button" class="cash-chip exact" (click)="setExactCash()">
                  <i class="fas fa-check"></i> Exacto
                </button>
                <button type="button" class="cash-chip" (click)="addCash(50)">+50</button>
                <button type="button" class="cash-chip" (click)="addCash(100)">+100</button>
                <button type="button" class="cash-chip" (click)="addCash(200)">+200</button>
                <button type="button" class="cash-chip reset" (click)="montoRecibido = 0">Limpiar</button>
              </div>
            </div>

            <!-- Panel Informativo para Tarjeta POS -->
            <div *ngIf="metodoPago === 'TARJETA'" class="card-info-panel">
              <i class="fas fa-credit-card-front card-icon"></i>
              <div>
                <h4>Terminal PinPad / Datafast Conectado</h4>
                <p>Inserte o acerque la tarjeta física del cliente al terminal POS inalámbrico. Presione "Cobrar" al confirmarse la aprobación.</p>
              </div>
            </div>

            <!-- Panel Informativo para QR BCB -->
            <div *ngIf="metodoPago === 'QR'" class="qr-info-panel">
              <div class="qr-preview-box">
                <i class="fas fa-qrcode qr-big-icon"></i>
              </div>
              <div class="qr-details">
                <h4>QR Simple - Banco Central de Bolivia</h4>
                <p>Muestre el código en pantalla al cliente para escaneo directo desde cualquier app bancaria móvil.</p>
                <span class="qr-ready-pill"><i class="fas fa-check-circle"></i> Listo para escaneo</span>
              </div>
            </div>
          </div>

          <!-- Botón de Acción Principal de Cobro -->
          <div class="ticket-actions">
            <button
              class="btn-cobrar"
              [disabled]="ticketItems.length === 0 || isProcessingSale || (metodoPago === 'EFECTIVO' && cambioCalculado < 0)"
              (click)="procesarVenta()"
            >
              <i class="fas" [class.fa-file-invoice-dollar]="!isProcessingSale" [class.fa-spinner]="isProcessingSale" [class.fa-spin]="isProcessingSale"></i>
              <span>{{ isProcessingSale ? 'Procesando Venta...' : 'COBRAR E IMPRIMIR TICKET (F2)' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Selección de Variante (Talla/Color) tras Escaneo -->
      <div *ngIf="showVariantModal && scannedProduct" class="pos-modal-overlay">
        <div class="pos-modal-card glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-tags"></i> Seleccionar Variante de Prenda</h3>
            <button class="btn-modal-close" (click)="showVariantModal = false"><i class="fas fa-times"></i></button>
          </div>

          <div class="modal-body">
            <div class="variant-prod-header">
              <img [src]="scannedProduct.imagen_principal || 'assets/placeholder-suit.jpg'" [alt]="scannedProduct.nombre" class="variant-thumb" />
              <div>
                <h4>{{ scannedProduct.nombre }}</h4>
                <span class="sku-badge">{{ scannedProduct.codigo_sku_base }}</span>
                <span class="price-highlight">Bs. {{ scannedProduct.precio_base | number:'1.2-2' }}</span>
                <p class="stock-info">Stock disponible en sucursal: <strong>{{ scannedProduct.stock_disponible_sucursal }} uds.</strong></p>
              </div>
            </div>

            <!-- Selector de Talla -->
            <div class="variant-selector-group">
              <label>Talla Disponible:</label>
              <div class="chips-group">
                <button
                  *ngFor="let t of scannedProduct.tallas"
                  type="button"
                  class="variant-chip"
                  [class.selected]="selectedTalla === t"
                  (click)="selectedTalla = t"
                >
                  {{ t }}
                </button>
              </div>
            </div>

            <!-- Selector de Color -->
            <div class="variant-selector-group">
              <label>Color:</label>
              <div class="chips-group">
                <button
                  *ngFor="let c of scannedProduct.colores"
                  type="button"
                  class="variant-chip"
                  [class.selected]="selectedColor === c"
                  (click)="selectedColor = c"
                >
                  {{ c }}
                </button>
              </div>
            </div>

            <!-- Cantidad a agregar -->
            <div class="variant-selector-group qty-row">
              <label>Cantidad:</label>
              <div class="modal-qty-control">
                <button type="button" class="qty-btn" (click)="selectedQty = selectedQty > 1 ? selectedQty - 1 : 1"><i class="fas fa-minus"></i></button>
                <span class="qty-display">{{ selectedQty }}</span>
                <button type="button" class="qty-btn" (click)="selectedQty = selectedQty + 1"><i class="fas fa-plus"></i></button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="showVariantModal = false">Cancelar</button>
            <button type="button" class="btn-primary" (click)="confirmVariantAdd()">
              <i class="fas fa-cart-plus"></i> Agregar al Ticket
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Búsqueda / Carga de Reserva QR -->
      <div *ngIf="showReservaModal" class="pos-modal-overlay">
        <div class="pos-modal-card glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-qrcode"></i> Cargar Reserva Presencial</h3>
            <button class="btn-modal-close" (click)="showReservaModal = false"><i class="fas fa-times"></i></button>
          </div>

          <div class="modal-body">
            <p class="modal-desc">
              Ingrese el código QR alfanumérico o escanee el comprobante digital presentado por el cliente en el probador/mostrador.
            </p>
            <div class="search-input-wrap">
              <i class="fas fa-camera scanner-icon"></i>
              <input
                type="text"
                [(ngModel)]="rsvSearchCode"
                (keyup.enter)="buscarReserva()"
                placeholder="Ej: POS-TEST-QR-..., FASHION-RSV-..."
                class="pos-scanner-input"
                autofocus
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" (click)="showReservaModal = false">Cerrar</button>
            <button type="button" class="btn-primary" (click)="buscarReserva()" [disabled]="isLoadingRsv">
              <i class="fas" [class.fa-search]="!isLoadingRsv" [class.fa-spinner]="isLoadingRsv" [class.fa-spin]="isLoadingRsv"></i>
              <span>Cargar Prendas al Mostrador</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Ticket Térmico Fiscal (Impresión Oficial) -->
      <div *ngIf="showTicketModal && ultimoTicket" class="pos-modal-overlay">
        <div class="thermal-ticket-dialog glass-panel">
          <div class="dialog-actions-bar no-print">
            <button class="btn-action-print" (click)="printTicket()">
              <i class="fas fa-print"></i> Imprimir Comprobante (80mm)
            </button>
            <button class="btn-action-new" (click)="cerrarTicketYLimpiar()">
              <i class="fas fa-plus-circle"></i> Nueva Venta
            </button>
          </div>

          <!-- Comprobante Térmico con diseño estándar 80mm -->
          <div class="thermal-receipt" id="print-area">
            <div class="receipt-header">
              <div class="receipt-logo">FASHION STORE S.R.L.</div>
              <div class="receipt-line bold">CASA MATRIZ Y SUCURSALES</div>
              <div class="receipt-line">{{ ultimoTicket.nombre_sucursal }}</div>
              <div class="receipt-line">{{ ultimoTicket.direccion_sucursal }}</div>
              <div class="receipt-line bold">NIT: 4029182019</div>
              <div class="receipt-line">AUTORIZACIÓN: 2904001928374</div>
              <div class="receipt-divider">================================</div>
              <div class="receipt-title">FACTURA COMERCIAL DE VENTA</div>
              <div class="receipt-line bold">N° FACTURA: {{ ultimoTicket.numero_factura }}</div>
              <div class="receipt-divider">--------------------------------</div>
            </div>

            <div class="receipt-info-block">
              <div class="info-row">
                <span>FECHA / HORA:</span>
                <span>{{ ultimoTicket.fecha_hora | date:'dd/MM/yyyy HH:mm:ss' }}</span>
              </div>
              <div class="info-row">
                <span>CAJERO:</span>
                <span>{{ ultimoTicket.cajero_nombre }}</span>
              </div>
              <div class="info-row">
                <span>SEÑOR(ES):</span>
                <span>{{ ultimoTicket.nombre_cliente }}</span>
              </div>
              <div class="info-row">
                <span>NIT / CI:</span>
                <span>{{ ultimoTicket.nit_cliente }}</span>
              </div>
            </div>

            <div class="receipt-divider">--------------------------------</div>

            <!-- Tabla de Prendas -->
            <div class="receipt-table">
              <div class="table-head">
                <span class="col-qty">CANT</span>
                <span class="col-desc">DESCRIPCIÓN</span>
                <span class="col-sub">TOTAL</span>
              </div>
              <div *ngFor="let det of ultimoTicket.detalles" class="table-row">
                <span class="col-qty">{{ det.cantidad }}</span>
                <span class="col-desc">{{ det.nombre_producto }} ({{ det.talla }}/{{ det.color }})</span>
                <span class="col-sub">{{ det.subtotal | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="receipt-divider">================================</div>

            <!-- Totales Fiscales -->
            <div class="receipt-totals">
              <div class="total-row">
                <span>SUBTOTAL:</span>
                <span>Bs. {{ ultimoTicket.subtotal | number:'1.2-2' }}</span>
              </div>
              <div class="total-row grand">
                <span>TOTAL A PAGAR:</span>
                <span>Bs. {{ ultimoTicket.total | number:'1.2-2' }}</span>
              </div>
              <div class="total-row">
                <span>FORMA DE PAGO:</span>
                <span>{{ ultimoTicket.metodo_pago }}</span>
              </div>
              <div *ngIf="ultimoTicket.metodo_pago === 'EFECTIVO'" class="total-row">
                <span>EFECTIVO RECIBIDO:</span>
                <span>Bs. {{ ultimoTicket.monto_recibido | number:'1.2-2' }}</span>
              </div>
              <div *ngIf="ultimoTicket.metodo_pago === 'EFECTIVO'" class="total-row">
                <span>CAMBIO / VUELTO:</span>
                <span>Bs. {{ ultimoTicket.cambio_devolver | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="receipt-divider">--------------------------------</div>

            <!-- Pie Fiscal y QR Simulado -->
            <div class="receipt-footer">
              <p class="legal-text">
                "ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE DE ACUERDO A LEY."
              </p>
              <div class="receipt-qr-sim">
                <i class="fas fa-qrcode"></i>
              </div>
              <p class="receipt-code">COD. CONTROL: 4B-8F-A2-9E-01</p>
              <p class="thank-you">¡GRACIAS POR SU PREFERENCIA!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pos-container {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 65px);
      background: #090d16;
      color: #f8fafc;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow: hidden;
    }

    /* Top Bar */
    .pos-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.5rem;
      background: rgba(15, 23, 42, 0.85);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      z-index: 10;
    }
    .pos-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .pos-icon-badge {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: white;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }
    .pos-title {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .pos-subtitle {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .pos-status-bar {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .status-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      font-size: 0.8rem;
      color: #cbd5e1;
    }
    .branch-select {
      background: transparent;
      border: none;
      color: #38bdf8;
      font-weight: 700;
      font-size: 0.8rem;
      outline: none;
      cursor: pointer;
    }
    .branch-select option {
      background: #1e293b;
      color: #fff;
    }
    .online-chip {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-weight: 700;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: pulse-green 1.5s infinite;
    }
    @keyframes pulse-green {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.5; }
    }

    /* Grid Principal */
    .pos-main-grid {
      display: grid;
      grid-template-columns: 58% 42%;
      flex: 1;
      gap: 1rem;
      padding: 1rem 1.5rem;
      overflow: hidden;
    }

    /* Columna Izquierda: Escáner y Catálogo */
    .pos-catalog-column {
      display: flex;
      flex-direction: column;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 1.25rem;
      overflow: hidden;
    }
    .pos-search-box {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.85rem;
    }
    .search-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      position: relative;
    }
    .scanner-icon {
      position: absolute;
      left: 1rem;
      color: #818cf8;
      font-size: 1.15rem;
    }
    .pos-scanner-input {
      width: 100%;
      background: rgba(30, 41, 59, 0.8);
      border: 1.5px solid rgba(99, 102, 241, 0.35);
      border-radius: 10px;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      color: #ffffff;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
    }
    .pos-scanner-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    }
    .btn-scan {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: white;
      border: none;
      padding: 0 1.25rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-scan:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .btn-load-rsv {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(168, 85, 247, 0.15);
      border: 1.5px solid rgba(168, 85, 247, 0.4);
      color: #c084fc;
      padding: 0 1.15rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-load-rsv:hover {
      background: rgba(168, 85, 247, 0.25);
    }

    /* Banner de Reserva Vinculada */
    .rsv-badge-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(168, 85, 247, 0.15);
      border: 1px dashed #a855f7;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      margin-bottom: 0.85rem;
      font-size: 0.85rem;
      color: #e9d5ff;
    }
    .btn-rsv-clear {
      background: transparent;
      border: none;
      color: #f87171;
      cursor: pointer;
      font-size: 0.95rem;
    }

    /* Catálogo Sección */
    .catalog-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .section-header h3 {
      font-size: 0.9rem;
      font-weight: 700;
      color: #94a3b8;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .catalog-filter-input {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 0.35rem 0.75rem;
      font-size: 0.78rem;
      color: #fff;
      outline: none;
      width: 190px;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 0.75rem;
      overflow-y: auto;
      padding-right: 0.35rem;
      flex: 1;
    }
    .pos-product-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
    }
    .pos-product-card:hover {
      border-color: rgba(99, 102, 241, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }
    .card-img-wrap {
      height: 105px;
      position: relative;
      background: #0f172a;
    }
    .card-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .stock-pill {
      position: absolute;
      top: 6px;
      right: 6px;
      background: rgba(16, 185, 129, 0.85);
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }
    .stock-pill.low-stock {
      background: rgba(239, 68, 68, 0.85);
    }
    .card-info {
      padding: 0.55rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .sku-tag {
      font-size: 0.65rem;
      color: #818cf8;
      font-weight: 700;
    }
    .prod-name {
      font-size: 0.78rem;
      font-weight: 600;
      color: #e2e8f0;
      margin: 0.2rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .prod-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 0.35rem;
    }
    .prod-price {
      font-size: 0.82rem;
      font-weight: 800;
      color: #38bdf8;
    }
    .btn-add-mini {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      background: rgba(99, 102, 241, 0.25);
      border: none;
      color: #818cf8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      cursor: pointer;
    }
    .empty-catalog {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 0;
      color: #64748b;
      gap: 0.75rem;
      font-size: 0.9rem;
    }

    /* Columna Derecha: Ticket Virtual */
    .pos-ticket-column {
      display: flex;
      flex-direction: column;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1.15rem;
      overflow: hidden;
    }
    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 0.75rem;
    }
    .ticket-title-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .ticket-title-row h2 {
      font-size: 1.05rem;
      font-weight: 800;
      margin: 0;
      color: #fff;
    }
    .items-count-badge {
      font-size: 0.72rem;
      font-weight: 700;
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }
    .btn-clear-ticket {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      font-size: 0.75rem;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-clear-ticket:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.15);
    }
    .btn-clear-ticket:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Items Scroll */
    .ticket-items-scroll {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      padding-right: 0.25rem;
      min-height: 140px;
    }
    .ticket-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      color: #64748b;
      text-align: center;
    }
    .empty-icon-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(30, 41, 59, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      margin-bottom: 0.75rem;
      color: #475569;
    }
    .ticket-empty-state h4 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #94a3b8;
      margin: 0 0 0.25rem;
    }
    .ticket-empty-state p {
      font-size: 0.78rem;
      margin: 0;
    }

    .ticket-item-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(30, 41, 59, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0.6rem 0.75rem;
      border-radius: 8px;
    }
    .item-desc {
      flex: 1;
      min-width: 0;
    }
    .item-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: #f1f5f9;
      margin: 0 0 0.2rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-meta {
      display: flex;
      gap: 0.4rem;
      font-size: 0.68rem;
      color: #94a3b8;
    }
    .badge-sku {
      color: #818cf8;
      font-weight: 600;
    }
    .item-unit-price {
      font-size: 0.72rem;
      color: #64748b;
    }

    /* Qty Stepper */
    .item-qty-controls {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 0.15rem 0.25rem;
    }
    .qty-btn {
      width: 22px;
      height: 22px;
      border-radius: 4px;
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
    }
    .qty-btn:hover:not(:disabled) {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }
    .qty-num {
      font-size: 0.82rem;
      font-weight: 800;
      width: 18px;
      text-align: center;
      color: #fff;
    }
    .item-subtotal-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .item-subtotal-val {
      font-size: 0.85rem;
      font-weight: 800;
      color: #38bdf8;
      min-width: 65px;
      text-align: right;
    }
    .btn-item-delete {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 0.8rem;
      padding: 0.2rem;
    }
    .btn-item-delete:hover {
      color: #ef4444;
    }

    /* Totals Box */
    .ticket-totals-box {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.65rem 0.85rem;
      margin: 0.65rem 0;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: #94a3b8;
      margin-bottom: 0.25rem;
    }
    .total-line.grand-total {
      font-size: 1rem;
      font-weight: 800;
      color: #fff;
      margin-top: 0.35rem;
      padding-top: 0.35rem;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
    }
    .total-amount {
      color: #10b981;
      font-size: 1.15rem;
    }

    /* Customer Info Box */
    .ticket-customer-box {
      margin-bottom: 0.65rem;
    }
    .customer-row {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 0.5rem;
    }
    .customer-field label {
      display: block;
      font-size: 0.68rem;
      color: #94a3b8;
      margin-bottom: 0.2rem;
      font-weight: 600;
    }
    .input-with-action {
      display: flex;
      gap: 0.3rem;
    }
    .pos-input-sm {
      width: 100%;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 0.35rem 0.55rem;
      font-size: 0.78rem;
      color: #fff;
      outline: none;
    }
    .pos-input-sm:focus {
      border-color: #6366f1;
    }
    .btn-cf {
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      font-size: 0.68rem;
      font-weight: 800;
      border-radius: 6px;
      padding: 0 0.5rem;
      cursor: pointer;
    }

    /* Payment Section */
    .payment-section {
      margin-bottom: 0.75rem;
    }
    .section-label {
      display: block;
      font-size: 0.7rem;
      color: #94a3b8;
      margin-bottom: 0.35rem;
      font-weight: 600;
    }
    .payment-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.4rem;
      margin-bottom: 0.55rem;
    }
    .pay-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem 0.25rem;
      border-radius: 8px;
      background: rgba(30, 41, 59, 0.5);
      border: 1.5px solid rgba(255, 255, 255, 0.06);
      color: #94a3b8;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pay-tab.active {
      background: rgba(99, 102, 241, 0.15);
      border-color: #6366f1;
      color: #818cf8;
    }

    /* Efectivo Panel */
    .cash-calculator-panel {
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 0.55rem 0.75rem;
    }
    .cash-input-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;
      align-items: center;
      margin-bottom: 0.45rem;
    }
    .cash-input-wrap label {
      display: block;
      font-size: 0.68rem;
      color: #94a3b8;
      margin-bottom: 0.2rem;
    }
    .input-bs {
      display: flex;
      align-items: center;
      background: rgba(30, 41, 59, 0.8);
      border: 1.5px solid #10b981;
      border-radius: 6px;
      padding: 0 0.5rem;
    }
    .bs-prefix {
      font-size: 0.8rem;
      font-weight: 800;
      color: #10b981;
      margin-right: 0.25rem;
    }
    .pos-cash-input {
      width: 100%;
      background: transparent;
      border: none;
      font-size: 0.95rem;
      font-weight: 800;
      color: #ffffff;
      outline: none;
      padding: 0.35rem 0;
    }
    .change-display {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      padding: 0.35rem 0.65rem;
      text-align: right;
    }
    .change-display.has-change {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.1);
    }
    .change-display.negative-change {
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(239, 68, 68, 0.1);
    }
    .change-label {
      display: block;
      font-size: 0.65rem;
      color: #94a3b8;
    }
    .change-amount {
      font-size: 1.05rem;
      font-weight: 800;
      color: #10b981;
    }
    .negative-change .change-amount {
      color: #f87171;
    }
    .quick-cash-chips {
      display: flex;
      gap: 0.35rem;
    }
    .cash-chip {
      flex: 1;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.25rem 0.35rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .cash-chip.exact {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.3);
      color: #34d399;
    }
    .cash-chip.reset {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      color: #f87171;
      flex: 0.8;
    }
    .cash-chip:hover {
      filter: brightness(1.2);
    }

    /* Tarjeta & QR Panels */
    .card-info-panel, .qr-info-panel {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.65rem;
    }
    .card-icon {
      font-size: 1.8rem;
      color: #38bdf8;
    }
    .card-info-panel h4, .qr-details h4 {
      font-size: 0.78rem;
      font-weight: 700;
      margin: 0 0 0.15rem;
      color: #fff;
    }
    .card-info-panel p, .qr-details p {
      font-size: 0.68rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.3;
    }
    .qr-preview-box {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0f172a;
      font-size: 1.6rem;
      flex-shrink: 0;
    }
    .qr-ready-pill {
      display: inline-block;
      margin-top: 0.25rem;
      font-size: 0.65rem;
      color: #34d399;
      font-weight: 700;
    }

    /* Botón Cobrar */
    .btn-cobrar {
      width: 100%;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border: none;
      padding: 0.85rem;
      border-radius: 10px;
      font-weight: 800;
      font-size: 0.95rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
      transition: all 0.2s;
    }
    .btn-cobrar:hover:not(:disabled) {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .btn-cobrar:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      box-shadow: none;
      filter: grayscale(0.5);
    }

    /* Modales */
    .pos-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      padding: 1rem;
    }
    .pos-modal-card {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      width: 100%;
      max-width: 480px;
      padding: 1.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .modal-header h3 {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-modal-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1rem;
      cursor: pointer;
    }
    .modal-desc {
      font-size: 0.82rem;
      color: #94a3b8;
      margin-bottom: 1rem;
      line-height: 1.4;
    }
    .variant-prod-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .variant-thumb {
      width: 70px;
      height: 70px;
      object-fit: cover;
      border-radius: 8px;
    }
    .variant-prod-header h4 {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0 0 0.25rem;
      color: #fff;
    }
    .sku-badge {
      display: inline-block;
      font-size: 0.7rem;
      color: #818cf8;
      background: rgba(99, 102, 241, 0.15);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      margin-right: 0.5rem;
    }
    .price-highlight {
      font-size: 0.95rem;
      font-weight: 800;
      color: #38bdf8;
    }
    .stock-info {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0.35rem 0 0;
    }
    .variant-selector-group {
      margin-bottom: 1rem;
    }
    .variant-selector-group label {
      display: block;
      font-size: 0.75rem;
      color: #cbd5e1;
      margin-bottom: 0.35rem;
      font-weight: 600;
    }
    .chips-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .variant-chip {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .variant-chip.selected {
      background: #6366f1;
      border-color: #818cf8;
      color: white;
    }
    .modal-qty-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .qty-display {
      font-size: 1.1rem;
      font-weight: 800;
      color: #fff;
      min-width: 30px;
      text-align: center;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
    .btn-secondary {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
    }
    .btn-primary {
      background: #6366f1;
      border: none;
      color: white;
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    /* Ticket Térmico Imprimible */
    .thermal-ticket-dialog {
      background: #1e293b;
      border-radius: 12px;
      max-width: 420px;
      width: 100%;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      max-height: 90vh;
    }
    .dialog-actions-bar {
      display: flex;
      gap: 0.65rem;
      margin-bottom: 1rem;
    }
    .btn-action-print {
      flex: 1;
      background: #10b981;
      border: none;
      color: white;
      padding: 0.65rem;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .btn-action-new {
      flex: 1;
      background: #6366f1;
      border: none;
      color: white;
      padding: 0.65rem;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .thermal-receipt {
      background: #ffffff;
      color: #000000;
      font-family: 'Courier New', Courier, monospace;
      padding: 1.5rem 1rem;
      border-radius: 6px;
      overflow-y: auto;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      font-size: 11px;
      line-height: 1.35;
    }
    .receipt-header {
      text-align: center;
      margin-bottom: 0.5rem;
    }
    .receipt-logo {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 1px;
      margin-bottom: 0.2rem;
    }
    .receipt-line {
      font-size: 10px;
    }
    .receipt-line.bold {
      font-weight: bold;
    }
    .receipt-title {
      font-weight: 900;
      margin: 0.25rem 0;
      font-size: 11px;
    }
    .receipt-divider {
      margin: 0.25rem 0;
      letter-spacing: -1px;
      font-weight: bold;
      text-align: center;
    }
    .receipt-info-block {
      margin: 0.35rem 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
    }
    .receipt-table {
      margin: 0.5rem 0;
    }
    .table-head {
      display: flex;
      font-weight: bold;
      border-bottom: 1px solid #000;
      padding-bottom: 0.2rem;
    }
    .col-qty { width: 12%; }
    .col-desc { width: 63%; }
    .col-sub { width: 25%; text-align: right; }
    .table-row {
      display: flex;
      margin-top: 0.3rem;
      font-size: 10px;
    }
    .receipt-totals {
      margin: 0.5rem 0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
    }
    .total-row.grand {
      font-size: 13px;
      font-weight: 900;
      margin: 0.3rem 0;
    }
    .receipt-footer {
      text-align: center;
      margin-top: 0.5rem;
    }
    .legal-text {
      font-size: 8px;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }
    .receipt-qr-sim {
      font-size: 40px;
      margin: 0.35rem 0;
    }
    .receipt-code {
      font-size: 9px;
      font-weight: bold;
      margin: 0.15rem 0;
    }
    .thank-you {
      font-size: 10px;
      font-weight: bold;
      margin-top: 0.35rem;
    }

    /* Print Styles */
    @media print {
      body * {
        visibility: hidden;
      }
      #print-area, #print-area * {
        visibility: visible;
      }
      #print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 80mm;
        margin: 0;
        padding: 5mm;
      }
      .no-print {
        display: none !important;
      }
    }
  `]
})
export class PosTerminalComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  posService = inject(PosService);
  fashionApi = inject(FashionApiService);
  toast = inject(ToastService);

  // Sucursal activa
  sucursales: Sucursal[] = [];
  selectedSucursalId: number = 1;
  sucursalActual?: Sucursal;

  // Reloj
  currentTime: string = '';
  private timerInterval: any;

  // Catálogo Rápido
  catalogProducts: Producto[] = [];
  catalogFilter: string = '';

  // Búsqueda y Escáner
  skuSearchTerm: string = '';
  isLoadingScan: boolean = false;

  // Modal Selección Variante
  showVariantModal: boolean = false;
  scannedProduct?: PosProductoLookupResponse;
  selectedTalla: string = 'M';
  selectedColor: string = 'Azul Marino';
  selectedQty: number = 1;

  // Modal Reserva
  showReservaModal: boolean = false;
  rsvSearchCode: string = '';
  isLoadingRsv: boolean = false;
  reservaVinculada?: { id_reserva: number; nombre_cliente: string };

  // Ticket Virtual
  ticketItems: TicketItem[] = [];
  nitCliente: string = '0';
  nombreCliente: string = 'Cliente Mostrador';
  metodoPago: string = 'EFECTIVO'; // 'EFECTIVO' | 'TARJETA' | 'QR'
  montoRecibido: number = 0;
  isProcessingSale: boolean = false;

  // Modal Ticket / Factura
  showTicketModal: boolean = false;
  ultimoTicket?: PosTicketResponse;

  get filteredCatalog(): Producto[] {
    if (!this.catalogFilter.trim()) return this.catalogProducts;
    const q = this.catalogFilter.toLowerCase();
    return this.catalogProducts.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.codigo_sku_base.toLowerCase().includes(q)
    );
  }

  get totalTicket(): number {
    return this.ticketItems.reduce((acc, it) => acc + (it.precio_unitario * it.cantidad), 0);
  }

  get cambioCalculado(): number {
    return Math.round((this.montoRecibido - this.totalTicket) * 100) / 100;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    if (event.key === 'F2') {
      event.preventDefault();
      if (this.ticketItems.length > 0 && !this.isProcessingSale) {
        this.procesarVenta();
      }
    }
  }

  ngOnInit() {
    this.initClock();
    this.loadSucursales();
    this.loadCatalog();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private initClock() {
    this.updateClock();
    this.timerInterval = setInterval(() => this.updateClock(), 1000);
  }

  private updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-BO', { hour12: false });
  }

  private loadSucursales() {
    this.fashionApi.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        const user = this.auth.currentUser();
        if (user && user.id_sucursal) {
          this.selectedSucursalId = user.id_sucursal;
        } else if (data.length > 0) {
          this.selectedSucursalId = data[0].id_sucursal;
        }
        this.onSucursalChange();
      },
      error: () => this.toast.error('Error de Sucursales', 'No se pudieron cargar las sucursales.')
    });
  }

  onSucursalChange() {
    this.sucursalActual = this.sucursales.find(s => s.id_sucursal === Number(this.selectedSucursalId));
    this.clearTicket();
  }

  private loadCatalog() {
    this.fashionApi.getProductos().subscribe({
      next: (prods) => {
        this.catalogProducts = prods;
      },
      error: () => console.warn('No se pudo cargar el catálogo de productos')
    });
  }

  onBarcodeScan() {
    if (!this.skuSearchTerm.trim()) return;
    this.isLoadingScan = true;

    this.posService.lookupProducto(this.skuSearchTerm).subscribe({
      next: (resp) => {
        this.isLoadingScan = false;
        this.scannedProduct = resp;
        this.selectedTalla = resp.tallas[0] || 'M';
        this.selectedColor = resp.colores[0] || 'Único';
        this.selectedQty = 1;
        this.showVariantModal = true;
        this.skuSearchTerm = '';
      },
      error: (err) => {
        this.isLoadingScan = false;
        const msg = err.error?.detail || `Prenda con código '${this.skuSearchTerm}' no encontrada.`;
        this.toast.error('Búsqueda Fallida', msg);
      }
    });
  }

  selectCatalogProduct(prod: Producto) {
    this.skuSearchTerm = prod.codigo_sku_base;
    this.onBarcodeScan();
  }

  confirmVariantAdd() {
    if (!this.scannedProduct) return;

    // Verificar si ya existe el item con la misma talla y color en el ticket
    const existIdx = this.ticketItems.findIndex(
      it => it.id_producto === this.scannedProduct!.id_producto &&
            it.talla === this.selectedTalla &&
            it.color === this.selectedColor
    );

    if (existIdx >= 0) {
      const item = this.ticketItems[existIdx];
      if (item.cantidad + this.selectedQty > item.stock_max) {
        this.toast.warning('Límite de Stock', `Stock máximo en sucursal alcanzado (${item.stock_max} uds.)`);
        item.cantidad = item.stock_max;
      } else {
        item.cantidad += this.selectedQty;
      }
    } else {
      this.ticketItems.push({
        id_producto: this.scannedProduct.id_producto,
        sku: this.scannedProduct.codigo_sku_base,
        nombre_producto: this.scannedProduct.nombre,
        talla: this.selectedTalla,
        color: this.selectedColor,
        cantidad: this.selectedQty,
        precio_unitario: this.scannedProduct.precio_base,
        stock_max: this.scannedProduct.stock_disponible_sucursal || 99,
        imagen: this.scannedProduct.imagen_principal
      });
    }

    this.showVariantModal = false;
    this.toast.success('Prenda Agregada', `Agregado: ${this.scannedProduct.nombre} (${this.selectedTalla})`);
  }

  incrementItem(index: number) {
    const it = this.ticketItems[index];
    if (it.cantidad < it.stock_max) {
      it.cantidad++;
    }
  }

  decrementItem(index: number) {
    const it = this.ticketItems[index];
    if (it.cantidad > 1) {
      it.cantidad--;
    } else {
      this.removeItem(index);
    }
  }

  removeItem(index: number) {
    this.ticketItems.splice(index, 1);
  }

  clearTicket() {
    this.ticketItems = [];
    this.reservaVinculada = undefined;
    this.montoRecibido = 0;
  }

  setSinNombre() {
    this.nitCliente = '0';
    this.nombreCliente = 'Control Fiscal / C/F';
  }

  selectMetodoPago(metodo: string) {
    this.metodoPago = metodo;
    if (metodo === 'EFECTIVO' && this.montoRecibido < this.totalTicket) {
      this.montoRecibido = this.totalTicket;
    }
  }

  setExactCash() {
    this.montoRecibido = this.totalTicket;
  }

  addCash(amount: number) {
    this.montoRecibido = (Number(this.montoRecibido) || 0) + amount;
  }

  openReservaModal() {
    this.rsvSearchCode = '';
    this.showReservaModal = true;
  }

  buscarReserva() {
    if (!this.rsvSearchCode.trim()) return;
    this.isLoadingRsv = true;

    this.posService.lookupReserva(this.rsvSearchCode).subscribe({
      next: (resp) => {
        this.isLoadingRsv = false;
        this.showReservaModal = false;

        // Cargar ítems de la reserva en el ticket
        this.ticketItems = resp.detalles.map(d => ({
          ...d,
          stock_max: 99
        }));

        this.nitCliente = resp.nit_cliente || '0';
        this.nombreCliente = resp.nombre_cliente;
        this.reservaVinculada = {
          id_reserva: resp.id_reserva,
          nombre_cliente: resp.nombre_cliente
        };

        if (this.metodoPago === 'EFECTIVO') {
          this.montoRecibido = this.totalTicket;
        }

        this.toast.success('Reserva Vinculada', `Reserva #${resp.id_reserva} cargada exitosamente al mostrador`);
      },
      error: (err) => {
        this.isLoadingRsv = false;
        const msg = err.error?.detail || 'No se pudo cargar la reserva.';
        this.toast.error('Error Reserva', msg);
      }
    });
  }

  desvincularReserva() {
    this.reservaVinculada = undefined;
    this.toast.info('Ticket Actualizado', 'Reserva desvinculada del ticket');
  }

  procesarVenta() {
    if (this.ticketItems.length === 0) {
      this.toast.warning('Ticket Vacío', 'El ticket de venta está vacío.');
      return;
    }

    if (this.metodoPago === 'EFECTIVO' && this.montoRecibido < this.totalTicket) {
      this.toast.error('Monto Insuficiente', `El monto recibido (Bs. ${this.montoRecibido}) es menor al total a cobrar (Bs. ${this.totalTicket}).`);
      return;
    }

    this.isProcessingSale = true;

    const payload: PosVentaCreate = {
      nombre_cliente: this.nombreCliente.trim() || 'Cliente Mostrador',
      nit_cliente: this.nitCliente.trim() || '0',
      metodo_pago: this.metodoPago,
      monto_recibido: this.metodoPago === 'EFECTIVO' ? Number(this.montoRecibido) : this.totalTicket,
      id_reserva_origen: this.reservaVinculada?.id_reserva,
      items: this.ticketItems.map(it => ({
        id_producto: it.id_producto,
        sku: it.sku,
        nombre_producto: it.nombre_producto,
        talla: it.talla,
        color: it.color,
        cantidad: it.cantidad,
        precio_unitario: it.precio_unitario
      }))
    };

    this.posService.procesarVenta(payload).subscribe({
      next: (ticketResp) => {
        this.isProcessingSale = false;
        this.ultimoTicket = ticketResp;
        this.showTicketModal = true;
        this.toast.success('Venta Exitosa', `¡Venta completada con éxito! Factura: ${ticketResp.numero_factura}`);
      },
      error: (err) => {
        this.isProcessingSale = false;
        const msg = err.error?.detail || 'Ocurrió un error al procesar la venta en caja.';
        this.toast.error('Error en Caja', msg);
      }
    });
  }

  printTicket() {
    window.print();
  }

  cerrarTicketYLimpiar() {
    this.showTicketModal = false;
    this.clearTicket();
    this.nitCliente = '0';
    this.nombreCliente = 'Cliente Mostrador';
    this.metodoPago = 'EFECTIVO';
  }
}
