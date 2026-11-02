import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { FashionApiService } from '../../../core/services/fashion-api.service';
import { Sucursal, Producto } from '../../../core/models/fashion.models';

export interface TraspasoItem {
  id_producto: number;
  talla: string;
  color: string;
  cantidad: number;
}

export interface TraspasoRow {
  id_traspaso: number;
  codigo_traspaso: string;
  id_sucursal_origen: number;
  nombre_origen: string;
  id_sucursal_destino: number;
  nombre_destino: string;
  estado: string;
  items: TraspasoItem[];
  fecha_solicitud: string;
  fecha_recepcion?: string;
}

@Component({
  selector: 'app-traspasos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Encabezado de la Vista -->
      <div class="view-header glass-panel">
        <div class="header-titles">
          <h2><i class="fas fa-truck-moving text-indigo"></i> Traspasos Inter-Sucursales de Inventario (CU14)</h2>
          <p class="subtitle">Control y trazabilidad de transferencias físicas de stock entre tiendas con doble asiento en Kardex</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="abrirModalNuevo()">
            <i class="fas fa-plus-circle"></i> Iniciar Traspaso (CU14)
          </button>
        </div>
      </div>

      <!-- Barra de Filtros y Selector de Tenant -->
      <div class="filters-bar glass-panel" *ngIf="auth.isSuperAdmin()">
        <div class="filter-group">
          <label><i class="fas fa-store"></i> Empresa Activa (Tenant):</label>
          <span class="active-tenant-badge">
            <i class="fas fa-building"></i> Tenant ID: {{ auth.getActiveEmpresaId() || 1 }}
          </span>
          <button class="btn-refresh" (click)="cargarTraspasos()" title="Recargar lista">
            <i class="fas fa-sync-alt" [class.fa-spin]="isLoading"></i>
          </button>
        </div>
      </div>

      <!-- Tabla Principal de Traspasos -->
      <div class="table-card glass-panel">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código Traspaso</th>
                <th>Sucursal Origen</th>
                <th>Sucursal Destino</th>
                <th>Prendas y Variantes</th>
                <th>Fecha Solicitud</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of traspasos">
                <td class="font-mono bold text-cyan">{{ t.codigo_traspaso }}</td>
                <td>
                  <strong>{{ t.nombre_origen || ('Sucursal #' + t.id_sucursal_origen) }}</strong>
                </td>
                <td>
                  <strong>{{ t.nombre_destino || ('Sucursal #' + t.id_sucursal_destino) }}</strong>
                </td>
                <td>
                  <div class="items-wrap">
                    <span *ngFor="let it of t.items" class="prenda-chip">
                      Prod #{{ it.id_producto }} (Talla: {{ it.talla }}) x<strong>{{ it.cantidad }}</strong>
                    </span>
                  </div>
                </td>
                <td class="text-muted">{{ t.fecha_solicitud | date:'medium' }}</td>
                <td>
                  <span class="status-pill" [ngClass]="{
                    'status-transito': t.estado === 'EN_TRANSITO',
                    'status-recibido': t.estado === 'RECIBIDO'
                  }">
                    <i class="fas" [ngClass]="t.estado === 'RECIBIDO' ? 'fa-check-circle' : 'fa-truck-moving'"></i>
                    {{ t.estado }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button 
                    *ngIf="t.estado === 'EN_TRANSITO'" 
                    (click)="recibirTraspaso(t)" 
                    [disabled]="isProcessing" 
                    class="btn-action-receive"
                    title="Confirmar llegada de mercadería y acreditar en Kardex"
                  >
                    <i class="fas fa-box-check"></i> Confirmar Recepción
                  </button>
                  <span *ngIf="t.estado === 'RECIBIDO'" class="acreditado-lbl">
                    <i class="fas fa-check-double text-emerald"></i> Asentado en Kardex
                  </span>
                </td>
              </tr>
              <tr *ngIf="traspasos.length === 0">
                <td colspan="7" class="empty-row">
                  <i class="fas fa-exchange-alt empty-icon"></i>
                  <p>No se registran traspasos inter-sucursales para esta empresa.</p>
                  <button class="btn btn-secondary btn-sm" (click)="abrirModalNuevo()">Iniciar el primer traspaso</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: Iniciar Traspaso Inter-Sucursal -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <div class="header-titles">
              <h3><i class="fas fa-truck-loading text-indigo"></i> Iniciar Traspaso Inter-Sucursal (CU14)</h3>
              <p class="modal-subtitle">Se descontará stock en origen, se registrará salida en Kardex y pasará a estado EN_TRANSITO.</p>
            </div>
            <button class="close-btn" (click)="showModal = false">&times;</button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <div class="form-group col-half">
                <label>Sucursal Origen (Emisora):</label>
                <select [(ngModel)]="nuevoOrigen" class="form-control">
                  <option *ngFor="let s of sucursales" [ngValue]="s.id_sucursal">
                    {{ s.nombre_sucursal }} ({{ s.nombre_ciudad || 'Central' }})
                  </option>
                </select>
              </div>

              <div class="form-group col-half">
                <label>Sucursal Destino (Receptora):</label>
                <select [(ngModel)]="nuevoDestino" class="form-control">
                  <option *ngFor="let s of sucursales" [ngValue]="s.id_sucursal">
                    {{ s.nombre_sucursal }} ({{ s.nombre_ciudad || 'Central' }})
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Seleccionar Prenda / Producto a Transferir:</label>
              <select [(ngModel)]="nuevoProdId" class="form-control" (change)="onProductoSelect()">
                <option *ngFor="let p of productos" [ngValue]="p.id_producto">
                  {{ p.nombre }} — SKU: {{ p.codigo_sku_base }} (Bs. {{ p.precio_base }})
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Talla a Traspasar:</label>
                <input type="text" [(ngModel)]="nuevaTalla" placeholder="Ej: M, L, 38, 40" class="form-control" />
              </div>

              <div class="form-group col-half">
                <label>Cantidad de Unidades:</label>
                <input type="number" [(ngModel)]="nuevaCantidad" min="1" max="100" class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label>Observaciones de Despacho:</label>
              <textarea [(ngModel)]="nuevasObservaciones" rows="2" placeholder="Nota de envío o chofer asignado..." class="form-control"></textarea>
            </div>

            <div class="math-formula-box">
              <span class="formula-title"><i class="fas fa-calculator"></i> Impacto en Kardex Fiscal (Ley 843):</span>
              <code>Origen: Salida stock (-{{ nuevaCantidad }} uds) | Destino: Entrada stock y recálculo de CPP al recibir</code>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
            <button class="btn btn-primary" (click)="guardarTraspaso()" [disabled]="isProcessing">
              <i class="fas" [class.fa-truck-moving]="!isProcessing" [class.fa-spinner]="isProcessing" [class.fa-spin]="isProcessing"></i>
              <span>{{ isProcessing ? 'Registrando...' : 'Emitir Traspaso' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem 2rem;
      min-height: 100vh;
      background: #0b0f19;
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
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-titles h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin: 0 0 0.3rem 0;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 0.85rem;
      margin: 0;
    }

    .btn {
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #4338ca, #4f46e5);
      box-shadow: 0 6px 16px rgba(79, 70, 229, 0.5);
    }

    .btn-secondary {
      background: #1e293b;
      color: #cbd5e1;
      border: 1px solid #334155;
    }

    .btn-secondary:hover {
      background: #334155;
      color: #fff;
    }

    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }

    .filters-bar {
      padding: 0.85rem 1.5rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .active-tenant-badge {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
      padding: 4px 10px;
      border-radius: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-refresh {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      border-radius: 6px;
      padding: 4px 8px;
      cursor: pointer;
    }

    .btn-refresh:hover {
      color: #fff;
      border-color: rgba(255, 255, 255, 0.25);
    }

    .table-card {
      padding: 0;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .data-table th {
      padding: 1rem 1.25rem;
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 23, 42, 0.6);
    }

    .data-table td {
      padding: 1rem 1.25rem;
      font-size: 0.85rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #e2e8f0;
      vertical-align: middle;
    }

    .data-table tr:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .bold {
      font-weight: 700;
    }

    .text-cyan {
      color: #38bdf8;
    }

    .text-muted {
      color: #64748b;
      font-size: 0.8rem;
    }

    .text-emerald {
      color: #10b981;
    }

    .text-indigo {
      color: #818cf8;
    }

    .items-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .prenda-chip {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      color: #cbd5e1;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .status-transito {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }

    .status-recibido {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }

    .btn-action-receive {
      background: linear-gradient(135deg, #059669, #10b981);
      color: #fff;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
    }

    .btn-action-receive:hover {
      background: #047857;
    }

    .acreditado-lbl {
      font-size: 0.75rem;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .empty-row {
      text-align: center;
      padding: 3rem 1rem !important;
      color: #64748b;
    }

    .empty-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #334155;
      display: block;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-card {
      width: 100%;
      max-width: 550px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 1.75rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.75rem;
    }

    .modal-header h3 {
      font-size: 1.2rem;
      color: #fff;
      margin: 0 0 0.25rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modal-subtitle {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0;
    }

    .close-btn {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
    }

    .close-btn:hover {
      color: #fff;
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-group label {
      font-size: 0.8rem;
      color: #cbd5e1;
      font-weight: 500;
    }

    .form-control {
      background: #020617;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-family: inherit;
    }

    .form-control:focus {
      outline: none;
      border-color: #6366f1;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .col-half {
      flex: 1;
    }

    .math-formula-box {
      background: rgba(15, 23, 42, 0.8);
      border: 1px dashed rgba(99, 102, 241, 0.4);
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.78rem;
    }

    .formula-title {
      display: block;
      color: #a5b4fc;
      margin-bottom: 0.25rem;
      font-weight: 600;
    }

    .math-formula-box code {
      color: #38bdf8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1rem;
    }
  `]
})
export class TraspasosComponent implements OnInit {
  private http = inject(HttpClient);
  public auth = inject(AuthService);
  private toast = inject(ToastService);
  private api = inject(FashionApiService);
  private cdr = inject(ChangeDetectorRef);

  traspasos: TraspasoRow[] = [];
  sucursales: Sucursal[] = [];
  productos: Producto[] = [];

  showModal = false;
  isProcessing = false;
  isLoading = false;

  nuevoOrigen: number = 1;
  nuevoDestino: number = 2;
  nuevoProdId: number = 1;
  nuevaTalla: string = 'M';
  nuevaCantidad: number = 2;
  nuevasObservaciones: string = 'Traspaso inter-sucursal asistido';

  ngOnInit() {
    this.cargarTraspasos();
    this.cargarCatalogos();
  }

  cargarTraspasos() {
    this.isLoading = true;
    const tenantId = this.auth.getActiveEmpresaId() || 1;
    this.http.get<TraspasoRow[]>(`${API_BASE_URL}/traspasos?id_empresa=${tenantId}`, {
      headers: this.auth.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.traspasos = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al cargar traspasos:', err);
      }
    });
  }

  cargarCatalogos() {
    const tenantId = this.auth.getActiveEmpresaId() || 1;
    this.api.getSucursales(tenantId).subscribe({
      next: (sucs) => {
        this.sucursales = sucs || [];
        if (this.sucursales.length >= 2) {
          this.nuevoOrigen = this.sucursales[0].id_sucursal;
          this.nuevoDestino = this.sucursales[1].id_sucursal;
        } else if (this.sucursales.length === 1) {
          this.nuevoOrigen = this.sucursales[0].id_sucursal;
          this.nuevoDestino = this.sucursales[0].id_sucursal;
        }
      }
    });

    this.api.getProductos(tenantId).subscribe({
      next: (prods) => {
        this.productos = prods || [];
        if (this.productos.length > 0) {
          this.nuevoProdId = this.productos[0].id_producto;
        }
      }
    });
  }

  onProductoSelect() {
    const prod = this.productos.find(p => p.id_producto === this.nuevoProdId);
    if (prod && prod.tallas && prod.tallas.length > 0) {
      this.nuevaTalla = prod.tallas[0].talla;
    }
  }

  abrirModalNuevo() {
    this.showModal = true;
  }

  guardarTraspaso() {
    if (this.nuevoOrigen === this.nuevoDestino) {
      this.toast.error('Sucursales Inválidas', 'La sucursal de origen y destino deben ser distintas.');
      return;
    }
    if (!this.nuevaCantidad || this.nuevaCantidad <= 0) {
      this.toast.error('Cantidad Inválida', 'La cantidad a traspasar debe ser mayor a 0.');
      return;
    }

    this.isProcessing = true;
    const body = {
      id_sucursal_origen: Number(this.nuevoOrigen),
      id_sucursal_destino: Number(this.nuevoDestino),
      items: [
        {
          id_producto: Number(this.nuevoProdId),
          talla: this.nuevaTalla.trim() || 'M',
          color: 'ESTANDAR',
          cantidad: Number(this.nuevaCantidad)
        }
      ],
      observaciones: this.nuevasObservaciones || 'Traspaso inter-sucursal emitido desde consola'
    };

    this.http.post<any>(`${API_BASE_URL}/traspasos`, body, {
      headers: this.auth.getAuthHeaders()
    }).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.showModal = false;
        this.toast.success('Traspaso Emitido (CU14)', `Código: ${res.codigo_traspaso}. Stock descontado en origen y retenido EN_TRANSITO.`);
        this.cargarTraspasos();
      },
      error: (err) => {
        this.isProcessing = false;
        const msg = err.error?.detail || 'No se pudo emitir el traspaso inter-sucursal';
        this.toast.error('Error al emitir traspaso', msg);
      }
    });
  }

  recibirTraspaso(t: TraspasoRow) {
    this.isProcessing = true;
    this.http.post<any>(`${API_BASE_URL}/traspasos/${t.id_traspaso}/recibir`, {}, {
      headers: this.auth.getAuthHeaders()
    }).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.toast.success('Recepción Confirmada (CU14)', res.mensaje || 'Stock acreditado en destino y Kardex actualizado.');
        this.cargarTraspasos();
      },
      error: (err) => {
        this.isProcessing = false;
        this.toast.error('Error al recibir traspaso', err.error?.detail || 'Error en la recepción');
      }
    });
  }
}
