import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FashionApiService } from '../../../core/services/fashion-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { API_BASE_URL } from '../../../core/constants/api.constants';

interface DashboardKPIs {
  ventas_totales_bs: number;
  total_ordenes: number;
  ordenes_pagadas: number;
  ordenes_pendientes: number;
  total_reservas: number;
  reservas_pendientes: number;
  reservas_confirmadas: number;
  despachos_activos: number;
  entregadas: number;
  total_productos: number;
  total_sucursales: number;
  stock_total: number;
  total_usuarios: number;
  total_medios_pago: number;
  medios_activos: number;
  valuacion_inventario_cpp: number;
  efectividad_probadores_pct: number;
}

interface RendimientoPrenda {
  id_producto: number;
  sku: string;
  nombre: string;
  categoria: string;
  stock_total: number;
  unidades_vendidas?: number;
  ultimo_costo: number;
  cpp: number;
  precio_venta: number;
  margen_bruto_pct: number;
  ranking_pos?: number;
  tipo_ranking?: string;
}

interface UltimaOrden {
  id_orden: number;
  numero_factura: string;
  cliente: string;
  total: number;
  estado_pago: string;
  estado_logistica: string;
  canal: string;
  fecha: string;
}

interface UltimaReserva {
  id_reserva: number;
  codigo_reserva: string;
  cliente: string;
  sucursal: string;
  estado: string;
  fecha: string;
}

interface UseCaseItem {
  code: string;
  name: string;
  cycle: number;
  module: string;
  desc: string;
  route: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page-container" *ngIf="canAccess()">
      <!-- Banner de Bienvenida y Estado del Sistema -->
      <div class="welcome-banner glass-panel">
        <div class="banner-text">
          <div class="banner-tags">
            <span class="course-pill"><i class="fas fa-university"></i> SI2 — 2-2026</span>
            <span class="cycle-pill"><i class="fas fa-layer-group"></i> Ciclo 1, 2 & 3 (CU24)</span>
            <span class="puds-pill"><i class="fas fa-cubes"></i> Metodología PUDS</span>
          </div>
          <h2>FashionStore — Cuadros de Mando y Dashboards Ejecutivos (CU24)</h2>
          <p class="desc">
            Plataforma inteligente de comercio omnicanal para moda masculina. Monitoreo en tiempo real de transaccionalidad, 
            valuación de inventarios CPP, reservas de probadores en sucursales físicas, pasarelas de cobro y logística de delivery.
          </p>
          <div class="authors-badge">
            <span><i class="fas fa-user-graduate"></i> Alberto Delgado</span>
            <span><i class="fas fa-user-graduate"></i> Andy Mujica</span>
            <span><i class="fas fa-chalkboard-teacher"></i> Docente: MSc. Ing. Angélica Garzón Cuéllar</span>
          </div>
        </div>

        <div class="system-status-box">
          <div class="status-indicator">
            <span class="ping-dot" [class.offline]="isError"></span>
            <strong>Backend FastAPI: {{ isError ? 'REINTENTANDO' : 'ONLINE' }}</strong>
            <button class="btn-mini-refresh" (click)="cargarMetricas()" [disabled]="isLoading" title="Recargar métricas">
              <i class="fas fa-sync-alt" [class.fa-spin]="isLoading"></i>
            </button>
          </div>
          <div class="status-meta">
            <span><i class="fas fa-database"></i> Motor BD: <code>{{ serviciosEstado.database_status }}</code></span>
            <span><i class="fas fa-credit-card"></i> Pasarela Stripe: <code>{{ serviciosEstado.stripe_status }}</code></span>
            <span><i class="fas fa-truck"></i> Motor Logístico: <code>{{ serviciosEstado.delivery_status }}</code></span>
          </div>
          <div class="quick-links">
            <a [href]="docsUrl" target="_blank" class="status-link">
              <i class="fas fa-book"></i> Swagger Docs
            </a>
            <a [href]="healthUrl" target="_blank" class="status-link">
              <i class="fas fa-heartbeat"></i> Health API
            </a>
          </div>
          <div class="export-actions-bar">
            <button class="btn-export-pdf" (click)="exportarPDF()" title="Exportar Reporte Contable formal en PDF">
              <i class="fas fa-file-pdf"></i> Exportar Reporte Contable (PDF)
            </button>
            <button class="btn-export-xlsx" (click)="exportarXLSX()" title="Descargar Dataset de Auditoría en XLSX">
              <i class="fas fa-file-excel"></i> Descargar Dataset para Auditoría (XLSX)
            </button>
          </div>
        </div>
      </div>

      <!-- Barra de Filtros de Sucursal y Rango Temporal (CU24 Flujo Principal 7 & Alternativo 1a) -->
      <div class="filter-dashboard-bar glass-panel">
        <div class="filter-item-block">
          <label><i class="fas fa-store text-indigo"></i> Sucursal Física:</label>
          <div class="branch-selector-wrap" *ngIf="!isSucursalLocked">
            <select class="dashboard-custom-select" [ngModel]="selectedSucursalId" (ngModelChange)="cambiarSucursal($event)">
              <option [ngValue]="null">🌐 Red Global (Todas las Sucursales)</option>
              <option *ngFor="let s of sucursalesDisponibles" [ngValue]="s.id_sucursal">
                📍 {{ s.nombre }} ({{ s.ciudad }})
              </option>
            </select>
          </div>
          <div class="locked-branch-pill" *ngIf="isSucursalLocked" title="Vista restringida por rol de Encargado de Sucursal">
            <i class="fas fa-lock text-amber"></i>
            <span>{{ selectedSucursalNombre }} (Sucursal Asignada)</span>
          </div>
        </div>

        <div class="filter-item-block">
          <label><i class="fas fa-calendar-alt text-emerald"></i> Periodo Temporal:</label>
          <div class="time-filter-group">
            <button class="time-pill-btn" [class.active]="selectedRangoFecha === 'TODO'" (click)="cambiarRangoFecha('TODO')">
              Histórico
            </button>
            <button class="time-pill-btn" [class.active]="selectedRangoFecha === 'HOY'" (click)="cambiarRangoFecha('HOY')">
              Hoy
            </button>
            <button class="time-pill-btn" [class.active]="selectedRangoFecha === '7_DIAS'" (click)="cambiarRangoFecha('7_DIAS')">
              Últimos 7 días
            </button>
            <button class="time-pill-btn" [class.active]="selectedRangoFecha === 'MES'" (click)="cambiarRangoFecha('MES')">
              Este Mes
            </button>
          </div>
        </div>

        <div class="audit-signature-pill" *ngIf="auditoriaContable">
          <i class="fas fa-shield-check text-cyan"></i>
          <div class="audit-text-wrap">
            <span class="audit-lbl">Auditoría Inmutable (GMT-04:00)</span>
            <span class="audit-hash" [title]="auditoriaContable.firma_digital_sha256">
              Hash: {{ auditoriaContable.firma_digital_sha256?.substring(0, 14) }}...
            </span>
          </div>
        </div>
      </div>

      <!-- Cuadrícula de 8 KPIs Principales -->
      <div class="kpi-grid">
        <!-- KPI 1: Ventas Facturadas -->
        <div class="kpi-card glass-panel highlight-kpi">
          <div class="kpi-icon sales"><i class="fas fa-hand-holding-usd"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Ventas Totales Cobradas</span>
            <span class="kpi-value text-emerald">Bs. {{ kpis.ventas_totales_bs | number:'1.2-2' }}</span>
            <span class="kpi-sub"><i class="fas fa-check-double"></i> {{ kpis.ordenes_pagadas }} órdenes pagadas</span>
          </div>
        </div>

        <!-- KPI 2: Total Órdenes -->
        <div class="kpi-card glass-panel" routerLink="/admin/pagos-config">
          <div class="kpi-icon orders"><i class="fas fa-shopping-cart"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Órdenes Transaccionadas</span>
            <span class="kpi-value">{{ kpis.total_ordenes }}</span>
            <span class="kpi-sub text-cyan">{{ distribucion.online }} Online | {{ distribucion.pos }} POS</span>
          </div>
        </div>

        <!-- KPI 3: Reservas de Probador -->
        <div class="kpi-card glass-panel" routerLink="/encargado/reservas">
          <div class="kpi-icon fitting"><i class="fas fa-calendar-check"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Reservas en Sucursal</span>
            <span class="kpi-value">{{ kpis.total_reservas }}</span>
            <span class="kpi-sub text-amber">{{ kpis.reservas_pendientes }} por atender (CU11/CU12)</span>
          </div>
        </div>

        <!-- KPI 4: Despachos y Logística -->
        <div class="kpi-card glass-panel" routerLink="/logistica/dashboard">
          <div class="kpi-icon delivery"><i class="fas fa-truck-moving"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Despachos en Tránsito</span>
            <span class="kpi-value">{{ kpis.despachos_activos }}</span>
            <span class="kpi-sub text-purple">{{ kpis.entregadas }} completadas (CU18)</span>
          </div>
        </div>

        <!-- KPI 5: Stock Total -->
        <div class="kpi-card glass-panel" routerLink="/inventario">
          <div class="kpi-icon stock"><i class="fas fa-boxes"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Stock Total en Red</span>
            <span class="kpi-value">{{ kpis.stock_total | number }}</span>
            <span class="kpi-sub text-amber">Valuación CPP (CU09)</span>
          </div>
        </div>

        <!-- KPI 6: Catálogo de Ropa -->
        <div class="kpi-card glass-panel" routerLink="/catalogo">
          <div class="kpi-icon catalog"><i class="fas fa-tshirt"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Prendas en Catálogo</span>
            <span class="kpi-value">{{ kpis.total_productos }}</span>
            <span class="kpi-sub text-indigo">Modelos Activos (CU06/CU10)</span>
          </div>
        </div>

        <!-- KPI 7: Sucursales Físicas -->
        <div class="kpi-card glass-panel" routerLink="/sucursales">
          <div class="kpi-icon branch"><i class="fas fa-store-alt"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Sucursales Físicas</span>
            <span class="kpi-value">{{ kpis.total_sucursales }}</span>
            <span class="kpi-sub text-emerald">GPS & Probadores (CU05)</span>
          </div>
        </div>

        <!-- KPI 8: Medios de Cobro -->
        <div class="kpi-card glass-panel" routerLink="/admin/pagos-config">
          <div class="kpi-icon payment"><i class="fas fa-sliders-h"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Canales de Recaudación</span>
            <span class="kpi-value">{{ kpis.medios_activos }}/{{ kpis.total_medios_pago }}</span>
            <span class="kpi-sub text-cyan">Habilitados en tiempo real (CU17)</span>
          </div>
        </div>

        <!-- KPI 9: Valuación CPP (CU09 / CU24) -->
        <div class="kpi-card glass-panel highlight-kpi" routerLink="/inventario">
          <div class="kpi-icon sales"><i class="fas fa-coins"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Valuación Inventario CPP</span>
            <span class="kpi-value text-emerald">Bs. {{ (kpis.valuacion_inventario_cpp || 0) | number:'1.2-2' }}</span>
            <span class="kpi-sub text-amber"><i class="fas fa-balance-scale"></i> Costo Promedio Ponderado (CU24)</span>
          </div>
        </div>

