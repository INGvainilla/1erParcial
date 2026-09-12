import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PagoConfigService, MetodoPagoResponse, MetodoPagoUpdate } from '../../core/services/pago-config.service';
import { ToastService } from '../../core/services/toast.service';

interface CredFieldDef {
  key: string;
  label: string;
  placeholder: string;
  isSecret: boolean;
  showText?: boolean;
}

@Component({
  selector: 'app-admin-pagos-config',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-pagos-container">
      <!-- Encabezado de Página -->
      <div class="page-header glass-panel">
        <div class="header-left">
          <div class="icon-badge">
            <i class="fas fa-sliders-h"></i>
          </div>
          <div>
            <div class="header-breadcrumb">
              <a routerLink="/dashboard"><i class="fas fa-arrow-left"></i> Panel de Control</a>
              <span class="sep">/</span>
              <span>Configuración Financiera (CU17)</span>
            </div>
            <h1 class="page-title">Gestión de Tipos y Medios de Cobro</h1>
            <p class="page-subtitle">Activar, desactivar y parametrizar canales de recaudación física y digital en tiempo real.</p>
          </div>
        </div>

        <div class="header-right">
          <button class="btn-refresh" (click)="cargarMetodos()" [disabled]="isLoading">
            <i class="fas fa-sync-alt" [class.fa-spin]="isLoading"></i>
            <span>Actualizar Canales</span>
          </button>
        </div>
      </div>

      <!-- Barra de Métricas Rápidas -->
      <div class="stats-row">
        <div class="stat-card glass-panel">
          <div class="stat-icon total"><i class="fas fa-wallet"></i></div>
          <div class="stat-content">
            <span class="stat-label">Canales Registrados</span>
            <span class="stat-val">{{ metodos.length }}</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon active"><i class="fas fa-check-circle"></i></div>
          <div class="stat-content">
            <span class="stat-label">Canales Habilitados</span>
            <span class="stat-val text-success">{{ totalActivos }}</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon digital"><i class="fas fa-globe"></i></div>
          <div class="stat-content">
            <span class="stat-label">Pasarelas Digitales</span>
            <span class="stat-val text-indigo">{{ totalDigitales }}</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon physical"><i class="fas fa-cash-register"></i></div>
          <div class="stat-content">
            <span class="stat-label">Cobro en Sucursales</span>
            <span class="stat-val text-amber">{{ totalFisicos }}</span>
          </div>
        </div>
      </div>

      <!-- Grid de Métodos de Pago -->
      <div class="methods-grid">
        <div *ngFor="let m of metodos" class="method-card glass-panel" [class.inactive]="!m.activo">
          <div class="card-top">
            <div class="method-icon-wrap" [ngClass]="getMethodColorClass(m.codigo)">
              <i class="fas" [ngClass]="m.icono || 'fa-credit-card'"></i>
            </div>
            
            <div class="card-badges">
              <span class="type-pill" [ngClass]="m.tipo.toLowerCase()">{{ m.tipo }}</span>
              <span class="status-pill" [class.active]="m.activo">
                <span class="status-dot"></span>
                {{ m.activo ? 'HABILITADO' : 'DESACTIVADO' }}
              </span>
            </div>
          </div>

          <div class="card-body">
            <div class="code-tag">{{ m.codigo }}</div>
            <h3 class="method-name">{{ m.nombre }}</h3>
            <p class="method-desc">{{ m.descripcion }}</p>

            <!-- Credenciales Enmascaradas (si requiere) -->
            <div *ngIf="m.requiere_credenciales" class="creds-preview-box">
              <div class="creds-title">
                <i class="fas fa-key"></i> Parámetros de Integración:
              </div>
              <div class="creds-tags">
                <div *ngFor="let item of m.credenciales_enmascaradas | keyvalue" class="cred-chip">
                  <span class="key-name">{{ item.key }}:</span>
                  <span class="masked-val">{{ item.value || 'Sin configurar' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <!-- Toggle Switch iOS Style -->
            <div class="toggle-control-group" (click)="toggleMetodo(m)">
              <div class="ios-switch" [class.checked]="m.activo">
                <div class="switch-handle"></div>
              </div>
              <span class="toggle-label">{{ m.activo ? 'Canal Operativo' : 'Desactivado' }}</span>
            </div>

            <!-- Botón de Configuración -->
            <button
              *ngIf="m.requiere_credenciales"
              class="btn-configure"
              (click)="openConfigModal(m)"
            >
              <i class="fas fa-cog"></i>
              <span>Configurar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Parametrización y Credenciales -->
      <div *ngIf="showModal && selectedMetodo" class="modal-overlay">
        <div class="modal-card glass-panel">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon" [ngClass]="getMethodColorClass(selectedMetodo.codigo)">
                <i class="fas" [ngClass]="selectedMetodo.icono || 'fa-cog'"></i>
              </div>
              <div>
                <h3>Configurar {{ selectedMetodo.nombre }}</h3>
                <span class="modal-sub">Código: {{ selectedMetodo.codigo }} | Tipo: {{ selectedMetodo.tipo }}</span>
              </div>
            </div>
            <button class="btn-close-modal" (click)="closeModal()"><i class="fas fa-times"></i></button>
          </div>

          <form (submit)="guardarConfiguracion($event)" class="modal-form">
            <div class="modal-body">
              <p class="form-instructions">
                Modifique las llaves criptográficas y parámetros de conexión. Los valores con asteriscos representan claves existentes que se preservarán si no se modifican.
              </p>

              <div *ngFor="let field of currentFields" class="form-group">
                <label>{{ field.label }}</label>
                <div class="input-toggle-wrap">
                  <input
                    [type]="field.isSecret && !field.showText ? 'password' : 'text'"
                    [(ngModel)]="editForm[field.key]"
                    [name]="field.key"
                    [placeholder]="field.placeholder"
                    class="config-input"
                  />
                  <button
                    *ngIf="field.isSecret"
                    type="button"
                    class="btn-eye-toggle"
                    (click)="field.showText = !field.showText"
                    title="Alternar visibilidad de clave"
                  >
                    <i class="fas" [class.fa-eye]="!field.showText" [class.fa-eye-slash]="field.showText"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn-save" [disabled]="isSaving">
                <i class="fas" [class.fa-save]="!isSaving" [class.fa-spinner]="isSaving" [class.fa-spin]="isSaving"></i>
                <span>{{ isSaving ? 'Guardando en BD...' : 'Guardar Parámetros' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-pagos-container {
      padding: 1.5rem 2rem 3rem;
      min-height: calc(100vh - 65px);
      background: #090d16;
      color: #f8fafc;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.75rem;
      border-radius: 14px;
      margin-bottom: 1.5rem;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1.15rem;
    }
    .icon-badge {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      color: white;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
    }
    .header-breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      color: #94a3b8;
      margin-bottom: 0.2rem;
    }
    .header-breadcrumb a {
      color: #818cf8;
      text-decoration: none;
    }
    .page-title {
      font-size: 1.35rem;
      font-weight: 800;
      margin: 0;
      color: #fff;
    }
    .page-subtitle {
      font-size: 0.82rem;
      color: #94a3b8;
      margin: 0.2rem 0 0;
    }
    .btn-refresh {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 0.65rem 1.15rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-refresh:hover:not(:disabled) {
      background: rgba(99, 102, 241, 0.2);
      border-color: #6366f1;
      color: #fff;
    }

    /* Stats Row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .stat-icon.total { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .stat-icon.active { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .stat-icon.digital { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .stat-icon.physical { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    .stat-label {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
    }
    .stat-val {
      font-size: 1.45rem;
      font-weight: 800;
      color: #fff;
    }
    .text-success { color: #34d399; }
    .text-indigo { color: #818cf8; }
    .text-amber { color: #fbbf24; }

    /* Grid de Métodos */
    .methods-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.25rem;
    }
    .method-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 1.35rem;
      display: flex;
      flex-direction: column;
      transition: all 0.25s;
    }
    .method-card:hover {
      border-color: rgba(99, 102, 241, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    }
    .method-card.inactive {
      opacity: 0.7;
      border-color: rgba(239, 68, 68, 0.2);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .method-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
    .icon-green { background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .icon-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; }
    .icon-indigo { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; }
    .icon-purple { background: linear-gradient(135deg, #a855f7, #7e22ce); color: white; }

    .card-badges {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.35rem;
    }
    .type-pill {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
    }
    .type-pill.digital { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .type-pill.fisico { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .type-pill.omnicanal { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      background: rgba(239, 68, 68, 0.12);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.25);
    }
    .status-pill.active {
      background: rgba(16, 185, 129, 0.12);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.3);
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .card-body {
      flex: 1;
    }
    .code-tag {
      font-size: 0.68rem;
      font-family: monospace;
      color: #818cf8;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .method-name {
      font-size: 1.05rem;
      font-weight: 800;
      margin: 0 0 0.4rem;
      color: #fff;
    }
    .method-desc {
      font-size: 0.8rem;
      color: #94a3b8;
      line-height: 1.4;
      margin: 0 0 1rem;
    }

    .creds-preview-box {
      background: rgba(30, 41, 59, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 0.65rem 0.75rem;
      margin-bottom: 1rem;
    }
    .creds-title {
      font-size: 0.7rem;
      color: #94a3b8;
      font-weight: 700;
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .creds-tags {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .cred-chip {
      display: flex;
      justify-content: space-between;
      font-size: 0.7rem;
    }
    .cred-chip .key-name {
      color: #64748b;
      font-family: monospace;
    }
    .cred-chip .masked-val {
      color: #cbd5e1;
      font-family: monospace;
      font-weight: 600;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      margin-top: auto;
    }

    /* Toggle Switch iOS Style */
    .toggle-control-group {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      cursor: pointer;
      user-select: none;
    }
    .ios-switch {
      width: 44px;
      height: 24px;
      border-radius: 12px;
      background: #334155;
      position: relative;
      transition: all 0.25s;
    }
    .ios-switch.checked {
      background: #10b981;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
    }
    .switch-handle {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ffffff;
      position: absolute;
      top: 3px;
      left: 3px;
      transition: all 0.25s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .ios-switch.checked .switch-handle {
      left: 23px;
    }
    .toggle-label {
      font-size: 0.78rem;
      font-weight: 700;
      color: #cbd5e1;
    }

    .btn-configure {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #818cf8;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;
    }
    .btn-configure:hover {
      background: #6366f1;
      color: white;
    }

    /* Modal */
    .modal-overlay {
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
      z-index: 1000;
      padding: 1rem;
    }
    .modal-card {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      max-width: 520px;
      width: 100%;
      padding: 1.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .modal-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .modal-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .modal-title-wrap h3 {
      font-size: 1.1rem;
      font-weight: 800;
      margin: 0;
      color: #fff;
    }
    .modal-sub {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .btn-close-modal {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1rem;
      cursor: pointer;
    }
    .form-instructions {
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 1.25rem;
      line-height: 1.4;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      color: #cbd5e1;
      margin-bottom: 0.35rem;
    }
    .input-toggle-wrap {
      position: relative;
    }
    .config-input {
      width: 100%;
      background: rgba(30, 41, 59, 0.7);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 0.65rem 2.5rem 0.65rem 0.85rem;
      font-size: 0.85rem;
      font-family: monospace;
      color: #fff;
      outline: none;
      transition: all 0.2s;
    }
    .config-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.25);
    }
    .btn-eye-toggle {
      position: absolute;
      right: 0.65rem;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .btn-eye-toggle:hover {
      color: #fff;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .btn-cancel {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
    }
    .btn-save {
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
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }
    .btn-save:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  `]
})
export class AdminPagosConfigComponent implements OnInit {
  pagoConfig = inject(PagoConfigService);
  toast = inject(ToastService);

  metodos: MetodoPagoResponse[] = [];
  isLoading: boolean = false;

  // Modal
  showModal: boolean = false;
  selectedMetodo?: MetodoPagoResponse;
  currentFields: CredFieldDef[] = [];
  editForm: { [key: string]: string } = {};
  isSaving: boolean = false;

  get totalActivos(): number {
    return this.metodos.filter(m => m.activo).length;
  }

  get totalDigitales(): number {
    return this.metodos.filter(m => m.tipo === 'DIGITAL').length;
  }

  get totalFisicos(): number {
    return this.metodos.filter(m => m.tipo === 'FISICO').length;
  }

  ngOnInit() {
    this.cargarMetodos();
  }

  cargarMetodos() {
    this.isLoading = true;
    this.pagoConfig.getMetodos().subscribe({
      next: (data) => {
        this.metodos = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toast.error('Error de Configuración', 'No se pudieron cargar los métodos de pago.');
      }
    });
  }

  getMethodColorClass(codigo: string): string {
    switch (codigo) {
      case 'EFECTIVO': return 'icon-green';
      case 'TARJETA_POS': return 'icon-blue';
      case 'STRIPE': return 'icon-indigo';
      case 'QR_BCB': return 'icon-purple';
      default: return 'icon-blue';
    }
  }

  toggleMetodo(metodo: MetodoPagoResponse) {
    const nuevoEstado = !metodo.activo;
    // Actualización optimista en UI
    metodo.activo = nuevoEstado;

    this.pagoConfig.actualizarMetodo(metodo.id_metodo, { activo: nuevoEstado }).subscribe({
      next: (updated) => {
        metodo.activo = updated.activo;
        const msg = updated.activo
          ? `El canal '${metodo.nombre}' fue habilitado.`
          : `El canal '${metodo.nombre}' fue desactivado temporalmente.`;
        this.toast.success('Estado Actualizado', msg);
      },
      error: (err) => {
        // Revertir estado ante fallo
        metodo.activo = !nuevoEstado;
        const msg = err.error?.detail || 'No se pudo actualizar el estado del método de pago.';
        this.toast.error('Fallo al Actualizar', msg);
      }
    });
  }

  openConfigModal(metodo: MetodoPagoResponse) {
    this.selectedMetodo = metodo;
    this.editForm = {};
    this.currentFields = this.buildFieldDefinitions(metodo.codigo);

    // Inicializar formulario con los valores enmascarados actuales
    for (const f of this.currentFields) {
      this.editForm[f.key] = metodo.credenciales_enmascaradas[f.key] || '';
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedMetodo = undefined;
    this.editForm = {};
  }

  private buildFieldDefinitions(codigo: string): CredFieldDef[] {
    switch (codigo) {
      case 'STRIPE':
        return [
          { key: 'publishable_key', label: 'Stripe Publishable Key (pk_test_...)', placeholder: 'pk_test_...', isSecret: false },
          { key: 'secret_key', label: 'Stripe Secret Key (sk_test_...)', placeholder: 'sk_test_...', isSecret: true },
          { key: 'webhook_secret', label: 'Stripe Webhook Signing Secret (whsec_...)', placeholder: 'whsec_...', isSecret: true }
        ];
      case 'TARJETA_POS':
        return [
          { key: 'terminal_id', label: 'Identificador de Terminal (Datafast PinPad)', placeholder: 'POS-DATAFAST-XXX', isSecret: false },
          { key: 'banco_adquirente', label: 'Entidad Bancaria Adquirente', placeholder: 'Banco Mercantil Santa Cruz', isSecret: false }
        ];
      case 'QR_BCB':
        return [
          { key: 'banco_origen', label: 'Entidad Financiera Emisora', placeholder: 'Banco Central de Bolivia', isSecret: false },
          { key: 'cuenta_recaudacion', label: 'N° Cuenta Corriente de Recaudación', placeholder: '100000XXXXXXX', isSecret: true },
          { key: 'comercio_id', label: 'Código de Comercio Afiliado', placeholder: 'FASHIONSTORE-BO', isSecret: false }
        ];
      default:
        return [
          { key: 'param_1', label: 'Parámetro de Integración', placeholder: 'Valor', isSecret: false }
        ];
    }
  }

  guardarConfiguracion(event: Event) {
    event.preventDefault();
    if (!this.selectedMetodo) return;

    this.isSaving = true;

    const updatePayload: MetodoPagoUpdate = {
      credenciales: { ...this.editForm }
    };

    this.pagoConfig.actualizarMetodo(this.selectedMetodo.id_metodo, updatePayload).subscribe({
      next: (updated) => {
        this.isSaving = false;
        // Actualizar datos en memoria
        const idx = this.metodos.findIndex(m => m.id_metodo === updated.id_metodo);
        if (idx >= 0) {
          this.metodos[idx] = updated;
        }
        this.toast.success('Parámetros Guardados', `Credenciales para '${updated.nombre}' actualizadas con éxito.`);
        this.closeModal();
      },
      error: (err) => {
        this.isSaving = false;
        const msg = err.error?.detail || 'Error al guardar las credenciales.';
        this.toast.error('Error de Guardado', msg);
      }
    });
  }
}
