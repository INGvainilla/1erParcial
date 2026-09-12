import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LogisticaService, OrdenLogistica, RepartidorDisponible } from '../../core/services/logistica.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-logistica-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="logistica-page">
      <!-- HEADER -->
      <div class="page-header">
        <div class="header-titles">
          <div class="header-badge">
            <i class="fas fa-truck"></i> MÓDULO DE DISTRIBUCIÓN
          </div>
          <h1 class="page-title">Tablero de Despacho & Logística</h1>
          <p class="page-subtitle">CU18 — Orquestación de empaque, asignación de couriers y entregas a domicilio</p>
        </div>
        <div class="header-actions">
          <button class="btn-refresh" (click)="cargarOrdenes()" [disabled]="cargando">
            <i class="fas fa-sync-alt" [class.fa-spin]="cargando"></i> Actualizar
          </button>
        </div>
      </div>

      <!-- METRIC COUNTERS -->
      <div class="metrics-grid">
        <div class="metric-card metric-prep">
          <div class="metric-icon"><i class="fas fa-box"></i></div>
          <div class="metric-body">
            <span class="metric-val">{{ ordenesPreparacion.length }}</span>
            <span class="metric-lbl">Por Empacar</span>
          </div>
        </div>
        <div class="metric-card metric-listo">
          <div class="metric-icon"><i class="fas fa-dolly"></i></div>
          <div class="metric-body">
            <span class="metric-val">{{ ordenesListas.length }}</span>
            <span class="metric-lbl">Listas para Despacho</span>
          </div>
        </div>
        <div class="metric-card metric-transito">
          <div class="metric-icon"><i class="fas fa-motorcycle"></i></div>
          <div class="metric-body">
            <span class="metric-val">{{ ordenesTransito.length }}</span>
            <span class="metric-lbl">En Tránsito</span>
          </div>
        </div>
        <div class="metric-card metric-entregadas">
          <div class="metric-icon"><i class="fas fa-check-double"></i></div>
          <div class="metric-body">
            <span class="metric-val">{{ ordenesEntregadas.length }}</span>
            <span class="metric-lbl">Entregadas</span>
          </div>
        </div>
      </div>

      <!-- KANBAN BOARD -->
      <div class="kanban-board">
        <!-- COLUMNA 1: POR EMPACAR (PREPARACION / CREADA) -->
        <div class="kanban-col col-prep">
          <div class="col-header">
            <div class="col-title">
              <span class="status-indicator ind-prep"></span>
              <h3>Por Empacar</h3>
            </div>
            <span class="badge-count">{{ ordenesPreparacion.length }}</span>
          </div>

          <div class="col-content">
            <div *ngIf="ordenesPreparacion.length === 0" class="empty-state">
              <i class="fas fa-check-circle"></i>
              <p>No hay pedidos pendientes de empaque</p>
            </div>

            <div *ngFor="let ord of ordenesPreparacion" class="kanban-card card-prep">
              <div class="card-head">
                <span class="order-id">#{{ ord.id_orden }}</span>
                <span class="invoice-num">{{ ord.numero_factura || 'ORDEN' }}</span>
              </div>

              <div class="client-info">
                <div class="client-name">
                  <i class="fas fa-user"></i>
                  <span>{{ ord.nombre_cliente || 'Cliente Web' }}</span>
                </div>
                <div class="client-phone" *ngIf="ord.telefono_contacto">
                  <i class="fas fa-phone"></i> {{ ord.telefono_contacto }}
                </div>
              </div>

              <div class="dest-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ ord.direccion_envio }}</span>
              </div>

              <div class="dist-tag" *ngIf="ord.distancia_km">
                <i class="fas fa-route"></i> Distancia: <strong>{{ ord.distancia_km }} km</strong>
              </div>

              <!-- BOTÓN EXPANDIR PRENDAS -->
              <div class="prendas-section">
                <button class="btn-toggle-prendas" (click)="toggleExpand(ord.id_orden)">
                  <i class="fas" [class.fa-chevron-down]="!isExpanded(ord.id_orden)" [class.fa-chevron-up]="isExpanded(ord.id_orden)"></i>
                  <span>{{ ord.prendas.length }} Prenda(s) para empaque</span>
                </button>

                <div class="prendas-list" *ngIf="isExpanded(ord.id_orden)">
                  <div *ngFor="let p of ord.prendas" class="prenda-row">
                    <span class="prenda-sku">[{{ p.codigo_sku_base }}]</span>
                    <span class="prenda-name">{{ p.nombre_producto }}</span>
                    <span class="prenda-spec">{{ p.talla }} / {{ p.color }} (x{{ p.cantidad }})</span>
                  </div>
                </div>
              </div>

              <div class="card-footer">
                <div class="order-total">Total: Bs. {{ ord.total.toFixed(2) }}</div>
                <button class="btn-action btn-empacar" (click)="marcarListo(ord)" [disabled]="procesandoId === ord.id_orden">
                  <i class="fas fa-box-check"></i> Empacado & Listo
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA 2: LISTAS PARA DESPACHO (LISTO_DESPACHO) -->
        <div class="kanban-col col-listo">
          <div class="col-header">
            <div class="col-title">
              <span class="status-indicator ind-listo"></span>
              <h3>Listas para Despacho</h3>
            </div>
            <span class="badge-count">{{ ordenesListas.length }}</span>
          </div>

          <div class="col-content">
            <div *ngIf="ordenesListas.length === 0" class="empty-state">
              <i class="fas fa-box-open"></i>
              <p>Sin pedidos listos para recojo</p>
            </div>

            <div *ngFor="let ord of ordenesListas" class="kanban-card card-listo">
              <div class="card-head">
                <span class="order-id">#{{ ord.id_orden }}</span>
                <span class="badge-ready"><i class="fas fa-check"></i> EMBALADO</span>
              </div>

              <div class="client-info">
                <div class="client-name">
                  <i class="fas fa-user"></i>
                  <span>{{ ord.nombre_cliente || 'Cliente Web' }}</span>
                </div>
                <div class="client-phone" *ngIf="ord.telefono_contacto">
                  <i class="fas fa-phone"></i> {{ ord.telefono_contacto }}
                </div>
              </div>

              <div class="dest-info">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ ord.direccion_envio }}</span>
              </div>

              <div class="dist-tag" *ngIf="ord.distancia_km">
                <i class="fas fa-route"></i> Distancia: <strong>{{ ord.distancia_km }} km</strong>
              </div>

              <div class="card-footer">
                <button class="btn-action btn-asignar" (click)="abrirModalAsignar(ord)">
                  <i class="fas fa-motorcycle"></i> Asignar Repartidor
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA 3: EN TRÁNSITO (EN_TRANSITO) -->
        <div class="kanban-col col-transito">
          <div class="col-header">
            <div class="col-title">
              <span class="status-indicator ind-transito"></span>
              <h3>En Tránsito</h3>
            </div>
            <span class="badge-count">{{ ordenesTransito.length }}</span>
          </div>

          <div class="col-content">
            <div *ngIf="ordenesTransito.length === 0" class="empty-state">
              <i class="fas fa-road"></i>
              <p>No hay repartos en ruta activa</p>
            </div>

            <div *ngFor="let ord of ordenesTransito" class="kanban-card card-transito">
              <div class="card-head">
                <span class="order-id">#{{ ord.id_orden }}</span>
                <span class="badge-in-route"><i class="fas fa-biking fa-beat"></i> EN RUTA</span>
              </div>

              <div class="courier-badge">
                <i class="fas fa-id-badge"></i>
                <div>
                  <strong>{{ ord.nombre_repartidor }}</strong>
                  <span *ngIf="ord.telefono_repartidor"> | {{ ord.telefono_repartidor }}</span>
                </div>
              </div>

              <div class="client-info">
                <div class="client-name">
                  <i class="fas fa-user"></i>
                  <span>{{ ord.nombre_cliente }}</span>
                </div>
                <div class="dest-info">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ ord.direccion_envio }}</span>
                </div>
              </div>

              <div class="card-footer card-footer-split">
                <a [routerLink]="['/tracking', ord.id_orden]" target="_blank" class="btn-tracking-link">
                  <i class="fas fa-satellite-dish"></i> Tracking
                </a>
                <button class="btn-action btn-entregar" (click)="marcarEntregada(ord)" [disabled]="procesandoId === ord.id_orden">
                  <i class="fas fa-check-circle"></i> Entregada
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA 4: ENTREGADAS (ENTREGADA) -->
        <div class="kanban-col col-entregadas">
          <div class="col-header">
            <div class="col-title">
              <span class="status-indicator ind-entregada"></span>
              <h3>Entregadas</h3>
            </div>
            <span class="badge-count">{{ ordenesEntregadas.length }}</span>
          </div>

          <div class="col-content">
            <div *ngIf="ordenesEntregadas.length === 0" class="empty-state">
              <i class="fas fa-history"></i>
              <p>Sin entregas completadas hoy</p>
            </div>

            <div *ngFor="let ord of ordenesEntregadas" class="kanban-card card-entregada">
              <div class="card-head">
                <span class="order-id">#{{ ord.id_orden }}</span>
                <span class="badge-success"><i class="fas fa-check-circle"></i> ENTREGADA</span>
              </div>

              <div class="client-info">
                <div class="client-name">
                  <i class="fas fa-user"></i>
                  <span>{{ ord.nombre_cliente }}</span>
                </div>
                <div class="dest-info">
                  <i class="fas fa-map-pin"></i>
                  <span>{{ ord.direccion_envio }}</span>
                </div>
              </div>

              <div class="delivered-meta">
                <span>Repartidor: {{ ord.nombre_repartidor || 'Courier Externo' }}</span>
                <span class="meta-date">{{ ord.creado_en | date:'short' }}</span>
              </div>

              <div class="card-footer">
                <a [routerLink]="['/tracking', ord.id_orden]" target="_blank" class="btn-tracking-link btn-block">
                  <i class="fas fa-receipt"></i> Ver Comprobante & Tracking
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL ASIGNAR REPARTIDOR -->
      <div class="modal-backdrop" *ngIf="mostrarModalAsignar">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title">
              <i class="fas fa-motorcycle"></i> Asignar Repartidor o Courier
            </div>
            <button class="btn-close" (click)="cerrarModalAsignar()">&times;</button>
          </div>

          <div class="modal-body" *ngIf="ordenSeleccionada">
            <p class="modal-desc">
              Seleccione el personal de logística o ingrese los datos de la empresa de courier encargada del despacho de la orden <strong>#{{ ordenSeleccionada.id_orden }}</strong>.
            </p>

            <div class="form-group">
              <label>Seleccionar de la Flota Interna:</label>
              <select class="form-control" (change)="seleccionarRepartidorFlota($event)">
                <option value="">-- Asignación Manual o Courier Externo --</option>
                <option *ngFor="let rep of repartidores" [value]="rep.id_usuario">
                  {{ rep.nombre_completo }} ({{ rep.rol }}) - Tel: {{ rep.telefono }}
                </option>
              </select>
            </div>

            <div class="form-divider"><span>O INGRESO DIRECTO</span></div>

            <div class="form-group">
              <label>Nombre del Repartidor / Empresa Courier *:</label>
              <input type="text" class="form-control" [(ngModel)]="nombreRepartidorInput" placeholder="Ej: Carlos Gómez o PedidosYa Express" />
            </div>

            <div class="form-group">
              <label>Teléfono de Contacto del Conductor:</label>
              <input type="text" class="form-control" [(ngModel)]="telefonoRepartidorInput" placeholder="Ej: 71234567" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" (click)="cerrarModalAsignar()">Cancelar</button>
            <button class="btn-confirm" (click)="confirmarAsignacion()" [disabled]="!nombreRepartidorInput.trim() || procesandoId !== null">
              <i class="fas fa-paper-plane"></i> Asignar y Poner en Tránsito
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .logistica-page {
      padding: 1.5rem 2rem;
      color: #f1f5f9;
      min-height: calc(100vh - 64px);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 1rem;
    }

    .header-badge {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #38bdf8;
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 0.25rem 0;
    }

    .page-subtitle {
      font-size: 0.88rem;
      color: #94a3b8;
      margin: 0;
    }

    .btn-refresh {
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
      border: 1px solid rgba(255,255,255,0.15);
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s ease;
    }

    .btn-refresh:hover {
      background: rgba(255,255,255,0.12);
      border-color: #38bdf8;
      color: #38bdf8;
    }

    /* METRICS */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.75rem;
    }

    .metric-card {
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 1.1rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
    }

    .metric-prep .metric-icon { background: rgba(234, 179, 8, 0.15); color: #eab308; }
    .metric-listo .metric-icon { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
    .metric-transito .metric-icon { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
    .metric-entregadas .metric-icon { background: rgba(34, 197, 94, 0.15); color: #22c55e; }

    .metric-val {
      display: block;
      font-size: 1.6rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
    }

    .metric-lbl {
      font-size: 0.8rem;
      color: #94a3b8;
      font-weight: 500;
    }

    /* KANBAN */
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      align-items: start;
    }

    .kanban-col {
      background: #0b1120;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 270px);
      overflow: hidden;
    }

    .col-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.9rem 1.1rem;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
    }

    .col-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .col-title h3 {
      font-size: 0.95rem;
      font-weight: 700;
      margin: 0;
      color: #e2e8f0;
    }

    .status-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .ind-prep { background: #eab308; box-shadow: 0 0 8px rgba(234, 179, 8, 0.6); }
    .ind-listo { background: #38bdf8; box-shadow: 0 0 8px rgba(56, 189, 248, 0.6); }
    .ind-transito { background: #a855f7; box-shadow: 0 0 8px rgba(168, 85, 247, 0.6); }
    .ind-entregada { background: #22c55e; box-shadow: 0 0 8px rgba(34, 197, 94, 0.6); }

    .badge-count {
      background: rgba(255,255,255,0.08);
      color: #94a3b8;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 12px;
    }

    .col-content {
      padding: 0.85rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .empty-state {
      padding: 2.5rem 1rem;
      text-align: center;
      color: #64748b;
    }

    .empty-state i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      opacity: 0.4;
    }

    .empty-state p {
      font-size: 0.82rem;
      margin: 0;
    }

    /* KANBAN CARDS */
    .kanban-card {
      background: #131d33;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 1rem;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .kanban-card:hover {
      border-color: rgba(56, 189, 248, 0.35);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-id {
      font-weight: 800;
      font-size: 0.95rem;
      color: #f8fafc;
    }

    .invoice-num {
      font-size: 0.75rem;
      color: #94a3b8;
      background: rgba(255,255,255,0.05);
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }

    .badge-ready {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .badge-in-route {
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .badge-success {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .client-info {
      font-size: 0.82rem;
      color: #cbd5e1;
    }

    .client-name {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 600;
      color: #f1f5f9;
    }

    .client-phone {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.2rem;
    }

    .dest-info {
      font-size: 0.78rem;
      color: #94a3b8;
      display: flex;
      align-items: flex-start;
      gap: 0.4rem;
      line-height: 1.3;
    }

    .dest-info i {
      color: #ef4444;
      margin-top: 2px;
    }

    .dist-tag {
      font-size: 0.75rem;
      background: rgba(255,255,255,0.04);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      color: #cbd5e1;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      width: fit-content;
    }

    .dist-tag i { color: #38bdf8; }

    .courier-badge {
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.25);
      border-radius: 6px;
      padding: 0.4rem 0.6rem;
      font-size: 0.78rem;
      color: #e9d5ff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .courier-badge i { font-size: 0.9rem; color: #c084fc; }

    .delivered-meta {
      font-size: 0.75rem;
      color: #94a3b8;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .meta-date {
      color: #64748b;
      font-size: 0.7rem;
    }

    /* PRENDAS */
    .prendas-section {
      background: rgba(0,0,0,0.2);
      border-radius: 6px;
      overflow: hidden;
    }

    .btn-toggle-prendas {
      width: 100%;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.75rem;
      padding: 0.35rem 0.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      text-align: left;
    }

    .btn-toggle-prendas:hover {
      color: #38bdf8;
    }

    .prendas-list {
      padding: 0.4rem 0.6rem;
      border-top: 1px solid rgba(255,255,255,0.05);
      font-size: 0.72rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .prenda-row {
      display: flex;
      gap: 0.3rem;
      color: #cbd5e1;
    }

    .prenda-sku { color: #f59e0b; font-family: monospace; }
    .prenda-name { font-weight: 500; }
    .prenda-spec { color: #94a3b8; margin-left: auto; }

    /* FOOTER & BUTTONS */
    .card-footer {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-top: 0.2rem;
    }

    .card-footer-split {
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
    }

    .order-total {
      font-size: 0.85rem;
      font-weight: 700;
      color: #f8fafc;
      text-align: right;
    }

    .btn-action {
      width: 100%;
      padding: 0.55rem;
      border-radius: 6px;
      border: none;
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
    }

    .btn-empacar {
      background: #eab308;
      color: #020617;
    }

    .btn-empacar:hover {
      background: #facc15;
    }

    .btn-asignar {
      background: #0284c7;
      color: #ffffff;
    }

    .btn-asignar:hover {
      background: #38bdf8;
    }

    .btn-entregar {
      background: #16a34a;
      color: #ffffff;
      flex: 1;
    }

    .btn-entregar:hover {
      background: #22c55e;
    }

    .btn-tracking-link {
      background: rgba(255,255,255,0.06);
      color: #cbd5e1;
      padding: 0.55rem 0.75rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.78rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      border: 1px solid rgba(255,255,255,0.1);
      transition: all 0.2s ease;
    }

    .btn-tracking-link:hover {
      background: rgba(255,255,255,0.12);
      color: #38bdf8;
      border-color: #38bdf8;
    }

    .btn-block { width: 100%; }

    /* MODAL */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-card {
      background: #0f172a;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 14px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.1rem 1.25rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.02);
    }

    .modal-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.4rem;
      cursor: pointer;
    }

    .modal-body {
      padding: 1.25rem;
    }

    .modal-desc {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-top: 0;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 0.35rem;
    }

    .form-control {
      width: 100%;
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px;
      padding: 0.65rem 0.8rem;
      color: #ffffff;
      font-size: 0.88rem;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #38bdf8;
    }

    .form-divider {
      text-align: center;
      margin: 1.2rem 0;
      position: relative;
    }

    .form-divider::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 1px;
      background: rgba(255,255,255,0.1);
    }

    .form-divider span {
      position: relative;
      background: #0f172a;
      padding: 0 0.8rem;
      font-size: 0.72rem;
      color: #64748b;
      font-weight: 700;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.02);
    }

    .btn-cancel {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      color: #94a3b8;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .btn-confirm {
      background: #0284c7;
      border: none;
      color: #ffffff;
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-confirm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class LogisticaDashboardComponent implements OnInit {
  private logisticaService = inject(LogisticaService);
  private toast = inject(ToastService);

  cargando = false;
  procesandoId: number | null = null;
  ordenes: OrdenLogistica[] = [];
  repartidores: RepartidorDisponible[] = [];

  // Control de expansión de acordeón de prendas
  expandedCards = new Set<number>();

  // Modal de asignación
  mostrarModalAsignar = false;
  ordenSeleccionada: OrdenLogistica | null = null;
  nombreRepartidorInput = '';
  telefonoRepartidorInput = '';
  idRepartidorSeleccionado: number | undefined = undefined;

  ngOnInit(): void {
    this.cargarOrdenes();
    this.cargarRepartidores();
  }

  cargarOrdenes(): void {
    this.cargando = true;
    this.logisticaService.getOrdenes().subscribe({
      next: (res) => {
        this.ordenes = res;
        this.cargando = false;
      },
      error: (err) => {
        this.toast.error('Error', 'No se pudieron recuperar las órdenes de despacho');
        this.cargando = false;
      }
    });
  }

  cargarRepartidores(): void {
    this.logisticaService.getRepartidores().subscribe({
      next: (reps) => {
        this.repartidores = reps;
      },
      error: () => {}
    });
  }

  // Filtrado por columnas Kanban
  get ordenesPreparacion(): OrdenLogistica[] {
    return this.ordenes.filter(o => o.estado_logistica === 'CREADA' || o.estado_logistica === 'PREPARACION');
  }

  get ordenesListas(): OrdenLogistica[] {
    return this.ordenes.filter(o => o.estado_logistica === 'LISTO_DESPACHO');
  }

  get ordenesTransito(): OrdenLogistica[] {
    return this.ordenes.filter(o => o.estado_logistica === 'EN_TRANSITO');
  }

  get ordenesEntregadas(): OrdenLogistica[] {
    return this.ordenes.filter(o => o.estado_logistica === 'ENTREGADA');
  }

  // Acordeón
  toggleExpand(idOrden: number): void {
    if (this.expandedCards.has(idOrden)) {
      this.expandedCards.delete(idOrden);
    } else {
      this.expandedCards.add(idOrden);
    }
  }

  isExpanded(idOrden: number): boolean {
    return this.expandedCards.has(idOrden);
  }

  // Acciones de avance
  marcarListo(ord: OrdenLogistica): void {
    this.procesandoId = ord.id_orden;

    // Si estaba en CREADA, primero avanzar a PREPARACION y luego LISTO_DESPACHO
    if (ord.estado_logistica === 'CREADA') {
      this.logisticaService.cambiarEstado(ord.id_orden, { nuevo_estado: 'PREPARACION' }).subscribe({
        next: () => {
          this.logisticaService.cambiarEstado(ord.id_orden, { nuevo_estado: 'LISTO_DESPACHO' }).subscribe({
            next: (actualizada) => {
              this.procesandoId = null;
              this.toast.success('Orden Empacada', `La orden #${ord.id_orden} está lista para asignación de courier`);
              this.actualizarOrdenEnLista(actualizada);
            },
            error: (err) => {
              this.procesandoId = null;
              this.toast.error('Conflicto Logístico', err.error?.detail || 'No se pudo avanzar el estado');
            }
          });
        },
        error: (err) => {
          this.procesandoId = null;
          this.toast.error('Error', err.error?.detail || 'No se pudo iniciar el empaque');
        }
      });
    } else {
      this.logisticaService.cambiarEstado(ord.id_orden, { nuevo_estado: 'LISTO_DESPACHO' }).subscribe({
        next: (actualizada) => {
          this.procesandoId = null;
          this.toast.success('Orden Empacada', `La orden #${ord.id_orden} está lista para asignación de courier`);
          this.actualizarOrdenEnLista(actualizada);
        },
        error: (err) => {
          this.procesandoId = null;
          this.toast.error('Conflicto Logístico', err.error?.detail || 'No se pudo avanzar el estado');
        }
      });
    }
  }

  abrirModalAsignar(ord: OrdenLogistica): void {
    this.ordenSeleccionada = ord;
    this.nombreRepartidorInput = ord.nombre_repartidor || '';
    this.telefonoRepartidorInput = ord.telefono_repartidor || '';
    this.idRepartidorSeleccionado = ord.id_repartidor;
    this.mostrarModalAsignar = true;
  }

  cerrarModalAsignar(): void {
    this.mostrarModalAsignar = false;
    this.ordenSeleccionada = null;
    this.nombreRepartidorInput = '';
    this.telefonoRepartidorInput = '';
  }

  seleccionarRepartidorFlota(event: any): void {
    const id = Number(event.target.value);
    if (!id) {
      this.idRepartidorSeleccionado = undefined;
      return;
    }
    const rep = this.repartidores.find(r => r.id_usuario === id);
    if (rep) {
      this.idRepartidorSeleccionado = rep.id_usuario;
      this.nombreRepartidorInput = rep.nombre_completo;
      this.telefonoRepartidorInput = rep.telefono;
    }
  }

  confirmarAsignacion(): void {
    if (!this.ordenSeleccionada || !this.nombreRepartidorInput.trim()) return;

    this.procesandoId = this.ordenSeleccionada.id_orden;
    this.logisticaService.asignarRepartidor(this.ordenSeleccionada.id_orden, {
      id_repartidor: this.idRepartidorSeleccionado,
      nombre_repartidor: this.nombreRepartidorInput.trim(),
      telefono_repartidor: this.telefonoRepartidorInput.trim() || undefined
    }).subscribe({
      next: (actualizada) => {
        this.procesandoId = null;
        this.toast.success('Despacho Iniciado', `Courier asignado a la orden #${actualizada.id_orden}. Pedido en tránsito.`);
        this.actualizarOrdenEnLista(actualizada);
        this.cerrarModalAsignar();
      },
      error: (err) => {
        this.procesandoId = null;
        this.toast.error('Error de Asignación', err.error?.detail || 'No se pudo asignar el repartidor');
      }
    });
  }

  marcarEntregada(ord: OrdenLogistica): void {
    this.procesandoId = ord.id_orden;
    this.logisticaService.cambiarEstado(ord.id_orden, { nuevo_estado: 'ENTREGADA' }).subscribe({
      next: (actualizada) => {
        this.procesandoId = null;
        this.toast.success('Entrega Confirmada', `La orden #${ord.id_orden} fue marcada como ENTREGADA`);
        this.actualizarOrdenEnLista(actualizada);
      },
      error: (err) => {
        this.procesandoId = null;
        this.toast.error('Conflicto Logístico', err.error?.detail || 'No se pudo marcar la entrega');
      }
    });
  }

  private actualizarOrdenEnLista(actualizada: OrdenLogistica): void {
    const idx = this.ordenes.findIndex(o => o.id_orden === actualizada.id_orden);
    if (idx !== -1) {
      this.ordenes[idx] = actualizada;
    } else {
      this.ordenes.unshift(actualizada);
    }
  }
}
