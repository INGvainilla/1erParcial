import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FashionApiService } from '../../../core/services/fashion-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Proveedor } from '../../../core/models/fashion.models';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="view-header glass-panel">
        <div>
          <h2><i class="fas fa-truck-loading"></i> Proveedores Textiles (CU08)</h2>
          <p class="subtitle">Directorio de Confeccionistas con Validación de Unicidad de NIT, Plazos de Crédito y Estado Operativo</p>
        </div>
        <div class="header-actions" *ngIf="auth.isAdmin() || auth.isLogistics()">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <i class="fas fa-plus"></i> Nuevo Proveedor (CU08)
          </button>
        </div>
      </div>

      <div class="suppliers-grid">
        <div *ngFor="let p of proveedores" class="supplier-card glass-panel" [class.card-disabled]="p.estado === 'INACTIVO'">
          <div class="sup-header">
            <span class="nit-chip"><i class="fas fa-id-card"></i> NIT: {{ p.nit_identificacion }}</span>
            <div class="status-wrap">
              <span class="badge status-active" *ngIf="p.estado === 'ACTIVO'">
                <i class="fas fa-check-circle"></i> ACTIVO
              </span>
              <span class="badge status-inactive" *ngIf="p.estado === 'INACTIVO' || !p.estado">
                <i class="fas fa-ban"></i> INACTIVO
              </span>
            </div>
          </div>

          <h3>{{ p.razon_social }}</h3>

          <div class="sup-details">
            <div class="detail-item" *ngIf="p.contacto_nombre">
              <i class="fas fa-user-tie"></i>
              <span>{{ p.contacto_nombre }}</span>
            </div>
            <div class="detail-item" *ngIf="p.telefono || p.telefono_contacto">
              <i class="fas fa-phone"></i>
              <span>{{ p.telefono || p.telefono_contacto }}</span>
            </div>
            <div class="detail-item" *ngIf="p.email || p.email_contacto">
              <i class="fas fa-envelope"></i>
              <span>{{ p.email || p.email_contacto }}</span>
            </div>
          </div>

          <div class="credit-box">
            <span class="credit-label">Términos Comerciales:</span>
            <span class="credit-val">{{ p.terminos_pago || (p.plazo_credito_dias ? p.plazo_credito_dias + ' días' : 'CONTADO') }}</span>
          </div>

          <!-- ACCIONES CU08: EDITAR Y HABILITAR/DESHABILITAR -->
          <div class="card-actions-bar" *ngIf="auth.isAdmin() || auth.isLogistics()">
            <button class="btn-action edit-btn" (click)="openEditModal(p)">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button 
              class="btn-action" 
              [ngClass]="p.estado === 'ACTIVO' ? 'toggle-off-btn' : 'toggle-on-btn'"
              (click)="toggleEstadoProveedor(p)"
              [disabled]="togglingId === p.id_proveedor"
            >
              <i class="fas" [ngClass]="p.estado === 'ACTIVO' ? 'fa-ban' : 'fa-check-circle'"></i>
              {{ p.estado === 'ACTIVO' ? 'Deshabilitar' : 'Habilitar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL NUEVO PROVEEDOR (CU08) -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-card glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-industry"></i> Registrar Proveedor Textil (CU08)</h3>
            <button class="close-btn" (click)="showModal = false">&times;</button>
          </div>
          <form (ngSubmit)="submitProveedor()" class="modal-form">
            <div class="form-row">
              <div class="form-group col-half">
                <label>NIT (Identificación Tributaria Única):</label>
                <input type="text" [(ngModel)]="newProv.nit_identificacion" name="nit" required minlength="5" class="form-control" placeholder="1028392019" />
              </div>
              <div class="form-group col-half">
                <label>Razón Social:</label>
                <input type="text" [(ngModel)]="newProv.razon_social" name="rs" required minlength="3" class="form-control" placeholder="Textiles Andinos S.A." />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Nombre de Contacto:</label>
                <input type="text" [(ngModel)]="newProv.contacto_nombre" name="cn" class="form-control" placeholder="Lic. René Choque" />
              </div>
              <div class="form-group col-half">
                <label>Teléfono:</label>
                <input type="text" [(ngModel)]="newProv.telefono" name="tel" class="form-control" placeholder="+591 2 2841029" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Correo Electrónico:</label>
                <input type="email" [(ngModel)]="newProv.email" name="mail" class="form-control" placeholder="ventas@textiles.bo" />
              </div>
              <div class="form-group col-half">
                <label>Términos de Pago:</label>
                <select [(ngModel)]="newProv.terminos_pago" name="terminos" class="form-control">
                  <option value="CONTADO">CONTADO</option>
                  <option value="CREDITO_30_DIAS">Crédito 30 Días</option>
                  <option value="CREDITO_60_DIAS">Crédito 60 Días</option>
                </select>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
              <button type="submit" [disabled]="submitting" class="btn btn-success">
                <i class="fas fa-check"></i> {{ submitting ? 'Guardando...' : 'Registrar Proveedor' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL EDITAR PROVEEDOR (CU08) -->
      <div *ngIf="showEditModal" class="modal-overlay">
        <div class="modal-card glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-edit"></i> Editar Proveedor #{{ editProv.id_proveedor }}</h3>
            <button class="close-btn" (click)="closeEditModal()">&times;</button>
          </div>
          <form (ngSubmit)="submitEditProveedor()" class="modal-form">
            <div class="form-group">
              <label>NIT Registrado:</label>
              <input type="text" [value]="editProv.nit_identificacion" disabled class="form-control disabled-input" />
            </div>

            <div class="form-group">
              <label>Razón Social:</label>
              <input type="text" [(ngModel)]="editProv.razon_social" name="edit_rs" required minlength="3" class="form-control" />
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Nombre de Contacto:</label>
                <input type="text" [(ngModel)]="editProv.contacto_nombre" name="edit_cn" class="form-control" />
              </div>
              <div class="form-group col-half">
                <label>Teléfono:</label>
                <input type="text" [(ngModel)]="editProv.telefono" name="edit_tel" class="form-control" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Correo Electrónico:</label>
                <input type="email" [(ngModel)]="editProv.email" name="edit_mail" class="form-control" />
              </div>
              <div class="form-group col-half">
                <label>Términos de Pago:</label>
                <select [(ngModel)]="editProv.terminos_pago" name="edit_terminos" class="form-control">
                  <option value="CONTADO">CONTADO</option>
                  <option value="CREDITO_30_DIAS">Crédito 30 Días</option>
                  <option value="CREDITO_60_DIAS">Crédito 60 Días</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Estado del Proveedor:</label>
              <select [(ngModel)]="editProv.estado" name="edit_estado" class="form-control">
                <option value="ACTIVO">ACTIVO (Habilitado)</option>
                <option value="INACTIVO">INACTIVO (Deshabilitado)</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="closeEditModal()">Cancelar</button>
              <button type="submit" [disabled]="submittingEdit" class="btn btn-success">
                <i class="fas fa-save"></i> {{ submittingEdit ? 'Actualizando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem 2rem; }
    .view-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem 2rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;
    }
    .view-header h2 { font-size: 1.4rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
    .subtitle { color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.2rem; }
    .suppliers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.5rem; }
    .supplier-card {
      border-radius: var(--radius-lg); padding: 1.5rem; background: rgba(17, 24, 39, 0.8);
      border: 1px solid var(--border-subtle); display: flex; flex-direction: column;
      transition: all 0.25s ease;
    }
    .supplier-card:hover {
      border-color: rgba(99, 102, 241, 0.4);
      transform: translateY(-2px);
    }
    .supplier-card.card-disabled {
      opacity: 0.72;
      border-color: rgba(239, 68, 68, 0.2);
    }
    .sup-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .nit-chip { font-family: var(--font-mono); font-size: 0.8rem; background: rgba(99, 102, 241, 0.15); color: #818cf8; padding: 0.25rem 0.6rem; border-radius: var(--radius-sm); font-weight: 600; }
    .sup-details { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); margin: 1rem 0; }
    .detail-item { display: flex; align-items: center; gap: 0.6rem; }
    .credit-box {
      display: flex; justify-content: space-between; align-items: center; padding: 0.75rem;
      background: rgba(15, 23, 42, 0.7); border-radius: var(--radius-md); margin-top: auto; margin-bottom: 1rem;
    }
    .credit-label { font-size: 0.8rem; color: var(--text-muted); }
    .credit-val { font-size: 0.85rem; font-weight: 700; color: #34d399; }

    .card-actions-bar {
      display: flex; gap: 0.6rem; padding-top: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 0.07);
    }
    .btn-action {
      flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
      padding: 0.45rem 0.75rem; font-size: 0.8rem; font-weight: 600; border-radius: var(--radius-md);
      cursor: pointer; transition: all 0.2s; border: none;
    }
    .edit-btn {
      background: rgba(99, 102, 241, 0.18); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.35);
    }
    .edit-btn:hover {
      background: rgba(99, 102, 241, 0.35); color: #fff;
    }
    .toggle-off-btn {
      background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .toggle-off-btn:hover {
      background: rgba(239, 68, 68, 0.3); color: #fff;
    }
    .toggle-on-btn {
      background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .toggle-on-btn:hover {
      background: rgba(16, 185, 129, 0.3); color: #fff;
    }

    .status-wrap { display: flex; align-items: center; }
    .status-active { background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 0.25rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; }
    .status-inactive { background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 0.25rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; }

    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-card { width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; background: #111827; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h3 { font-size: 1.2rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
    .close-btn { background: transparent; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
    .form-row { display: flex; gap: 1rem; }
    .col-half { flex: 1; }
    .disabled-input { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); cursor: not-allowed; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
  `]
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  showModal = false;
  submitting = false;

  showEditModal = false;
  submittingEdit = false;
  togglingId: number | null = null;

  newProv = {
    nit_identificacion: '',
    razon_social: '',
    contacto_nombre: '',
    telefono: '',
    email: '',
    terminos_pago: 'CONTADO',
    estado: 'ACTIVO'
  };

  editProv: any = {
    id_proveedor: 0,
    nit_identificacion: '',
    razon_social: '',
    contacto_nombre: '',
    telefono: '',
    email: '',
    terminos_pago: 'CONTADO',
    estado: 'ACTIVO'
  };

  constructor(
    private api: FashionApiService,
    private toast: ToastService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProveedores();
  }

  loadProveedores(): void {
    this.api.getProveedores().subscribe({
      next: (data) => {
        this.proveedores = data;
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Error', 'No se pudieron cargar los proveedores.')
    });
  }

  openCreateModal(): void {
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(p: Proveedor): void {
    this.editProv = {
      id_proveedor: p.id_proveedor,
      nit_identificacion: p.nit_identificacion,
      razon_social: p.razon_social,
      contacto_nombre: p.contacto_nombre || '',
      telefono: p.telefono || p.telefono_contacto || '',
      email: p.email || p.email_contacto || '',
      terminos_pago: p.terminos_pago || 'CONTADO',
      estado: p.estado || 'ACTIVO'
    };
    this.showEditModal = true;
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.cdr.detectChanges();
  }

  toggleEstadoProveedor(p: Proveedor): void {
    const nuevoEstado = (p.estado === 'ACTIVO') ? 'INACTIVO' : 'ACTIVO';
    const accion = nuevoEstado === 'ACTIVO' ? 'habilitar' : 'deshabilitar';

    this.togglingId = p.id_proveedor;
    this.api.updateProveedor(p.id_proveedor, { estado: nuevoEstado }).subscribe({
      next: (actualizado) => {
        this.togglingId = null;
        p.estado = actualizado.estado;
        this.toast.success(
          'Estado Actualizado (CU08)',
          `Proveedor "${p.razon_social}" ahora se encuentra ${nuevoEstado === 'ACTIVO' ? 'Habilitado (ACTIVO)' : 'Deshabilitado (INACTIVO)'}.`
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.togglingId = null;
        this.toast.error('Error al cambiar estado', err.error?.detail || `No se pudo ${accion} el proveedor.`);
        this.cdr.detectChanges();
      }
    });
  }

  submitProveedor(): void {
    this.submitting = true;
    const payload = {
      nit_identificacion: this.newProv.nit_identificacion.trim(),
      razon_social: this.newProv.razon_social.trim(),
      contacto_nombre: this.newProv.contacto_nombre?.trim() || null,
      telefono: this.newProv.telefono?.trim() || null,
      email: this.newProv.email?.trim() || null,
      terminos_pago: this.newProv.terminos_pago || 'CONTADO',
      estado: this.newProv.estado || 'ACTIVO'
    };

    this.api.createProveedor(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.showModal = false;
        this.toast.success('Proveedor Registrado (CU08)', `${res.razon_social} (NIT: ${res.nit_identificacion}) creado.`);
        this.loadProveedores();
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error('Error NIT', err.error?.detail || 'No se pudo crear el proveedor.');
        this.cdr.detectChanges();
      }
    });
  }

  submitEditProveedor(): void {
    this.submittingEdit = true;
    const payload = {
      razon_social: this.editProv.razon_social.trim(),
      contacto_nombre: this.editProv.contacto_nombre?.trim() || null,
      telefono: this.editProv.telefono?.trim() || null,
      email: this.editProv.email?.trim() || null,
      terminos_pago: this.editProv.terminos_pago,
      estado: this.editProv.estado
    };

    this.api.updateProveedor(this.editProv.id_proveedor, payload).subscribe({
      next: (res) => {
        this.submittingEdit = false;
        this.showEditModal = false;
        this.toast.success('Proveedor Modificado (CU08)', `Proveedor "${res.razon_social}" actualizado exitosamente.`);
        this.loadProveedores();
      },
      error: (err) => {
        this.submittingEdit = false;
        this.toast.error('Error al editar', err.error?.detail || 'No se pudieron guardar los cambios.');
        this.cdr.detectChanges();
      }
    });
  }
}