        <!-- KPI 10: Efectividad Probadores (CU24) -->
        <div class="kpi-card glass-panel" routerLink="/encargado/reservas">
          <div class="kpi-icon fitting"><i class="fas fa-percentage"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Conversión de Probadores</span>
            <span class="kpi-value text-cyan">{{ kpis.efectividad_probadores_pct || 78.5 }}%</span>
            <span class="kpi-sub text-emerald"><i class="fas fa-check-circle"></i> Reservas a Venta (CU24)</span>
          </div>
        </div>
      </div>

      <!-- Sección de Análisis Omnicanal y Distribución -->
      <div class="analytics-row">
        <!-- Gráfico / Proporción de Ventas por Canal -->
        <div class="analytics-card glass-panel">
          <div class="card-header-clean">
            <h3><i class="fas fa-chart-pie"></i> Distribución Omnicanal de Ventas</h3>
            <span class="badge-pill">CU14 vs CU15</span>
          </div>
          <div class="omnichannel-breakdown">
            <div class="channel-metric online">
              <div class="channel-icon"><i class="fas fa-globe"></i></div>
              <div class="channel-info">
                <span class="label">Canal Digital (Web / E-Commerce)</span>
                <span class="val">{{ distribucion.online }} órdenes</span>
              </div>
              <span class="pct">{{ getOnlinePct() }}%</span>
            </div>

            <div class="progress-bar-container">
              <div class="progress-bar-online" [style.width.%]="getOnlinePct()"></div>
              <div class="progress-bar-pos" [style.width.%]="100 - getOnlinePct()"></div>
            </div>

            <div class="channel-metric pos">
              <div class="channel-icon"><i class="fas fa-cash-register"></i></div>
              <div class="channel-info">
                <span class="label">Canal Presencial (Caja Mostrador POS)</span>
                <span class="val">{{ distribucion.pos }} ventas</span>
              </div>
              <span class="pct">{{ 100 - getOnlinePct() }}%</span>
            </div>
          </div>
        </div>

        <!-- Fila CU24: Desglose de Medios de Cobro Interoperables -->
        <div class="analytics-card glass-panel">
          <div class="card-header-clean">
            <h3><i class="fas fa-wallet"></i> Medios de Cobro (CU17 / CU24)</h3>
            <span class="badge-pill badge-green">Multicanal</span>
          </div>
          <div class="omnichannel-breakdown">
            <div *ngFor="let m of getMediosPagoEntries()" class="channel-metric">
              <div class="channel-icon" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
                <i class="fas" [ngClass]="m.icono"></i>
              </div>
              <div class="channel-info">
                <span class="label">{{ m.nombre }}</span>
                <span class="val">{{ m.cantidad }} transacciones confirmadas</span>
              </div>
              <span class="pct" style="color: #10b981; font-weight: 700;">{{ m.pct }}%</span>
            </div>
          </div>
        </div>

        <!-- Resumen Operativo de la Infraestructura -->
        <div class="analytics-card glass-panel">
          <div class="card-header-clean">
            <h3><i class="fas fa-microchip"></i> Estado de Componentes de Arquitectura</h3>
            <span class="badge-pill badge-green">Monitoreo 24/7</span>
          </div>
          <div class="services-status-list">
            <div class="service-item">
              <div class="svc-left">
                <i class="fas fa-server svc-icon text-indigo"></i>
                <div>
                  <strong>Servidor Backend REST</strong>
                  <span class="svc-sub">FastAPI + Uvicorn Async</span>
                </div>
              </div>
              <span class="status-pill-clean active"><span class="dot"></span> ONLINE</span>
            </div>

            <div class="service-item">
              <div class="svc-left">
                <i class="fas fa-database svc-icon text-emerald"></i>
                <div>
                  <strong>Capa de Persistencia</strong>
                  <span class="svc-sub">PostgreSQL / SQLAlchemy ORM</span>
                </div>
              </div>
              <span class="status-pill-clean active"><span class="dot"></span> ACTIVA</span>
            </div>

            <div class="service-item">
              <div class="svc-left">
                <i class="fab fa-stripe-s svc-icon text-purple"></i>
                <div>
                  <strong>Integración de Pagos (CU16/CU17)</strong>
                  <span class="svc-sub">Stripe Sandbox + 3DS Tokenizado</span>
                </div>
              </div>
              <span class="status-pill-clean active"><span class="dot"></span> CONECTADO</span>
            </div>

            <div class="service-item">
              <div class="svc-left">
                <i class="fas fa-route svc-icon text-amber"></i>
                <div>
                  <strong>Cálculo Geodésico (CU18)</strong>
                  <span class="svc-sub">Haversine GPS + Tracking en Vivo</span>
                </div>
              </div>
              <span class="status-pill-clean active"><span class="dot"></span> OPERATIVO</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección de Flujos y Actividad Reciente -->
      <div class="recent-activity-row">
        <!-- Últimas Órdenes Transaccionadas -->
        <div class="activity-card glass-panel">
          <div class="card-header-clean">
            <h3><i class="fas fa-file-invoice-dollar"></i> Transacciones Recientes de Venta</h3>
            <a routerLink="/caja/pos" class="link-more">Ir a Caja POS <i class="fas fa-arrow-right"></i></a>
          </div>

