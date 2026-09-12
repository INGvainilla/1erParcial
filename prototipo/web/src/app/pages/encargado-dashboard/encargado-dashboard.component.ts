import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EncargadoService, ReservaEncargado } from '../../shared/services/encargado.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-encargado-dashboard',
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-left">
          <h1 class="page-title">
            <i class="fas fa-clipboard-list"></i>
            Tablero de Reservas del Día
          </h1>
          <p class="page-subtitle">CU12 — Preparar y Atender Reservas Presenciales</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" (click)="cargarReservas()" [disabled]="isLoading">
            <i class="fas fa-sync-alt" [class.fa-spin]="isLoading"></i>
            Actualizar
          </button>
          <a routerLink="/encargado/escaner" class="btn-scanner">
            <i class="fas fa-qrcode"></i>
            Abrir Escáner QR
          </a>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-card stat-pendiente">
          <div class="stat-icon"><i class="fas fa-clock"></i></div>
          <div class="stat-info">
            <span class="stat-number">{{ pendientes.length }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>
        <div class="stat-card stat-preparada">
          <div class="stat-icon"><i class="fas fa-box-open"></i></div>
          <div class="stat-info">
            <span class="stat-number">{{ preparadas.length }}</span>
            <span class="stat-label">Preparadas</span>
          </div>
        </div>
        <div class="stat-card stat-atendida">
          <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
          <div class="stat-info">
            <span class="stat-number">{{ atendidas.length }}</span>
            <span class="stat-label">Atendidas</span>
          </div>
        </div>
        <div class="stat-card stat-total">
          <div class="stat-icon"><i class="fas fa-calendar-day"></i></div>
          <div class="stat-info">
            <span class="stat-number">{{ todasReservas.length }}</span>
            <span class="stat-label">Total Hoy</span>
          </div>
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="kanban-board" *ngIf="!isLoading && todasReservas.length > 0">
        <!-- Columna PENDIENTES -->
        <div class="kanban-column col-pendiente">
          <div class="column-header">
            <div class="column-title">
              <span class="column-dot dot-pendiente"></span>
              Pendientes
            </div>
            <span class="column-count">{{ pendientes.length }}</span>
          </div>
          <div class="column-body">
            <div class="reserva-card" *ngFor="let r of pendientes" [class.card-processing]="r.id_reserva === processingId">
              <div class="card-header-row">
                <span class="reserva-id">#{{ r.id_reserva }}</span>
                <span class="badge badge-pendiente">PENDIENTE</span>
              </div>
              <div class="card-client">
                <i class="fas fa-user-circle"></i>
                <span>{{ r.nombre_cliente || 'Cliente #' + r.id_usuario }}</span>
              </div>
              <div class="card-time">
                <i class="fas fa-clock"></i>
                <span>{{ formatHora(r.fecha_visita) }}</span>
              </div>
              <div class="card-items">
                <div class="item-row" *ngFor="let d of r.detalles">
                  <span class="item-dot"></span>
                  Producto #{{ d.id_producto }} — {{ d.talla }}/{{ d.color }} x{{ d.cantidad }}
                </div>
              </div>
              <button class="btn-preparar" (click)="prepararReserva(r)" [disabled]="processingId !== null">
                <i class="fas fa-box-open"></i> Marcar como Preparada
              </button>
            </div>
            <div class="column-empty" *ngIf="pendientes.length === 0">
              <i class="fas fa-inbox"></i>
              <span>Sin reservas pendientes</span>
            </div>
          </div>
        </div>

        <!-- Columna PREPARADAS -->
        <div class="kanban-column col-preparada">
          <div class="column-header">
            <div class="column-title">
              <span class="column-dot dot-preparada"></span>
              Preparadas
            </div>
            <span class="column-count">{{ preparadas.length }}</span>
          </div>
          <div class="column-body">
            <div class="reserva-card" *ngFor="let r of preparadas">
              <div class="card-header-row">
                <span class="reserva-id">#{{ r.id_reserva }}</span>
                <span class="badge badge-preparada">PREPARADA</span>
              </div>
              <div class="card-client">
                <i class="fas fa-user-circle"></i>
                <span>{{ r.nombre_cliente || 'Cliente #' + r.id_usuario }}</span>
              </div>
              <div class="card-time">
                <i class="fas fa-clock"></i>
                <span>{{ formatHora(r.fecha_visita) }}</span>
              </div>
              <div class="card-items">
                <div class="item-row" *ngFor="let d of r.detalles">
                  <span class="item-dot"></span>
                  Producto #{{ d.id_producto }} — {{ d.talla }}/{{ d.color }} x{{ d.cantidad }}
                </div>
              </div>
              <div class="card-waiting">
                <i class="fas fa-hourglass-half"></i> Esperando al cliente con QR
              </div>
            </div>
            <div class="column-empty" *ngIf="preparadas.length === 0">
              <i class="fas fa-box"></i>
              <span>Sin reservas preparadas</span>
            </div>
          </div>
        </div>

        <!-- Columna ATENDIDAS -->
        <div class="kanban-column col-atendida">
          <div class="column-header">
            <div class="column-title">
              <span class="column-dot dot-atendida"></span>
              Atendidas
            </div>
            <span class="column-count">{{ atendidas.length }}</span>
          </div>
          <div class="column-body">
            <div class="reserva-card card-completed" *ngFor="let r of atendidas">
              <div class="card-header-row">
                <span class="reserva-id">#{{ r.id_reserva }}</span>
                <span class="badge badge-atendida">ATENDIDA</span>
              </div>
              <div class="card-client">
                <i class="fas fa-user-check"></i>
                <span>{{ r.nombre_cliente || 'Cliente #' + r.id_usuario }}</span>
              </div>
              <div class="card-time">
                <i class="fas fa-check"></i>
                <span>{{ formatHora(r.fecha_visita) }}</span>
              </div>
              <div class="card-items compact">
                <span>{{ r.detalles.length }} producto(s) entregados</span>
              </div>
            </div>
            <div class="column-empty" *ngIf="atendidas.length === 0">
              <i class="fas fa-check-double"></i>
              <span>Aún no se han atendido reservas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && todasReservas.length === 0">
        <div class="empty-icon">
          <i class="fas fa-calendar-times"></i>
        </div>
        <h2>Sin reservas para hoy</h2>
        <p>No hay reservas programadas para el día de hoy en esta sucursal.</p>
        <button class="btn-refresh" (click)="cargarReservas()">
          <i class="fas fa-sync-alt"></i> Reintentar
        </button>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Cargando reservas del día...</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 1.5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin: 0;
    }
    .page-title i { color: #818cf8; }
    .page-subtitle {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .btn-refresh {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .btn-refresh:hover { background: rgba(255,255,255,0.12); color: #ffffff; }
    .btn-scanner {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 700;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
    }
    .btn-scanner:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }

    /* Stats Bar */
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      padding: 1rem 1.2rem;
      border-radius: 12px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.2s;
    }
    .stat-card:hover { background: rgba(255,255,255,0.07); transform: translateY(-2px); }
    .stat-icon {
      width: 42px; height: 42px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem;
    }
    .stat-pendiente .stat-icon { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
    .stat-preparada .stat-icon { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .stat-atendida .stat-icon { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
    .stat-total .stat-icon { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
    .stat-number { font-size: 1.5rem; font-weight: 800; color: #ffffff; }
    .stat-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-info { display: flex; flex-direction: column; }

    /* Kanban Board */
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
      min-height: 400px;
    }
    .kanban-column {
      border-radius: 14px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .column-header {
      padding: 1rem 1.2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
    }
    .column-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .column-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-pendiente { background: #fbbf24; box-shadow: 0 0 8px rgba(251,191,36,0.4); }
    .dot-preparada { background: #60a5fa; box-shadow: 0 0 8px rgba(96,165,250,0.4); }
    .dot-atendida { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.4); }
    .column-count {
      background: rgba(255,255,255,0.1);
      padding: 0.15rem 0.55rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
    }
    .column-body {
      padding: 0.75rem;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* Reserva Card */
    .reserva-card {
      padding: 1rem;
      border-radius: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      transition: all 0.25s;
      animation: slideIn 0.3s ease;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .reserva-card:hover {
      background: rgba(255,255,255,0.08);
      border-color: rgba(255,255,255,0.14);
      transform: translateY(-2px);
    }
    .card-processing { opacity: 0.6; pointer-events: none; }
    .card-completed { opacity: 0.7; }

    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.6rem;
    }
    .reserva-id {
      font-size: 0.82rem;
      font-weight: 800;
      color: #a78bfa;
    }
    .badge {
      font-size: 0.62rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
    }
    .badge-pendiente { background: rgba(251,191,36,0.2); color: #fbbf24; }
    .badge-preparada { background: rgba(59,130,246,0.2); color: #60a5fa; }
    .badge-atendida { background: rgba(34,197,94,0.2); color: #22c55e; }

    .card-client, .card-time {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 0.35rem;
    }
    .card-client i { color: #818cf8; font-size: 0.9rem; }
    .card-time i { color: #94a3b8; }

    .card-items {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .card-items.compact {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .item-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.76rem;
      color: var(--text-secondary);
      padding: 0.15rem 0;
    }
    .item-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #64748b;
      flex-shrink: 0;
    }

    .btn-preparar {
      width: 100%;
      margin-top: 0.75rem;
      padding: 0.55rem 0;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.2s;
      box-shadow: 0 3px 10px rgba(59,130,246,0.25);
    }
    .btn-preparar:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(59,130,246,0.35); }
    .btn-preparar:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .card-waiting {
      margin-top: 0.6rem;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      background: rgba(59,130,246,0.1);
      border: 1px solid rgba(59,130,246,0.2);
      font-size: 0.75rem;
      color: #93c5fd;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .column-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      color: var(--text-muted);
      gap: 0.5rem;
    }
    .column-empty i { font-size: 2rem; opacity: 0.3; }
    .column-empty span { font-size: 0.8rem; }

    /* Empty and Loading States */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }
    .empty-icon {
      width: 80px; height: 80px;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      background: rgba(139,92,246,0.1);
      display: flex; align-items: center; justify-content: center;
    }
    .empty-icon i { font-size: 2rem; color: #a78bfa; }
    .empty-state h2 { font-size: 1.2rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem; }
    .empty-state p { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; }

    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
    }
    .spinner {
      width: 40px; height: 40px;
      margin: 0 auto 1rem;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #818cf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Responsive */
    @media (max-width: 1100px) {
      .kanban-board { grid-template-columns: 1fr; }
      .stats-bar { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .dashboard-container { padding: 1rem; }
      .stats-bar { grid-template-columns: 1fr; }
      .dashboard-header { flex-direction: column; }
    }
  `]
})
export class EncargadoDashboardComponent implements OnInit, OnDestroy {
  todasReservas: ReservaEncargado[] = [];
  pendientes: ReservaEncargado[] = [];
  preparadas: ReservaEncargado[] = [];
  atendidas: ReservaEncargado[] = [];
  isLoading = false;
  processingId: number | null = null;

  private refreshInterval: any;

  private encargadoService = inject(EncargadoService);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.cargarReservas();
    // Auto-refresh cada 30 segundos
    this.refreshInterval = setInterval(() => this.cargarReservas(), 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  cargarReservas(): void {
    this.isLoading = true;
    this.encargadoService.getReservasHoy().subscribe({
      next: (data) => {
        this.todasReservas = data;
        this.clasificarReservas();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error cargando reservas', err);
        this.toast.error('Error', 'No se pudieron cargar las reservas del día.');
      }
    });
  }

  private clasificarReservas(): void {
    this.pendientes = this.todasReservas.filter(r => r.estado === 'PENDIENTE');
    this.preparadas = this.todasReservas.filter(r => r.estado === 'PREPARADA');
    this.atendidas = this.todasReservas.filter(r => r.estado === 'ATENDIDA');
  }

  prepararReserva(reserva: ReservaEncargado): void {
    this.processingId = reserva.id_reserva;
    this.encargadoService.cambiarEstadoReserva(reserva.id_reserva, 'PREPARADA').subscribe({
      next: () => {
        this.toast.success('¡Listo!', `Reserva #${reserva.id_reserva} marcada como PREPARADA.`);
        this.processingId = null;
        this.cargarReservas();
      },
      error: (err) => {
        this.processingId = null;
        const msg = err.error?.detail || 'Error al cambiar el estado.';
        this.toast.error('Error', msg);
      }
    });
  }

  formatHora(fechaIso: string): string {
    try {
      const d = new Date(fechaIso);
      return d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return fechaIso;
    }
  }
}
