import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AuditBackupService,
  RespaldoSnapshot,
  IntegridadResult,
  ProgramacionRespaldo,
  RestaurarResult
} from '../../../core/services/audit-backup.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Empresa } from '../../../core/models/fashion.models';

@Component({
  selector: 'app-backups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="backup-container">
      <!-- Encabezado -->
      <div class="backup-header">
        <div>
          <h2><i class="fas fa-database"></i> Respaldos, Restauración y Automatización Multitenant (CU22 - P2)</h2>
          <p class="subtitle">
            Gestión soberana de snapshots lógicos aislados por inquilino, programación desatendida por fecha/hora y respaldo WAL de infraestructura.
          </p>
          <div class="role-badge-row">
            <span class="badge-role" [class.super]="auth.isSuperAdmin()" [class.tenant]="!auth.isSuperAdmin()">
              <i class="fas" [ngClass]="auth.isSuperAdmin() ? 'fa-crown' : 'fa-building'"></i>
              {{ auth.isSuperAdmin() ? 'SUPER ADMINISTRADOR (Acceso y Control Total)' : 'ADMINISTRADOR DE TENANT' }}
            </span>
            <span class="badge-tenant" *ngIf="tenantActivoNombre() as tName">
              🏢 Inquilino: <strong>{{ tName }}</strong> (ID: {{ getTenantIdFiltro() || 'Global' }})
            </span>
          </div>
        </div>

        <div class="header-actions">
          <!-- Selector de Inquilino para Super Admin -->
          <div class="tenant-filter-box" *ngIf="auth.isSuperAdmin()">
            <label><i class="fas fa-filter"></i> Inquilino:</label>
            <select class="select-tenant" [ngModel]="filtroTenantSuperAdmin" (ngModelChange)="cambiarFiltroTenant($event)">
              <option [ngValue]="null">🌐 Todas las Empresas</option>
              <option *ngFor="let emp of auth.empresas()" [ngValue]="emp.id_empresa">
                🏢 {{ emp.nombre_comercial }} (ID: {{ emp.id_empresa }})
              </option>
            </select>
          </div>

          <button class="btn-primary" (click)="abrirModalGenerar()" [disabled]="generando()">
            <i class="fas fa-save" [class.fa-spin]="generando()"></i> Generar Snapshot a Demanda
          </button>
          <button class="btn-schedule" (click)="abrirModalProgramar()">
            <i class="fas fa-clock"></i> Programar Respaldo Automático
          </button>
          <button class="btn-wal" *ngIf="auth.isSuperAdmin()" (click)="dispararWal()" [disabled]="generandoWal()">
            <i class="fas fa-server" [class.fa-spin]="generandoWal()"></i> Disparar WAL Global
          </button>
          <button class="btn-refresh" (click)="recargarTodo()" title="Actualizar datos">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      <!-- Resumen Informativo de Políticas de Respaldo -->
      <div class="info-grid">
        <div class="info-card">
          <i class="fas fa-lock text-primary"></i>
          <div>
            <strong>Aislamiento Criptográfico SHA-256</strong>
            <p>Cada snapshot extrae de forma atómica únicamente las tuplas del tenant y genera un Checksum inmutable de 64 caracteres.</p>
          </div>
        </div>
        <div class="info-card">
          <i class="fas fa-calendar-alt text-success"></i>
          <div>
            <strong>Programación por Fecha y Hora</strong>
            <p>Permite a cada administrador definir políticas automáticas (única, diaria, semanal o mensual) con ejecución en segundo plano.</p>
          </div>
        </div>
        <div class="info-card">
          <i class="fas fa-history text-warning"></i>
          <div>
            <strong>Restauración Atómica Segura</strong>
            <p>El motor valida el SHA-256 antes de restaurar tuplas del inquilino, asegurando cero fuga de datos cross-tenant.</p>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 1: RESPALDOS AUTOMÁTICOS PROGRAMADOS (CU22) -->
      <div class="card-section mb-4">
        <div class="card-section-header">
          <h3><i class="fas fa-calendar-check"></i> Políticas de Respaldo Automático Programadas (CU22)</h3>
          <span class="count-badge">{{ programaciones().length }} políticas registradas</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th *ngIf="auth.isSuperAdmin()">Empresa</th>
                <th>Nombre de la Política</th>
                <th>Fecha y Hora Programada</th>
                <th>Frecuencia</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Última Ejecución</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of programaciones()">
                <td class="mono">#{{ p.id_programacion }}</td>
                <td *ngIf="auth.isSuperAdmin()">
                  <span class="tenant-pill">{{ p.nombre_empresa || ('Tenant #' + p.id_empresa) }}</span>
                </td>
                <td><strong>{{ p.nombre }}</strong></td>
                <td>
                  <i class="far fa-clock text-primary"></i>
                  {{ p.fecha_hora_programada | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td>
                  <span class="freq-badge" [ngClass]="p.frecuencia.toLowerCase()">
                    {{ p.frecuencia }}
                  </span>
                </td>
                <td>{{ p.hora_ejecucion || '--:--' }}</td>
                <td>
                  <span class="status-badge" [class.ok]="p.activo && p.estado === 'PROGRAMADO'" [class.warn]="p.estado === 'EJECUTADO'" [class.err]="!p.activo || p.estado === 'CANCELADO'">
                    {{ p.estado }}
                  </span>
                </td>
                <td>
                  <span *ngIf="p.fecha_ultima_ejecucion">{{ p.fecha_ultima_ejecucion | date:'dd/MM/yyyy HH:mm' }}</span>
                  <span *ngIf="!p.fecha_ultima_ejecucion" class="text-muted small">Pendiente</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-action run" *ngIf="p.activo" (click)="ejecutarProgramacionAhora(p.id_programacion)" title="Ejecutar de inmediato esta regla">
                      <i class="fas fa-play"></i> Ejecutar
                    </button>
                    <button class="btn-action cancel" *ngIf="p.activo" (click)="cancelarProgramacion(p.id_programacion)" title="Cancelar política">
                      <i class="fas fa-ban"></i> Cancelar
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="programaciones().length === 0">
                <td [attr.colspan]="auth.isSuperAdmin() ? 9 : 8" class="text-center py-4 text-muted">
                  <i class="fas fa-calendar-times fa-2x mb-2" style="opacity: 0.3;"></i>
                  <p>No se registran políticas de respaldo automático programadas. Haga clic en <strong>Programar Respaldo Automático</strong> para configurar una con fecha y hora.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECCIÓN 2: HISTORIAL DE SNAPSHOTS DISPONIBLES (CU22) -->
      <div class="card-section">
        <div class="card-section-header">
          <h3><i class="fas fa-archive"></i> Historial de Snapshots Disponibles para Descarga y Restauración</h3>
          <span class="count-badge">{{ snapshots().length }} respaldos registrados</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th *ngIf="auth.isSuperAdmin()">Empresa</th>
                <th>Fecha y Hora</th>
                <th>Tipo</th>
                <th>Tamaño</th>
                <th>Registros</th>
                <th>Checksum SHA-256</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of snapshots()">
                <td class="mono">#{{ s.id_respaldo }}</td>
                <td *ngIf="auth.isSuperAdmin()">
                  <span class="tenant-pill">Tenant #{{ s.id_empresa }}</span>
                </td>
                <td>{{ s.fecha_creacion | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                <td>
                  <span class="type-badge" [class.tenant]="s.tipo_respaldo === 'SNAPSHOT_TENANT'">
                    {{ s.tipo_respaldo }}
                  </span>
                </td>
                <td>{{ s.tamano_mb | number:'1.2-2' }} MB <span class="text-muted small">({{ s.tamano_bytes | number }} B)</span></td>
                <td><strong>{{ s.total_registros }}</strong> tuplas</td>
                <td>
                  <div class="sha-container" [title]="s.checksum_sha256">
                    <span class="sha-text">{{ s.checksum_sha256.slice(0, 14) }}...{{ s.checksum_sha256.slice(-6) }}</span>
                    <button class="btn-copy" (click)="copiarSha(s.checksum_sha256)" title="Copiar Hash SHA-256">
                      <i class="fas fa-copy"></i>
                    </button>
                  </div>
                </td>
                <td>
                  <span class="status-badge" [class.ok]="s.estado === 'COMPLETADO'">
                    {{ s.estado }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-action check" (click)="verificarIntegridad(s.id_respaldo)" title="Verificar Integridad Criptográfica SHA-256">
                      <i class="fas fa-check-double"></i> Verificar
                    </button>
                    <button class="btn-action restore" (click)="restaurarSnapshot(s.id_respaldo, s.id_empresa)" title="Restaurar datos de este respaldo en la BD">
                      <i class="fas fa-history"></i> Restaurar
                    </button>
                    <button class="btn-action download" (click)="descargar(s.id_respaldo)" title="Descargar Respaldo Seguro (.json.gz)">
                      <i class="fas fa-download"></i> Descargar
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="snapshots().length === 0">
                <td [attr.colspan]="auth.isSuperAdmin() ? 9 : 8" class="text-center py-4">
                  No se registran respaldos previos. Haga clic en <strong>Generar Snapshot a Demanda</strong> para emitir el primero.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL: PROGRAMAR RESPALDO AUTOMÁTICO (FECHA Y HORA) -->
      <div class="modal-backdrop" *ngIf="modalProgramarAbierto()">
        <div class="modal-card">
          <div class="modal-header">
            <h3><i class="fas fa-calendar-plus text-primary"></i> Programar Respaldo Automático (CU22)</h3>
            <button class="btn-close" (click)="cerrarModalProgramar()"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <p class="modal-desc">
              Configure la fecha y hora de ejecución automática para generar copias de seguridad de su base de datos.
            </p>

            <div class="form-group" *ngIf="auth.isSuperAdmin()">
              <label>Empresa Destinataria (Exclusivo Super Admin):</label>
              <select class="form-control" [(ngModel)]="formProgramacion.id_empresa">
                <option *ngFor="let emp of auth.empresas()" [ngValue]="emp.id_empresa">
                  🏢 {{ emp.nombre_comercial }} (ID: {{ emp.id_empresa }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Nombre Descriptivo de la Política:</label>
              <input type="text" class="form-control" [(ngModel)]="formProgramacion.nombre" placeholder="Ej: Respaldo Fin de Mes">
            </div>

            <div class="form-row">
              <div class="form-group col">
                <label>Fecha y Hora Programada de Ejecución:</label>
                <input type="datetime-local" class="form-control" [(ngModel)]="formProgramacion.fecha_hora_programada">
                <small class="text-muted">Elija la fecha y hora exacta en la que se disparará el respaldo.</small>
              </div>

              <div class="form-group col">
                <label>Frecuencia de Recurrencia:</label>
                <select class="form-control" [(ngModel)]="formProgramacion.frecuencia">
                  <option value="UNA_VEZ">Solo Una Vez (Fecha exacta)</option>
                  <option value="DIARIO">Diario (Cada 24 horas)</option>
                  <option value="SEMANAL">Semanal (Cada 7 días)</option>
                  <option value="MENSUAL">Mensual (Cada 30 días)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Hora Sugerida de Ejecución (HH:MM):</label>
              <input type="time" class="form-control" [(ngModel)]="formProgramacion.hora_ejecucion">
            </div>

            <div class="form-group">
              <label>Alcance de Tablas:</label>
              <div class="scope-info">
                <i class="fas fa-check-circle text-success"></i> Se respaldarán todas las tablas operativas del inquilino (Empresa, Sucursales, Usuarios, Productos, Inventario, Kardex CPP, Órdenes, Reservas, Devoluciones y Auditoría).
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" (click)="cerrarModalProgramar()">Cancelar</button>
            <button class="btn-primary" (click)="guardarProgramacion()" [disabled]="guardandoProg()">
              <i class="fas fa-check" [class.fa-spin]="guardandoProg()"></i> Confirmar y Programar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backup-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .backup-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .backup-header h2 { font-size: 1.5rem; margin: 0; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
    .subtitle { color: #64748b; font-size: 0.9rem; margin-top: 0.25rem; }

    .role-badge-row { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .badge-role { padding: 3px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem; }
    .badge-role.super { background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; }
    .badge-role.tenant { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; }
    .badge-tenant { background: #f1f5f9; color: #334155; padding: 3px 10px; border-radius: 6px; font-size: 0.8rem; border: 1px solid #cbd5e1; }

    .header-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
    .tenant-filter-box { display: flex; align-items: center; gap: 0.4rem; background: white; padding: 4px 8px; border-radius: 8px; border: 1px solid #cbd5e1; }
    .tenant-filter-box label { font-size: 0.8rem; font-weight: 600; color: #475569; }
    .select-tenant { border: none; background: transparent; font-size: 0.85rem; font-weight: 600; color: #1e293b; outline: none; cursor: pointer; }

    .btn-primary { background: #2563eb; color: white; border: none; padding: 0.6rem 1.1rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-schedule { background: #059669; color: white; border: none; padding: 0.6rem 1.1rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
    .btn-schedule:hover { background: #047857; }
    .btn-wal { background: #7c3aed; color: white; border: none; padding: 0.6rem 1.1rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
    .btn-wal:hover { background: #6d28d9; }
    .btn-refresh { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 0.6rem 1rem; border-radius: 8px; cursor: pointer; }

    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .info-card { background: white; border-radius: 10px; border: 1px solid #e2e8f0; padding: 1rem; display: flex; align-items: flex-start; gap: 1rem; }
    .info-card i { font-size: 1.5rem; margin-top: 0.2rem; }
    .info-card strong { color: #1e293b; font-size: 0.95rem; }
    .info-card p { margin: 0.25rem 0 0 0; color: #64748b; font-size: 0.85rem; line-height: 1.4; }
    .text-primary { color: #2563eb; }
    .text-success { color: #059669; }
    .text-warning { color: #d97706; }

    .card-section { background: white; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
    .card-section.mb-4 { margin-bottom: 1.5rem; }
    .card-section-header { padding: 1rem 1.25rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .card-section-header h3 { font-size: 1.1rem; margin: 0; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
    .count-badge { background: #f1f5f9; color: #475569; font-size: 0.8rem; padding: 2px 8px; border-radius: 6px; font-weight: 600; }

    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    .data-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .mono { font-family: monospace; font-size: 0.85rem; }
    .small { font-size: 0.8rem; }
    .text-muted { color: #64748b; }

    .tenant-pill { background: #f1f5f9; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .type-badge { padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; background: #f1f5f9; color: #475569; }
    .type-badge.tenant { background: #e0f2fe; color: #0369a1; }

    .freq-badge { padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
    .freq-badge.una_vez { background: #f1f5f9; color: #475569; }
    .freq-badge.diario { background: #dcfce7; color: #15803d; }
    .freq-badge.semanal { background: #e0f2fe; color: #0369a1; }
    .freq-badge.mensual { background: #f3e8ff; color: #7e22ce; }

    .sha-container { display: flex; align-items: center; gap: 0.4rem; background: #f8fafc; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; width: fit-content; }
    .sha-text { font-family: monospace; font-size: 0.75rem; color: #334155; }
    .btn-copy { background: transparent; border: none; cursor: pointer; color: #64748b; font-size: 0.8rem; padding: 2px; }
    .btn-copy:hover { color: #0f172a; }

    .status-badge { padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
    .status-badge.ok { background: #ecfdf5; color: #059669; }
    .status-badge.warn { background: #fffbeb; color: #d97706; }
    .status-badge.err { background: #fef2f2; color: #b91c1c; }

    .action-buttons { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .btn-action { border: none; padding: 0.35rem 0.65rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
    .btn-action.check { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .btn-action.check:hover { background: #dcfce7; }
    .btn-action.restore { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
    .btn-action.restore:hover { background: #ffedd5; }
    .btn-action.download { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .btn-action.download:hover { background: #dbeafe; }
    .btn-action.run { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .btn-action.cancel { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

    /* MODAL */
    .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-card { background: white; border-radius: 14px; width: 100%; max-width: 600px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2); overflow: hidden; }
    .modal-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .modal-header h3 { margin: 0; font-size: 1.2rem; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
    .btn-close { background: transparent; border: none; font-size: 1.2rem; color: #64748b; cursor: pointer; }
    .modal-body { padding: 1.5rem; }
    .modal-desc { color: #64748b; font-size: 0.9rem; margin-top: 0; margin-bottom: 1rem; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: #334155; margin-bottom: 0.35rem; }
    .form-control { width: 100%; padding: 0.55rem 0.75rem; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.9rem; outline: none; }
    .form-control:focus { border-color: #2563eb; }
    .form-row { display: flex; gap: 1rem; }
    .form-row .col { flex: 1; }
    .scope-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; font-size: 0.85rem; color: #475569; }
    .modal-footer { padding: 1rem 1.5rem; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; }
    .btn-cancel { background: white; border: 1px solid #cbd5e1; padding: 0.55rem 1.1rem; border-radius: 8px; cursor: pointer; font-weight: 600; color: #475569; }
  `]
})
export class BackupsComponent implements OnInit {
  private backupService = inject(AuditBackupService);
  public auth = inject(AuthService);
  private toast = inject(ToastService);

  snapshots = signal<RespaldoSnapshot[]>([]);
  programaciones = signal<ProgramacionRespaldo[]>([]);
  generando = signal<boolean>(false);
  generandoWal = signal<boolean>(false);
  modalProgramarAbierto = signal<boolean>(false);
  guardandoProg = signal<boolean>(false);

  filtroTenantSuperAdmin: number | null = null;

  formProgramacion = {
    id_empresa: null as number | null,
    nombre: 'Respaldo Automático Programado',
    fecha_hora_programada: '',
    frecuencia: 'DIARIO',
    hora_ejecucion: '02:00'
  };

  ngOnInit() {
    this.recargarTodo();
  }

  getTenantIdFiltro(): number | null {
    if (this.auth.isSuperAdmin()) {
      return this.filtroTenantSuperAdmin;
    }
    return this.auth.getActiveEmpresaId() ?? null;
  }

  tenantActivoNombre(): string {
    if (this.auth.isSuperAdmin()) {
      if (this.filtroTenantSuperAdmin) {
        const emp = this.auth.empresas().find(e => e.id_empresa === this.filtroTenantSuperAdmin);
        return emp ? emp.nombre_comercial : `Empresa #${this.filtroTenantSuperAdmin}`;
      }
      return 'Todas las Empresas (Modo Global)';
    }
    return this.auth.getNombreEmpresa() || 'Mi Empresa';
  }

  cambiarFiltroTenant(idEmpresa: number | null) {
    this.filtroTenantSuperAdmin = idEmpresa;
    this.recargarTodo();
  }

  recargarTodo() {
    this.cargarHistorial();
    this.cargarProgramaciones();
  }

  cargarHistorial() {
    const tenantId = this.getTenantIdFiltro();
    this.backupService.getHistorialRespaldos(tenantId ?? undefined).subscribe({
      next: (data) => this.snapshots.set(data || []),
      error: () => this.toast.error('Respaldos', 'Error al cargar historial de respaldos')
    });
  }

  cargarProgramaciones() {
    const tenantId = this.getTenantIdFiltro();
    this.backupService.getProgramaciones(tenantId ?? undefined).subscribe({
      next: (data) => this.programaciones.set(data || []),
      error: () => this.toast.error('Programación', 'Error al cargar respaldos programados')
    });
  }

  abrirModalGenerar() {
    const targetTenant = this.getTenantIdFiltro();
    const promptMsg = targetTenant
      ? `Generar snapshot inmediato para la Empresa #${targetTenant}. Ingrese una nota:`
      : 'Generar snapshot inmediato. Ingrese una nota descriptiva:';

    const comentario = prompt(promptMsg, 'Respaldo a demanda desde Web Desktop');
    if (comentario === null) return;

    this.generando.set(true);
    this.toast.info('Respaldos', 'Extrayendo tuplas aisladas y calculando Checksum SHA-256...');

    this.backupService.generarSnapshot(comentario, targetTenant ?? undefined).subscribe({
      next: (snap) => {
        this.toast.success(
          'Respaldos',
          `Snapshot #${snap.id_respaldo} generado con éxito (${snap.tamano_mb.toFixed(2)} MB, ${snap.total_registros} tuplas)`
        );
        this.generando.set(false);
        this.cargarHistorial();
      },
      error: (err) => {
        this.toast.error('Respaldos', err?.error?.detail || 'Error al generar snapshot');
        this.generando.set(false);
      }
    });
  }

  abrirModalProgramar() {
    // Inicializar fecha y hora para mañana a las 02:00
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    manana.setHours(2, 0, 0, 0);

    const year = manana.getFullYear();
    const month = String(manana.getMonth() + 1).padStart(2, '0');
    const day = String(manana.getDate()).padStart(2, '0');
    const hours = String(manana.getHours()).padStart(2, '0');
    const minutes = String(manana.getMinutes()).padStart(2, '0');

    this.formProgramacion = {
      id_empresa: this.getTenantIdFiltro() || (this.auth.empresas().length > 0 ? this.auth.empresas()[0].id_empresa : 1),
      nombre: 'Respaldo Nocturno Automático',
      fecha_hora_programada: `${year}-${month}-${day}T${hours}:${minutes}`,
      frecuencia: 'DIARIO',
      hora_ejecucion: '02:00'
    };

    this.modalProgramarAbierto.set(true);
  }

  cerrarModalProgramar() {
    this.modalProgramarAbierto.set(false);
  }

  guardarProgramacion() {
    if (!this.formProgramacion.fecha_hora_programada) {
      alert('Debe seleccionar una fecha y hora programada de ejecución.');
      return;
    }

    this.guardandoProg.set(true);
    const targetTenant = this.auth.isSuperAdmin() ? this.formProgramacion.id_empresa : (this.auth.getActiveEmpresaId() ?? undefined);

    const payload = {
      id_empresa: targetTenant ?? undefined,
      nombre: this.formProgramacion.nombre || 'Respaldo Programado',
      fecha_hora_programada: new Date(this.formProgramacion.fecha_hora_programada).toISOString(),
      frecuencia: this.formProgramacion.frecuencia,
      hora_ejecucion: this.formProgramacion.hora_ejecucion,
      tablas_alcance: undefined
    };

    this.backupService.crearProgramacion(payload).subscribe({
      next: (res) => {
        this.toast.success('Programación', `Política #${res.id_programacion} registrada exitosamente para ${res.frecuencia}.`);
        this.guardandoProg.set(false);
        this.cerrarModalProgramar();
        this.cargarProgramaciones();
      },
      error: (err) => {
        this.toast.error('Programación', err?.error?.detail || 'Error al guardar la política');
        this.guardandoProg.set(false);
      }
    });
  }

  ejecutarProgramacionAhora(idProgramacion: number) {
    if (!confirm(`¿Desea forzar la ejecución inmediata de la política #${idProgramacion}?`)) return;
    this.toast.info('Programación', 'Disparando snapshot de la regla programada...');
    this.backupService.ejecutarProgramacion(idProgramacion).subscribe({
      next: (snap) => {
        this.toast.success('Programación', `Snapshot #${snap.id_respaldo} generado exitosamente (${snap.total_registros} tuplas).`);
        this.recargarTodo();
      },
      error: (err) => this.toast.error('Programación', err?.error?.detail || 'Error al ejecutar la regla')
    });
  }

  cancelarProgramacion(idProgramacion: number) {
    if (!confirm(`¿Confirma que desea cancelar y desactivar la política #${idProgramacion}?`)) return;
    this.backupService.cancelarProgramacion(idProgramacion).subscribe({
      next: () => {
        this.toast.success('Programación', 'Política cancelada y desactivada correctamente.');
        this.cargarProgramaciones();
      },
      error: (err) => this.toast.error('Programación', err?.error?.detail || 'Error al cancelar política')
    });
  }

  verificarIntegridad(idRespaldo: number) {
    this.toast.info('Integridad', 'Comprobando Checksum SHA-256 contra el binario en almacenamiento...');
    this.backupService.verificarIntegridad(idRespaldo).subscribe({
      next: (res: IntegridadResult) => {
        if (res.integro) {
          alert(`✅ INTEGRIDAD CRIPTOGRÁFICA VERIFICADA\n\nEl archivo en disco coincide exactamente con el Checksum SHA-256 registrado en la base de datos:\n\nSHA-256: ${res.checksum_calculado}\nTamaño: ${res.tamano_bytes} bytes\n\nResultado: Auténtico e inalterado.`);
        } else {
          alert(`❌ ALERTA DE INTEGRIDAD\n\nEl Checksum no coincide:\nEsperado: ${res.checksum_registrado}\nCalculado: ${res.checksum_calculado}`);
        }
      },
      error: () => this.toast.error('Integridad', 'Error al verificar integridad del archivo')
    });
  }

  restaurarSnapshot(idRespaldo: number, idEmpresa: number) {
    const msg = `⚠️ CONFIRMACIÓN DE RESTAURACIÓN (CU22)\n\n¿Está completamente seguro de restaurar el Snapshot #${idRespaldo} en la Empresa #${idEmpresa}?\n\nEsta operación:\n1. Verificará matemáticamente el Checksum SHA-256.\n2. Sobreescribirá las tuplas del inquilino bajo transacción atómica.\n3. Registrará el evento en la Bitácora de Auditoría.`;

    if (!confirm(msg)) return;

    this.toast.info('Restauración', 'Validando SHA-256 y restaurando tablas del inquilino...');
    this.backupService.restaurarRespaldo(idRespaldo).subscribe({
      next: (res: RestaurarResult) => {
        alert(`✅ RESTAURACIÓN COMPLETADA CON ÉXITO\n\n${res.mensaje}\n\nTablas restauradas: ${res.tablas_restauradas.join(', ')}\nChecksum verificado: ${res.checksum_verificado}`);
        this.toast.success('Restauración', `Restauradas ${res.total_tuplas_restauradas} tuplas exitosamente.`);
        this.cargarHistorial();
      },
      error: (err) => {
        alert(`❌ ERROR EN RESTAURACIÓN\n\n${err?.error?.detail || 'No se pudo completar la restauración'}`);
        this.toast.error('Restauración', 'Fallo al restaurar el respaldo');
      }
    });
  }

  descargar(idRespaldo: number) {
    this.backupService.descargarRespaldo(idRespaldo).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snapshot_${idRespaldo}.json.gz`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toast.success('Descarga', 'Archivo de respaldo descargado exitosamente');
      },
      error: () => this.toast.error('Error', 'No se pudo descargar el archivo de respaldo')
    });
  }

  dispararWal() {
    if (!confirm('¿Confirma que desea disparar un respaldo físico WAL / PITR de toda la infraestructura? (Exclusivo Super Admin)')) return;
    this.generandoWal.set(true);
    this.backupService.dispararWalGlobal().subscribe({
      next: (res) => {
        this.toast.success('WAL Global', `Backup WAL global registrado (${res.nombre_archivo})`);
        this.generandoWal.set(false);
        this.cargarHistorial();
      },
      error: () => {
        this.toast.error('WAL Global', 'Error al disparar WAL de infraestructura');
        this.generandoWal.set(false);
      }
    });
  }

  copiarSha(sha: string) {
    navigator.clipboard.writeText(sha);
    this.toast.success('Portapapeles', 'Checksum SHA-256 copiado al portapapeles');
  }
}