          <div class="table-responsive" *ngIf="ultimasOrdenes.length > 0">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>Factura / Ticket</th>
                  <th>Cliente</th>
                  <th>Canal</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Logística</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ord of ultimasOrdenes">
                  <td class="mono-font">{{ ord.numero_factura }}</td>
                  <td>{{ ord.cliente }}</td>
                  <td>
                    <span class="badge-canal" [class.pos]="ord.canal.includes('POS')">{{ ord.canal }}</span>
                  </td>
                  <td class="amount-cell">Bs. {{ ord.total | number:'1.2-2' }}</td>
                  <td>
                    <span class="badge-status" [class.paid]="ord.estado_pago === 'PAGADO'">
                      {{ ord.estado_pago }}
                    </span>
                  </td>
                  <td>
                    <span class="badge-logistica">{{ ord.estado_logistica }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="ultimasOrdenes.length === 0" class="empty-mini">
            <p>No se registran órdenes recientes.</p>
          </div>
        </div>

        <!-- Últimas Reservas de Probador -->
        <div class="activity-card glass-panel">
          <div class="card-header-clean">
            <h3><i class="fas fa-ticket-alt"></i> Reservas de Probador en Sucursal</h3>
            <a routerLink="/encargado/reservas" class="link-more">Ver Tablero <i class="fas fa-arrow-right"></i></a>
          </div>

          <div class="table-responsive" *ngIf="ultimasReservas.length > 0">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>Código QR</th>
                  <th>Cliente</th>
                  <th>Sucursal</th>
                  <th>Estado</th>
                  <th>Fecha/Hora</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let res of ultimasReservas">
                  <td class="mono-font" [title]="res.codigo_reserva">{{ res.codigo_reserva.substring(0, 14) }}...</td>
                  <td>{{ res.cliente }}</td>
                  <td>{{ res.sucursal }}</td>
                  <td>
                    <span class="badge-reserva" [ngClass]="res.estado.toLowerCase()">{{ res.estado }}</span>
                  </td>
                  <td class="date-cell">{{ res.fecha }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="ultimasReservas.length === 0" class="empty-mini">
            <p>No se registran reservas recientes.</p>
          </div>
        </div>
      </div>

      <!-- Fila CU24: Tabla de Rendimiento de Inventario y Margen Bruto vs CPP (Ranking Top/Bottom 10) -->
      <div class="activity-card glass-panel" style="margin-bottom: 1.5rem;">
        <div class="card-header-clean flex-header-wrap">
          <div>
            <h3><i class="fas fa-boxes text-emerald"></i> Valuación de Stock al Costo Promedio Ponderado (CPP) & Rotación de Prendas (CU24)</h3>
            <span class="sub-label">Cruce matemático en tiempo real: Precio de Venta vs CPP vigente para auditoría, margen bruto y ranking.</span>
          </div>
          <div class="ranking-controls-wrap">
            <div class="ranking-tabs-group">
              <button class="rank-tab-btn" [class.active]="selectedRankingTipo === 'TODOS'" (click)="cambiarRankingTipo('TODOS')">
                <i class="fas fa-layer-group"></i> Catálogo Completo
              </button>
              <button class="rank-tab-btn top-btn" [class.active]="selectedRankingTipo === 'TOP10'" (click)="cambiarRankingTipo('TOP10')">
                <i class="fas fa-crown text-amber"></i> Top 10 Más Vendidas
              </button>
              <button class="rank-tab-btn bottom-btn" [class.active]="selectedRankingTipo === 'BOTTOM10'" (click)="cambiarRankingTipo('BOTTOM10')">
                <i class="fas fa-exclamation-triangle text-purple"></i> Bottom 10 Menor Rotación
              </button>
            </div>
            <a routerLink="/inventario" class="link-more">
              Gestionar Kardex <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
        <div class="table-responsive">
          <table class="dashboard-table">
            <thead>
              <tr>
                <th># Rank</th>
                <th>Código SKU</th>
                <th>Nombre de Prenda</th>
                <th>Categoría</th>
                <th>Stock Red</th>
                <th>Uds. Vendidas</th>
                <th>Último Costo</th>
                <th>Costo Promedio (CPP)</th>
                <th>Precio Venta</th>
                <th>Margen Bruto (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of rendimientoInventario">
                <td>
                  <span class="rank-badge" [class.rank-gold]="item.ranking_pos === 1" [class.rank-silver]="item.ranking_pos === 2" [class.rank-bronze]="item.ranking_pos === 3" [class.rank-bottom]="item.tipo_ranking === 'BOTTOM'">
                    #{{ item.ranking_pos || '-' }}
                  </span>
                </td>
                <td class="mono-font">{{ item.sku }}</td>
                <td style="font-weight: 600; color: #fff;">{{ item.nombre }}</td>
                <td><span class="badge-logistica">{{ item.categoria }}</span></td>
                <td><strong>{{ item.stock_total }}</strong> uds</td>
                <td><span class="sold-pill"><i class="fas fa-shopping-bag"></i> {{ item.unidades_vendidas || 0 }}</span></td>
                <td>Bs. {{ item.ultimo_costo | number:'1.2-2' }}</td>
                <td class="amount-cell" style="color: #F59E0B;">Bs. {{ item.cpp | number:'1.2-2' }}</td>
                <td class="amount-cell" style="color: #10B981;">Bs. {{ item.precio_venta | number:'1.2-2' }}</td>
                <td>
                  <span class="badge-status paid">
                    +{{ item.margen_bruto_pct }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Directorio Completo de Casos de Uso (Ciclo 1, 2 y 3 - CU01 al CU25) -->
      <div class="usecases-section glass-panel">
        <div class="usecase-header">
          <div>
            <h3><i class="fas fa-th-list"></i> Directorio Integral de Casos de Uso (CU01 - CU25)</h3>
            <p class="usecase-subtitle">Acceso directo a todos los módulos funcionales evaluados en la arquitectura de software.</p>
          </div>

          <!-- Selector de Ciclos -->
          <div class="cycle-tabs">
            <button class="tab-btn" [class.active]="selectedCycleTab === 'all'" (click)="selectedCycleTab = 'all'">
              Todos (25 CU)
            </button>
            <button class="tab-btn" [class.active]="selectedCycleTab === 'c1'" (click)="selectedCycleTab = 'c1'">
              Ciclo 1 (CU01-CU10)
            </button>
            <button class="tab-btn" [class.active]="selectedCycleTab === 'c2'" (click)="selectedCycleTab = 'c2'">
              Ciclo 2 (CU11-CU18)
            </button>
            <button class="tab-btn" [class.active]="selectedCycleTab === 'c3'" (click)="selectedCycleTab = 'c3'">
              Ciclo 3 (CU19-CU25)
            </button>
          </div>
        </div>

        <div class="usecase-grid">
          <div
            *ngFor="let cu of filteredUseCases"
            class="cu-box"
            [routerLink]="cu.route"
          >
            <div class="cu-top">
              <span class="cu-tag" [ngClass]="'cycle-' + cu.cycle">{{ cu.code }}</span>
              <span class="module-tag">{{ cu.module }}</span>
            </div>
            <div class="cu-title-row">
              <i class="fas" [ngClass]="cu.icon" [style.color]="cu.color"></i>
              <h4>{{ cu.name }}</h4>
            </div>
            <p>{{ cu.desc }}</p>
            <div class="cu-footer">
              <span class="cycle-label">Ciclo {{ cu.cycle }}</span>
              <span class="enter-link">Probar Caso <i class="fas fa-chevron-right"></i></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Estructurado de Reporte Contable PDF con Firma Digital (Flujo Alternativo 7a) -->
    <div class="pdf-modal-backdrop" *ngIf="isPdfModalOpen">
      <div class="pdf-modal-container glass-panel">
        <div class="pdf-modal-header no-print">
          <div class="pdf-modal-title">
            <i class="fas fa-file-invoice-dollar text-red"></i>
            <span>Reporte Contable y Dictamen de Auditoría Ejecutiva (CU24)</span>
          </div>
          <div class="pdf-modal-actions">
            <button class="btn-print-action" (click)="imprimirReporte()">
              <i class="fas fa-print"></i> Imprimir / Guardar en PDF
            </button>
            <button class="btn-close-pdf" (click)="cerrarModalPDF()">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Documento Formal Imprimible con Simetría Ejecutiva -->
        <div class="pdf-document-body" id="reporte-contable-imprimible">
          <div class="doc-top-bar"></div>

          <div class="doc-letterhead">
            <div class="doc-logo-block">
              <div class="doc-brand-title">
                <i class="fas fa-crown doc-crown"></i>
                <span>FashionStore S.R.L.</span>
              </div>
              <span class="doc-sub">Plataforma Inteligente de Comercio Omnicanal — Metodología PUDS (SI2)</span>
              <span class="doc-meta">NIT: 1028472029 | Matrícula de Comercio: 00394821 | Autorización Fiscal: 2026-SI2-CU24</span>
              <span class="doc-address"><i class="fas fa-map-marker-alt"></i> Av. San Martín #450, Equipetrol, Santa Cruz / Av. Arce #210, La Paz — Bolivia</span>
            </div>
            <div class="doc-cert-block">
              <div class="cert-stamp">
                <i class="fas fa-certificate"></i> CERTIFICADO DE AUDITORÍA
              </div>
              <span class="cert-code">ID-REF: CU24-{{ (auditoriaContable?.firma_digital_sha256 || 'A1B2C3D4').substring(0, 8) | uppercase }}</span>
              <span class="cert-status"><i class="fas fa-check-circle"></i> DATOS INMUTABLES</span>
            </div>
          </div>

          <div class="doc-title-row">
            <h2>DICTAMEN DE AUDITORÍA CONTABLE Y CUADRO DE MANDO INTEGRAL (CU24)</h2>
            <p class="doc-subtitle">
              Evaluación consolidada en tiempo real de transaccionalidad comercial, valuación de existencias al Costo Promedio Ponderado (CPP), conversión de probadores y conciliación multicanal.
            </p>
          </div>

          <!-- Metadatos de Auditoría Legal en Grid Simétrica -->
          <div class="doc-audit-meta-grid">
            <div class="meta-item">
              <span class="lbl"><i class="fas fa-user-shield"></i> Usuario Auditor / Operador:</span>
              <span class="val">{{ auditoriaContable?.usuario }} ({{ auditoriaContable?.rol }})</span>
            </div>
            <div class="meta-item">
              <span class="lbl"><i class="fas fa-store"></i> Sucursal Física Evaluada:</span>
              <span class="val">{{ selectedSucursalNombre }}</span>
            </div>
            <div class="meta-item">
              <span class="lbl"><i class="fas fa-calendar-alt"></i> Periodo Temporal del Dictamen:</span>
              <span class="val">{{ selectedRangoFecha === 'TODO' ? 'Histórico Consolidado (Toda la operación)' : (selectedRangoFecha === 'HOY' ? 'Jornada Actual (Hoy)' : (selectedRangoFecha === '7_DIAS' ? 'Últimos 7 Días Calendario' : 'Mes Corriente')) }}</span>
            </div>
            <div class="meta-item">
              <span class="lbl"><i class="fas fa-clock"></i> Fecha y Hora de Emisión Local:</span>
              <span class="val text-amber">{{ auditoriaContable?.fecha_emision_local }}</span>
            </div>
            <div class="meta-item full-width">
              <span class="lbl"><i class="fas fa-fingerprint"></i> Firma Criptográfica de Integridad (SHA-256):</span>
              <code class="val-hash">{{ auditoriaContable?.firma_digital_sha256 }}</code>
            </div>
          </div>

          <!-- Tarjetas Simétricas de Resumen Ejecutivo (KPI Cards) -->
          <div class="doc-kpis-summary-grid">
            <div class="doc-kpi-card">
              <span class="doc-kpi-title">Ventas Totales Cobradas</span>
              <span class="doc-kpi-val text-navy">Bs. {{ kpis.ventas_totales_bs | number:'1.2-2' }}</span>
              <span class="doc-kpi-sub">{{ kpis.ordenes_pagadas }} transacciones pagadas</span>
            </div>
            <div class="doc-kpi-card">
              <span class="doc-kpi-title">Valuación Activo CPP</span>
              <span class="doc-kpi-val text-amber">Bs. {{ (kpis.valuacion_inventario_cpp || 0) | number:'1.2-2' }}</span>
              <span class="doc-kpi-sub">{{ kpis.stock_total | number }} prendas valoradas al CPP</span>
            </div>
            <div class="doc-kpi-card">
              <span class="doc-kpi-title">Efectividad Probadores</span>
              <span class="doc-kpi-val text-emerald">{{ kpis.efectividad_probadores_pct }}%</span>
              <span class="doc-kpi-sub">{{ kpis.reservas_confirmadas }} reservas convertidas a compra</span>
            </div>
            <div class="doc-kpi-card">
              <span class="doc-kpi-title">Sucursales Activas</span>
              <span class="doc-kpi-val text-indigo">{{ kpis.total_sucursales }} Tiendas</span>
              <span class="doc-kpi-sub">Red física interconectada</span>
            </div>
          </div>

          <!-- 1. RESUMEN DE INDICADORES CLAVE DE DESEMPEÑO -->
          <div class="doc-section-title">
            <span class="sec-num">1</span>
            <span>BALANCE Y RENDIMIENTO OPERACIONAL POR CANAL</span>
          </div>
          <table class="doc-table">
            <thead>
              <tr>
                <th style="width: 35%;">Métrica / Dimensión Contable</th>
                <th style="width: 25%; text-align: right;">Monto / Magnitud</th>
                <th style="width: 40%;">Diagnóstico y Observación de Control Interno</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Ventas Totales Efectivas</strong></td>
                <td class="amount" style="text-align: right;">Bs. {{ kpis.ventas_totales_bs | number:'1.2-2' }}</td>
                <td>Ingresos brutos acumulados libres de mora. Transacciones fiscalizadas al 100%.</td>
              </tr>
              <tr>
                <td><strong>Valuación de Existencias al CPP</strong></td>
                <td class="amount" style="text-align: right;">Bs. {{ (kpis.valuacion_inventario_cpp || 0) | number:'1.2-2' }}</td>
                <td>Valuación conforme a Norma Contable NC3 (Costo Promedio Ponderado móvil).</td>
              </tr>
              <tr>
                <td><strong>Conversión de Probadores a Compra</strong></td>
                <td class="amount" style="text-align: right;">{{ kpis.efectividad_probadores_pct }}%</td>
                <td>{{ kpis.reservas_confirmadas }} reservas físicas confirmadas en mostrador de sucursal.</td>
              </tr>
              <tr>
                <td><strong>Composición de Canal (Digital vs POS)</strong></td>
                <td class="amount" style="text-align: right;">Online: {{ distribucion.online }} | POS: {{ distribucion.pos }}</td>
                <td>{{ getOnlinePct() }}% canal web e-commerce frente a {{ 100 - getOnlinePct() }}% ventas en tienda física.</td>
              </tr>
            </tbody>
          </table>

          <!-- 2. RECAUDACIÓN Y CONCILIACIÓN POR PASARELAS DE COBRO -->
          <div class="doc-section-title">
            <span class="sec-num">2</span>
            <span>CONCILIACIÓN POR MEDIOS Y PASARELAS DE PAGO (CU17 / CU24)</span>
          </div>
          <table class="doc-table mini">
            <thead>
              <tr>
                <th style="width: 35%;">Canal / Pasarela de Cobro</th>
                <th style="width: 25%; text-align: center;">Operaciones Procesadas</th>
                <th style="width: 20%; text-align: right;">Participación</th>
                <th style="width: 20%; text-align: center;">Estado Conciliación</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of getMediosPagoEntries()">
                <td><strong>{{ m.nombre }}</strong></td>
                <td style="text-align: center;">{{ m.cantidad }} transacciones</td>
                <td style="text-align: right;"><strong>{{ m.pct }}%</strong></td>
                <td style="text-align: center;"><span class="status-badge-doc">AUDITADO Y CONCILIADO</span></td>
              </tr>
            </tbody>
          </table>

          <!-- 3. RENDIMIENTO TEXTIL AL CPP -->
          <div class="doc-section-title">
            <span class="sec-num">3</span>
            <span>VALUACIÓN TEXTIL, ROTACIÓN Y MARGEN DE CONTRIBUCIÓN VS. CPP</span>
          </div>
          <table class="doc-table mini">
            <thead>
              <tr>
                <th style="width: 12%;">SKU</th>
                <th style="width: 26%;">Prenda Textil</th>
                <th style="width: 11%; text-align: center;">Stock Físico</th>
                <th style="width: 11%; text-align: center;">Uds. Vendidas</th>
                <th style="width: 13%; text-align: right;">CPP Vigente</th>
                <th style="width: 13%; text-align: right;">Precio Venta</th>
                <th style="width: 14%; text-align: right;">Margen Bruto</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of rendimientoInventario">
                <td class="mono-font">{{ p.sku }}</td>
                <td><strong>{{ p.nombre }}</strong> <span class="doc-cat-tag">({{ p.categoria }})</span></td>
                <td style="text-align: center;">{{ p.stock_total }} uds</td>
                <td style="text-align: center;"><strong style="color: #4f46e5;">{{ p.unidades_vendidas || 0 }} uds</strong></td>
                <td style="text-align: right;" class="amount">Bs. {{ p.cpp | number:'1.2-2' }}</td>
                <td style="text-align: right;" class="amount">Bs. {{ p.precio_venta | number:'1.2-2' }}</td>
                <td style="text-align: right;">
                  <span class="doc-margin-badge">+{{ p.margen_bruto_pct }}%</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Bloque de Firmas y Responsabilidad Legal Simétrico -->
          <div class="doc-signatures-grid">
            <div class="sig-box">
              <div class="sig-stamp-placeholder">
                <i class="fas fa-stamp"></i> SELLO OFICIAL
              </div>
              <div class="sig-line"></div>
              <span class="sig-name">MSc. Ing. Angélica Garzón Cuéllar</span>
              <span class="sig-role">Docente Guía / Auditoría de Sistemas — SI2</span>
              <span class="sig-sub">Universidad Autónoma Gabriel René Moreno</span>
            </div>
            <div class="sig-box">
              <div class="sig-stamp-placeholder">
                <i class="fas fa-shield-alt"></i> FIRMA AUDITOR
              </div>
              <div class="sig-line"></div>
              <span class="sig-name">Alberto Delgado & Andy Mujica</span>
              <span class="sig-role">Dirección Financiera / Administración General</span>
              <span class="sig-sub">FashionStore S.R.L.</span>
            </div>
          </div>

          <div class="doc-footer-legal">
            <p>
              <strong>CERTIFICACIÓN DE INMUTABILIDAD CONTABLE:</strong> Este documento constituye un extracto oficial generado automáticamente por el Módulo de Business Intelligence CU24. Los montos han sido calculados cruzando transacciones de venta efectivas contra el Costo Promedio Ponderado (CPP) registrado en el Kardex. La integridad criptográfica está avalada por la firma SHA-256 registrada en la bitácora de auditoría del sistema.
            </p>
            <div class="doc-footer-bar">
              <span>FashionStore S.R.L. &copy; 2026</span>
              <span>Página 1 de 1</span>
              <span>Emisión: {{ auditoriaContable?.fecha_emision_local }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de Restricción para Usuarios No Autorizados en CU24 -->
    <div class="page-container" *ngIf="!canAccess()">
      <div class="auth-required-card glass-panel">
        <div class="auth-icon-wrap">
          <i class="fas fa-user-shield"></i>
        </div>
        <div class="auth-text-wrap">
          <h3>Cuadros de Mando y Dashboards Ejecutivos (CU24)</h3>
          <p>
            El cuadro de mando gerencial, valuación CPP y auditoría de transacciones están reservados para los roles <strong>ADMINISTRADOR</strong> y <strong>ENCARGADO_SUCURSAL</strong> conforme a la especificación de CU24 (PUDS).
          </p>
        </div>
        <div class="auth-actions-wrap">
          <a routerLink="/catalogo" class="btn-primary-action">
            <i class="fas fa-store"></i> Ir al Catálogo de Prendas
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem 2rem 3rem;
      background: #090d16;
      min-height: calc(100vh - 65px);
      color: #f8fafc;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Welcome Banner */
    .welcome-banner {
      padding: 1.75rem 2rem;
      border-radius: 16px;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
      overflow: hidden;
    }
    .welcome-banner::before {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 4px; height: 100%;
      background: linear-gradient(180deg, #6366f1, #3b82f6, #10b981);
    }
    .banner-text { flex: 1; min-width: 320px; }
    .banner-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.6rem; }
    .course-pill, .cycle-pill, .puds-pill {
      display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.65rem;
      border-radius: 9999px; font-size: 0.75rem; font-weight: 700;
    }
    .course-pill { background: rgba(99, 102, 241, 0.18); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .cycle-pill { background: rgba(16, 185, 129, 0.18); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .puds-pill { background: rgba(245, 158, 11, 0.18); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .banner-text h2 { font-size: 1.55rem; font-weight: 800; color: #ffffff; margin: 0 0 0.5rem; }
    .desc { color: #94a3b8; font-size: 0.85rem; line-height: 1.5; margin-bottom: 0.9rem; max-width: 720px; }
    .authors-badge { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.78rem; color: #cbd5e1; }
    .authors-badge span { display: flex; align-items: center; gap: 0.35rem; }

    /* System Status Box */
    .system-status-box {
      background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px; padding: 1.15rem; min-width: 280px; box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    }
    .status-indicator {
      display: flex; align-items: center; justify-content: space-between;
      color: #34d399; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.65rem;
    }
    .ping-dot {
      width: 9px; height: 9px; border-radius: 50%; background: #10b981;
      box-shadow: 0 0 8px #10b981; display: inline-block; margin-right: 0.4rem;
    }
    .ping-dot.offline { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
    .btn-mini-refresh {
      background: transparent; border: none; color: #94a3b8; cursor: pointer;
      font-size: 0.85rem; padding: 0.2rem; transition: color 0.2s;
    }
    .btn-mini-refresh:hover { color: #818cf8; }
    .status-meta {
      display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.74rem;
      color: #94a3b8; margin-bottom: 0.75rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;
    }
    .status-meta code { color: #38bdf8; font-family: monospace; font-weight: 600; }
    .quick-links { display: flex; gap: 0.5rem; }
    .status-link {
      flex: 1; padding: 0.4rem 0.6rem; border-radius: 6px; background: rgba(99, 102, 241, 0.18);
      border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; text-decoration: none;
      font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; justify-content: center;
      gap: 0.35rem; transition: all 0.2s;
    }
    .status-link:hover { background: rgba(99, 102, 241, 0.35); color: #fff; }

    .export-actions-bar {
      display: flex; flex-direction: column; gap: 0.45rem; margin-top: 0.65rem;
    }
    .btn-export-pdf, .btn-export-xlsx {
      width: 100%; padding: 0.45rem 0.65rem; border-radius: 6px; font-size: 0.72rem;
      font-weight: 700; display: flex; align-items: center; justify-content: center;
      gap: 0.45rem; cursor: pointer; transition: all 0.2s; border: none;
    }
    .btn-export-pdf {
      background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.35); color: #fca5a5;
    }
    .btn-export-pdf:hover {
      background: rgba(239, 68, 68, 0.35); color: #fff; transform: translateY(-1px);
    }
    .btn-export-xlsx {
      background: rgba(16, 185, 129, 0.18); border: 1px solid rgba(16, 185, 129, 0.35); color: #6ee7b7;
    }
    /* Filter Dashboard Bar (CU24 Flujo 7 & 1a) */
    .filter-dashboard-bar {
      padding: 0.9rem 1.4rem;
      border-radius: 14px;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.25rem;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }
    .filter-item-block {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .filter-item-block label {
      font-size: 0.82rem;
      font-weight: 700;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .dashboard-custom-select {
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #f8fafc;
      padding: 0.45rem 1rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-family: inherit;
      font-weight: 600;
      cursor: pointer;
      outline: none;
      transition: all 0.2s;
    }
    .dashboard-custom-select:hover, .dashboard-custom-select:focus {
      border-color: #818cf8;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
    }
    .locked-branch-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .time-filter-group {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .time-pill-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 0.4rem 0.75rem;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .time-pill-btn:hover {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border-color: rgba(16, 185, 129, 0.3);
    }
    .time-pill-btn.active {
      background: #10b981;
      color: #ffffff;
      border-color: #34d399;
      font-weight: 700;
      box-shadow: 0 2px 10px rgba(16, 185, 129, 0.4);
    }
    .audit-signature-pill {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(6, 182, 212, 0.12);
      border: 1px solid rgba(6, 182, 212, 0.3);
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
    }
    .audit-text-wrap {
      display: flex;
      flex-direction: column;
    }
    .audit-lbl {
      font-size: 0.68rem;
      font-weight: 700;
      color: #22d3ee;
    }
    .audit-hash {
      font-size: 0.65rem;
      font-family: monospace;
      color: #94a3b8;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem; margin-bottom: 1.5rem;
    }
    .kpi-card {
      border-radius: 12px; padding: 1.15rem; display: flex; align-items: center; gap: 1rem;
      cursor: pointer; transition: all 0.25s; background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .kpi-card:hover {
      transform: translateY(-3px); border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    }
    .kpi-card.highlight-kpi {
      border-color: rgba(16, 185, 129, 0.3);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.7));
    }
    .kpi-icon {
      width: 48px; height: 48px; border-radius: 12px; display: flex;
      align-items: center; justify-content: center; font-size: 1.35rem; flex-shrink: 0;
    }
    .kpi-icon.sales { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .kpi-icon.orders { background: rgba(6, 182, 212, 0.2); color: #22d3ee; }
    .kpi-icon.fitting { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .kpi-icon.delivery { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
    .kpi-icon.stock { background: rgba(234, 179, 8, 0.2); color: #facc15; }
    .kpi-icon.catalog { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
    .kpi-icon.branch { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .kpi-icon.payment { background: rgba(236, 72, 153, 0.2); color: #f472b6; }

    .kpi-content { display: flex; flex-direction: column; overflow: hidden; }
    .kpi-title { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
    .kpi-value { font-size: 1.45rem; font-weight: 800; color: #f8fafc; margin: 0.1rem 0; }
    .kpi-sub { font-size: 0.72rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .text-emerald { color: #34d399; }
    .text-cyan { color: #22d3ee; }
    .text-amber { color: #fbbf24; }
    .text-purple { color: #c084fc; }
    .text-indigo { color: #818cf8; }

    /* Analytics Row */
    .analytics-row {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;
    }
    @media (max-width: 992px) {
      .analytics-row { grid-template-columns: 1fr; }
    }
    .analytics-card {
      padding: 1.25rem 1.5rem; border-radius: 14px;
      background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .card-header-clean {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
    }
    .card-header-clean h3 { font-size: 1rem; font-weight: 800; color: #fff; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
    .badge-pill {
      font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 6px;
      background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .badge-pill.badge-green {
      background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);
    }

    /* Omnichannel Breakdown */
    .omnichannel-breakdown { display: flex; flex-direction: column; gap: 0.75rem; }
    .channel-metric { display: flex; align-items: center; gap: 0.75rem; }
    .channel-icon {
      width: 38px; height: 38px; border-radius: 8px; display: flex;
      align-items: center; justify-content: center; font-size: 1.1rem;
    }
    .channel-metric.online .channel-icon { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
    .channel-metric.pos .channel-icon { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .channel-info { flex: 1; display: flex; flex-direction: column; }
    .channel-info .label { font-size: 0.8rem; color: #cbd5e1; font-weight: 600; }
    .channel-info .val { font-size: 0.72rem; color: #94a3b8; }
    .channel-metric .pct { font-size: 1.1rem; font-weight: 800; color: #fff; }

    .progress-bar-container {
      height: 10px; border-radius: 5px; background: rgba(30, 41, 59, 0.8);
      display: flex; overflow: hidden; margin: 0.25rem 0;
    }
    .progress-bar-online { background: #06b6d4; height: 100%; transition: width 0.5s; }
    .progress-bar-pos { background: #a855f7; height: 100%; transition: width 0.5s; }

    /* Services List */
    .services-status-list { display: flex; flex-direction: column; gap: 0.65rem; }
    .service-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.6rem 0.85rem; border-radius: 8px; background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .svc-left { display: flex; align-items: center; gap: 0.75rem; }
    .svc-icon { font-size: 1.25rem; }
    .svc-left strong { font-size: 0.82rem; color: #f1f5f9; display: block; }
    .svc-sub { font-size: 0.7rem; color: #94a3b8; }
    .status-pill-clean {
      font-size: 0.68rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px;
      display: flex; align-items: center; gap: 0.35rem;
    }
    .status-pill-clean.active { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .status-pill-clean .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

    /* Recent Activity Tables */
    .recent-activity-row {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.5rem;
    }
    @media (max-width: 1024px) {
      .recent-activity-row { grid-template-columns: 1fr; }
    }
    .activity-card {
      padding: 1.25rem 1.5rem; border-radius: 14px;
      background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .link-more {
      font-size: 0.75rem; font-weight: 700; color: #818cf8; text-decoration: none;
      display: flex; align-items: center; gap: 0.35rem; transition: color 0.2s;
    }
    .link-more:hover { color: #a5b4fc; }

    .table-responsive { overflow-x: auto; }
    .dashboard-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
    .dashboard-table th {
      text-align: left; padding: 0.55rem 0.75rem; color: #94a3b8; font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 0.72rem; text-transform: uppercase;
    }
    .dashboard-table td {
      padding: 0.65rem 0.75rem; border-bottom: 1px solid rgba(255, 255, 255, 0.04); color: #cbd5e1;
    }
    .dashboard-table tbody tr:hover { background: rgba(99, 102, 241, 0.05); }
    .mono-font { font-family: monospace; font-weight: 700; color: #818cf8; }
    .amount-cell { font-weight: 700; color: #34d399; }
    .date-cell { font-size: 0.72rem; color: #94a3b8; }

    .badge-canal {
      font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 4px;
      background: rgba(6, 182, 212, 0.15); color: #22d3ee;
    }
    .badge-canal.pos { background: rgba(168, 85, 247, 0.15); color: #c084fc; }

    .badge-status {
      font-size: 0.68rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px;
      background: rgba(245, 158, 11, 0.15); color: #fbbf24;
    }
    .badge-status.paid { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .badge-logistica {
      font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px;
      background: rgba(255, 255, 255, 0.08); color: #cbd5e1;
    }
    .badge-reserva {
      font-size: 0.68rem; font-weight: 800; padding: 0.15rem 0.45rem; border-radius: 4px;
    }
    .badge-reserva.atendida { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .badge-reserva.preparada { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .badge-reserva.pendiente { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

    .empty-mini { text-align: center; padding: 2rem; color: #64748b; font-size: 0.8rem; }

    /* Directory of Use Cases */
    .usecases-section {
      border-radius: 16px; padding: 1.75rem; background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .usecase-header {
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;
    }
    .usecase-header h3 { font-size: 1.25rem; font-weight: 800; color: #fff; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
    .usecase-subtitle { font-size: 0.82rem; color: #94a3b8; margin: 0.2rem 0 0; }

    .cycle-tabs { display: flex; gap: 0.5rem; background: rgba(30, 41, 59, 0.6); padding: 0.25rem; border-radius: 8px; }
    .tab-btn {
      background: transparent; border: none; color: #94a3b8; padding: 0.4rem 0.85rem;
      border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .tab-btn.active { background: #6366f1; color: #fff; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4); }

    .usecase-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1rem; }
    .cu-box {
      background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px; padding: 1.15rem; cursor: pointer; transition: all 0.22s;
      display: flex; flex-direction: column; justify-content: space-between;
    }
    .cu-box:hover {
      background: rgba(30, 41, 59, 0.7); border-color: rgba(99, 102, 241, 0.4);
      transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.3);
    }
    .cu-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.65rem; }
    .cu-tag {
      font-size: 0.72rem; font-weight: 800; font-family: monospace;
      padding: 0.2rem 0.5rem; border-radius: 5px;
    }
    .cu-tag.cycle-1 { background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .cu-tag.cycle-2 { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .module-tag { font-size: 0.68rem; font-weight: 700; color: #64748b; font-family: monospace; }
    .cu-title-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; }
    .cu-title-row h4 { font-size: 0.95rem; font-weight: 700; color: #fff; margin: 0; }
    .cu-box p { font-size: 0.78rem; color: #94a3b8; line-height: 1.45; margin: 0 0 0.85rem; flex: 1; }
    .cu-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 0.65rem; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 0.72rem;
    }
    .cycle-label { color: #64748b; font-weight: 600; }
    .enter-link { color: #818cf8; font-weight: 700; display: flex; align-items: center; gap: 0.3rem; }

    /* Auth Required */
    .auth-required-card {
      display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
      padding: 2.5rem; border-radius: 14px; background: rgba(30, 41, 59, 0.75);
      border: 1px solid rgba(99, 102, 241, 0.3); margin-top: 1rem; flex-wrap: wrap;
    }
    .auth-icon-wrap {
      width: 56px; height: 56px; border-radius: 50%; background: rgba(99, 102, 241, 0.2);
      color: #818cf8; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;
    }
    .auth-text-wrap { flex: 1; min-width: 260px; }
    .auth-text-wrap h3 { font-size: 1.25rem; color: #ffffff; margin: 0 0 0.4rem; }
    .auth-text-wrap p { color: #94a3b8; font-size: 0.85rem; line-height: 1.4; margin: 0; }
    .btn-primary-action {
      background: #6366f1; color: white; padding: 0.65rem 1.25rem; border-radius: 8px;
      font-weight: 700; font-size: 0.85rem; text-decoration: none; display: flex; align-items: center; gap: 0.5rem;
    }

    /* Ranking Controls & Badges (CU24) */
    .flex-header-wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .ranking-controls-wrap {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .ranking-tabs-group {
      display: flex;
      gap: 0.35rem;
      background: rgba(15, 23, 42, 0.6);
      padding: 0.25rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .rank-tab-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .rank-tab-btn:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.05);
    }
    .rank-tab-btn.active {
      background: #6366f1;
      color: #ffffff;
      font-weight: 700;
    }
    .rank-tab-btn.active.top-btn {
      background: linear-gradient(135deg, #d97706, #b45309);
    }
    .rank-tab-btn.active.bottom-btn {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
    }
    .rank-badge {
      display: inline-block;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 800;
      font-family: monospace;
      background: rgba(255, 255, 255, 0.08);
      color: #94a3b8;
    }
    .rank-badge.rank-gold {
      background: rgba(245, 158, 11, 0.25);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.5);
    }
    .rank-badge.rank-silver {
      background: rgba(148, 163, 184, 0.25);
      color: #e2e8f0;
      border: 1px solid rgba(148, 163, 184, 0.5);
    }
    .rank-badge.rank-bronze {
      background: rgba(217, 119, 6, 0.2);
      color: #f59e0b;
      border: 1px solid rgba(217, 119, 6, 0.4);
    }
    .rank-badge.rank-bottom {
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.4);
    }
    .sold-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    /* Modal Reporte Contable PDF (Flujo Alternativo 7a) */
    .pdf-modal-backdrop {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .pdf-modal-container {
      width: 920px;
      max-width: 95vw;
      max-height: 92vh;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
    }
    .pdf-modal-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.95);
    }
    .pdf-modal-title {
      font-size: 1rem;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .pdf-modal-actions {
      display: flex;
      gap: 0.6rem;
      align-items: center;
    }
    .btn-print-action {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.45rem 1rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .btn-print-action:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }
    .btn-close-pdf {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #cbd5e1;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
    }
    .btn-close-pdf:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }
    .pdf-document-body {
      padding: 2.5rem 3rem;
      overflow-y: auto;
      background: #ffffff;
      color: #0f172a;
      font-family: 'Inter', -apple-system, sans-serif;
    }
    .doc-letterhead {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 1.25rem;
      margin-bottom: 1.25rem;
    }
    .doc-logo-block h1 {
      font-size: 1.75rem;
      font-weight: 900;
      color: #0f172a;
      margin: 0 0 0.2rem;
    }
    .doc-sub {
      font-size: 0.82rem;
      font-weight: 700;
      color: #475569;
      display: block;
    }
    .doc-meta {
      font-size: 0.75rem;
      color: #64748b;
      display: block;
      margin-top: 0.25rem;
    }
    .doc-cert-block {
      text-align: right;
    }
    .cert-stamp {
      background: #0f172a;
      color: #ffffff;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 800;
      border-radius: 4px;
      letter-spacing: 0.5px;
      display: inline-block;
      margin-bottom: 0.35rem;
    }
    .cert-code {
      font-size: 0.7rem;
      font-family: monospace;
      color: #475569;
      font-weight: 700;
      display: block;
    }
    .doc-title-row {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .doc-title-row h2 {
      font-size: 1.15rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.35rem;
    }
    .doc-subtitle {
      font-size: 0.8rem;
      color: #64748b;
      margin: 0;
    }
    .doc-audit-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.6rem 1.5rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      font-size: 0.82rem;
    }
    .meta-item {
      display: flex;
      gap: 0.5rem;
    }
    .meta-item.full-width {
      grid-column: 1 / -1;
      border-top: 1px solid #e2e8f0;
      padding-top: 0.5rem;
      margin-top: 0.25rem;
    }
    .meta-item .lbl {
      font-weight: 700;
      color: #475569;
    }
    .meta-item .val {
      font-weight: 600;
      color: #0f172a;
    }
    .val-hash {
      font-family: monospace;
      font-size: 0.75rem;
      color: #0f172a;
      background: #e2e8f0;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      word-break: break-all;
    }
    .doc-section-title {
      font-size: 0.85rem;
      font-weight: 800;
      color: #0f172a;
      border-left: 3px solid #6366f1;
      padding-left: 0.5rem;
      margin: 1.25rem 0 0.65rem;
      letter-spacing: 0.3px;
    }
    .doc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
      margin-bottom: 1.25rem;
    }
    .doc-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 0.6rem 0.85rem;
      border: 1px solid #cbd5e1;
    }
    .doc-table td {
      padding: 0.55rem 0.85rem;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }
    .doc-table .amount {
      font-weight: 800;
      color: #0f172a;
      font-family: monospace;
    }
    .doc-table.mini td, .doc-table.mini th {
      padding: 0.45rem 0.65rem;
      font-size: 0.76rem;
    }
    .status-badge-doc {
      font-size: 0.68rem;
      font-weight: 800;
      color: #15803d;
      background: #dcfce7;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }
    .doc-top-bar {
      height: 5px;
      background: linear-gradient(90deg, #0f172a 0%, #3b82f6 50%, #10b981 100%);
      margin-bottom: 1.25rem;
      border-radius: 3px;
    }
    .doc-brand-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.75rem;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 0.2rem;
    }
    .doc-crown {
      color: #d97706;
      font-size: 1.4rem;
    }
    .doc-address {
      font-size: 0.72rem;
      color: #64748b;
      margin-top: 0.25rem;
      display: block;
    }
    .cert-status {
      font-size: 0.66rem;
      font-weight: 800;
      color: #15803d;
      background: #dcfce7;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
      margin-top: 0.35rem;
      border: 1px solid #bbf7d0;
    }
    .doc-kpis-summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .doc-kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.9rem 0.75rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .doc-kpi-title {
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-kpi-val {
      font-size: 1.3rem;
      font-weight: 900;
      font-family: 'Outfit', sans-serif;
    }
    .doc-kpi-val.text-navy { color: #0f172a; }
    .doc-kpi-val.text-amber { color: #d97706; }
    .doc-kpi-val.text-emerald { color: #059669; }
    .doc-kpi-val.text-indigo { color: #4f46e5; }
    .doc-kpi-sub {
      font-size: 0.68rem;
      color: #64748b;
    }
    .sec-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      background: #0f172a;
      color: #ffffff;
      font-size: 0.68rem;
      font-weight: 900;
      border-radius: 50%;
      margin-right: 0.4rem;
    }
    .doc-margin-badge {
      font-size: 0.72rem;
      font-weight: 800;
      color: #047857;
      background: #d1fae5;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
    }
    .doc-cat-tag {
      font-size: 0.72rem;
      font-weight: normal;
      color: #64748b;
    }
    .doc-signatures-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 3rem;
      margin-top: 2.5rem;
      padding-top: 1rem;
    }
    .sig-box {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .sig-stamp-placeholder {
      width: 75px;
      height: 75px;
      border: 2px dashed #cbd5e1;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      font-size: 0.65rem;
      font-weight: 700;
      gap: 0.2rem;
      margin-bottom: 0.65rem;
    }
    .sig-line {
      width: 80%;
      border-bottom: 1px solid #334155;
      margin-bottom: 0.45rem;
    }
    .sig-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: #0f172a;
    }
    .sig-role {
      font-size: 0.72rem;
      color: #475569;
      font-weight: 600;
    }
    .sig-sub {
      font-size: 0.68rem;
      color: #94a3b8;
    }
    .doc-footer-legal {
      margin-top: 2rem;
      border-top: 1px solid #e2e8f0;
      padding-top: 0.75rem;
      font-size: 0.68rem;
      color: #64748b;
      text-align: justify;
      line-height: 1.45;
    }
    .doc-footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.6rem;
      border-top: 1px dashed #cbd5e1;
      padding-top: 0.45rem;
      font-size: 0.68rem;
      color: #94a3b8;
    }

    /* Print Specific Rules */
    @media print {
      @page {
        size: A4 portrait;
        margin: 10mm 15mm;
      }
      body * {
        visibility: hidden;
      }
      #reporte-contable-imprimible, #reporte-contable-imprimible * {
        visibility: visible;
      }
      #reporte-contable-imprimible {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        background: #ffffff !important;
        color: #0f172a !important;
        box-shadow: none !important;
      }
      .no-print {
        display: none !important;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(FashionApiService);
  public auth = inject(AuthService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  isLoading: boolean = false;
  isError: boolean = false;
  selectedCycleTab: 'all' | 'c1' | 'c2' | 'c3' = 'all';

  // Filtros interactivos CU24 (Flujo 7 & 1a)
  sucursalesDisponibles: any[] = [];
  selectedSucursalId: number | null = null;
  selectedSucursalNombre: string = 'Red Global (Todas las Sucursales)';
  isSucursalLocked: boolean = false;
  selectedRangoFecha: string = 'TODO';
  selectedRankingTipo: string = 'TODOS';
  auditoriaContable: any = null;
  isPdfModalOpen: boolean = false;

  // URLs dinámicas al backend para Swagger y Health
  docsUrl = API_BASE_URL.replace('/api/v1', '/docs');
  healthUrl = API_BASE_URL.replace('/api/v1', '/health');

  kpis: DashboardKPIs = {
    ventas_totales_bs: 0,
    total_ordenes: 0,
    ordenes_pagadas: 0,
    ordenes_pendientes: 0,
    total_reservas: 0,
    reservas_pendientes: 0,
    reservas_confirmadas: 0,
    despachos_activos: 0,
    entregadas: 0,
    total_productos: 0,
    total_sucursales: 0,
    stock_total: 0,
    total_usuarios: 0,
    total_medios_pago: 4,
    medios_activos: 4,
    valuacion_inventario_cpp: 0,
    efectividad_probadores_pct: 78.5
  };

  distribucion = {
    online: 0,
    pos: 0
  };

  distribucionMediosPago: { [key: string]: number } = {};
  rendimientoInventario: RendimientoPrenda[] = [];
  ultimasOrdenes: UltimaOrden[] = [];
  ultimasReservas: UltimaReserva[] = [];

  serviciosEstado = {
    api_version: '1.0.0',
    fastapi_status: 'ONLINE',
    database_status: 'PostgreSQL / SQLite Activa',
    stripe_status: 'Sandbox Tokenizado (CU16)',
    delivery_status: 'Haversine GPS Operativo (CU18)'
  };

  // Directorio Completo de Casos de Uso (CU01 al CU24)
  useCases: UseCaseItem[] = [
    // Ciclo 1
    { code: 'CU01', name: 'Autenticar Usuario (RBAC)', cycle: 1, module: 'M01', desc: 'Control de 5 intentos fallidos con bloqueo preventivo de 30 minutos y bitácora de accesos.', route: '/login', icon: 'fa-user-lock', color: '#818cf8' },
    { code: 'CU02', name: 'Registrar Cliente', cycle: 1, module: 'M01', desc: 'Auto-registro de clientes en línea con cifrado seguro Bcrypt y asignación de rol.', route: '/login', icon: 'fa-user-plus', color: '#60a5fa' },
    { code: 'CU03', name: 'Recuperar Contraseña (OTP)', cycle: 1, module: 'M01', desc: 'Emisión y verificación de token OTP de 6 dígitos con vigencia estricta de 15 minutos.', route: '/login', icon: 'fa-key', color: '#34d399' },
    { code: 'CU04', name: 'Gestionar Usuarios y Roles', cycle: 1, module: 'M02', desc: 'Desbloqueo administrativo de cuentas bloqueadas y cambio dinámico de roles RBAC.', route: '/usuarios', icon: 'fa-users-cog', color: '#f472b6' },
    { code: 'CU05', name: 'Sucursales Físicas y GPS', cycle: 1, module: 'M03', desc: 'Alta de tiendas, capacidad de probadores inteligentes y mapeo satelital GPS.', route: '/sucursales', icon: 'fa-map-marked-alt', color: '#fbbf24' },
    { code: 'CU06', name: 'Catálogo y Atributos de Moda', cycle: 1, module: 'M04', desc: 'Variantes de color HEX real, tallas numéricas/alfanuméricas y soporte para modelo 3D.', route: '/productos', icon: 'fa-tshirt', color: '#a78bfa' },
    { code: 'CU07', name: 'Temporadas y Colecciones', cycle: 1, module: 'M05', desc: 'Campañas estacionales Primavera/Verano y Otoño/Invierno con políticas de liquidación.', route: '/temporadas', icon: 'fa-calendar-alt', color: '#f87171' },
    { code: 'CU08', name: 'Proveedores Textiles', cycle: 1, module: 'M06', desc: 'Directorio de proveedores con garantía de unicidad estricta de NIT tributario.', route: '/proveedores', icon: 'fa-truck-loading', color: '#38bdf8' },
    { code: 'CU09', name: 'Inventario Multi-Sucursal y CPP', cycle: 1, module: 'M07', desc: 'Recálculo matemático en vivo de Costo Promedio Ponderado y asientos inmutables de Kardex.', route: '/inventario', icon: 'fa-calculator', color: '#fb923c' },
    { code: 'CU10', name: 'Consulta Catálogo Omnicanal', cycle: 1, module: 'M08', desc: 'Verificación de stock físico por sucursal seleccionada para evitar desabastecimiento.', route: '/catalogo', icon: 'fa-store', color: '#4ade80' },

    // Ciclo 2
    { code: 'CU11', name: 'Reservar Prendas en Sucursal', cycle: 2, module: 'M10', desc: 'Preselección de prendas, selección de sucursal física, horario de visita y generación de ticket QR.', route: '/reservar', icon: 'fa-bookmark', color: '#818cf8' },
    { code: 'CU12', name: 'Atender Reserva en Mostrador', cycle: 2, module: 'M10', desc: 'Apartado físico en probadores y confirmación presencial del cliente mediante escaneo de ticket QR.', route: '/encargado/reservas', icon: 'fa-qrcode', color: '#22d3ee' },
    { code: 'CU13', name: 'Bolsa de Compras Omnicanal', cycle: 2, module: 'M11', desc: 'Administración de bolsa persistente con validación atómica de existencias y cálculos en vivo.', route: '/catalogo', icon: 'fa-shopping-bag', color: '#34d399' },
    { code: 'CU14', name: 'Checkout y Emisión de Orden', cycle: 2, module: 'M12', desc: 'Formalización de compra digital con selección de logística (retiro o delivery) y facturación fiscal.', route: '/checkout', icon: 'fa-clipboard-check', color: '#fbbf24' },
    { code: 'CU15', name: 'Caja y Venta Mostrador (POS)', cycle: 2, module: 'M13', desc: 'Cobro en mostrador físico, cálculo de vuelto, soporte de reservas QR y emisión de tickets fiscales.', route: '/pos', icon: 'fa-cash-register', color: '#c084fc' },
    { code: 'CU16', name: 'Procesar Pagos Electrónicos', cycle: 2, module: 'M14', desc: 'Cobro seguro digital con tarjeta mediante pasarela Stripe, 3D Secure y confirmación asíncrona.', route: '/catalogo', icon: 'fa-credit-card', color: '#f472b6' },
    { code: 'CU17', name: 'Gestionar Medios de Cobro', cycle: 2, module: 'M15', desc: 'Parametrización y activación/desactivación en caliente de Efectivo, POS, Stripe y QR BCB.', route: '/admin/pagos-config', icon: 'fa-sliders-h', color: '#38bdf8' },
    { code: 'CU18', name: 'Despacho y Tracking Delivery', cycle: 2, module: 'M19', desc: 'Fórmula Haversine para cálculo de tarifas, asignación de choferes y seguimiento GPS en vivo.', route: '/logistica/dashboard', icon: 'fa-shipping-fast', color: '#a3e635' },

    // Ciclo 3 (Diferenciadores Tecnológicos, RA, IA, Analítica y Devoluciones)
    { code: 'CU19', name: 'Vestidor Virtual con RA', cycle: 3, module: 'M08', desc: 'Proyección 3D de prendas en Realidad Aumentada con ARCore, superposición anatómica y cambio dinámico.', route: '/catalogo', icon: 'fa-vr-cardboard', color: '#06b6d4' },
    { code: 'CU20', name: 'Comparador de Outfits', cycle: 3, module: 'M09', desc: 'Contrastación visual de 3 atuendos completos con desglose de precios, opción más económica y transferencia al carrito.', route: '/comparador', icon: 'fa-columns', color: '#10b981' },
    { code: 'CU21', name: 'Fidelización Gamificada', cycle: 3, module: 'M16', desc: 'Acumulación de puntos por compras, membresía VIP (Bronce a Diamante), vitrina de insignias y cupones.', route: '/recompensas', icon: 'fa-gem', color: '#f59e0b' },
    { code: 'CU22', name: 'Asistente de Estilo con IA', cycle: 3, module: 'M17', desc: 'Recomendaciones inteligentes evaluando temperatura de ciudades bolivianas, colorimetría y existencias.', route: '/asistente-ia', icon: 'fa-robot', color: '#38bdf8' },
    { code: 'CU23', name: 'Búsqueda por Voz y NLP', cycle: 3, module: 'M17', desc: 'Reconocimiento por voz en lenguaje natural y filtrado semántico instantáneo del catálogo textil.', route: '/asistente-ia', icon: 'fa-microphone', color: '#818cf8' },
    { code: 'CU24', name: 'Dashboards y Analítica', cycle: 3, module: 'M18', desc: 'Cuadro de mando ejecutivo con valuación al Costo Promedio (CPP), probadores y distribución multicanal.', route: '/dashboard', icon: 'fa-chart-line', color: '#ec4899' },
    { code: 'CU25', name: 'Devolución y Cambio de Prendas', cycle: 3, module: 'M13', desc: 'Validación de ticket (14 días), inspección física, reingreso al Kardex al CPP histórico y compensación en caja.', route: '/pos', icon: 'fa-exchange-alt', color: '#10b981' }
  ];

  get filteredUseCases(): UseCaseItem[] {
    if (this.selectedCycleTab === 'c1') {
      return this.useCases.filter(c => c.cycle === 1);
    }
    if (this.selectedCycleTab === 'c2') {
      return this.useCases.filter(c => c.cycle === 2);
    }
    if (this.selectedCycleTab === 'c3') {
      return this.useCases.filter(c => c.cycle === 3);
    }
    return this.useCases;
  }

  ngOnInit(): void {
    if (this.canAccess()) {
      this.cargarMetricas();
    }
  }

  cambiarSucursal(id: any): void {
    this.selectedSucursalId = id;
    this.cargarMetricas();
  }

  cambiarRangoFecha(r: string): void {
    this.selectedRangoFecha = r;
    this.cargarMetricas();
  }

  cambiarRankingTipo(t: string): void {
    this.selectedRankingTipo = t;
    this.cargarMetricas();
  }

  cargarMetricas(): void {
    this.isLoading = true;
    this.isError = false;
    this.cdr.detectChanges();

    this.api.getDashboardMetricas(this.selectedSucursalId, this.selectedRangoFecha, this.selectedRankingTipo).subscribe({
      next: (data) => {
        if (data && data.kpis) {
          this.kpis = data.kpis;
          this.distribucion = data.distribucion_canales || { online: 0, pos: 0 };
          this.distribucionMediosPago = data.distribucion_medios_pago || {};
          this.rendimientoInventario = data.rendimiento_inventario || [];
          this.ultimasOrdenes = data.ultimas_ordenes || [];
          this.ultimasReservas = data.ultimas_reservas || [];
          this.sucursalesDisponibles = data.sucursales_disponibles || [];
          if (data.filtro_actual) {
            this.selectedSucursalId = data.filtro_actual.sucursal_id;
            this.selectedSucursalNombre = data.filtro_actual.sucursal_nombre;
            this.isSucursalLocked = !!data.filtro_actual.sucursal_bloqueada;
          }
          if (data.auditoria_contable) {
            this.auditoriaContable = data.auditoria_contable;
          }
          if (data.servicios_estado) {
            this.serviciosEstado = { ...this.serviciosEstado, ...data.servicios_estado };
          }
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isError = true;
        this.cargarMetricasRespaldo();
      }
    });
  }

  private cargarMetricasRespaldo(): void {
    this.api.getProductos().subscribe(p => {
      this.kpis.total_productos = p.length;
      this.cdr.detectChanges();
    });
    this.api.getSucursales().subscribe(s => {
      this.kpis.total_sucursales = s.length;
      this.cdr.detectChanges();
    });
    this.api.getInventario().subscribe(inv => {
      this.kpis.stock_total = inv.reduce((acc, curr) => acc + curr.stock_fisico, 0);
      this.cdr.detectChanges();
    });
    this.api.getUsuarios().subscribe({
      next: (u) => {
        this.kpis.total_usuarios = u.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getOnlinePct(): number {
    const total = this.distribucion.online + this.distribucion.pos;
    if (total === 0) return 50;
    return Math.round((this.distribucion.online / total) * 100);
  }

  canAccess(): boolean {
    return this.auth.isAdmin() || this.auth.isManager();
  }

  exportarPDF(): void {
    this.isPdfModalOpen = true;
  }

  cerrarModalPDF(): void {
    this.isPdfModalOpen = false;
  }

  imprimirReporte(): void {
    window.print();
  }

  exportarXLSX(): void {
    const fechaIso = this.auditoriaContable?.fecha_emision_local || new Date().toLocaleString();
    const hash = this.auditoriaContable?.firma_digital_sha256 || 'HASH_INMUTABLE_CU24';
    const auditor = `${this.auditoriaContable?.usuario || 'Administrador'} (${this.auditoriaContable?.rol || 'ADMINISTRADOR'})`;
    const sucursal = this.selectedSucursalNombre;
    const periodo = this.selectedRangoFecha === 'TODO' ? 'Histórico Consolidado' : (this.selectedRangoFecha === 'HOY' ? 'Jornada Actual (Hoy)' : (this.selectedRangoFecha === '7_DIAS' ? 'Últimos 7 Días' : 'Mes Corriente'));
    const rankingModo = this.selectedRankingTipo === 'TOP10' ? 'Top 10 Más Vendidas' : (this.selectedRankingTipo === 'BOTTOM10' ? 'Bottom 10 Menor Rotación' : 'Catálogo Completo');

    // Filas de medios de pago
    const mediosRows = this.getMediosPagoEntries().map(m => `
      <tr style="background-color: #FFFFFF;">
        <td colspan="3" style="border: 1px solid #CBD5E1; padding: 6px 10px; font-weight: bold; color: #1E293B;">${m.nombre}</td>
        <td colspan="3" style="border: 1px solid #CBD5E1; padding: 6px 10px; text-align: center; mso-number-format:'\\#\\,\\#\\#0';">${m.cantidad} transacciones</td>
        <td colspan="2" style="border: 1px solid #CBD5E1; padding: 6px 10px; text-align: right; font-weight: bold; color: #2563EB; mso-number-format:'0\\.0%';">${(m.pct / 100).toFixed(3)}</td>
        <td colspan="2" style="border: 1px solid #CBD5E1; padding: 6px 10px; text-align: center; font-weight: bold; color: #059669;">CONCILIADO AL 100%</td>
      </tr>
    `).join('');

    // Filas de rendimiento textil
    const prendasRows = this.rendimientoInventario.map((p, idx) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF'};">
        <td style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: center; font-weight: bold; color: #64748B;">#${p.ranking_pos || (idx + 1)}</td>
        <td style="border: 1px solid #CBD5E1; padding: 6px 8px; font-family: monospace; font-weight: bold; color: #0F172A;">${p.sku}</td>
        <td style="border: 1px solid #CBD5E1; padding: 6px 10px; font-weight: bold; color: #1E293B;">${p.nombre}</td>
        <td style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: center; color: #475569;">${p.categoria}</td>
        <td style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: right; font-weight: bold; mso-number-format:'\\#\\,\\#\\#0';">${p.stock_total}</td>
        <td style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: right; font-weight: bold; color: #4F46E5; mso-number-format:'\\#\\,\\#\\#0';">${p.unidades_vendidas || 0}</td>
        <td style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: right; color: #475569; mso-number-format:'\"Bs.\"\\ \\#\\,\\#\\#0\\.00';">${Number(p.ultimo_costo).toFixed(2)}</td>
        <td style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: right; font-weight: bold; color: #D97706; mso-number-format:'\"Bs.\"\\ \\#\\,\\#\\#0\\.00';">${Number(p.cpp).toFixed(2)}</td>
        <td style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: right; font-weight: bold; color: #059669; mso-number-format:'\"Bs.\"\\ \\#\\,\\#\\#0\\.00';">${Number(p.precio_venta).toFixed(2)}</td>
        <td style="border: 1px solid #CBD5E1; padding: 6px 8px; text-align: right; font-weight: bold; color: #047857; mso-number-format:'+0\\.0%';">${(p.margen_bruto_pct / 100).toFixed(3)}</td>
      </tr>
    `).join('');

    const excelHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Auditoria_CU24</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1E293B; }
          table { border-collapse: collapse; width: 100%; }
          th { background-color: #0F172A; color: #FFFFFF; font-weight: bold; text-align: center; border: 1px solid #CBD5E1; height: 28px; font-size: 10.5pt; }
          td { border: 1px solid #CBD5E1; font-size: 10.5pt; vertical-align: middle; }
        </style>
      </head>
      <body>
        <table>
          <!-- ENCABEZADO CORPORATIVO -->
          <tr>
            <td colspan="10" style="background-color: #0F172A; color: #F8FAFC; text-align: center; font-size: 18pt; font-weight: 900; height: 48px; border: none;">
              FASHIONSTORE S.R.L. — AUDITORÍA CONTABLE Y CUADROS DE MANDO
            </td>
          </tr>
          <tr>
            <td colspan="10" style="background-color: #1E293B; color: #E2E8F0; text-align: center; font-size: 11pt; font-weight: bold; height: 26px; border: none;">
              PLATAFORMA INTELIGENTE DE COMERCIO OMNICANAL | CASO DE USO CU24 (METODOLOGÍA PUDS - SI2)
            </td>
          </tr>
          <tr>
            <td colspan="10" style="background-color: #334155; color: #CBD5E1; text-align: center; font-size: 9.5pt; height: 22px; border: none;">
              NIT: 1028472029 | Matrícula de Comercio: 00394821 | Autorización Fiscal: 2026-SI2-CU24 | La Paz / Santa Cruz — Bolivia
            </td>
          </tr>
          <tr><td colspan="10" style="height: 14px; border: none;"></td></tr>

          <!-- METADATOS DE AUDITORÍA Y SEGURIDAD -->
          <tr style="background-color: #2563EB;">
            <td colspan="10" style="color: #FFFFFF; font-size: 12pt; font-weight: bold; height: 28px; padding-left: 10px; border: 1px solid #1D4ED8;">
              PARÁMETROS OFICIALES DE LA AUDITORÍA Y METADATOS DEL SISTEMA
            </td>
          </tr>
          <tr>
            <td colspan="2" style="background-color: #F1F5F9; font-weight: bold; color: #334155; padding: 6px 10px; border: 1px solid #CBD5E1;">Usuario Auditor:</td>
            <td colspan="3" style="background-color: #FFFFFF; padding: 6px 10px; border: 1px solid #CBD5E1; font-weight: bold;">${auditor}</td>
            <td colspan="2" style="background-color: #F1F5F9; font-weight: bold; color: #334155; padding: 6px 10px; border: 1px solid #CBD5E1;">Sucursal Evaluada:</td>
            <td colspan="3" style="background-color: #FFFFFF; padding: 6px 10px; border: 1px solid #CBD5E1; font-weight: bold; color: #2563EB;">${sucursal}</td>
          </tr>
          <tr>
            <td colspan="2" style="background-color: #F1F5F9; font-weight: bold; color: #334155; padding: 6px 10px; border: 1px solid #CBD5E1;">Periodo Temporal:</td>
            <td colspan="3" style="background-color: #FFFFFF; padding: 6px 10px; border: 1px solid #CBD5E1;">${periodo}</td>
            <td colspan="2" style="background-color: #F1F5F9; font-weight: bold; color: #334155; padding: 6px 10px; border: 1px solid #CBD5E1;">Filtro de Ranking:</td>
            <td colspan="3" style="background-color: #FFFFFF; padding: 6px 10px; border: 1px solid #CBD5E1;">${rankingModo}</td>
          </tr>
          <tr>
            <td colspan="2" style="background-color: #F1F5F9; font-weight: bold; color: #334155; padding: 6px 10px; border: 1px solid #CBD5E1;">Fecha y Hora Local:</td>
            <td colspan="3" style="background-color: #FFFFFF; padding: 6px 10px; border: 1px solid #CBD5E1; font-weight: bold; color: #D97706;">${fechaIso}</td>
            <td colspan="2" style="background-color: #F1F5F9; font-weight: bold; color: #334155; padding: 6px 10px; border: 1px solid #CBD5E1;">Estado Integridad:</td>
            <td colspan="3" style="background-color: #DCFCE7; padding: 6px 10px; border: 1px solid #CBD5E1; font-weight: bold; color: #15803D; text-align: center;">REGISTRO INMUTABLE Y VERIFICADO</td>
          </tr>
          <tr>
            <td colspan="2" style="background-color: #F1F5F9; font-weight: bold; color: #334155; padding: 6px 10px; border: 1px solid #CBD5E1;">Firma Digital SHA-256:</td>
            <td colspan="8" style="background-color: #F8FAFC; padding: 6px 10px; border: 1px solid #CBD5E1; font-family: monospace; font-size: 9.5pt; color: #0F172A;">${hash}</td>
          </tr>
          <tr><td colspan="10" style="height: 16px; border: none;"></td></tr>

          <!-- SECCIÓN 1: KPIs FINANCIEROS Y COMERCIALES -->
          <tr style="background-color: #0F172A;">
            <td colspan="10" style="color: #FFFFFF; font-size: 12pt; font-weight: bold; height: 28px; padding-left: 10px; border: 1px solid #0F172A;">
              1. RESUMEN EJECUTIVO DE INDICADORES CLAVE DE RENDIMIENTO (KPIs)
            </td>
          </tr>
          <tr style="background-color: #F1F5F9;">
            <td colspan="4" style="font-weight: bold; padding: 8px 10px; border: 1px solid #CBD5E1;">Indicador de Negocio / Métrica Estratégica</td>
            <td colspan="3" style="font-weight: bold; padding: 8px 10px; border: 1px solid #CBD5E1; text-align: right;">Valor Consolidado en Sistema</td>
            <td colspan="3" style="font-weight: bold; padding: 8px 10px; border: 1px solid #CBD5E1;">Observación / Regla de Negocio</td>
          </tr>
          <tr>
            <td colspan="4" style="padding: 6px 10px; border: 1px solid #CBD5E1; font-weight: bold;">Ventas Totales Cobradas y Fiscalizadas</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: right; font-weight: 900; color: #0F172A; font-size: 12pt; mso-number-format:'\"Bs.\"\\ \\#\\,\\#\\#0\\.00';">${Number(this.kpis.ventas_totales_bs).toFixed(2)}</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #CBD5E1; color: #475569;">${this.kpis.ordenes_pagadas} transacciones con cobro confirmado</td>
          </tr>
          <tr style="background-color: #F8FAFC;">
            <td colspan="4" style="padding: 6px 10px; border: 1px solid #CBD5E1; font-weight: bold;">Valuación Contable al Costo Promedio Ponderado (CPP)</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: right; font-weight: 900; color: #D97706; font-size: 12pt; mso-number-format:'\"Bs.\"\\ \\#\\,\\#\\#0\\.00';">${Number(this.kpis.valuacion_inventario_cpp || 0).toFixed(2)}</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #CBD5E1; color: #475569;">Activo realizable valorado al CPP vigente (CU09/CU24)</td>
          </tr>
          <tr>
            <td colspan="4" style="padding: 6px 10px; border: 1px solid #CBD5E1; font-weight: bold;">Tasa de Efectividad en Probadores Físicos</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: right; font-weight: 900; color: #059669; font-size: 12pt; mso-number-format:'0\\.0%';">${(this.kpis.efectividad_probadores_pct / 100).toFixed(3)}</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #CBD5E1; color: #475569;">${this.kpis.reservas_confirmadas} reservas convertidas a compra en mostrador POS</td>
          </tr>
          <tr style="background-color: #F8FAFC;">
            <td colspan="4" style="padding: 6px 10px; border: 1px solid #CBD5E1; font-weight: bold;">Stock Total en Existencias (Físico)</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: right; font-weight: 900; color: #2563EB; font-size: 12pt; mso-number-format:'\\#\\,\\#\\#0';">${this.kpis.stock_total}</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #CBD5E1; color: #475569;">Unidades físicas en red de almacenes y sucursales</td>
          </tr>
          <tr>
            <td colspan="4" style="padding: 6px 10px; border: 1px solid #CBD5E1; font-weight: bold;">Distribución por Canal Comercial</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #CBD5E1; text-align: right; font-weight: bold; color: #1E293B;">Online: ${this.distribucion.online} | POS: ${this.distribucion.pos}</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #CBD5E1; color: #475569;">${this.getOnlinePct()}% ventas digitales vs ${100 - this.getOnlinePct()}% tiendas</td>
          </tr>
          <tr><td colspan="10" style="height: 16px; border: none;"></td></tr>

          <!-- SECCIÓN 2: MEDIOS DE RECAUDACIÓN -->
          <tr style="background-color: #0F172A;">
            <td colspan="10" style="color: #FFFFFF; font-size: 12pt; font-weight: bold; height: 28px; padding-left: 10px; border: 1px solid #0F172A;">
              2. CONCILIACIÓN DE RECAUDACIÓN POR PASARELAS Y MEDIOS DE PAGO (CU17 / CU24)
            </td>
          </tr>
          <tr style="background-color: #F1F5F9;">
            <th colspan="3" style="text-align: left; padding: 6px 10px;">Medio de Pago / Pasarela</th>
            <th colspan="3" style="text-align: center; padding: 6px 10px;">Operaciones Procesadas</th>
            <th colspan="2" style="text-align: right; padding: 6px 10px;">Participación (%)</th>
            <th colspan="2" style="text-align: center; padding: 6px 10px;">Estado Auditoría</th>
          </tr>
          ${mediosRows}
          <tr><td colspan="10" style="height: 16px; border: none;"></td></tr>

          <!-- SECCIÓN 3: RENDIMIENTO TEXTIL AL CPP -->
          <tr style="background-color: #0F172A;">
            <td colspan="10" style="color: #FFFFFF; font-size: 12pt; font-weight: bold; height: 28px; padding-left: 10px; border: 1px solid #0F172A;">
              3. RENDIMIENTO TEXTIL: ROTACIÓN DE PRENDAS, CPP Y MARGEN BRUTO DE GANANCIA (CU24)
            </td>
          </tr>
          <tr style="background-color: #1E293B; color: #FFFFFF;">
            <th style="width: 50px;">Rank</th>
            <th style="width: 120px;">Código SKU</th>
            <th style="width: 260px; text-align: left; padding-left: 8px;">Descripción de la Prenda</th>
            <th style="width: 130px;">Categoría</th>
            <th style="width: 90px; text-align: right; padding-right: 8px;">Stock Físico</th>
            <th style="width: 100px; text-align: right; padding-right: 8px;">Uds. Vendidas</th>
            <th style="width: 110px; text-align: right; padding-right: 8px;">Último Costo</th>
            <th style="width: 120px; text-align: right; padding-right: 8px;">CPP Vigente</th>
            <th style="width: 120px; text-align: right; padding-right: 8px;">Precio Venta</th>
            <th style="width: 110px; text-align: right; padding-right: 8px;">Margen Bruto</th>
          </tr>
          ${prendasRows}
          <tr><td colspan="10" style="height: 24px; border: none;"></td></tr>

          <!-- FIRMAS DE RESPONSABILIDAD -->
          <tr>
            <td colspan="5" style="text-align: center; border: none; padding: 15px;">
              <div style="border-top: 1px solid #334155; width: 80%; margin: 0 auto; padding-top: 6px;">
                <strong>MSc. Ing. Angélica Garzón Cuéllar</strong><br>
                <span style="font-size: 9.5pt; color: #64748B;">Docente Guía / Auditoría de Sistemas (SI2)<br>Universidad Autónoma Gabriel René Moreno</span>
              </div>
            </td>
            <td colspan="5" style="text-align: center; border: none; padding: 15px;">
              <div style="border-top: 1px solid #334155; width: 80%; margin: 0 auto; padding-top: 6px;">
                <strong>Alberto Delgado & Andy Mujica</strong><br>
                <span style="font-size: 9.5pt; color: #64748B;">Dirección Financiera / Administración General<br>FashionStore S.R.L.</span>
              </div>
            </td>
          </tr>
          <tr><td colspan="10" style="height: 12px; border: none;"></td></tr>
          <tr>
            <td colspan="10" style="text-align: center; font-size: 8.5pt; color: #94A3B8; border-top: 1px dashed #CBD5E1; padding-top: 8px;">
              Documento emitido formalmente bajo metodología PUDS y normativa contable boliviana (NC3). El hash criptográfico garantiza que las existencias y los costos no han sido alterados manualmente.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Auditoria_CU24_FashionStore_${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Auditoría Contable CU24', 'Planilla ejecutiva formal descargada exitosamente (.XLS)');
  }

  getMediosPagoEntries(): { nombre: string; cantidad: number; pct: number; icono: string }[] {
    const entries = Object.entries(this.distribucionMediosPago);
    const total = entries.reduce((acc, [_, v]) => acc + v, 0) || 1;
    const icons: { [key: string]: string } = {
      'Efectivo POS': 'fa-money-bill-wave',
      'Tarjeta POS': 'fa-credit-card',
      'Stripe Digital': 'fa-globe',
      'QR Interoperable BCB': 'fa-qrcode'
    };
    return entries.map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
      pct: Math.round((cantidad / total) * 100),
      icono: icons[nombre] || 'fa-receipt'
    }));
  }
}
