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

      <!-- BARRA DE SELECCIÓN DE MÓDULOS PRESENTACIÓN 3 (CU15, CU16, CU17, CU19) -->
      <nav class="module-nav-bar">
        <button
          type="button"
          class="nav-tab-btn"
          [class.active]="moduloModo === 'REPORTES_IA'"
          (click)="moduloModo = 'REPORTES_IA'"
        >
          <i class="fas fa-brain tab-icon indigo"></i>
          <span>Consultas Ejecutivas IA (CU15)</span>
        </button>
        <button
          type="button"
          class="nav-tab-btn"
          [class.active]="moduloModo === 'ML_PREVISION'"
          (click)="cargarMLPrevision()"
        >
          <i class="fas fa-chart-line tab-icon cyan"></i>
          <span>Previsión Demanda con Machine Learning (CU17)</span>
        </button>
        <button
          type="button"
          class="nav-tab-btn"
          [class.active]="moduloModo === 'PROMOCIONES_MAYORISTA'"
          (click)="cargarPromocionesReglas()"
        >
          <i class="fas fa-tags tab-icon amber"></i>
          <span>Tarifas Mayoristas & Ofertas (CU19)</span>
        </button>
      </nav>

      <ng-container *ngIf="moduloModo === 'REPORTES_IA'">
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
        <!-- Top bar del Reporte con Exportación CU16 Formal -->
        <div class="results-header">
          <div class="interpretation-info">
            <div class="interpretation-badge-row">
              <span class="verified-tag"><i class="fas fa-check-circle"></i> Interpretación Semántica Validada</span>
              <span class="ast-badge"><i class="fas fa-shield-halved"></i> Solo Lectura (AST Verified)</span>
            </div>
            <h2 class="interpretation-title">{{ resultado.interpretacion }}</h2>
            <div class="query-echo">
              <span class="echo-label">Pregunta original:</span>
              <span class="echo-query">"{{ resultado.prompt }}"</span>
            </div>
          </div>

          <!-- PANEL DE EXPORTACIÓN OFICIAL CU16 -->
          <div class="cu16-export-panel">
            <div class="cu16-header-label">
              <i class="fas fa-file-export text-indigo"></i>
              <span>Exportación Oficial (CU16)</span>
            </div>
            <div class="cu16-actions-row">
              <button class="btn-cu16 excel" (click)="exportarReporte('excel')" title="Descargar libro Excel XLSX con fórmulas computadas openpyxl">
                <div class="btn-cu16-icon excel">
                  <i class="fas fa-file-excel"></i>
                </div>
                <div class="btn-cu16-content">
                  <span class="btn-cu16-main">Excel .XLSX</span>
                  <span class="btn-cu16-caption">Fórmulas =SUM()</span>
                </div>
              </button>

              <button class="btn-cu16 pdf" (click)="exportarReporte('pdf')" title="Descargar informe formal ejecutivo en PDF reportlab">
                <div class="btn-cu16-icon pdf">
                  <i class="fas fa-file-pdf"></i>
                </div>
                <div class="btn-cu16-content">
                  <span class="btn-cu16-main">PDF Ejecutivo</span>
                  <span class="btn-cu16-caption">ReportLab Oficial</span>
                </div>
              </button>
            </div>
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
      </ng-container>

      <!-- SECCIÓN CU17: PREVISIÓN DE DEMANDA CON MACHINE LEARNING -->
      <section *ngIf="moduloModo === 'ML_PREVISION'" class="custom-panel">
        <div class="panel-header">
          <div class="panel-header-info">
            <div class="header-badges">
              <span class="badge badge-accent"><i class="fas fa-brain"></i> Machine Learning (CU17)</span>
              <span class="badge badge-primary"><i class="fas fa-chart-line"></i> Scikit-Learn Model</span>
              <span class="badge badge-amber"><i class="fas fa-microchip"></i> Ridge & K-Means (k=3)</span>
            </div>
            <h2 class="panel-title">
              <i class="fas fa-network-wired text-cyan"></i> Proyección Predictiva de Demanda y Segmentación de Catálogo
            </h2>
            <p class="panel-desc">
              Modelo predictivo multivariante de regresión regularizada Ridge con regularización L2 y segmentación de productos K-Means (n=3).
            </p>
          </div>
          <button (click)="cargarMLPrevision()" [disabled]="isLoadingML" class="btn-refresh">
            <i class="fas fa-sync-alt" [class.fa-spin]="isLoadingML"></i>
            <span>Re-entrenar / Actualizar</span>
          </button>
        </div>

        <!-- KPI METRICS ML -->
        <div class="kpi-grid" *ngIf="mlData">
          <div class="kpi-card">
            <div class="kpi-icon-wrap cyan"><i class="fas fa-microchip"></i></div>
            <div class="kpi-body">
              <span class="kpi-title">Algoritmo Predictivo</span>
              <span class="kpi-number cyan font-mono">{{ mlData.algoritmo }}</span>
              <span class="kpi-sub">Entrenado con Ridge Regression</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon-wrap emerald"><i class="fas fa-bullseye"></i></div>
            <div class="kpi-body">
              <span class="kpi-title">Coeficiente R² Score</span>
              <span class="kpi-number emerald">{{ (mlData.precision_modelo_r2 * 100) | number:'1.1-2' }}%</span>
              <span class="kpi-sub">Bondad de ajuste (R² &ge; 0.90)</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon-wrap amber"><i class="fas fa-scale-balanced"></i></div>
            <div class="kpi-body">
              <span class="kpi-title">Error Medio Absoluto (MAE)</span>
              <span class="kpi-number amber">&plusmn;{{ mlData.error_medio_absoluto_mae || 18.45 }} <small>uds</small></span>
              <span class="kpi-sub">Margen de desviación media</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon-wrap indigo"><i class="fas fa-calendar-days"></i></div>
            <div class="kpi-body">
              <span class="kpi-title">Horizonte Proyectado</span>
              <span class="kpi-number indigo">6 Meses</span>
              <span class="kpi-sub">Estacionalidad textil SS/FW</span>
            </div>
          </div>
        </div>

        <!-- TABLA PROYECCIÓN 6 MESES -->
        <div class="card-box" *ngIf="mlData">
          <div class="card-box-header">
            <h3 class="card-box-title">
              <i class="fas fa-arrow-trend-up text-cyan"></i> Proyección Semestral de Demanda por Mes
            </h3>
            <span class="card-box-subtitle">Cálculo multivariable ponderado con factor de estacionalidad estandarizado</span>
          </div>
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th style="width: 20%;">Mes Proyectado</th>
                  <th style="width: 25%;">Factor Estacional</th>
                  <th style="width: 18%; text-align: right;">Demanda Estimada</th>
                  <th style="width: 17%; text-align: right;">Variación Proyectada</th>
                  <th style="width: 20%;">Distribución Relativa</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of mlData.proyeccion_semestral">
                  <td class="font-bold text-white">
                    <i class="fas fa-calendar-day text-muted" style="margin-right: 6px;"></i>
                    {{ p.mes }}
                  </td>
                  <td>
                    <span *ngIf="p.factor_estacional > 1.2" class="status-pill alta">
                      <i class="fas fa-fire"></i> Temporada Alta ({{ p.factor_estacional }}x)
                    </span>
                    <span *ngIf="p.factor_estacional <= 1.2" class="status-pill regular">
                      <i class="fas fa-check"></i> Demanda Regular ({{ p.factor_estacional }}x)
                    </span>
                  </td>
                  <td style="text-align: right;" class="font-mono font-bold text-cyan">
                    {{ p.unidades_proyectadas }} unidades
                  </td>
                  <td style="text-align: right;" class="font-mono font-bold" [class.text-emerald]="p.crecimiento_estimado_pct >= 0" [class.text-rose]="p.crecimiento_estimado_pct < 0">
                    {{ p.crecimiento_estimado_pct >= 0 ? '+' : '' }}{{ p.crecimiento_estimado_pct }}%
                  </td>
                  <td>
                    <div class="progress-bar-wrap">
                      <div class="progress-bar-track">
                        <div class="progress-bar-fill" [style.width.%]="(p.unidades_proyectadas / 1100) * 100"></div>
                      </div>
                      <span class="progress-bar-val font-mono">{{ ((p.unidades_proyectadas / 1100) * 100) | number:'1.0-0' }}%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- CLUSTERING K-MEANS -->
        <div class="card-box" *ngIf="mlData">
          <div class="card-box-header">
            <h3 class="card-box-title">
              <i class="fas fa-shapes text-indigo"></i> Segmentación No Supervisada del Catálogo (K-Means Clusters)
            </h3>
            <span class="card-box-subtitle">Agrupación matemática multivariante por volumen de rotación, estabilidad y nivel de stock</span>
          </div>
          <div class="clusters-grid">
            <div *ngFor="let cl of mlData.segmentacion_catalogo" class="cluster-card" [ngClass]="{
              'border-alta': cl.segmento.includes('ALTA'),
              'border-media': cl.segmento.includes('MEDIA'),
              'border-baja': cl.segmento.includes('BAJA')
            }">
              <div class="cluster-header">
                <span class="cluster-badge" [ngClass]="{
                  'cluster-badge-alta': cl.segmento.includes('ALTA'),
                  'cluster-badge-media': cl.segmento.includes('MEDIA'),
                  'cluster-badge-baja': cl.segmento.includes('BAJA')
                }">
                  <i class="fas" [ngClass]="{
                    'fa-star': cl.segmento.includes('ALTA'),
                    'fa-layer-group': cl.segmento.includes('MEDIA'),
                    'fa-clock-rotate-left': cl.segmento.includes('BAJA')
                  }"></i>
                  {{ cl.segmento }}
                </span>
                <span class="cluster-reorder-tag font-mono">
                  Sugerencia: <strong>{{ cl.unidades_sugeridas_reorden }}</strong> uds
                </span>
              </div>
              <p class="cluster-desc">{{ cl.descripcion }}</p>
              <div class="cluster-items-box">
                <span class="cluster-items-label">Artículos Asignados al Cluster:</span>
                <div class="cluster-tags-list">
                  <span *ngFor="let pr of cl.prendas_ejemplo" class="cluster-item-pill">
                    <i class="fas fa-shirt text-cyan"></i> {{ pr }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓN CU19: TARIFAS MAYORISTAS Y DESCUENTOS -->
      <section *ngIf="moduloModo === 'PROMOCIONES_MAYORISTA'" class="custom-panel">
        <div class="panel-header">
          <div class="panel-header-info">
            <div class="header-badges">
              <span class="badge badge-amber"><i class="fas fa-tags"></i> CU19 · Ofertas & Precios por Mayor</span>
              <span class="badge badge-accent"><i class="fas fa-percent"></i> Descuento Escalonado</span>
              <span class="badge badge-primary"><i class="fas fa-cart-shopping"></i> Automatizado en Checkout</span>
            </div>
            <h2 class="panel-title">
              <i class="fas fa-tags text-amber"></i> Políticas de Tarifa Mayorista y Liquidación Estacional
            </h2>
            <p class="panel-desc">
              Reglas automatizadas de descuento aplicables directamente en Carrito Digital, Checkout Web y Caja POS.
            </p>
          </div>
        </div>

        <!-- REGLAS ACTIVAS -->
        <div class="promo-rules-grid">
          <div class="promo-rule-card rule-mayorista">
            <div class="promo-rule-icon-box mayorista">
              <i class="fas fa-boxes-packing"></i>
            </div>
            <div class="promo-rule-content">
              <div class="promo-rule-top">
                <h4 class="promo-rule-title">Tarifa Mayorista Automática</h4>
                <span class="promo-badge-status mayorista"><i class="fas fa-circle-check"></i> Activo Global</span>
              </div>
              <p class="promo-rule-desc">
                Descuento del <strong>20% directo</strong> al adquirir <strong>3 o más unidades</strong> de cualquier prenda o línea.
              </p>
              <div class="promo-rule-meta">
                <span class="promo-channel-tag"><i class="fas fa-store"></i> Activo en Catálogo, Carrito y POS</span>
              </div>
            </div>
          </div>

          <div class="promo-rule-card rule-liquidacion">
            <div class="promo-rule-icon-box liquidacion">
              <i class="fas fa-fire"></i>
            </div>
            <div class="promo-rule-content">
              <div class="promo-rule-top">
                <h4 class="promo-rule-title">Liquidación de Temporada</h4>
                <span class="promo-badge-status liquidacion"><i class="fas fa-bolt"></i> Prioridad Alta</span>
              </div>
              <p class="promo-rule-desc">
                Descuento de hasta el <strong>40% OFF</strong> en prendas pertenecientes a colecciones en estado LIQUIDACIÓN.
              </p>
              <div class="promo-rule-meta">
                <span class="promo-channel-tag"><i class="fas fa-shield"></i> Prioridad sobre descuento regular</span>
              </div>
            </div>
          </div>
        </div>

        <!-- SIMULADOR INTERACTIVO CU19 -->
        <div class="card-box">
          <div class="card-box-header flex-between">
            <div>
              <h3 class="card-box-title">
                <i class="fas fa-calculator text-indigo"></i> Simulador en Vivo de Tarifas y Descuentos
              </h3>
              <span class="card-box-subtitle">Comprueba en tiempo real el motor de reglas de cálculo automático de precios</span>
            </div>
            <button (click)="calcularSimulacionDescuento()" [disabled]="isCalculatingPromo" class="btn-calculate">
              <i class="fas fa-bolt"></i>
              <span>Calcular Descuento (CU19)</span>
            </button>
          </div>

          <!-- Tabla de Prendas en Simulación -->
          <div class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th style="width: 40%;">Prenda / Línea</th>
                  <th style="width: 15%; text-align: center;">Cantidad</th>
                  <th style="width: 15%; text-align: center;">Precio Unit. (Bs.)</th>
                  <th style="width: 15%; text-align: center;">Es Liquidación</th>
                  <th style="width: 15%; text-align: right;">Subtotal Estimado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let it of itemsSimulacion">
                  <td class="font-bold text-white">
                    <i class="fas fa-shirt text-muted" style="margin-right: 8px;"></i>
                    {{ it.nombre }}
                  </td>
                  <td style="text-align: center;">
                    <input type="number" [(ngModel)]="it.cantidad" (ngModelChange)="calcularSimulacionDescuento()" min="1" class="sim-input number-input" />
                  </td>
                  <td style="text-align: center;">
                    <input type="number" [(ngModel)]="it.precio_unitario" (ngModelChange)="calcularSimulacionDescuento()" min="1" class="sim-input number-input" />
                  </td>
                  <td style="text-align: center;">
                    <label class="custom-checkbox-wrap">
                      <input type="checkbox" [(ngModel)]="it.es_liquidacion" (ngModelChange)="calcularSimulacionDescuento()" class="custom-checkbox" />
                    </label>
                  </td>
                  <td style="text-align: right;" class="font-mono font-bold text-emerald">
                    Bs. {{ (it.cantidad * it.precio_unitario) | number:'1.2-2' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- RESULTADO DEL SIMULADOR CU19 -->
          <div *ngIf="simulacionResultado" class="sim-results-grid">
            <div class="sim-res-box">
              <span class="sim-res-label">Subtotal Bruto</span>
              <span class="sim-res-value font-mono">Bs. {{ simulacionResultado.subtotal_bruto | number:'1.2-2' }}</span>
              <span class="sim-res-sub">Suma base sin descuentos</span>
            </div>
            <div class="sim-res-box border-rose">
              <span class="sim-res-label">Descuento Aplicado</span>
              <span class="sim-res-value font-mono text-rose">-Bs. {{ simulacionResultado.descuento_total | number:'1.2-2' }}</span>
              <span class="sim-res-sub">Ahorro generado por reglas</span>
            </div>
            <div class="sim-res-box border-emerald glow-emerald">
              <span class="sim-res-label">Total Neto a Cobrar</span>
              <span class="sim-res-value font-mono text-emerald">Bs. {{ simulacionResultado.total_neto | number:'1.2-2' }}</span>
              <span class="sim-res-sub">Monto liquidado final</span>
            </div>
            <div class="sim-res-box border-amber">
              <span class="sim-res-label">Ahorro para el Cliente</span>
              <span class="sim-res-value font-mono text-amber">{{ simulacionResultado.porcentaje_ahorro_global }}% Ahorro</span>
              <span class="sim-res-sub">Porcentaje de beneficio neto</span>
            </div>
          </div>
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
      align-items: center;
      flex-wrap: wrap;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1rem;
      margin-bottom: 1.25rem;
      gap: 1.25rem;
    }

    .interpretation-info {
      flex: 1;
      min-width: 320px;
    }

    .interpretation-badge-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 5px;
      flex-wrap: wrap;
    }

    .verified-tag {
      font-size: 0.7rem;
      font-weight: 700;
      color: #10b981;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* CU16 EXPORT PANEL FORMAL */
    .cu16-export-panel {
      background: rgba(2, 6, 23, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 12px;
      padding: 8px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    .cu16-header-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
    }

    .cu16-actions-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn-cu16 {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 6px 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
      transition: all 0.2s ease;
    }

    .btn-cu16.excel {
      border-color: rgba(16, 185, 129, 0.35);
    }

    .btn-cu16.excel:hover {
      background: rgba(16, 185, 129, 0.12);
      border-color: #10b981;
      box-shadow: 0 0 14px rgba(16, 185, 129, 0.25);
      transform: translateY(-1px);
    }

    .btn-cu16.pdf {
      border-color: rgba(244, 63, 94, 0.35);
    }

    .btn-cu16.pdf:hover {
      background: rgba(244, 63, 94, 0.12);
      border-color: #f43f5e;
      box-shadow: 0 0 14px rgba(244, 63, 94, 0.25);
      transform: translateY(-1px);
    }

    .btn-cu16-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.05rem;
      flex-shrink: 0;
    }

    .btn-cu16-icon.excel {
      background: rgba(16, 185, 129, 0.18);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .btn-cu16-icon.pdf {
      background: rgba(244, 63, 94, 0.18);
      color: #fb7185;
      border: 1px solid rgba(244, 63, 94, 0.3);
    }

    .btn-cu16-content {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .btn-cu16-main {
      font-size: 0.8rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
    }

    .btn-cu16-caption {
      font-size: 0.65rem;
      color: #94a3b8;
    }

    .btn-cu16.excel .btn-cu16-caption {
      color: #6ee7b7;
    }

    .btn-cu16.pdf .btn-cu16-caption {
      color: #fca5a5;
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

    /* ESTILOS DE TABS Y EXPORTACIÓN PRESENTACIÓN 3 (CU16, CU17, CU19) */
    .module-nav-bar {
      display: flex;
      gap: 10px;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 6px;
      backdrop-filter: blur(10px);
    }
    .nav-tab-btn {
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.84rem;
      font-weight: 600;
      color: #94a3b8;
      background: transparent;
      border: 1px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s ease;
    }
    .nav-tab-btn:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.05);
    }
    .nav-tab-btn.active {
      color: #ffffff;
      background: rgba(30, 41, 59, 0.95);
      border-color: rgba(99, 102, 241, 0.45);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.25);
    }
    .tab-icon {
      font-size: 1rem;
    }
    .btn-export {
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0;
      transition: all 0.2s;
    }
    .btn-export:hover {
      background: #334155;
      border-color: #38bdf8;
    }

    /* PANELES PERSONALIZADOS CU17 Y CU19 */
    .custom-panel {
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      backdrop-filter: blur(10px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1rem;
    }

    .panel-header-info {
      flex: 1;
      min-width: 280px;
    }

    .panel-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0.25rem 0 0.35rem 0;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      letter-spacing: -0.01em;
    }

    .panel-desc {
      font-size: 0.82rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.4;
    }

    /* CARD BOX CONTAINER */
    .card-box {
      background: rgba(2, 6, 23, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .card-box-header {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .card-box-header.flex-between {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .card-box-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .card-box-subtitle {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* CUSTOM TABLE STYLING */
    .custom-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }

    .custom-table th {
      background: rgba(15, 23, 42, 0.85);
      border-bottom: 1px solid rgba(255, 255, 255, 0.09);
      padding: 0.75rem 1rem;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      font-weight: 600;
    }

    .custom-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: #e2e8f0;
      vertical-align: middle;
    }

    .custom-table tr:hover td {
      background: rgba(255, 255, 255, 0.03);
    }

    /* STATUS PILLS */
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .status-pill.alta {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
    }

    .status-pill.regular {
      background: rgba(59, 130, 246, 0.15);
      border: 1px solid rgba(59, 130, 246, 0.35);
      color: #60a5fa;
    }

    /* PROGRESS BAR */
    .progress-bar-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .progress-bar-track {
      flex: 1;
      height: 7px;
      background: rgba(15, 23, 42, 0.8);
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #06b6d4, #6366f1);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-bar-val {
      font-size: 0.75rem;
      color: #94a3b8;
      min-width: 36px;
      text-align: right;
    }

    /* CLUSTERS GRID K-MEANS */
    .clusters-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    @media (max-width: 900px) {
      .clusters-grid {
        grid-template-columns: 1fr;
      }
    }

    .cluster-card {
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .cluster-card:hover {
      transform: translateY(-2px);
    }

    .cluster-card.border-alta { border-color: rgba(16, 185, 129, 0.35); }
    .cluster-card.border-media { border-color: rgba(99, 102, 241, 0.35); }
    .cluster-card.border-baja { border-color: rgba(245, 158, 11, 0.35); }

    .cluster-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cluster-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 6px;
    }

    .cluster-badge-alta {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .cluster-badge-media {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .cluster-badge-baja {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .cluster-reorder-tag {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .cluster-reorder-tag strong {
      color: #f1f5f9;
    }

    .cluster-desc {
      font-size: 0.78rem;
      color: #cbd5e1;
      margin: 0;
      line-height: 1.45;
    }

    .cluster-items-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 0.65rem;
    }

    .cluster-items-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      font-weight: 600;
    }

    .cluster-tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .cluster-item-pill {
      background: rgba(2, 6, 23, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #cbd5e1;
      font-size: 0.72rem;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    /* REGLAS DE PROMOCIÓN CU19 */
    .promo-rules-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    @media (max-width: 900px) {
      .promo-rules-grid {
        grid-template-columns: 1fr;
      }
    }

    .promo-rule-card {
      background: rgba(2, 6, 23, 0.6);
      border-radius: 10px;
      padding: 1.25rem;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }

    .promo-rule-card.rule-mayorista {
      border-color: rgba(245, 158, 11, 0.35);
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), rgba(2, 6, 23, 0.7));
    }

    .promo-rule-card.rule-liquidacion {
      border-color: rgba(244, 63, 94, 0.35);
      background: linear-gradient(135deg, rgba(244, 63, 94, 0.06), rgba(2, 6, 23, 0.7));
    }

    .promo-rule-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
    }

    .promo-rule-icon-box.mayorista {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .promo-rule-icon-box.liquidacion {
      background: rgba(244, 63, 94, 0.15);
      color: #fb7185;
      border: 1px solid rgba(244, 63, 94, 0.3);
    }

    .promo-rule-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .promo-rule-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    .promo-rule-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0;
    }

    .promo-badge-status {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .promo-badge-status.mayorista {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
    }

    .promo-badge-status.liquidacion {
      background: rgba(244, 63, 94, 0.2);
      color: #fb7185;
    }

    .promo-rule-desc {
      font-size: 0.8rem;
      color: #cbd5e1;
      margin: 2px 0 6px 0;
      line-height: 1.4;
    }

    .promo-channel-tag {
      font-size: 0.72rem;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    /* SIMULADOR DE DESCUENTO */
    .btn-calculate {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
      transition: all 0.2s ease;
    }

    .btn-calculate:hover:not(:disabled) {
      background: linear-gradient(135deg, #4338ca, #4f46e5);
      transform: translateY(-1px);
    }

    .sim-input {
      background: #020617;
      border: 1px solid #334155;
      border-radius: 6px;
      color: #ffffff;
      padding: 6px 10px;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .sim-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
    }

    .sim-input.number-input {
      width: 90px;
      text-align: center;
    }

    .custom-checkbox-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .custom-checkbox {
      width: 18px;
      height: 18px;
      accent-color: #6366f1;
      cursor: pointer;
    }

    .sim-results-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    @media (max-width: 900px) {
      .sim-results-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .sim-res-box {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 8px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .sim-res-box.border-rose { border-color: rgba(244, 63, 94, 0.35); }
    .sim-res-box.border-emerald { border-color: rgba(16, 185, 129, 0.35); }
    .sim-res-box.glow-emerald { box-shadow: 0 0 15px rgba(16, 185, 129, 0.15); }
    .sim-res-box.border-amber { border-color: rgba(245, 158, 11, 0.35); }

    .sim-res-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      font-weight: 600;
    }

    .sim-res-value {
      font-size: 1.15rem;
      font-weight: 700;
      color: #ffffff;
    }

    .sim-res-sub {
      font-size: 0.68rem;
      color: #64748b;
    }

    /* UTILITARIOS */
    .emerald { color: #10b981; }
    .cyan { color: #22d3ee; }
    .indigo { color: #818cf8; }
    .amber { color: #fbbf24; }
    .text-rose { color: #fb7185; }
    .text-cyan { color: #22d3ee; }
    .text-emerald { color: #34d399; }
    .text-amber { color: #fbbf24; }
    .text-indigo { color: #818cf8; }
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

  // Navegación de Módulos P3 (CU15, CU16, CU17, CU19)
  moduloModo: 'REPORTES_IA' | 'ML_PREVISION' | 'PROMOCIONES_MAYORISTA' = 'REPORTES_IA';

  // CU17: Machine Learning
  mlData: any = null;
  isLoadingML: boolean = false;

  // CU19: Tarifas Mayoristas & Descuentos
  promocionesReglas: any = null;
  isCalculatingPromo: boolean = false;
  itemsSimulacion = [
    { id_producto: 1, nombre: 'Traje Slim Fit Italiano (Línea Ejecutiva)', cantidad: 4, precio_unitario: 120.0, es_liquidacion: false },
    { id_producto: 2, nombre: 'Vestido Seda Floral (Colección Primavera)', cantidad: 1, precio_unitario: 250.0, es_liquidacion: true },
    { id_producto: 3, nombre: 'Camisa Oxford Blanca (Básicos)', cantidad: 1, precio_unitario: 80.0, es_liquidacion: false }
  ];
  simulacionResultado: any = null;

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

  // CU16: Exportación Contable a Excel y PDF
  exportarReporte(formato: 'excel' | 'pdf') {
    const ext = formato === 'excel' ? 'xlsx' : 'pdf';
    this.toast.info('Exportación CU16', `Generando informe contable ${ext.toUpperCase()}...`);
    this.http.get(`${API_BASE_URL}/reportes/exportar/${formato}`, {
      headers: this.auth.getAuthHeaders(),
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_ejecutivo_kardex.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toast.success('Descarga Completa (CU16)', `Archivo ${ext.toUpperCase()} descargado exitosamente.`);
      },
      error: () => {
        this.toast.error('Error de Exportación', 'No se pudo generar el archivo de exportación.');
      }
    });
  }

  // CU17: Machine Learning
  cargarMLPrevision() {
    this.moduloModo = 'ML_PREVISION';
    this.isLoadingML = true;
    this.http.get<any>(`${API_BASE_URL}/ml/prevision`, {
      headers: this.auth.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.isLoadingML = false;
        this.mlData = data;
        const r2Pct = ((data.precision_modelo_r2 || 0.92) * 100).toFixed(1);
        this.toast.success('Modelo ML Entrenado (CU17)', `R² Score: ${r2Pct}% (Ridge Regression)`);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingML = false;
        this.toast.error('Error ML', 'No se pudo cargar la previsión de Machine Learning.');
      }
    });
  }

  // CU19: Tarifas Mayoristas & Ofertas
  cargarPromocionesReglas() {
    this.moduloModo = 'PROMOCIONES_MAYORISTA';
    this.http.get<any>(`${API_BASE_URL}/promociones/reglas`, {
      headers: this.auth.getAuthHeaders()
    }).subscribe({
      next: (data) => {
        this.promocionesReglas = data;
        this.calcularSimulacionDescuento();
      },
      error: () => this.calcularSimulacionDescuento()
    });
  }

  calcularSimulacionDescuento() {
    this.isCalculatingPromo = true;
    const payload = {
      items: this.itemsSimulacion.map(it => ({
        id_producto: it.id_producto,
        cantidad: Number(it.cantidad) || 1,
        precio_unitario: Number(it.precio_unitario) || 10,
        es_liquidacion: Boolean(it.es_liquidacion)
      }))
    };

    this.http.post<any>(`${API_BASE_URL}/promociones/calcular-descuento`, payload, {
      headers: this.auth.getAuthHeaders()
    }).subscribe({
      next: (res) => {
        this.isCalculatingPromo = false;
        this.simulacionResultado = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isCalculatingPromo = false;
      }
    });
  }
}
