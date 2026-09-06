import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { InventarioItem, KardexItem, Sucursal, Producto } from '../../core/models/fashion.models';

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
      <div *ngIf="showKardexModal" class="modal-overlay">
        <div class="modal-card wide glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-history"></i> Asientos de Kardex Inmutable (CU09)</h3>
            <button class="close-btn" (click)="showKardexModal = false">&times;</button>
          </div>
          <div class="kardex-summary" *ngIf="selectedItemKardex">
            <span><strong>Producto:</strong> {{ selectedItemKardex.nombre_producto || ('Producto #' + selectedItemKardex.id_producto) }}</span>
            <span><strong>Talla/Color:</strong> {{ selectedItemKardex.talla }} / {{ selectedItemKardex.color }}</span>
            <span><strong>Sucursal:</strong> {{ selectedItemKardex.nombre_sucursal || ('Sucursal #' + selectedItemKardex.id_sucursal) }}</span>
          </div>

          <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Tipo Movimiento</th>
                  <th>Cantidad</th>
                  <th>Costo Unitario</th>
                  <th>Saldo Cantidad</th>
                  <th>Saldo CPP Resultante</th>
                  <th>Documento Ref.</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let k of kardexList">
                  <td>{{ k.fecha_hora | date:'short' }}</td>
                  <td>
                    <span class="badge" [ngClass]="k.tipo_movimiento === 'ENTRADA_COMPRA' ? 'status-active' : 'status-locked'">
                      {{ k.tipo_movimiento }}
                    </span>
                  </td>
                  <td class="bold">+{{ k.cantidad }}</td>
                  <td>Bs. {{ k.costo_unitario_movimiento | number:'1.2-2' }}</td>
                  <td class="bold">{{ k.saldo_cantidad_resultante }} unid.</td>
                  <td class="cpp-highlight">Bs. {{ k.saldo_cpp_resultante | number:'1.2-2' }}</td>
                  <td>{{ k.referencia_documento || '—' }}</td>
                </tr>
                <tr *ngIf="kardexList.length === 0">
                  <td colspan="7" class="text-center py-3 text-muted">No se registran movimientos en el Kardex.</td>
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
      background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-card { width: 100%; max-width: 550px; background: #111827; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; }
    .modal-card.wide { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h3 { font-size: 1.2rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
    .close-btn { background: transparent; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
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
      display: flex; gap: 1.5rem; background: rgba(30, 41, 59, 0.6); padding: 0.75rem 1rem;
      border-radius: var(--radius-md); font-size: 0.85rem; margin-bottom: 1rem; color: var(--text-secondary);
    }
    .kardex-summary strong { color: var(--text-primary); }
    .status-active { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .status-locked { background: rgba(239, 68, 68, 0.15); color: #f87171; }
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
    private toast: ToastService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSucursales();
    this.loadProductos();
    this.loadInventario();
  }

  loadSucursales(): void {
    this.api.getSucursales().subscribe({
      next: (data) => this.sucursales = data
    });
  }

  loadProductos(): void {
    this.api.getProductos().subscribe({
      next: (data) => this.productos = data
    });
  }

  loadInventario(): void {
    this.loading = true;
    this.api.getInventario(this.filterSucursalId || undefined).subscribe({
      next: (data) => {
        this.inventario = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('Inventario', 'No se pudo cargar el inventario.');
      }
    });
  }

  openEntradaModal(): void {
    this.showEntradaModal = true;
    if (this.sucursales.length > 0) this.entradaData.id_sucursal = this.sucursales[0].id_sucursal;
    if (this.productos.length > 0) this.entradaData.id_producto = this.productos[0].id_producto;
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
        this.loadInventario();
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error('Error en Entrada', err.error?.detail || 'No se pudo procesar la compra.');
      }
    });
  }


  verKardex(item: InventarioItem): void {
    this.selectedItemKardex = item;
    this.api.getKardex(item.id_inventario).subscribe({
      next: (data) => {
        this.kardexList = data;
        this.showKardexModal = true;
      },
      error: () => this.toast.error('Kardex', 'No se pudo consultar el historial del Kardex.')
    });
  }
}
