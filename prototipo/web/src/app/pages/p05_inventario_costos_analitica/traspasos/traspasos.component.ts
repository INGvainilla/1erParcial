import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

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
    <div class="traspasos-container p-6">
      <div class="header-bar flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white flex items-center gap-2">
            <i class="fas fa-truck-moving text-blue-400"></i> Traspasos Inter-Sucursales (CU14)
          </h1>
          <p class="text-gray-400 text-sm">Control de stock en tránsito y reabastecimiento entre tiendas</p>
        </div>
        <button (click)="abrirModalNuevo()" class="btn-nuevo bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow flex items-center gap-2">
          <i class="fas fa-plus"></i> Iniciar Traspaso
        </button>
      </div>

      <!-- Tabla de Traspasos -->
      <div class="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden shadow">
        <table class="w-full text-left text-sm text-gray-200">
          <thead class="bg-slate-900/60 text-xs uppercase text-gray-400 border-b border-slate-700">
            <tr>
              <th class="p-3">Código</th>
              <th class="p-3">Sucursal Origen</th>
              <th class="p-3">Sucursal Destino</th>
              <th class="p-3">Prendas Transferidas</th>
              <th class="p-3">Fecha Solicitud</th>
              <th class="p-3">Estado</th>
              <th class="p-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of traspasos" class="border-b border-slate-700/50 hover:bg-slate-750">
              <td class="p-3 font-mono font-semibold text-blue-400">{{ t.codigo_traspaso }}</td>
              <td class="p-3">{{ t.nombre_origen || ('Sucursal #' + t.id_sucursal_origen) }}</td>
              <td class="p-3">{{ t.nombre_destino || ('Sucursal #' + t.id_sucursal_destino) }}</td>
              <td class="p-3">
                <span *ngFor="let it of t.items" class="inline-block bg-slate-700 px-2 py-0.5 rounded text-xs mr-1">
                  Prod #{{ it.id_producto }} ({{ it.talla }}) x{{ it.cantidad }}
                </span>
              </td>
              <td class="p-3 text-gray-400">{{ t.fecha_solicitud | date:'short' }}</td>
              <td class="p-3">
                <span [class]="t.estado === 'RECIBIDO' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'" class="px-2.5 py-1 rounded-full text-xs font-semibold">
                  {{ t.estado }}
                </span>
              </td>
              <td class="p-3 text-right">
                <button *ngIf="t.estado === 'EN_TRANSITO'" (click)="recibirTraspaso(t)" [disabled]="isProcessing" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded font-medium shadow">
                  <i class="fas fa-check-circle"></i> Confirmar Recepción
                </button>
                <span *ngIf="t.estado === 'RECIBIDO'" class="text-xs text-gray-400">
                  <i class="fas fa-box-open text-emerald-400"></i> Acreditado en Kardex
                </span>
              </td>
            </tr>
            <tr *ngIf="traspasos.length === 0">
              <td colspan="7" class="text-center p-6 text-gray-400">No hay traspasos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal Iniciar Traspaso -->
      <div *ngIf="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
          <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <i class="fas fa-exchange-alt text-blue-400"></i> Nuevo Traspaso Inter-Sucursal
          </h3>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">ID Sucursal Origen (Descuento stock):</label>
              <input type="number" [(ngModel)]="nuevoOrigen" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-400 mb-1">ID Sucursal Destino (Recepción stock):</label>
              <input type="number" [(ngModel)]="nuevoDestino" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
            </div>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1">ID Producto:</label>
                <input type="number" [(ngModel)]="nuevoProdId" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1">Talla:</label>
                <input type="text" [(ngModel)]="nuevaTalla" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-400 mb-1">Cantidad:</label>
                <input type="number" [(ngModel)]="nuevaCantidad" min="1" class="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm" />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button (click)="showModal = false" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm">Cancelar</button>
            <button (click)="guardarTraspaso()" [disabled]="isProcessing" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium">
              Emitir Traspaso
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .traspasos-container { min-height: 100vh; background: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; }
  `]
})
export class TraspasosComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  traspasos: TraspasoRow[] = [];
  showModal = false;
  isProcessing = false;

  nuevoOrigen = 1;
  nuevoDestino = 2;
  nuevoProdId = 1;
  nuevaTalla = 'M';
  nuevaCantidad = 5;

  ngOnInit() {
    this.cargarTraspasos();
  }

  cargarTraspasos() {
    this.http.get<TraspasoRow[]>(`${API_BASE_URL}/traspasos`, {
      headers: this.auth.getAuthHeaders()
    }).subscribe({
      next: (data) => this.traspasos = data || [],
      error: (err) => console.error(err)
    });
  }

  abrirModalNuevo() {
    this.showModal = true;
  }

  guardarTraspaso() {
    if (this.nuevoOrigen === this.nuevoDestino) {
      this.toast.error('Error', 'La sucursal de origen y destino deben ser distintas.');
      return;
    }
    this.isProcessing = true;
    const body = {
      id_sucursal_origen: Number(this.nuevoOrigen),
      id_sucursal_destino: Number(this.nuevoDestino),
      items: [
        {
          id_producto: Number(this.nuevoProdId),
          talla: this.nuevaTalla,
          color: 'Negro',
          cantidad: Number(this.nuevaCantidad)
        }
      ],
      observaciones: 'Traspaso emitido desde consola administrativa'
    };

    this.http.post<any>(`${API_BASE_URL}/traspasos`, body, {
      headers: this.auth.getAuthHeaders()
    }).subscribe({
      next: (res) => {
        this.isProcessing = false;
        this.showModal = false;
        this.toast.success('Traspaso Emitido', `Código: ${res.codigo_traspaso}. Stock en tránsito.`);
        this.cargarTraspasos();
      },
      error: (err) => {
        this.isProcessing = false;
        this.toast.error('Error', err.error?.detail || 'No se pudo emitir el traspaso');
      }
    });
  }

  recibirTraspaso(t: TraspasoRow) {
    this.isProcessing = true;
    this.http.post<any>(`${API_BASE_URL}/traspasos/${t.id_traspaso}/recibir`, {}, {
      headers: this.auth.getAuthHeaders()
    }).subscribe({
      next: () => {
        this.isProcessing = false;
        this.toast.success('Recepción Confirmada', 'Stock acreditado en inventario y Kardex de destino.');
        this.cargarTraspasos();
      },
      error: (err) => {
        this.isProcessing = false;
        this.toast.error('Error', err.error?.detail || 'Error al recibir traspaso');
      }
    });
  }
}

