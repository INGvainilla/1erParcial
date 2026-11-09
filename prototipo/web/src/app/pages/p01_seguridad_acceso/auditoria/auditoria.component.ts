import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditBackupService, BitacoraItem, MetricasSeguridad, CuentaBloqueada } from '../../../core/services/audit-backup.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="audit-container">
      <!-- Encabezado con Indicador Multitenant -->
      <div class="audit-header">
        <div>
          <h2><i class="fas fa-shield-alt"></i> Bitácora y Auditoría de Seguridad (CU21 - P2)</h2>
          <p class="subtitle">
            Monitoreo cronológico inmutable de accesos, detección de fuerza bruta y supervisión multitenant.
            <span class="badge-tenant" *ngIf="auth.selectedTenant() as t">
              🏢 Inquilino: {{ t.nombre_comercial }} (ID: {{ t.id_empresa }})
            </span>
            <span class="badge-super" *ngIf="auth.isSuperAdmin() && !auth.selectedTenant()">
              🌐 Modo Global Cross-Tenant (Super Admin)
            </span>
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-export" (click)="exportarCsv()">
            <i class="fas fa-file-download"></i> Exportar Informe SHA-256 (CSV)
          </button>
          <button class="btn-refresh" (click)="cargarTodo()">
            <i class="fas fa-sync-alt" [class.fa-spin]="cargando()"></i> Actualizar
          </button>
        </div>
      </div>

      <!-- Tarjetas de Métricas de Seguridad (24 Horas) -->
      <div class="metrics-grid" *ngIf="metricas() as m">
        <div class="metric-card total">
          <div class="metric-icon"><i class="fas fa-fingerprint"></i></div>
          <div class="metric-data">
            <span class="metric-value">{{ m.total_accesos_24h }}</span>
            <span class="metric-label">Accesos 24h</span>
          </div>
        </div>

        <div class="metric-card success">
          <div class="metric-icon"><i class="fas fa-check-circle"></i></div>
          <div class="metric-data">
            <span class="metric-value">{{ m.total_exitosos_24h }}</span>
            <span class="metric-label">Inicios Exitosos ({{ m.tasa_exito_porcentaje | number:'1.1-1' }}%)</span>
          </div>
        </div>

        <div class="metric-card danger">
          <div class="metric-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="metric-data">
            <span class="metric-value">{{ m.total_fallidos_24h }}</span>
            <span class="metric-label">Intentos Fallidos</span>
          </div>
        </div>

        <div class="metric-card warning">
          <div class="metric-icon"><i class="fas fa-user-lock"></i></div>
          <div class="metric-data">
            <span class="metric-value">{{ m.total_cuentas_bloqueadas }}</span>
            <span class="metric-label">Cuentas Bloqueadas</span>
          </div>
        </div>
      </div>

      <!-- Alertas de Fuerza Bruta / IPs Sospechosas -->
      <div class="alert-banner" *ngIf="metricas()?.ips_sospechosas?.length">
        <div class="alert-title">
          <i class="fas fa-shield-virus"></i> Alerta de Seguridad: Patrones Anómalos Detectados (&ge; 3 Fallos Consecutivos)
        </div>
        <div class="alert-items">
          <span class="sos-tag" *ngFor="let sos of metricas()!.ips_sospechosas">
            <strong>IP {{ sos.ip }}</strong>: {{ sos.intentos_fallidos }} intentos fallidos — {{ sos.alerta }}
          </span>
        </div>
      </div>

      <!-- Sección de Cuentas Bloqueadas con Acción de Desbloqueo -->
      <div class="card-section" *ngIf="cuentasBloqueadas().length > 0">
        <div class="card-section-header">
          <h3><i class="fas fa-user-shield"></i> Cuentas Suspendidas por Políticas de Seguridad</h3>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fallos Consecutivos</th>
              <th>Tiempo Restante</th>
              <th>Acción Inmediata</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of cuentasBloqueadas()">
              <td><strong>{{ c.nombres }} {{ c.apellidos }}</strong></td>
              <td>{{ c.email }}</td>
              <td><span class="role-badge">{{ c.rol }}</span></td>
              <td><span class="fail-badge">{{ c.intentos_fallidos }} fallos</span></td>
              <td>{{ c.minutos_restantes ? (c.minutos_restantes + ' min') : 'Bloqueo Activo' }}</td>
              <td>
                <button class="btn-unlock" (click)="desbloquear(c.id_usuario)">
                  <i class="fas fa-key"></i> Desbloquear Cuenta
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Barra de Filtros Cronológicos y por Evento -->
      <div class="filter-bar">
        <div class="filter-group" *ngIf="auth.isSuperAdmin()">
          <label>Inquilino / Tenant:</label>
          <select [(ngModel)]="filtroTenantId" (change)="onTenantFiltroChange()">
            <option [ngValue]="null">🌐 Todas las Empresas (Modo Global)</option>
            <option *ngFor="let emp of auth.empresas()" [ngValue]="emp.id_empresa">
              🏢 {{ emp.nombre_comercial }} (ID: {{ emp.id_empresa }})
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Tipo de Evento:</label>
          <select [(ngModel)]="filtroTipo" (change)="cargarEventos()">
            <option value="">Todos los Eventos</option>
            <option value="LOGIN_EXITOSO">LOGIN_EXITOSO</option>
            <option value="LOGIN_FALLIDO">LOGIN_FALLIDO</option>
            <option value="ACCESO_SISTEMA">ACCESO_SISTEMA</option>
            <option value="CONSULTA_IA_VOZ">CONSULTA_IA_VOZ</option>
            <option value="CONSULTA_IA">CONSULTA_IA</option>
            <option value="BLOQUEO_INTENTOS">BLOQUEO_INTENTOS</option>
            <option value="DESBLOQUEO_ADMIN">DESBLOQUEO_ADMIN</option>
            <option value="PASSWORD_RESET_SOLICITADO">PASSWORD_RESET_SOLICITADO</option>
            <option value="PASSWORD_RESET_COMPLETADO">PASSWORD_RESET_COMPLETADO</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Estado:</label>
          <select [(ngModel)]="filtroExito" (change)="cargarEventos()">
            <option [ngValue]="null">Todos</option>
            <option [ngValue]="true">Solo Exitosos</option>
            <option [ngValue]="false">Solo Fallidos</option>
          </select>
        </div>

        <div class="filter-group">
          <label>IP Origen:</label>
          <input type="text" [(ngModel)]="filtroIp" placeholder="Ej: 192.168.1.10" (keyup.enter)="cargarEventos()" />
        </div>

        <button class="btn-filter" (click)="cargarEventos()">
          <i class="fas fa-filter"></i> Filtrar
        </button>
      </div>

      <!-- Tabla Principal de Bitácora de Auditoría -->
      <div class="card-section">
        <div class="card-section-header">
          <h3><i class="fas fa-list-alt"></i> Registro de Eventos de Autenticación</h3>
          <span class="count-badge">{{ eventos().length }} registros recuperados</span>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha y Hora</th>
                <th>Evento</th>
                <th>Usuario / Identidad</th>
                <th>IP Origen</th>
                <th>Dispositivo / User-Agent</th>
                <th>Resultado</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ev of eventos()">
                <td class="mono">#{{ ev.id_bitacora }}</td>
                <td>{{ ev.fecha_hora | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                <td>
                  <span class="event-pill" [ngClass]="getEventoClass(ev.tipo_evento)">
                    {{ ev.tipo_evento }}
                  </span>
                </td>
                <td>
                  <div *ngIf="ev.email_usuario || ev.nombre_usuario">
                    <strong>{{ ev.nombre_usuario || 'Usuario' }}</strong>
                    <div class="text-muted small">{{ ev.email_usuario }} ({{ ev.rol_usuario }})</div>
                  </div>
                  <div *ngIf="!ev.email_usuario && !ev.nombre_usuario" class="text-muted italic">
                    Sin vincular (Intento anónimo)
                  </div>
                </td>
                <td class="mono">{{ ev.ip_origen }}</td>
                <td class="small" [title]="ev.user_agent || ''">
                  <i [class]="getDeviceIcon(ev.user_agent)"></i>
                  {{ parseUserAgentShort(ev.user_agent) }}
                </td>
                <td>
                  <span class="status-badge" [class.ok]="ev.exitoso" [class.fail]="!ev.exitoso">
                    {{ ev.exitoso ? 'CORRECTO' : 'RECHAZADO' }}
                  </span>
                </td>
                <td class="small text-muted">{{ ev.motivo || '—' }}</td>
              </tr>
              <tr *ngIf="eventos().length === 0">
                <td colspan="8" class="text-center py-4">
                  No se encontraron eventos con los filtros seleccionados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .audit-container { padding: 1.5rem; max-width: 1400px; margin: 0 auto; }
    .audit-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
    .audit-header h2 { font-size: 1.5rem; margin: 0; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
    .subtitle { color: #64748b; font-size: 0.9rem; margin-top: 0.25rem; }
    .badge-tenant { background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 6px; font-weight: 600; margin-left: 0.5rem; }
    .badge-super { background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 6px; font-weight: 600; margin-left: 0.5rem; }
    
    .header-actions { display: flex; gap: 0.75rem; }
    .btn-export { background: #0f766e; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s; }
    .btn-export:hover { background: #115e59; }
    .btn-refresh { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }

    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .metric-card { background: white; border-radius: 12px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .metric-icon { width: 48px; height: 48px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
    .metric-card.total .metric-icon { background: #eff6ff; color: #2563eb; }
    .metric-card.success .metric-icon { background: #ecfdf5; color: #059669; }
    .metric-card.danger .metric-icon { background: #fef2f2; color: #dc2626; }
    .metric-card.warning .metric-icon { background: #fffbeb; color: #d97706; }
    .metric-data { display: flex; flex-direction: column; }
    .metric-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
    .metric-label { font-size: 0.8rem; color: #64748b; }

    .alert-banner { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 1rem; margin-bottom: 1.5rem; }
    .alert-title { color: #be123c; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; }
    .alert-items { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .sos-tag { background: white; border: 1px solid #fda4af; color: #9f1239; padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; }

    .card-section { background: white; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
    .card-section-header { padding: 1rem 1.25rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
    .card-section-header h3 { font-size: 1.1rem; margin: 0; color: #1e293b; display: flex; align-items: center; gap: 0.5rem; }
    .count-badge { background: #f1f5f9; color: #475569; font-size: 0.8rem; padding: 2px 8px; border-radius: 6px; font-weight: 600; }

    .filter-bar { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
    .filter-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .filter-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
    .filter-group select, .filter-group input { padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.9rem; }
    .btn-filter { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; }

    .data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
    .data-table th { background: #f8fafc; color: #475569; font-weight: 600; padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0; }
    .data-table td { padding: 0.75rem 1rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
    .mono { font-family: monospace; font-size: 0.85rem; }
    .small { font-size: 0.8rem; }
    .text-muted { color: #64748b; }
    .italic { font-style: italic; }

    .event-pill { padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; font-family: monospace; }
    .event-success { background: #ecfdf5; color: #047857; }
    .event-fail { background: #fef2f2; color: #b91c1c; }
    .event-warning { background: #fffbeb; color: #b45309; }
    .event-info { background: #eff6ff; color: #1d4ed8; }

    .status-badge { padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
    .status-badge.ok { background: #ecfdf5; color: #059669; }
    .status-badge.fail { background: #fef2f2; color: #dc2626; }

    .role-badge { background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
    .fail-badge { background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; }
    .btn-unlock { background: #22c55e; color: white; border: none; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.3rem; }
    .btn-unlock:hover { background: #16a34a; }
  `]
})
export class AuditoriaComponent implements OnInit {
  private auditService = inject(AuditBackupService);
  public auth = inject(AuthService);
  private toast = inject(ToastService);

  eventos = signal<BitacoraItem[]>([]);
  metricas = signal<MetricasSeguridad | null>(null);
  cuentasBloqueadas = signal<CuentaBloqueada[]>([]);
  cargando = signal<boolean>(false);

  filtroTenantId: number | null = null;
  filtroTipo = '';
  filtroExito: boolean | null = null;
  filtroIp = '';

  ngOnInit() {
    if (this.auth.isSuperAdmin()) {
      this.filtroTenantId = this.auth.selectedTenant()?.id_empresa ?? null;
    }
    this.cargarTodo();
  }

  onTenantFiltroChange() {
    this.cargarTodo();
  }

  cargarTodo() {
    this.cargarMetricas();
    this.cargarCuentasBloqueadas();
    this.cargarEventos();
  }

  cargarEventos() {
    this.cargando.set(true);
    const params: any = { limit: 150 };
    if (this.filtroTipo) params.tipo_evento = this.filtroTipo;
    if (this.filtroExito !== null) params.exitoso = this.filtroExito;
    if (this.filtroIp) params.ip_origen = this.filtroIp;
    if (this.auth.isSuperAdmin() && this.filtroTenantId !== null) {
      params.id_empresa = this.filtroTenantId;
    }

    this.auditService.getEventos(params).subscribe({
      next: (data) => {
        this.eventos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.toast.error('Auditoría', 'Error al cargar bitácora de auditoría');
        this.cargando.set(false);
      }
    });
  }

  cargarMetricas() {
    const tenantId = this.auth.isSuperAdmin() ? (this.filtroTenantId ?? undefined) : (this.auth.selectedTenant()?.id_empresa ?? undefined);
    this.auditService.getMetricas(tenantId).subscribe({
      next: (m) => this.metricas.set(m),
      error: () => console.warn('No se pudieron obtener métricas de auditoría')
    });
  }

  cargarCuentasBloqueadas() {
    const tenantId = this.auth.isSuperAdmin() ? (this.filtroTenantId ?? undefined) : (this.auth.selectedTenant()?.id_empresa ?? undefined);
    this.auditService.getCuentasBloqueadas(tenantId).subscribe({
      next: (c) => this.cuentasBloqueadas.set(c),
      error: () => console.warn('No se pudieron cargar cuentas bloqueadas')
    });
  }

  desbloquear(idUsuario: number) {
    if (!confirm('¿Confirma que desea desbloquear el acceso para este usuario?')) return;
    this.auditService.desbloquearCuenta(idUsuario).subscribe({
      next: (res) => {
        this.toast.success('Seguridad', res.mensaje || 'Cuenta desbloqueada');
        this.cargarTodo();
      },
      error: () => this.toast.error('Seguridad', 'Error al desbloquear usuario')
    });
  }

  exportarCsv() {
    const tenantId = this.auth.isSuperAdmin() ? this.filtroTenantId : this.auth.selectedTenant()?.id_empresa;
    const params: any = {};
    if (this.filtroTipo) params.tipo_evento = this.filtroTipo;
    if (this.filtroExito !== null) params.exitoso = this.filtroExito;
    if (tenantId && this.auth.isSuperAdmin()) params.id_empresa = tenantId;

    this.auditService.exportarCsv(params).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toast.success('Auditoría', 'Informe exportado exitosamente');
      },
      error: () => this.toast.error('Error', 'No se pudo exportar el informe')
    });
  }

  getEventoClass(tipo: string): string {
    if (tipo.includes('EXITOSO') || tipo.includes('DESBLOQUEO')) return 'event-success';
    if (tipo.includes('FALLIDO') || tipo.includes('BLOQUEO')) return 'event-fail';
    if (tipo.includes('RESET')) return 'event-warning';
    return 'event-info';
  }

  getDeviceIcon(ua?: string): string {
    if (!ua) return 'fas fa-question';
    const lower = ua.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) return 'fas fa-mobile-alt';
    if (lower.includes('mac') || lower.includes('windows') || lower.includes('linux')) return 'fas fa-laptop';
    return 'fas fa-globe';
  }

  parseUserAgentShort(ua?: string): string {
    if (!ua) return 'Desconocido';
    if (ua.includes('Flutter') || ua.includes('Dart')) return 'App Móvil Flutter';
    if (ua.includes('Chrome')) return 'Google Chrome';
    if (ua.includes('Firefox')) return 'Mozilla Firefox';
    if (ua.includes('Safari')) return 'Apple Safari';
    return ua.slice(0, 25);
  }
}
