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
    <div class="compras-desktop-container p-6">
      <!-- Banner CU20: Exclusivo Web Desktop -->
      <div class="desktop-badge-banner mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-900/60 to-indigo-900/40 border border-blue-500/30 flex justify-between items-center shadow-lg">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-blue-500/20 text-blue-400 rounded-lg text-xl">
            <i class="fas fa-desktop"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Módulo de Aprovisionamiento Textil (CU20)</h2>
            <p class="text-xs text-blue-200">Terminal de compras corporativas restringido exclusivamente a clientes de escritorio (Resolución &ge; 768px)</p>
          </div>
        </div>
        <div class="text-right">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Desktop Validado
          </span>
        </div>
      </div>

      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-bold text-white flex items-center gap-2">
          <i class="fas fa-file-invoice-dollar text-indigo-400"></i> Órdenes de Compra y Suministro
        </h1>
        <button (click)="showModal = true" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow flex items-center gap-2">
          <i class="fas fa-plus"></i> Emitir Orden de Compra
        </button>
      </div>

      <!-- Tabla de Órdenes de Compra -->
      <div class="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden shadow">
        <table class="w-full text-left text-sm text-gray-200">
          <thead class="bg-slate-900/60 text-xs uppercase text-gray-400 border-b border-slate-700">
            <tr>
              <th class="p-3">Código</th>
              <th class="p-3">Proveedor</th>
              <th class="p-3">Sucursal Destino</th>
              <th class="p-3">Total (Bs.)</th>
              <th class="p-3">Prendas</th>
              <th class="p-3">Fecha Emisión</th>
              <th class="p-3">Estado</th>
              <th class="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of compras" class="border-b border-slate-700/50 hover:bg-slate-750">
              <td class="p-3 font-mono font-semibold text-indigo-400">{{ c.codigo_orden }}</td>
              <td class="p-3">{{ c.proveedor }}</td>
              <td class="p-3">{{ c.sucursal }}</td>
              <td class="p-3 font-semibold text-emerald-400">Bs. {{ c.monto_total | number:'1.2-2' }}</td>
              <td class="p-3">
                <span *ngFor="let it of c.items" class="inline-block bg-slate-700 px-2 py-0.5 rounded text-xs mr-1 mb-1">
                  Prod #{{ it.id_producto }} ({{ it.talla }}) x{{ it.cantidad }} - Bs. {{ it.costo_unitario }}
                </span>
              </td>
              <td class="p-3 text-gray-400">{{ c.fecha_emision | date:'short' }}</td>
              <td class="p-3">
                <span *ngIf="c.estado === 'EMITIDA'" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <i class="fas fa-paper-plane mr-1"></i> EMITIDA
                </span>
                <span *ngIf="c.estado === 'AUTORIZADA'" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <i class="fas fa-check-circle mr-1"></i> AUTORIZADA
                </span>
                <span *ngIf="c.estado === 'RECEPCIONADA_CONFORME'" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" [title]="'Factura: ' + (c.nro_factura || 'S/N')">
                  <i class="fas fa-boxes mr-1"></i> CONFORME
                </span>
                <span *ngIf="c.estado === 'RECEPCIONADA_CON_DISCREPANCIA'" class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30" [title]="'Discrepancia detectada. Factura: ' + (c.nro_factura || 'S/N')">
                  <i class="fas fa-exclamation-triangle mr-1"></i> DISCREPANCIA
                </span>
              </td>
              <td class="p-3 text-right">
                <div class="flex justify-end gap-2">
                  <button *ngIf="c.estado === 'EMITIDA'"
                          (click)="autorizarCompra(c)"
                          [disabled]="isProcessing"
                          class="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium flex items-center gap-1 shadow">
                    <i class="fas fa-stamp"></i> Autorizar
                  </button>
                  <button *ngIf="c.estado === 'AUTORIZADA'"
                          (click)="abrirModalRecepcion(c)"
                          [disabled]="isProcessing"
                          class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1 shadow">
                    <i class="fas fa-dolly"></i> Recepcionar
                  </button>
                  <span *ngIf="c.estado.startsWith('RECEPCIONADA')" class="text-xs text-gray-400">
                    Fact: <span class="font-mono text-gray-200">{{ c.nro_factura || 'S/N' }}</span>
                  </span>
                </div>
              </td>
            </tr>
            <tr *ngIf="compras.length === 0">
              <td colspan="8" class="text-center p-6 text-gray-400">No hay órdenes de compra registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Emitir Compra -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl">
          <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <i class="fas fa-cart-arrow-down text-indigo-400"></i> Nueva Orden de Compra Desktop
          </h3>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1">ID Proveedor:</label>
                <input type="number" [(ngModel)]="nuevoProveedorId" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1">ID Sucursal Destino:</label>
                <input type="number" [(ngModel)]="nuevaSucursalDestino" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
              </div>
            </div>
            <div class="p-3 bg-slate-900/60 rounded border border-slate-700/60 space-y-3">
              <span class="text-xs font-semibold text-gray-300">Ítem a Comprar:</span>
              <div class="grid grid-cols-4 gap-2">
                <div>
                  <label class="block text-[11px] text-gray-400 mb-0.5">ID Prod:</label>
                  <input type="number" [(ngModel)]="nuevoProdId" class="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs" />
                </div>
                <div>
                  <label class="block text-[11px] text-gray-400 mb-0.5">Talla:</label>
                  <input type="text" [(ngModel)]="nuevaTalla" class="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs" />
                </div>
                <div>
                  <label class="block text-[11px] text-gray-400 mb-0.5">Cant:</label>
                  <input type="number" [(ngModel)]="nuevaCantidad" min="1" class="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs" />
                </div>
                <div>
                  <label class="block text-[11px] text-gray-400 mb-0.5">Costo Unit:</label>
                  <input type="number" [(ngModel)]="nuevoCostoUnitario" min="0.1" class="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-white text-xs" />
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button (click)="showModal = false" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">Cancelar</button>
            <button (click)="emitirCompra()" [disabled]="isProcessing" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium">
              Emitir Orden de Compra
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Recepcionar Mercadería (CU20) -->
      <div *ngIf="showModalRecepcion && ordenSeleccionada" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-lg w-full shadow-2xl">
          <h3 class="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <i class="fas fa-boxes text-emerald-400"></i> Recepción Física de Mercadería
          </h3>
          <p class="text-xs text-gray-400 mb-4">
            Orden: <span class="text-indigo-400 font-mono font-bold">{{ ordenSeleccionada.codigo_orden }}</span> | Al confirmar se actualizará el stock en inventario y se recalculará el CPP mediante redondeo Half-Up.
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-300 mb-1">N° de Factura / Remisión Fiscal:</label>
              <input type="text" [(ngModel)]="nroFacturaRecepcion" placeholder="Ej. FAC-2026-90412" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
            </div>

            <div class="p-3 bg-slate-900/60 rounded border border-slate-700/60">
              <span class="text-xs font-semibold text-gray-300 block mb-2">Prendas a Ingresar a Kardex:</span>
              <div *ngFor="let it of ordenSeleccionada.items" class="flex justify-between items-center text-xs py-1 border-b border-slate-800 last:border-0">
                <span class="text-gray-300">Producto #{{ it.id_producto }} (Talla {{ it.talla }})</span>
                <span class="font-mono text-emerald-400 font-bold">{{ it.cantidad }} unidades @ Bs. {{ it.costo_unitario }}</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button (click)="showModalRecepcion = false" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">Cancelar</button>
            <button (click)="recepcionarCompra()" [disabled]="isProcessing || !nroFacturaRecepcion.trim()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium">
              Confirmar Recepción y Asentar Kardex
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .compras-desktop-container { min-height: 100vh; background: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; }
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
