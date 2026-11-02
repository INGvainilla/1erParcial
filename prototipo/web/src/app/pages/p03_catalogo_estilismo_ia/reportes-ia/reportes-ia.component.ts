import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../../core/constants/api.constants';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

interface AIQueryResponse {
  prompt: string;
  interpretacion: string;
  sql_generado: string;
  datos: any[];
  chart?: any;
}

interface PromptItem {
  label: string;
  query: string;
  icon?: string;
}

interface PromptCategory {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  prompts: PromptItem[];
}

@Component({
  selector: 'app-reportes-ia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="reportes-container">
      <!-- HEADER EJECUTIVO UNIFICADO -->
      <header class="header-card">
        <div class="header-main">
          <div class="header-badges">
            <span class="badge badge-primary"><i class="fas fa-brain"></i> CU15 · Analítica Generativa IA</span>
            <span class="badge badge-accent"><i class="fas fa-shield-alt"></i> AST Sanitizado (Solo SELECT)</span>
            <span class="badge badge-amber"><i class="fas fa-crown"></i> Plan Profesional / Enterprise</span>
            <span class="badge badge-tenant"><i class="fas fa-store"></i> {{ auth.getNombreEmpresa() || ('Tenant #' + (auth.getActiveEmpresaId() || 1)) }}</span>
          </div>
          <h1 class="header-title">
            <i class="fas fa-chart-pie header-icon"></i>
            Reportes Ejecutivos & Analítica con Inteligencia Artificial
          </h1>
          <p class="header-desc">
            Motor de procesamiento de lenguaje natural (NLP) con mapeo semántico relacional y aislamiento inquebrantable de datos por empresa.
          </p>
        </div>
        <div class="header-meta">
          <div class="security-indicator">
            <span class="sec-dot"></span>
            <div class="sec-text">
              <span class="sec-title">Aislamiento Multitenant Activo</span>
              <code>WHERE id_empresa = :tenant_id</code>
            </div>
          </div>
          <button class="btn-refresh" (click)="consultarIA()" [disabled]="isLoading" title="Recargar consulta actual">
            <i class="fas fa-sync-alt" [class.fa-spin]="isLoading"></i>
            <span>Actualizar</span>
          </button>
        </div>
      </header>

      <!-- CONSOLA DE BÚSQUEDA Y DICTADO POR VOZ -->
      <section class="console-card">
        <!-- Input Principal Unificado -->
        <div class="search-row">
          <div class="input-container">
            <i class="fas fa-search input-search-icon"></i>
            <input
              type="text"
              [(ngModel)]="promptTexto"
              (keyup.enter)="consultarIA()"
              placeholder="Escribe o dicta tu consulta de negocio (ej: Ventas por categoría, Top prendas, Stock crítico...)"
              class="prompt-input"
            />
            <button
              type="button"
              class="btn-mic"
              [class.is-recording]="isListening"
              (click)="toggleVoiceInput()"
              [title]="isListening ? 'Detener escucha' : 'Dictar por voz (Web Speech API)'"
            >
              <i class="fas" [ngClass]="isListening ? 'fa-microphone-slash' : 'fa-microphone'"></i>
              <span class="mic-status-label">{{ isListening ? 'Escuchando...' : 'Por Voz' }}</span>
            </button>
          </div>
          <button
            type="button"
            class="btn-submit"
            (click)="consultarIA()"
            [disabled]="isLoading || !promptTexto.trim()"
          >
            <i class="fas" [class.fa-wand-magic-sparkles]="!isLoading" [class.fa-spinner]="isLoading" [class.fa-spin]="isLoading"></i>
            <span>{{ isLoading ? 'Analizando...' : 'Generar Reporte' }}</span>
          </button>
        </div>

        <!-- Alerta de Escucha en Vivo -->
        <div *ngIf="isListening" class="live-voice-banner">
          <div class="voice-equalizer">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <span class="voice-hint">Micrófono activado en Español Bolivia. Di tu pregunta con claridad...</span>
        </div>

        <!-- Alerta de Error de Backend / Restricción -->
        <div *ngIf="errorMensaje" class="error-banner">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ errorMensaje }}</span>
        </div>

        <!-- SELECTOR DE FILTROS TEMÁTICOS Y ACCESOS RÁPIDOS -->
        <div class="quick-filters-wrapper">
          <div class="category-tabs">
            <span class="filter-caption"><i class="fas fa-compass"></i> Explorar filtros:</span>
            <button
              type="button"
              class="cat-tab"
              [class.active]="selectedCategoriaId === 'TODAS'"
              (click)="selectedCategoriaId = 'TODAS'"
            >
              Todos los Filtros
            </button>
            <button
              *ngFor="let cat of categoriasFiltros"
              type="button"
              class="cat-tab"
              [class.active]="selectedCategoriaId === cat.id"
              (click)="selectedCategoriaId = cat.id"
            >
              <i class="fas" [ngClass]="cat.icono" [style.color]="selectedCategoriaId === cat.id ? '#fff' : cat.color"></i>
              {{ cat.nombre }}
            </button>
          </div>

          <div class="prompts-ribbon">
            <button
              *ngFor="let p of getPromptsVisibles()"
              type="button"
              class="chip-prompt"
              [class.is-active]="promptTexto.toLowerCase() === p.query.toLowerCase()"
              (click)="ejecutarPrompt(p.query)"
              [title]="p.query"
            >
              <i class="fas" [ngClass]="p.icon || 'fa-bolt'" style="opacity: 0.7;"></i>
              <span>{{ p.label }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- RESULTADOS DEL REPORTE EJECUTIVO -->
      <section *ngIf="resultado" class="results-card">
        <!-- Top bar del Reporte -->
        <div class="results-header">
          <div class="interpretation-info">
            <div class="verified-tag">
              <i class="fas fa-check-circle"></i> Interpretación Semántica Validada
            </div>
            <h2 class="interpretation-title">{{ resultado.interpretacion }}</h2>
            <div class="query-echo">
              <span class="echo-label">Pregunta original:</span>
              <span class="echo-query">"{{ resultado.prompt }}"</span>
            </div>
          </div>
          <div class="header-actions">
            <span class="ast-badge"><i class="fas fa-shield-halved"></i> Solo Lectura (AST Verified)</span>
          </div>
        </div>

        <!-- 4 TARJETAS KPI RESUMEN CALIBRADAS -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon-wrap emerald">
              <i class="fas fa-coins"></i>
            </div>
            <div class="kpi-body">
              <span class="kpi-title">Monto / Facturación Total</span>
              <span class="kpi-number emerald">Bs. {{ calcularTotalMonto() | number:'1.2-2' }}</span>
              <span class="kpi-sub">Total en dimensión analizada</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrap cyan">
              <i class="fas fa-boxes-stacked"></i>
            </div>
            <div class="kpi-body">
              <span class="kpi-title">Volumen Operativo</span>
              <span class="kpi-number cyan">{{ calcularTotalCantidad() }} <small>uds / transacciones</small></span>
              <span class="kpi-sub">Artículos o movimientos</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrap indigo">
              <i class="fas fa-layer-group"></i>
            </div>
            <div class="kpi-body">
              <span class="kpi-title">Dimensiones Evaluadas</span>
              <span class="kpi-number indigo">{{ resultado.datos?.length || 0 }} <small>registros</small></span>
              <span class="kpi-sub">Filas agregadas en consulta</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon-wrap amber">
              <i class="fas fa-lock"></i>
            </div>
            <div class="kpi-body">
              <span class="kpi-title">Aislamiento Multitenant</span>
              <span class="kpi-number amber">100% Hermético</span>
              <span class="kpi-sub">Sin cruce de inventario</span>
            </div>
          </div>
        </div>

        <!-- PESTAÑAS DE VISTA -->
        <div class="view-tabs-row">
          <div class="tabs-group">
            <button
              class="tab-btn"
              [class.active]="activeTab === 'GRAFICO'"
              (click)="activeTab = 'GRAFICO'"
            >
              <i class="fas fa-chart-bar"></i> Visualización de Distribución
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab === 'TABLA'"
              (click)="activeTab = 'TABLA'"
            >
              <i class="fas fa-table-list"></i> Matriz Detallada de Datos
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab === 'SQL'"
              (click)="activeTab = 'SQL'"
            >
              <i class="fas fa-code"></i> Auditoría SQL Generada
            </button>
          </div>
        </div>

        <!-- VISTA 1: GRÁFICO PROPORCIONAL CALIBRADO -->
        <div *ngIf="activeTab === 'GRAFICO'" class="chart-container">
          <div class="chart-list">
            <div *ngFor="let item of resultado.datos; let i = index" class="chart-row-card">
              <!-- Posición / Ranking -->
              <div class="chart-rank">#{{ i + 1 }}</div>

              <!-- Nombre y Detalles -->
              <div class="chart-info">
                <span class="item-name">{{ item.etiqueta || item.nombre || 'Sin Etiqueta' }}</span>
                <span class="item-sub" *ngIf="item.cantidad_prendas || item.total_transacciones || item.stock_actual">
                  {{ item.cantidad_prendas || item.total_transacciones || item.stock_actual }} unidades registradas
                </span>
              </div>

              <!-- Barra Proporcional con Porcentaje -->
              <div class="chart-bar-area">
                <div class="bar-track">
                  <div
                    class="bar-fill"
                    [style.width.%]="calcularPorcentaje(item.total_ventas || item.total_vendido || item.cantidad_prendas || 0)"
                  ></div>
                </div>
                <span class="bar-percent font-mono">
                  {{ calcularPorcentaje(item.total_ventas || item.total_vendido || item.cantidad_prendas || 0) | number:'1.1-1' }}%
                </span>
              </div>

              <!-- Monto Numérico Alineado -->
              <div class="chart-amount">
                <span class="amount-val font-mono">
                  Bs. {{ (item.total_ventas || item.total_vendido || 0) | number:'1.2-2' }}
                </span>
              </div>
            </div>

            <div *ngIf="!resultado.datos || resultado.datos.length === 0" class="empty-state">
              <i class="fas fa-chart-simple"></i>
              <p>No se encontraron datos que coincidan con la consulta para este tenant.</p>
            </div>
          </div>
        </div>

        <!-- VISTA 2: TABLA DETALLADA -->
        <div *ngIf="activeTab === 'TABLA'" class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 45%;">Dimensión / Atributo</th>
                <th style="width: 20%; text-align: right;">Cantidad / Transacciones</th>
                <th style="width: 20%; text-align: right;">Monto Facturado (Bs.)</th>
                <th style="width: 15%; text-align: right;">Participación</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of resultado.datos">
                <td class="col-name font-semibold">
                  <i class="fas fa-cube text-muted" style="margin-right: 8px; font-size: 0.8rem;"></i>
                  {{ r.etiqueta || r.nombre || 'Sin Etiqueta' }}
                </td>
                <td style="text-align: right;" class="font-mono text-muted">
                  {{ r.cantidad_prendas || r.total_transacciones || r.total_vendido || r.stock_actual || '-' }}
                </td>
                <td style="text-align: right;" class="font-mono font-bold text-emerald">
                  Bs. {{ (r.total_ventas || r.total_vendido || 0) | number:'1.2-2' }}
                </td>
                <td style="text-align: right;" class="font-mono text-cyan">
                  {{ calcularPorcentaje(r.total_ventas || r.total_vendido || r.cantidad_prendas || 0) | number:'1.1-1' }}%
                </td>
              </tr>
              <tr *ngIf="!resultado.datos || resultado.datos.length === 0">
                <td colspan="4" class="empty-table-row">No hay registros asociados a los filtros solicitados.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- VISTA 3: AUDITORÍA SQL GENERADA -->
        <div *ngIf="activeTab === 'SQL'" class="sql-container">
          <div class="sql-topbar">
            <span class="sql-title"><i class="fas fa-terminal"></i> Consulta SQL Enlazada con Parámetros Sanitizados</span>
            <span class="sql-pill"><i class="fas fa-shield-check"></i> Inyección SQL Neutralizada por AST</span>
          </div>
          <pre class="sql-code"><code>{{ resultado.sql_generado }}</code></pre>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .reportes-container {
      padding: 1.5rem 2rem;
      max-width: 1600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      color: #f1f5f9;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* TARJETA HEADER UNIFICADA */
    .header-card {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6));
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.25rem;
      backdrop-filter: blur(10px);
    }

    .header-main {
      flex: 1;
      min-width: 320px;
    }

    .header-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 0.4rem;
    }

    .badge {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .badge-primary {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.35);
      color: #a5b4fc;
    }

    .badge-accent {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
    }

    .badge-amber {
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fcd34d;
    }

    .badge-tenant {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
    }

    .header-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0.15rem 0 0.3rem 0;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      letter-spacing: -0.02em;
    }

    .header-icon {
      color: #818cf8;
      font-size: 1.25rem;
    }

    .header-desc {
      color: #94a3b8;
      font-size: 0.82rem;
      margin: 0;
      line-height: 1.35;
    }

    .header-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .security-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(2, 6, 23, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.07);
      padding: 6px 12px;
      border-radius: 8px;
    }

    .sec-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    .sec-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .sec-title {
      font-size: 0.7rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .sec-text code {
      font-size: 0.72rem;
      color: #38bdf8;
      font-family: ui-monospace, monospace;
    }

    .btn-refresh {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }

    .btn-refresh:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    /* CONSOLA DE BÚSQUEDA Y COMANDOS */
    .console-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      backdrop-filter: blur(10px);
    }

    .search-row {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 0.85rem;
    }

    .input-container {
      flex: 1;
      display: flex;
      align-items: center;
      background: #020617;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 0 10px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .input-container:focus-within {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
    }

    .input-search-icon {
      color: #64748b;
      margin-right: 8px;
      font-size: 0.9rem;
    }

    .prompt-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #f8fafc;
      padding: 10px 0;
      font-size: 0.9rem;
      outline: none;
    }

    .prompt-input::placeholder {
      color: #64748b;
      font-size: 0.85rem;
    }

    .btn-mic {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      padding: 6px 10px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.76rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-mic:hover {
      background: rgba(99, 102, 241, 0.2);
      border-color: #6366f1;
      color: #a5b4fc;
    }

    .btn-mic.is-recording {
      background: #dc2626;
      border-color: #ef4444;
      color: #fff;
      animation: mic-pulse 1.5s infinite;
    }

    @keyframes mic-pulse {
      0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
      70% { box-shadow: 0 0 0 6px rgba(220, 38, 38, 0); }
      100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
    }

    .btn-submit {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      white-space: nowrap;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
    }

    .btn-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #4338ca, #4f46e5);
      transform: translateY(-1px);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .live-voice-banner {
      background: rgba(220, 38, 38, 0.1);
      border: 1px solid rgba(220, 38, 38, 0.25);
      border-radius: 6px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 0.75rem;
      font-size: 0.78rem;
      color: #fca5a5;
    }

    .voice-equalizer {
      display: flex;
      gap: 2px;
      align-items: center;
    }

    .voice-equalizer span {
      width: 2.5px;
      height: 10px;
      background: #f87171;
      border-radius: 1px;
      animation: eq-anim 0.8s infinite ease-in-out;
    }

    .voice-equalizer span:nth-child(2) { animation-delay: 0.15s; height: 14px; }
    .voice-equalizer span:nth-child(3) { animation-delay: 0.3s; height: 18px; }
    .voice-equalizer span:nth-child(4) { animation-delay: 0.15s; height: 12px; }
    .voice-equalizer span:nth-child(5) { animation-delay: 0.05s; height: 8px; }

    @keyframes eq-anim {
      0%, 100% { transform: scaleY(0.4); }
      50% { transform: scaleY(1); }
    }

    .error-banner {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: 6px;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 0.75rem;
      font-size: 0.8rem;
      color: #fca5a5;
    }

    /* FILTROS TEMÁTICOS HORIZONTALES */
    .quick-filters-wrapper {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .category-tabs {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .filter-caption {
      font-size: 0.74rem;
      color: #64748b;
      font-weight: 600;
      margin-right: 4px;
    }

    .cat-tab {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #94a3b8;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s ease;
    }

    .cat-tab:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }

    .cat-tab.active {
      background: rgba(99, 102, 241, 0.2);
      border-color: #6366f1;
      color: #ffffff;
      font-weight: 600;
    }

    .prompts-ribbon {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .chip-prompt {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #cbd5e1;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.74rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .chip-prompt:hover {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.35);
      color: #fff;
      transform: translateY(-1px);
    }

    .chip-prompt.is-active {
      background: rgba(99, 102, 241, 0.25);
      border-color: #818cf8;
      color: #ffffff;
      font-weight: 600;
    }

    /* SECCIÓN DE RESULTADOS */
    .results-card {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      backdrop-filter: blur(10px);
    }

    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      padding-bottom: 0.85rem;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .verified-tag {
      font-size: 0.7rem;
      font-weight: 700;
      color: #10b981;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .interpretation-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 3px 0;
    }

    .query-echo {
      font-size: 0.76rem;
      color: #94a3b8;
    }

    .echo-label {
      color: #64748b;
      margin-right: 4px;
    }

    .echo-query {
      color: #cbd5e1;
      font-style: italic;
    }

    .ast-badge {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
    }

    /* 4 KPIS GRID */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 1.25rem;
    }

    @media (max-width: 1024px) {
      .kpi-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .kpi-card {
      background: rgba(2, 6, 23, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 0.85rem 1rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .kpi-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .kpi-icon-wrap.emerald { background: rgba(16, 185, 129, 0.12); color: #34d399; }
    .kpi-icon-wrap.cyan { background: rgba(6, 182, 212, 0.12); color: #22d3ee; }
    .kpi-icon-wrap.indigo { background: rgba(99, 102, 241, 0.12); color: #818cf8; }
    .kpi-icon-wrap.amber { background: rgba(245, 158, 11, 0.12); color: #fbbf24; }

    .kpi-body {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }

    .kpi-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .kpi-number {
      font-size: 1.15rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
    }

    .kpi-number small {
      font-size: 0.7rem;
      font-weight: 500;
      color: #94a3b8;
    }

    .kpi-sub {
      font-size: 0.68rem;
      color: #64748b;
    }

    /* PESTAÑAS DE VISTA */
    .view-tabs-row {
      display: flex;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      margin-bottom: 1rem;
    }

    .tabs-group {
      display: flex;
      gap: 6px;
      padding-bottom: 8px;
    }

    .tab-btn {
      background: transparent;
      border: 1px solid transparent;
      color: #94a3b8;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    .tab-btn:hover {
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.04);
    }

    .tab-btn.active {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.35);
      color: #ffffff;
      font-weight: 600;
    }

    /* LISTA DE GRÁFICO PROPORCIONAL */
    .chart-container {
      width: 100%;
    }

    .chart-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .chart-row-card {
      background: rgba(2, 6, 23, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      display: grid;
      grid-template-columns: 36px 280px 1fr 180px;
      align-items: center;
      gap: 16px;
      transition: background 0.15s ease;
    }

    .chart-row-card:hover {
      background: rgba(2, 6, 23, 0.65);
      border-color: rgba(255, 255, 255, 0.09);
    }

    .chart-rank {
      font-size: 0.74rem;
      font-weight: 700;
      color: #64748b;
      text-align: center;
    }

    .chart-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }

    .item-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #f8fafc;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .item-sub {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    .chart-bar-area {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .bar-track {
      flex: 1;
      height: 7px;
      background: rgba(15, 23, 42, 0.8);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #4f46e5, #06b6d4, #10b981);
      border-radius: 4px;
      transition: width 0.4s ease-out;
    }

    .bar-percent {
      font-size: 0.75rem;
      color: #94a3b8;
      min-width: 44px;
      text-align: right;
    }

    .chart-amount {
      text-align: right;
    }

    .amount-val {
      font-size: 0.92rem;
      font-weight: 700;
      color: #10b981;
    }

    @media (max-width: 900px) {
      .chart-row-card {
        grid-template-columns: 32px 1fr;
        gap: 8px;
      }
      .chart-bar-area {
        grid-column: 1 / -1;
      }
      .chart-amount {
        grid-column: 1 / -1;
        text-align: left;
      }
    }

    /* TABLA DE DATOS */
    .table-container {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }

    .data-table th {
      background: rgba(2, 6, 23, 0.5);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 0.65rem 1rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      font-weight: 600;
    }

    .data-table td {
      padding: 0.65rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #e2e8f0;
    }

    .data-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .empty-table-row {
      text-align: center;
      padding: 2rem !important;
      color: #64748b;
    }

    /* SQL BOX */
    .sql-container {
      background: #020617;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 1rem;
    }

    .sql-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.72rem;
      color: #94a3b8;
      margin-bottom: 0.5rem;
    }

    .sql-pill {
      color: #34d399;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .sql-code {
      margin: 0;
      color: #38bdf8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.8rem;
      line-height: 1.5;
      overflow-x: auto;
    }

    .empty-state {
      text-align: center;
      padding: 2.5rem;
      color: #64748b;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .empty-state i {
      font-size: 2rem;
      opacity: 0.4;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.85rem;
    }

    /* UTILITARIOS */
    .emerald { color: #10b981; }
    .cyan { color: #22d3ee; }
    .indigo { color: #818cf8; }
    .amber { color: #fbbf24; }
    .text-muted { color: #94a3b8; }
    .font-mono { font-family: ui-monospace, monospace; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
  `]
})
export class ReportesIaComponent implements OnInit {
  private http = inject(HttpClient);
  public auth = inject(AuthService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  promptTexto: string = 'Ventas por categoría textil';
  isLoading: boolean = false;
  isListening: boolean = false;
  isSpeechSupported: boolean = false;
  errorMensaje: string | null = null;
  resultado: AIQueryResponse | null = null;
  activeTab: 'GRAFICO' | 'TABLA' | 'SQL' = 'GRAFICO';
  selectedCategoriaId: string = 'TODAS';

  private recognition: any = null;

  // Catálogo Estructurado de Filtros Temáticos de Voz y Texto
  categoriasFiltros: PromptCategory[] = [
    {
      id: 'VENTAS',
      nombre: 'Ventas & Rentabilidad',
      icono: 'fa-hand-holding-dollar',
      color: '#34d399',
      prompts: [
        { label: 'Ventas por Categoría', query: 'Ventas por categoría textil', icon: 'fa-chart-pie' },
        { label: 'Tendencia Mensual', query: 'Tendencia mensual de ingresos', icon: 'fa-arrow-trend-up' },
        { label: 'Web vs POS Mostrador', query: 'Comparativa de ventas por canal web vs pos', icon: 'fa-cash-register' },
        { label: 'Top 7 Más Vendidas', query: 'Top prendas más vendidas y rotación', icon: 'fa-crown' }
      ]
    },
    {
      id: 'PRENDAS',
      nombre: 'Líneas Textiles & Colecciones',
      icono: 'fa-shirt',
      color: '#818cf8',
      prompts: [
        { label: 'Línea Camisas Formales', query: 'Ventas de camisas formales', icon: 'fa-shirt' },
        { label: 'Línea Trajes Ejecutivos', query: 'Ventas de trajes ejecutivos', icon: 'fa-user-tie' },
        { label: 'Línea Pantalones & Chinos', query: 'Ventas de pantalones', icon: 'fa-tags' },
        { label: 'Calzado & Mocasines', query: 'Ventas de calzado y mocasines', icon: 'fa-shoe-prints' }
      ]
    },
    {
      id: 'SUCURSALES',
      nombre: 'Sucursales Físicas',
      icono: 'fa-store',
      color: '#fbbf24',
      prompts: [
        { label: 'Rendimiento por Tienda', query: 'Rendimiento consolidado por sucursal física', icon: 'fa-building-columns' },
        { label: 'Sucursal Equipetrol', query: 'Ventas en sucursal Equipetrol', icon: 'fa-location-dot' },
        { label: 'Sucursal Centro', query: 'Ventas en sucursal Centro', icon: 'fa-map-pin' }
      ]
    },
    {
      id: 'INVENTARIO',
      nombre: 'Inventario & Costos (CPP)',
      icono: 'fa-boxes-stacked',
      color: '#ef4444',
      prompts: [
        { label: 'Alertas de Stock Crítico', query: 'Prendas con bajo stock crítico o mínimo', icon: 'fa-triangle-exclamation' },
        { label: 'Valuación CPP Existencias', query: 'Valuación de inventario y Costo Promedio Ponderado', icon: 'fa-calculator' }
      ]
    },
    {
      id: 'PAGOS',
      nombre: 'Medios de Cobro & Pagos',
      icono: 'fa-wallet',
      color: '#06b6d4',
      prompts: [
        { label: 'Efectivo vs Tarjetas vs QR', query: 'Distribución de pagos por efectivo, tarjeta y qr', icon: 'fa-qrcode' }
      ]
    }
  ];

  ngOnInit() {
    this.initSpeechRecognition();
    this.consultarIA();
  }

  getPromptsVisibles(): PromptItem[] {
    if (this.selectedCategoriaId === 'TODAS') {
      return this.categoriasFiltros.flatMap(c => c.prompts);
    }
    const cat = this.categoriasFiltros.find(c => c.id === this.selectedCategoriaId);
    return cat ? cat.prompts : [];
  }

  initSpeechRecognition() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSpeechSupported = true;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-BO';
        this.recognition.continuous = false;
        this.recognition.interimResults = false;

        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          this.promptTexto = transcript;
          this.isListening = false;
          this.toast.info('Voz Reconocida', `"${transcript}"`);
          this.consultarIA();
        };

        this.recognition.onerror = () => {
          this.isListening = false;
          this.toast.warning('Dictado por Voz', 'No se detectó audio claro o el micrófono requiere permisos.');
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.cdr.detectChanges();
        };
      }
    }
  }

  toggleVoiceInput() {
    if (!this.recognition) {
      this.toast.warning('No Compatible', 'Tu navegador no tiene activado el reconocimiento por voz.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        this.isListening = false;
      }
    }
  }

  ejecutarPrompt(prompt: string) {
    this.promptTexto = prompt;
    this.consultarIA();
  }

  consultarIA() {
    if (!this.promptTexto || !this.promptTexto.trim()) return;

    this.isLoading = true;
    this.errorMensaje = null;

    this.http.post<AIQueryResponse>(`${API_BASE_URL}/reportes-ia/query`, {
      prompt: this.promptTexto.trim()
    }, {
      headers: this.auth.getAuthHeaders()
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.resultado = res;
        this.toast.success('Reporte Generado (CU15)', res.interpretacion || 'Consulta ejecutada con éxito.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.resultado = null;
        this.errorMensaje = err.error?.detail || 'Error al procesar la consulta con Inteligencia Artificial.';
        this.toast.error('Error en Consulta IA', this.errorMensaje || 'Fallo en reporte');
        this.cdr.detectChanges();
      }
    });
  }

  calcularTotalMonto(): number {
    if (!this.resultado?.datos) return 0;
    return this.resultado.datos.reduce((acc, row) => acc + (row.total_ventas || row.total_vendido || 0), 0);
  }

  calcularTotalCantidad(): number {
    if (!this.resultado?.datos) return 0;
    return this.resultado.datos.reduce((acc, row) => acc + (row.cantidad_prendas || row.total_transacciones || 0), 0);
  }

  calcularPorcentaje(valor: number): number {
    const total = this.calcularTotalMonto() || this.calcularTotalCantidad() || 1;
    if (total === 0) return 0;
    return Math.min(100, Math.max(5, (valor / total) * 100));
  }
}
