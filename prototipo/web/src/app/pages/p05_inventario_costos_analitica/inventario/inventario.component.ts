import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FashionApiService } from '../../../core/services/fashion-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { InventarioItem, KardexItem, Sucursal, Producto } from '../../../core/models/fashion.models';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="view-header glass-panel">
        <div>
          <h2><i class="fas fa-boxes"></i> Inventario Multi-Sucursal y Costos Ponderados (CU09)</h2>
          <p class="subtitle">Valuación en Tiempo Real por Costo Promedio Ponderado (CPP) y Asientos Inmutables de Kardex</p>
        </div>
        <div class="header-actions" *ngIf="auth.isAdmin() || auth.isLogistics() || auth.isManager()">
          <button class="btn btn-primary" (click)="openEntradaModal()">
            <i class="fas fa-cart-arrow-down"></i> Registrar Entrada de Compra (CU09)
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <div class="filter-group">
          <label><i class="fas fa-store"></i> Filtrar por Sucursal:</label>
          <select [(ngModel)]="filterSucursalId" (change)="loadInventario()" class="form-control">
            <option [ngValue]="null">Todas las Sucursales</option>
            <option *ngFor="let s of sucursales" [ngValue]="s.id_sucursal">
              {{ s.nombre_sucursal }} ({{ s.nombre_ciudad || 'Bolivia' }})
            </option>
          </select>
        </div>
      </div>

      <!-- Tabla de Inventario -->
      <div class="table-card glass-panel">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sucursal</th>
                <th>Producto / SKU</th>
                <th>Talla / Color</th>
                <th>Stock Físico</th>
                <th>Stock Disponible</th>
                <th>Último Costo</th>
                <th>Costo Prom. Pond. (CPP)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of inventario">
                <td>#{{ item.id_inventario }}</td>
                <td>
                  <strong>{{ item.nombre_sucursal || ('Sucursal #' + item.id_sucursal) }}</strong>
                </td>
                <td>
                  <div class="product-cell">
                    <span class="p-name">{{ item.nombre_producto || ('Producto #' + item.id_producto) }}</span>
                    <span class="p-sku">SKU: {{ item.codigo_sku_base || 'N/A' }}</span>
                  </div>
                </td>
                <td>
                  <span class="variant-chip">{{ item.talla }}</span>
                  <span class="variant-chip">{{ item.color }}</span>
                </td>
                <td>
                  <span class="stock-num bold">{{ item.stock_fisico }}</span>
                </td>
                <td>
                  <span class="stock-num disp" [class.low]="item.stock_disponible <= item.stock_minimo">
                    {{ item.stock_disponible }}
                  </span>
                  <span class="min-alert" *ngIf="item.stock_disponible <= item.stock_minimo" title="Stock bajo el mínimo permitido">
                    <i class="fas fa-exclamation-triangle"></i>
                  </span>
                </td>
                <td>Bs. {{ item.ultimo_costo_compra | number:'1.2-2' }}</td>
                <td>
                  <span class="cpp-highlight">Bs. {{ item.costo_promedio_ponderado | number:'1.2-2' }}</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline" (click)="verKardex(item)">
                    <i class="fas fa-history"></i> Kardex
                  </button>
                </td>
              </tr>
              <tr *ngIf="inventario.length === 0 && !loading">
                <td colspan="9" class="text-center py-4 text-muted">
                  No se registran existencias de inventario para el filtro seleccionado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL CU09: REGISTRAR ENTRADA Y RECÁLCULO CPP -->
      <div *ngIf="showEntradaModal" class="modal-overlay">
        <div class="modal-card glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-plus-circle"></i> Registrar Entrada de Compra y Recalcular CPP</h3>
            <button class="close-btn" (click)="showEntradaModal = false">&times;</button>
          </div>
          <form (ngSubmit)="submitEntrada()" class="modal-form">
            <div class="form-group">
              <label>Sucursal de Destino:</label>
              <select [(ngModel)]="entradaData.id_sucursal" name="sucursal" required class="form-control">
                <option *ngFor="let s of sucursales" [ngValue]="s.id_sucursal">
                  {{ s.nombre_sucursal }} ({{ s.nombre_ciudad || 'Bolivia' }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Producto:</label>
              <select [(ngModel)]="entradaData.id_producto" name="producto" required class="form-control">
                <option *ngFor="let p of productos" [ngValue]="p.id_producto">
                  {{ p.nombre }} (SKU: {{ p.codigo_sku_base }})
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Talla:</label>
                <input type="text" [(ngModel)]="entradaData.talla" name="talla" required class="form-control" placeholder="Ej. 40R o M" />
              </div>
              <div class="form-group col-half">
                <label>Color:</label>
                <input type="text" [(ngModel)]="entradaData.color" name="color" required class="form-control" placeholder="Ej. Azul Marino" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Cantidad a Ingresar:</label>
                <input type="number" [(ngModel)]="entradaData.cantidad" name="cantidad" required min="1" class="form-control" />
              </div>
              <div class="form-group col-half">
                <label>Costo Unitario Compra (Bs.):</label>
                <input type="number" step="0.01" [(ngModel)]="entradaData.costo_unitario_compra" name="costo" required min="0.01" class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label>Documento de Referencia:</label>
              <input type="text" [(ngModel)]="entradaData.referencia_documento" name="ref" class="form-control" placeholder="Ej. Factura F-9021 Textiles Andinos" />
            </div>

            <div class="math-formula-box">
              <span class="formula-title"><i class="fas fa-calculator"></i> Fórmula Matemática de Recálculo (CU09):</span>
              <code>CPP_nuevo = (Stock_ant * CPP_ant + Cant_nueva * Costo_nuevo) / Stock_total</code>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showEntradaModal = false">Cancelar</button>
              <button type="submit" [disabled]="submitting" class="btn btn-success">
                <i class="fas fa-check"></i> {{ submitting ? 'Procesando...' : 'Confirmar Entrada' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL KARDEX -->
      <div *ngIf="showKardexModal" class="modal-overlay" (click)="cerrarKardexModal()">
        <div class="modal-card wide glass-panel" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div class="header-titles">
              <h3><i class="fas fa-history" style="color: #818cf8;"></i> Asientos de Kardex Inmutable y Valuación CPP (CU09)</h3>
              <p class="header-sub">Trazabilidad contable legal auditada: compras a proveedores, salidas por venta mostrador/web, intercambios y devoluciones.</p>
            </div>
            <button class="close-btn" (click)="cerrarKardexModal()">&times;</button>
          </div>

          <div class="kardex-summary" *ngIf="selectedItemKardex">
            <div class="summary-pill">
              <span class="pill-label"><i class="fas fa-tshirt"></i> Producto:</span>
              <span class="pill-value text-accent">{{ selectedItemKardex.nombre_producto || ('Producto #' + selectedItemKardex.id_producto) }}</span>
            </div>
            <div class="summary-pill">
              <span class="pill-label"><i class="fas fa-palette"></i> Variante:</span>
              <span class="pill-value">Talla {{ selectedItemKardex.talla }} &bull; {{ selectedItemKardex.color }}</span>
            </div>
            <div class="summary-pill">
              <span class="pill-label"><i class="fas fa-store"></i> Sucursal:</span>
              <span class="pill-value">{{ selectedItemKardex.nombre_sucursal || ('Sucursal #' + selectedItemKardex.id_sucursal) }}</span>
            </div>
            <div class="summary-pill">
              <span class="pill-label"><i class="fas fa-boxes"></i> Stock Físico / Disp.:</span>
              <span class="pill-value font-mono">
                <strong style="color: #f8fafc;">{{ selectedItemKardex.stock_fisico }}</strong> / 
                <strong style="color: #34d399;">{{ selectedItemKardex.stock_disponible }}</strong> unid.
                <span *ngIf="selectedItemKardex.stock_reservado > 0" class="badge-reservado-tag">
                  ({{ selectedItemKardex.stock_reservado }} en reserva QR)
                </span>
              </span>
            </div>

            <div class="summary-pill">
              <span class="pill-label"><i class="fas fa-calculator"></i> CPP Actual:</span>
              <span class="pill-value cpp-pill">Bs. {{ selectedItemKardex.costo_promedio_ponderado | number:'1.2-2' }}</span>
            </div>
          </div>

          <div *ngIf="loadingKardex" class="kardex-loader">
            <i class="fas fa-spinner fa-spin fa-2x" style="color: #818cf8;"></i>
            <p>Cargando asientos inmutables de Kardex...</p>
          </div>

          <div *ngIf="!loadingKardex" class="kardex-table-wrapper">
            <table class="kardex-data-table">
              <thead>
                <tr>
                  <th class="col-fecha"><i class="far fa-clock"></i> Fecha / Hora</th>
                  <th class="col-tipo"><i class="fas fa-exchange-alt"></i> Tipo Movimiento</th>
                  <th class="col-cant"><i class="fas fa-layer-group"></i> Cantidad</th>
                  <th class="col-costo"><i class="fas fa-tag"></i> Costo Unit.</th>
                  <th class="col-saldo-cant"><i class="fas fa-boxes"></i> Saldo Cant.</th>
                  <th class="col-saldo-cpp"><i class="fas fa-coins"></i> Saldo CPP</th>
                  <th class="col-ref"><i class="fas fa-file-invoice"></i> Documento de Referencia</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let k of kardexList">
                  <td class="col-fecha text-muted font-mono">{{ k.fecha_hora | date:'dd/MM/yyyy, HH:mm' }}</td>
                  <td class="col-tipo">
                    <span class="kardex-badge" [ngClass]="{
                      'badge-entrada': k.tipo_movimiento === 'ENTRADA_COMPRA',
                      'badge-salida': k.tipo_movimiento === 'SALIDA_VENTA',
                      'badge-devolucion': k.tipo_movimiento === 'DEVOLUCION_VENTA',
                      'badge-reserva': k.tipo_movimiento === 'RESERVA_APARTADA',
                      'badge-reserva-liberada': k.tipo_movimiento === 'RESERVA_LIBERADA'
                    }">
                      <i class="fas" [ngClass]="{
                        'fa-arrow-down': k.tipo_movimiento === 'ENTRADA_COMPRA',
                        'fa-arrow-up': k.tipo_movimiento === 'SALIDA_VENTA',
                        'fa-rotate-left': k.tipo_movimiento === 'DEVOLUCION_VENTA',
                        'fa-clock': k.tipo_movimiento === 'RESERVA_APARTADA',
                        'fa-check-double': k.tipo_movimiento === 'RESERVA_LIBERADA'
                      }"></i>
                      {{ k.tipo_movimiento }}
                    </span>
                  </td>
                  <td class="col-cant bold font-mono" [style.color]="k.tipo_movimiento === 'SALIDA_VENTA' ? '#f87171' : '#34d399'">
                    {{ k.tipo_movimiento === 'SALIDA_VENTA' ? '-' : '+' }}{{ k.cantidad }}
                  </td>
                  <td class="col-costo font-mono">Bs. {{ k.costo_unitario_movimiento | number:'1.2-2' }}</td>
                  <td class="col-saldo-cant bold font-mono">{{ k.saldo_cantidad_resultante }} unid.</td>
                  <td class="col-saldo-cpp bold font-mono cpp-highlight">Bs. {{ k.saldo_cpp_resultante | number:'1.2-2' }}</td>
                  <td class="col-ref">
                    <span class="ref-badge-doc">{{ k.referencia_documento || '—' }}</span>
                  </td>
                </tr>
                <tr *ngIf="kardexList.length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">No se registran movimientos en el Kardex para esta variante.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem 2rem; }
    .view-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-radius: var(--radius-lg);
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .view-header h2 { font-size: 1.4rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
    .subtitle { color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.2rem; }
    .filters-bar { margin-bottom: 1.25rem; }
    .filter-group { display: flex; align-items: center; gap: 0.75rem; }
    .filter-group label { font-size: 0.85rem; color: var(--text-secondary); }
    .table-card { border-radius: var(--radius-lg); padding: 1rem; background: rgba(17, 24, 39, 0.8); border: 1px solid var(--border-subtle); }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 0.85rem 1rem; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border-subtle); }
    .data-table td { padding: 0.85rem 1rem; font-size: 0.85rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: var(--text-primary); }
    .product-cell { display: flex; flex-direction: column; }
    .p-sku { font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); }
    .variant-chip { background: rgba(255, 255, 255, 0.06); padding: 0.15rem 0.45rem; border-radius: var(--radius-sm); font-size: 0.75rem; margin-right: 0.3rem; }
    .stock-num.bold { font-weight: 700; }
    .stock-num.disp { color: #34d399; font-weight: 700; }
    .stock-num.low { color: #ef4444; }
    .min-alert { color: #f59e0b; margin-left: 0.3rem; }
    .cpp-highlight { color: #38bdf8; font-weight: 700; }
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.82); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-card { width: 100%; max-width: 550px; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius-lg); padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .modal-card.wide {
      max-width: 1200px;
      width: 95vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      padding: 1.75rem 2rem;
    }
    .modal-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; }
    .header-titles h3 { font-size: 1.25rem; color: var(--text-primary); margin: 0 0 0.25rem 0; display: flex; align-items: center; gap: 0.5rem; }
    .header-sub { font-size: 0.82rem; color: var(--text-muted); margin: 0; }
    .close-btn { background: transparent; border: none; color: var(--text-secondary); font-size: 1.75rem; cursor: pointer; line-height: 1; padding: 0.25rem; border-radius: 4px; transition: color 0.15s ease; }
    .close-btn:hover { color: #fff; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
    .form-row { display: flex; gap: 1rem; }
    .col-half { flex: 1; }
    .math-formula-box {
      background: rgba(15, 23, 42, 0.7); border: 1px dashed rgba(99, 102, 241, 0.4);
      padding: 0.75rem; border-radius: var(--radius-md); margin: 1rem 0; font-size: 0.8rem;
    }
    .formula-title { display: block; color: #818cf8; margin-bottom: 0.3rem; font-weight: 600; }
    .math-formula-box code { color: #38bdf8; font-family: var(--font-mono); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .kardex-summary {
      display: flex; flex-wrap: wrap; gap: 1.25rem; background: rgba(30, 41, 59, 0.7);
      padding: 0.85rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.08); align-items: center;
    }
    .summary-pill { display: flex; align-items: center; gap: 0.45rem; font-size: 0.84rem; }
    .pill-label { color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem; }
    .pill-value { color: var(--text-primary); font-weight: 500; }
    .pill-value.text-accent { color: #a5b4fc; font-weight: 600; }
    .cpp-pill { color: #38bdf8; font-weight: 700; }
    .badge-reservado-tag {
      color: #fbbf24; font-size: 0.76rem; margin-left: 0.4rem; font-weight: 600;
      background: rgba(245, 158, 11, 0.12); padding: 0.15rem 0.45rem;
      border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.25);
    }
    .kardex-loader { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }

    .kardex-loader p { margin-top: 0.75rem; font-size: 0.88rem; }
    .kardex-table-wrapper {
      overflow-x: auto; overflow-y: auto; max-height: calc(88vh - 210px);
      border-radius: var(--radius-md); border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.5);
    }
    .kardex-data-table {
      width: 100%; min-width: 1050px; border-collapse: collapse; text-align: left;
    }
    .kardex-data-table th {
      position: sticky; top: 0; background: #1e293b; z-index: 2;
      padding: 0.85rem 1rem; font-size: 0.78rem; text-transform: uppercase;
      letter-spacing: 0.04em; color: var(--text-muted); border-bottom: 2px solid rgba(99, 102, 241, 0.4);
    }
    .kardex-data-table td {
      padding: 0.85rem 1rem; font-size: 0.85rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-primary); vertical-align: middle;
    }
    .kardex-data-table tr:hover td { background: rgba(255, 255, 255, 0.03); }
    .col-fecha { width: 155px; min-width: 155px; white-space: nowrap; font-size: 0.82rem; }
    .col-tipo { width: 190px; min-width: 190px; }
    .col-cant { width: 95px; min-width: 95px; text-align: center; }
    .col-costo { width: 125px; min-width: 125px; text-align: right; }
    .col-saldo-cant { width: 125px; min-width: 125px; text-align: center; }
    .col-saldo-cpp { width: 135px; min-width: 135px; text-align: right; }
    .col-ref { min-width: 290px; }
    .ref-badge-doc {
      display: inline-block; padding: 0.25rem 0.6rem; border-radius: 4px;
      background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.82rem; color: #e2e8f0; line-height: 1.4; word-break: break-word;
    }
    .kardex-badge {
      display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.65rem;
      border-radius: 6px; font-size: 0.74rem; font-weight: 600; letter-spacing: 0.02em;
    }
    .badge-entrada { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); }
    .badge-salida { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); }
    .badge-devolucion { background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14, 165, 233, 0.35); }
    .badge-reserva { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.35); }
    .badge-reserva-liberada { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.35); }
  `]

})
export class InventarioComponent implements OnInit {
  inventario: InventarioItem[] = [];
  sucursales: Sucursal[] = [];
  productos: Producto[] = [];

  filterSucursalId: number | null = null;
  loading = false;
  submitting = false;

  // Modales
  showEntradaModal = false;
  showKardexModal = false;
  loadingKardex = false;
  selectedItemKardex: InventarioItem | null = null;
  kardexList: KardexItem[] = [];

  entradaData = {
    id_sucursal: 1,
    id_producto: 1,
    talla: '40R',
    color: 'Azul Marino',
    cantidad: 10,
    costo_unitario_compra: 450.00,
    referencia_documento: 'Factura F-9021 Textiles Andinos'
  };

  constructor(
    private api: FashionApiService,
    public auth: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSucursales();
    this.loadProductos();
    this.loadInventario();
  }

  loadSucursales(): void {
    this.api.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      }
    });
  }

  loadProductos(): void {
    this.api.getProductos().subscribe({
      next: (data) => {
        this.productos = data;
        this.cdr.detectChanges();
      }
    });
  }

  loadInventario(): void {
    this.loading = true;
    this.api.getInventario(this.filterSucursalId || undefined).subscribe({
      next: (data) => {
        this.inventario = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.error('Inventario', 'No se pudo cargar el inventario.');
      }
    });
  }

  openEntradaModal(): void {
    this.showEntradaModal = true;
    if (this.sucursales.length > 0) this.entradaData.id_sucursal = this.sucursales[0].id_sucursal;
    if (this.productos.length > 0) this.entradaData.id_producto = this.productos[0].id_producto;
    this.cdr.detectChanges();
  }

  cerrarEntradaModal(): void {
    this.showEntradaModal = false;
    this.cdr.detectChanges();
  }

  submitEntrada(): void {
    this.submitting = true;
    this.api.registrarEntradaCompra({
      id_sucursal: Number(this.entradaData.id_sucursal),
      id_producto: Number(this.entradaData.id_producto),
      talla: this.entradaData.talla,
      color: this.entradaData.color,
      cantidad_recibida: Number(this.entradaData.cantidad),
      costo_unitario_compra: Number(this.entradaData.costo_unitario_compra),
      numero_factura: this.entradaData.referencia_documento
    }).subscribe({
      next: (res) => {
        this.submitting = false;
        this.showEntradaModal = false;
        this.toast.success(
          'Entrada Registrada (CU09)',
          `Saldo resultante: ${res.saldo_cantidad_resultante} unid. | Nuevo CPP: Bs. ${Number(res.saldo_cpp_resultante).toFixed(2)}`
        );
        this.cdr.detectChanges();
        this.loadInventario();
      },
      error: (err) => {
        this.submitting = false;
        this.cdr.detectChanges();
        this.toast.error('Error en Entrada', err.error?.detail || 'No se pudo procesar la compra.');
      }
    });
  }

  verKardex(item: InventarioItem): void {
    this.selectedItemKardex = { ...item };
    this.kardexList = [];
    this.showKardexModal = true;
    this.loadingKardex = true;
    this.cdr.detectChanges(); // Inmediatamente despliega el modal en la pantalla

    // 1. Cargar asientos inmutables de Kardex
    this.api.getKardex(item.id_inventario).subscribe({
      next: (data) => {
        this.kardexList = data || [];
        this.loadingKardex = false;
        if (this.kardexList.length > 0 && this.selectedItemKardex) {
          const latest = this.kardexList[0];
          this.selectedItemKardex.stock_fisico = latest.saldo_cantidad_resultante;
          this.selectedItemKardex.costo_promedio_ponderado = Number(latest.saldo_cpp_resultante);
          item.stock_fisico = latest.saldo_cantidad_resultante;
          item.costo_promedio_ponderado = Number(latest.saldo_cpp_resultante);
        }
        this.cdr.detectChanges(); // Pinta los asientos inmutables en el DOM en perfecta concordancia
      },
      error: () => {
        this.loadingKardex = false;
        this.cdr.detectChanges();
        this.toast.error('Kardex', 'No se pudo consultar el historial del Kardex.');
      }
    });

    // 2. Refrescar estado actual del inventario en tiempo real desde la BD
    this.api.getInventario(this.filterSucursalId || undefined).subscribe({
      next: (freshList) => {
        this.inventario = freshList || [];
        const fresh = this.inventario.find(x => x.id_inventario === item.id_inventario);
        if (fresh) {
          Object.assign(item, fresh);
          if (this.selectedItemKardex) {
            this.selectedItemKardex.stock_fisico = fresh.stock_fisico;
            this.selectedItemKardex.stock_reservado = fresh.stock_reservado;
            this.selectedItemKardex.stock_disponible = fresh.stock_disponible;
            this.selectedItemKardex.costo_promedio_ponderado = fresh.costo_promedio_ponderado;
          }
          this.cdr.detectChanges();
        }
      }
    });
  }

  cerrarKardexModal(): void {
    this.showKardexModal = false;
    this.selectedItemKardex = null;
    this.kardexList = [];
    this.loadingKardex = false;
    this.cdr.detectChanges();
    this.loadInventario();
  }
}
