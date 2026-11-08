import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

export interface CompraRow {
  id_orden_compra: number;
  codigo_orden: string;
  proveedor: string;
  sucursal: string;
  monto_total: number;
  estado: string;
  nro_factura?: string;
  items: any[];
  discrepancias?: any[];
  fecha_emision: string;
  fecha_aprobacion?: string;
  fecha_recepcion?: string;
}

@Component({
  selector: 'app-compras-desktop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="compras-desktop-container">
      <!-- Banner CU20: Exclusivo Web Desktop -->
      <div class="desktop-badge-banner">
        <div class="banner-left">
          <div class="banner-icon-box">
            <i class="fas fa-desktop"></i>
          </div>
          <div>
            <h2 class="banner-title">Módulo de Aprovisionamiento Textil (CU20)</h2>
            <p class="banner-sub">Terminal de compras corporativas restringido exclusivamente a clientes de escritorio (Resolución &ge; 768px)</p>
          </div>
        </div>
        <div class="banner-right">
          <span class="badge-desktop-valid">
            <span class="pulse-dot"></span> Desktop Validado
          </span>
        </div>
      </div>

      <div class="compras-header">
        <h1 class="compras-title">
          <i class="fas fa-file-invoice-dollar text-indigo"></i> Órdenes de Compra y Suministro
        </h1>
        <button (click)="showModal = true" class="btn-nueva-compra">
          <i class="fas fa-plus"></i> Emitir Orden de Compra
        </button>
      </div>

      <!-- Tabla de Órdenes de Compra -->
      <div class="table-card">
        <table class="compras-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Proveedor</th>
              <th>Sucursal Destino</th>
              <th>Total (Bs.)</th>
              <th>Prendas</th>
              <th>Fecha Emisión</th>
              <th>Estado</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of compras">
              <td class="font-mono font-bold text-indigo">{{ c.codigo_orden }}</td>
              <td>{{ c.proveedor }}</td>
              <td>{{ c.sucursal }}</td>
              <td class="font-bold text-emerald">Bs. {{ c.monto_total | number:'1.2-2' }}</td>
              <td>
                <span *ngFor="let it of c.items" class="prenda-chip">
                  Prod #{{ it.id_producto }} ({{ it.talla }}) x{{ it.cantidad }} - Bs. {{ it.costo_unitario }}
                </span>
              </td>
              <td class="text-muted">{{ c.fecha_emision | date:'short' }}</td>
              <td>
                <span *ngIf="c.estado === 'EMITIDA'" class="status-badge emitida">
                  <i class="fas fa-paper-plane"></i> EMITIDA
                </span>
                <span *ngIf="c.estado === 'AUTORIZADA'" class="status-badge autorizada">
                  <i class="fas fa-check-circle"></i> AUTORIZADA
                </span>
                <span *ngIf="c.estado === 'RECEPCIONADA_CONFORME'" class="status-badge conforme" [title]="'Factura: ' + (c.nro_factura || 'S/N')">
                  <i class="fas fa-boxes-stacked"></i> CONFORME
                </span>
                <span *ngIf="c.estado === 'RECEPCIONADA_CON_DISCREPANCIA'" class="status-badge discrepancia" [title]="'Discrepancia detectada. Factura: ' + (c.nro_factura || 'S/N')">
                  <i class="fas fa-triangle-exclamation"></i> DISCREPANCIA
                </span>
              </td>
              <td style="text-align: right;">
                <div class="actions-group">
                  <button *ngIf="c.estado === 'EMITIDA'"
                          (click)="autorizarCompra(c)"
                          [disabled]="isProcessing"
                          class="btn-action autorizar">
                    <i class="fas fa-stamp"></i> Autorizar
                  </button>
                  <button *ngIf="c.estado === 'AUTORIZADA'"
                          (click)="abrirModalRecepcion(c)"
                          [disabled]="isProcessing"
                          class="btn-action recepcionar">
                    <i class="fas fa-dolly"></i> Recepcionar
                  </button>
                  <span *ngIf="c.estado.startsWith('RECEPCIONADA')" class="factura-tag">
                    Fact: <strong class="font-mono text-white">{{ c.nro_factura || 'S/N' }}</strong>
                  </span>
                </div>
              </td>
            </tr>
            <tr *ngIf="compras.length === 0">
              <td colspan="8" class="empty-state-row">No hay órdenes de compra registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Emitir Compra -->
      <div *ngIf="showModal" class="modal-backdrop">
        <div class="modal-card">
          <h3 class="modal-title">
            <i class="fas fa-cart-arrow-down text-indigo"></i> Nueva Orden de Compra Desktop
          </h3>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">ID Proveedor:</label>
                <input type="number" [(ngModel)]="nuevoProveedorId" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">ID Sucursal Destino:</label>
                <input type="number" [(ngModel)]="nuevaSucursalDestino" class="form-input" />
              </div>
            </div>
            <div class="inner-box">
              <span class="inner-box-title">Ítem a Comprar:</span>
              <div class="form-grid-4">
                <div class="form-group">
                  <label class="form-label small">ID Prod:</label>
                  <input type="number" [(ngModel)]="nuevoProdId" class="form-input small" />
                </div>
                <div class="form-group">
                  <label class="form-label small">Talla:</label>
                  <input type="text" [(ngModel)]="nuevaTalla" class="form-input small" />
                </div>
                <div class="form-group">
                  <label class="form-label small">Cant:</label>
                  <input type="number" [(ngModel)]="nuevaCantidad" min="1" class="form-input small" />
                </div>
                <div class="form-group">
                  <label class="form-label small">Costo Unit:</label>
                  <input type="number" [(ngModel)]="nuevoCostoUnitario" min="0.1" class="form-input small" />
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button (click)="showModal = false" class="btn-cancel">Cancelar</button>
            <button (click)="emitirCompra()" [disabled]="isProcessing" class="btn-confirm">
              Emitir Orden de Compra
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Recepcionar Mercadería (CU20) -->
      <div *ngIf="showModalRecepcion && ordenSeleccionada" class="modal-backdrop">
        <div class="modal-card">
          <h3 class="modal-title">
            <i class="fas fa-boxes-stacked text-emerald"></i> Recepción Física de Mercadería
          </h3>
          <p class="modal-desc">
            Orden: <strong class="text-indigo font-mono">{{ ordenSeleccionada.codigo_orden }}</strong> · Al confirmar se actualizará el stock en inventario y se recalculará el CPP mediante redondeo Half-Up.
          </p>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">N° de Factura / Remisión Fiscal:</label>
              <input type="text" [(ngModel)]="nroFacturaRecepcion" placeholder="Ej. FAC-2026-90412" class="form-input" />
            </div>

            <div class="inner-box">
              <span class="inner-box-title">Prendas a Ingresar a Kardex:</span>
              <div *ngFor="let it of ordenSeleccionada.items" class="reception-item-row">
                <span class="text-gray-300">Producto #{{ it.id_producto }} (Talla {{ it.talla }})</span>
                <span class="font-mono text-emerald font-bold">{{ it.cantidad }} unidades @ Bs. {{ it.costo_unitario }}</span>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button (click)="showModalRecepcion = false" class="btn-cancel">Cancelar</button>
            <button (click)="recepcionarCompra()" [disabled]="isProcessing || !nroFacturaRecepcion.trim()" class="btn-confirm success">
              Confirmar Recepción y Asentar Kardex
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .compras-desktop-container {
      padding: 1.5rem 2rem;
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      color: #f1f5f9;
      font-family: 'Inter', sans-serif;
    }

    .desktop-badge-banner {
      background: linear-gradient(135deg, rgba(30, 58, 138, 0.45), rgba(49, 46, 129, 0.35));
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 12px;
      padding: 1.2rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    .banner-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .banner-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.2);
      border: 1px solid rgba(59, 130, 246, 0.35);
      color: #60a5fa;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
    }

    .banner-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 2px 0;
    }

    .banner-sub {
      font-size: 0.78rem;
      color: #bfdbfe;
      margin: 0;
    }

    .badge-desktop-valid {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.74rem;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    .compras-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .compras-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    .btn-nueva-compra {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 10px rgba(79, 70, 229, 0.35);
      transition: all 0.2s;
    }

    .btn-nueva-compra:hover {
      background: linear-gradient(135deg, #4338ca, #4f46e5);
      transform: translateY(-1px);
    }

    .table-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow-x: auto;
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .compras-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }

    .compras-table th {
      background: rgba(15, 23, 42, 0.85);
      border-bottom: 1px solid rgba(255, 255, 255, 0.09);
      padding: 0.75rem 1rem;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      font-weight: 600;
      text-align: left;
    }

    .compras-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #e2e8f0;
      vertical-align: middle;
    }

    .compras-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .prenda-chip {
      display: inline-block;
      background: rgba(2, 6, 23, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.72rem;
      margin: 2px 4px 2px 0;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .status-badge.emitida {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.35);
      color: #60a5fa;
    }

    .status-badge.autorizada {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
    }

    .status-badge.conforme {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
    }

    .status-badge.discrepancia {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
    }

    .actions-group {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 8px;
    }

    .btn-action {
      border: none;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s;
    }

    .btn-action.autorizar {
      background: #4f46e5;
      color: #fff;
    }

    .btn-action.autorizar:hover {
      background: #4338ca;
    }

    .btn-action.recepcionar {
      background: #059669;
      color: #fff;
    }

    .btn-action.recepcionar:hover {
      background: #047857;
    }

    .factura-tag {
      font-size: 0.74rem;
      color: #94a3b8;
    }

    .empty-state-row {
      text-align: center;
      padding: 2.5rem !important;
      color: #64748b;
    }

    /* MODAL */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999;
      padding: 1rem;
    }

    .modal-card {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      padding: 1.5rem;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .modal-desc {
      font-size: 0.78rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.4;
    }

    .modal-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-label {
      font-size: 0.74rem;
      font-weight: 600;
      color: #94a3b8;
    }

    .form-label.small {
      font-size: 0.68rem;
    }

    .form-input {
      background: #020617;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 8px 12px;
      color: #ffffff;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .form-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .form-input.small {
      padding: 5px 8px;
      font-size: 0.8rem;
    }

    .inner-box {
      background: rgba(2, 6, 23, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .inner-box-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .form-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }

    .reception-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.78rem;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 0.5rem;
    }

    .btn-cancel {
      background: #334155;
      color: #e2e8f0;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-cancel:hover {
      background: #475569;
    }

    .btn-confirm {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-confirm.success {
      background: linear-gradient(135deg, #059669, #10b981);
    }

    .btn-confirm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* UTILITARIOS */
    .text-indigo { color: #818cf8; }
    .text-emerald { color: #34d399; }
    .text-muted { color: #94a3b8; }
    .font-mono { font-family: ui-monospace, monospace; }
    .font-bold { font-weight: 700; }
  `]
})
export class ComprasDesktopComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  compras: CompraRow[] = [];
  showModal = false;
  showModalRecepcion = false;
  isProcessing = false;

  ordenSeleccionada: CompraRow | null = null;
  nroFacturaRecepcion = '';

  nuevoProveedorId = 1;
  nuevaSucursalDestino = 1;
  nuevoProdId = 1;
  nuevaTalla = 'M';
  nuevaCantidad = 25;
  nuevoCostoUnitario = 35.0;

  ngOnInit() {
    this.cargarCompras();
  }

  cargarCompras() {
    this.http.get<CompraRow[]>(`${API_BASE_URL}/compras`, {
      headers: {
        ...this.auth.getAuthHeaders(),
        'X-Viewport-Width': String(window.innerWidth || 1200)
      }
    }).subscribe({
      next: (data) => this.compras = data || [],
      error: (err) => console.error(err)
    });
  }

  emitirCompra() {
    this.isProcessing = true;
    const body = {
      id_proveedor: Number(this.nuevoProveedorId),
      id_sucursal_destino: Number(this.nuevaSucursalDestino),
      items: [
        {
          id_producto: Number(this.nuevoProdId),
          talla: this.nuevaTalla,
          color: 'Blanco',
          cantidad: Number(this.nuevaCantidad),
          costo_unitario: Number(this.nuevoCostoUnitario)
        }
      ],
      observaciones: 'Orden emitida desde Web Desktop'
    };

    this.http.post<any>(`${API_BASE_URL}/compras`, body, {
      headers: {
        ...this.auth.getAuthHeaders(),
        'X-Viewport-Width': String(window.innerWidth || 1200)
      }
    }).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.showModal = false;
        this.toast.success('Orden Emitida', `Código: ${res.codigo_orden}. Total: Bs. ${res.monto_total}`);
        this.cargarCompras();
      },
      error: (err) => {
        this.isProcessing = false;
        this.toast.error('Error', err.error?.detail || 'No se pudo emitir la orden de compra');
      }
    });
  }

  autorizarCompra(c: CompraRow) {
    if (!confirm(`¿Autorizar orden de compra ${c.codigo_orden} por Bs. ${c.monto_total}? Se verificará el presupuesto disponible.`)) {
      return;
    }
    this.isProcessing = true;
    this.http.post<any>(`${API_BASE_URL}/compras/${c.id_orden_compra}/autorizar`, {}, {
      headers: {
        ...this.auth.getAuthHeaders(),
        'X-Viewport-Width': String(window.innerWidth || 1200)
      }
    }).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.toast.success('Orden Autorizada', res.mensaje || 'Presupuesto validado y orden autorizada.');
        this.cargarCompras();
      },
      error: (err) => {
        this.isProcessing = false;
        this.toast.error('Error', err.error?.detail || 'No se pudo autorizar la orden');
      }
    });
  }

  abrirModalRecepcion(c: CompraRow) {
    this.ordenSeleccionada = c;
    this.nroFacturaRecepcion = `FAC-${Date.now().toString().slice(-6)}`;
    this.showModalRecepcion = true;
  }

  recepcionarCompra() {
    if (!this.ordenSeleccionada || !this.nroFacturaRecepcion.trim()) return;
    this.isProcessing = true;

    const payload = {
      nro_factura: this.nroFacturaRecepcion.trim()
    };

    this.http.post<any>(`${API_BASE_URL}/compras/${this.ordenSeleccionada.id_orden_compra}/recepcionar`, payload, {
      headers: {
        ...this.auth.getAuthHeaders(),
        'X-Viewport-Width': String(window.innerWidth || 1200)
      }
    }).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.showModalRecepcion = false;
        this.toast.success('Mercadería Recepcionada', res.mensaje || 'Inventario y Kardex actualizados.');
        this.cargarCompras();
      },
      error: (err) => {
        this.isProcessing = false;
        this.toast.error('Error al Recepcionar', err.error?.detail || 'No se pudo procesar la recepción');
      }
    });
  }
}
