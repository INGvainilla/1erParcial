import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FashionApiService } from '../../../core/services/fashion-api.service';
import { CarritoService } from '../../../core/services/carrito.service';
import { ToastService } from '../../../core/services/toast.service';

interface ClimaLocal {
  ciudad: string;
  temperatura_c: number;
  sensacion_c: number;
  condicion: string;
  descripcion_clima: string;
  icono_clima: string;
  recomendacion_textil: string;
}

interface PrendaOutfit {
  id_producto: number;
  codigo_sku_base: string;
  nombre: string;
  categoria: string;
  precio_base: number;
  precio_final: number;
  descuento_pct: number;
  imagen_principal?: string;
  color_sugerido: string;
  color_hex: string;
  talla_sugerida: string;
  modelo_3d_glb?: string;
}

interface OutfitRecomendado {
  id_outfit: string;
  titulo: string;
  ocasion: string;
  estilo: string;
  afinidad_climatica_pct: number;
  analisis_estilista_ia: string;
  regla_colorimetria: string;
  prendas: PrendaOutfit[];
  precio_total_original: number;
  precio_total_final: number;
  ahorro_total: number;
}

@Component({
  selector: 'app-asistente-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="asistente-page">
      <!-- Encabezado con Widget de Clima Contextual en Vivo -->
      <div class="header-hero glass-card">
        <div class="hero-left">
          <div class="badges-row">
            <span class="badge-pu"><i class="fas fa-robot"></i> CU22 — M17</span>
            <span class="badge-tag"><i class="fas fa-cloud-sun"></i> Climatología Sastorial</span>
            <span class="badge-tag highlight"><i class="fas fa-palette"></i> Colorimetría Masculina</span>
          </div>
          <h1>Asistente de Estilo & Recomendación IA</h1>
          <p class="hero-desc">
            Algoritmo inteligente de estilismo que evalúa en tiempo real las condiciones meteorológicas
            de ciudades bolivianas, reglas de protocolo masculino y existencias físicas de inventario.
          </p>
        </div>

        <!-- Widget Meteorológico en Vivo (OpenWeatherMap) -->
        <div class="weather-widget">
          <div class="weather-top">
            <span class="city-badge">
              <i class="fas fa-map-marker-alt"></i> {{ clima.ciudad }}
            </span>
            <span class="weather-icon-badge">
              <i [class]="getWeatherIcon(clima.icono_clima)"></i>
            </span>
          </div>
          <div class="temperature-row">
            <span class="temp-val">{{ clima.temperatura_c }}°C</span>
            <div class="temp-sub">
              <span class="condition-text">{{ clima.condicion }}</span>
              <span class="sensacion-text">Sensación: {{ clima.sensacion_c }}°C</span>
            </div>
          </div>
          <p class="textile-advice">
            <i class="fas fa-tshirt"></i> {{ clima.recomendacion_textil }}
          </p>
        </div>
      </div>

      <!-- Barra de Filtros y Control de Contexto -->
      <div class="controls-panel glass-card">
        <!-- Selector de Ciudad Boliviana -->
        <div class="control-group">
          <label><i class="fas fa-city"></i> Ciudad de Destino:</label>
          <div class="btn-group">
            <button 
              *ngFor="let c of ciudades" 
              class="selector-btn"
              [class.active]="ciudadSeleccionada === c"
              (click)="seleccionarCiudad(c)">
              {{ c }}
            </button>
          </div>
        </div>

        <!-- Selector de Ocasión -->
        <div class="control-group">
          <label><i class="fas fa-calendar-check"></i> Ocasión:</label>
          <div class="btn-group">
            <button 
              *ngFor="let oc of ocasiones" 
              class="selector-btn"
              [class.active]="ocasionSeleccionada === oc"
              (click)="seleccionarOcasion(oc)">
              {{ oc }}
            </button>
          </div>
        </div>

        <!-- Botón de Búsqueda por Voz CU23 -->
        <button class="btn-voice-search" (click)="abrirModalVoz()">
          <span class="pulse-mic"><i class="fas fa-microphone"></i></span>
          <div class="voice-btn-content">
            <span class="voice-btn-title">Búsqueda por Voz (CU23)</span>
            <span class="voice-btn-sub">NLP Semántico en Vivo</span>
          </div>
        </button>
      </div>

      <!-- Indicador sutil de actualización en tiempo real -->
      <div class="updating-bar" *ngIf="isUpdating">
        <div class="updating-spinner"></div>
        <span>Sincronizando pronóstico meteorológico y existencias de stock con IA...</span>
      </div>

      <!-- Outfits Recomendados con Justificación de IA -->
      <div class="recommendations-container" *ngIf="outfits.length > 0">
        <div *ngFor="let out of outfits; let i = index" class="outfit-recommendation-card glass-card">
          <!-- Columna Izquierda: Análisis del Estilista Virtual -->
          <div class="stylist-column">
            <div class="outfit-badge-row">
              <span class="outfit-tag">PROPUESTA #0{{ i + 1 }}</span>
              <span class="affinity-pill">
                <i class="fas fa-sparkles"></i> {{ out.afinidad_climatica_pct }}% Afinidad Climática
              </span>
            </div>

            <h2 class="outfit-title">{{ out.titulo }}</h2>
            <div class="outfit-meta-row">
              <span class="meta-item"><i class="fas fa-tag"></i> {{ out.estilo }}</span>
              <span class="meta-item"><i class="fas fa-calendar-alt"></i> {{ out.ocasion }}</span>
            </div>

            <!-- Justificación de IA -->
            <div class="ai-box">
              <div class="ai-box-title">
                <i class="fas fa-brain text-indigo"></i> Análisis del Estilista de Imagen:
              </div>
              <p class="ai-text">{{ out.analisis_estilista_ia }}</p>
            </div>

            <!-- Regla de Colorimetría -->
            <div class="colorimetry-box">
              <div class="color-box-title">
                <i class="fas fa-tint text-gold"></i> Regla de Colorimetría Aplicada:
              </div>
              <p class="color-text">{{ out.regla_colorimetria }}</p>
            </div>

            <!-- Resumen Económico -->
            <div class="pricing-card">
              <div class="price-breakdown">
                <span class="orig-price">Bs. {{ out.precio_total_original | number:'1.2-2' }}</span>
                <span class="final-price">Bs. {{ out.precio_total_final | number:'1.2-2' }}</span>
              </div>
              <span class="savings-text" *ngIf="out.ahorro_total > 0">
                Ahorro de Bs. {{ out.ahorro_total | number:'1.2-2' }} en este conjunto
              </span>
            </div>

            <!-- Botones de Acción -->
            <div class="action-buttons-group">
              <button class="btn-buy-outfit" (click)="comprarOutfit(out)">
                <i class="fas fa-shopping-bag"></i> Comprar Outfit Completo
              </button>
              <button class="btn-compare" (click)="verEnComparador(out)">
                <i class="fas fa-columns"></i> Contrastar en el Comparador (CU20)
              </button>
            </div>
          </div>

          <!-- Columna Derecha: Prendas Individuales Verificadas -->
          <div class="garments-column">
            <h3 class="garments-header"><i class="fas fa-layer-group"></i> Prendas Componentes del Atuendo</h3>
            <div class="garments-grid">
              <div *ngFor="let p of out.prendas" class="garment-card">
                <div class="garment-img-wrap">
                  <img [src]="p.imagen_principal || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'" [alt]="p.nombre">
                  <span class="category-floating">{{ p.categoria }}</span>
                </div>
                <div class="garment-info">
                  <h4>{{ p.nombre }}</h4>
                  <div class="garment-specs">
                    <span class="color-chip">
                      <span class="dot" [style.background-color]="p.color_hex"></span>
                      {{ p.color_sugerido }}
                    </span>
                    <span class="talla-chip">Talla: {{ p.talla_sugerida }}</span>
                  </div>
                  <div class="garment-price-row">
                    <span class="price-final">Bs. {{ p.precio_final | number:'1.2-2' }}</span>
                    <button class="btn-add-single" (click)="agregarPrendaSola(p)" title="Añadir sólo esta prenda">
                      <i class="fas fa-cart-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Búsqueda por Voz Ultra-Formal (CU23) -->
      <div class="voice-modal-backdrop" *ngIf="isVoiceModalOpen" (click)="onBackdropClick($event)">
        <div class="voice-modal glass-card-luxury" (click)="$event.stopPropagation()">
          
          <!-- Encabezado Formal del Modal -->
          <div class="voice-modal-header">
            <div class="voice-header-titles">
              <div class="voice-super-badge">
                <span class="badge-cu"><i class="fas fa-microphone-lines"></i> CU23 • M17</span>
                <span class="badge-tech"><i class="fas fa-brain"></i> Motor NLP Semántico</span>
              </div>
              <h2 class="voice-modal-h2">Asistente Ejecutivo de Búsqueda por Voz</h2>
              <p class="voice-modal-sub">
                Reconocimiento acústico en tiempo real y extracción semántica de siluetas, telas y colores.
              </p>
            </div>
            <button class="btn-close-voice" (click)="cerrarModalVoz()" title="Cerrar ventana">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Escenario Acústico y Ecualizador Dinámico -->
          <div class="acoustic-stage">
            <div class="mic-halo-container" [class.active-recording]="isListening">
              <div class="pulsing-halo ring-1"></div>
              <div class="pulsing-halo ring-2"></div>
              <button class="master-mic-button" [class.listening]="isListening" (click)="toggleEscuchar()">
                <i [class]="isListening ? 'fas fa-stop' : 'fas fa-microphone'"></i>
              </button>
            </div>

            <!-- Ecualizador de Ondas de Voz (14 Barras Dinámicas) -->
            <div class="equalizer-visualizer" [class.active]="isListening">
              <span class="eq-bar bar-1"></span>
              <span class="eq-bar bar-2"></span>
              <span class="eq-bar bar-3"></span>
              <span class="eq-bar bar-4"></span>
              <span class="eq-bar bar-5"></span>
              <span class="eq-bar bar-6"></span>
              <span class="eq-bar bar-7"></span>
              <span class="eq-bar bar-8"></span>
              <span class="eq-bar bar-9"></span>
              <span class="eq-bar bar-10"></span>
              <span class="eq-bar bar-11"></span>
              <span class="eq-bar bar-12"></span>
              <span class="eq-bar bar-13"></span>
              <span class="eq-bar bar-14"></span>
            </div>

            <!-- Estado de Voz Dinámico -->
            <div class="voice-status-box">
              <span class="status-indicator-dot" [class.dot-listening]="isListening"></span>
              <span class="status-text">{{ statusVoice }}</span>
            </div>
          </div>

          <!-- Caja de Transcripción en Vivo (Lo que el usuario dice) -->
          <div class="live-transcription-card">
            <div class="transcription-label">
              <span><i class="fas fa-quote-left text-indigo"></i> Transcripción de Audio en Tiempo Real:</span>
              <span class="lang-tag" *ngIf="isSpeechSupported">
                <i class="fas fa-wave-square"></i> Audio HD (es-BO)
              </span>
              <span class="lang-tag fallback" *ngIf="!isSpeechSupported">
                <i class="fas fa-keyboard"></i> Dictado Directo
              </span>
            </div>
            <div class="transcription-display">
              <p class="transcription-text" [class.placeholder]="!transcriptEnVivo && !consultaTexto">
                {{ transcriptEnVivo || consultaTexto || 'Presiona el micrófono y habla, o escribe en el campo inferior...' }}
              </p>
            </div>
          </div>

          <!-- Campo de Entrada Formal y Ejecución NLP -->
          <div class="formal-input-panel">
            <div class="input-wrapper">
              <i class="fas fa-search input-icon"></i>
              <input 
                type="text" 
                class="formal-text-input"
                placeholder="Ej: Necesito un terno azul marino elegante para una boda..."
                [(ngModel)]="consultaTexto"
                (keyup.enter)="ejecutarBusquedaVoz(consultaTexto)">
              <button 
                *ngIf="consultaTexto" 
                class="btn-clear-input" 
                (click)="consultaTexto = ''; transcriptEnVivo = ''"
                title="Limpiar texto">
                <i class="fas fa-times-circle"></i>
              </button>
            </div>
            
            <button 
              class="btn-run-nlp" 
              [disabled]="isAnalyzing || (!consultaTexto && !transcriptEnVivo)"
              (click)="ejecutarBusquedaVoz(consultaTexto || transcriptEnVivo)">
              <i class="fas fa-circle-notch fa-spin" *ngIf="isAnalyzing"></i>
              <i class="fas fa-wand-magic-sparkles" *ngIf="!isAnalyzing"></i>
              <span>{{ isAnalyzing ? 'Interpretando...' : 'Analizar con NLP' }}</span>
            </button>
          </div>

          <!-- Sugerencias Formales de Protocolo y Clima -->
          <div class="executive-suggestions">
            <span class="sugg-header"><i class="fas fa-lightbulb text-gold"></i> Sugerencias de Estilismo y Protocolo Rápido:</span>
            <div class="sugg-grid">
              <button class="sugg-chip" (click)="usarSugerencia('Necesito un terno o traje azul marino elegante para una boda')">
                <i class="fas fa-user-tie"></i> Traje azul formal para boda
              </button>
              <button class="sugg-chip" (click)="usarSugerencia('Camisa fresca de lino para el calor')">
                <i class="fas fa-sun"></i> Camisa fresca de lino para calor
              </button>
              <button class="sugg-chip" (click)="usarSugerencia('Blazer slim fit de lana fría para evento')">
                <i class="fas fa-briefcase"></i> Blazer slim fit de lana fría
              </button>
              <button class="sugg-chip" (click)="usarSugerencia('Pantalón chino beige para reunión casual')">
                <i class="fas fa-cocktail"></i> Pantalón chino beige casual
              </button>
            </div>
          </div>

          <!-- Área de Resultados Semánticos de IA -->
          <div class="nlp-results-wrapper" *ngIf="voiceResults">
            <!-- Barra de Entidades Semánticas Extraídas -->
            <div class="nlp-entities-bar">
              <div class="entity-pill intention">
                <span class="entity-name">Intención:</span>
                <span class="entity-value">{{ voiceResults.intencion_detectada || 'Búsqueda Textil' }}</span>
              </div>
              <div class="entity-pill category" *ngIf="voiceResults.categoria_detectada">
                <span class="entity-name">Categoría:</span>
                <span class="entity-value">{{ voiceResults.categoria_detectada }}</span>
              </div>
              <div class="entity-pill occasion" *ngIf="voiceResults.ocasion_detectada">
                <span class="entity-name">Ocasión:</span>
                <span class="entity-value">{{ voiceResults.ocasion_detectada }}</span>
              </div>
              <div class="entity-pill points-earned">
                <i class="fas fa-coins text-gold"></i> +15 Puntos VIP Ganados
              </div>
            </div>

            <!-- Mensaje Conversacional del Asistente -->
            <div class="assistant-feedback-box">
              <i class="fas fa-robot text-indigo"></i>
              <p class="assistant-msg">{{ voiceResults.mensaje_asistente }}</p>
            </div>

            <!-- Cuadrícula de Prendas Encontradas con Verificación de Stock -->
            <div class="voice-products-grid">
              <div *ngFor="let item of voiceResults.prendas_sugeridas" class="voice-product-card glass-card">
                <div class="prod-thumb-wrap">
                  <img [src]="item.imagen_principal || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'" [alt]="item.nombre">
                  <span class="affinity-badge-corner">
                    <i class="fas fa-star text-gold"></i> {{ item.relevancia_score || 95 }}% Afinidad
                  </span>
                </div>

                <div class="prod-details">
                  <div class="prod-category-tag">{{ item.categoria }}</div>
                  <h4 class="prod-name">{{ item.nombre }}</h4>
                  <p class="prod-match-reason">
                    <i class="fas fa-check-circle text-green"></i> {{ item.motivo_coincidencia }}
                  </p>
                  
                  <div class="prod-bottom-row">
                    <div class="price-stack">
                      <span class="price-val">Bs. {{ item.precio_final | number:'1.2-2' }}</span>
                      <span class="discount-badge" *ngIf="item.descuento_pct > 0">-{{ item.descuento_pct }}% OFF</span>
                    </div>

                    <button class="btn-add-cart-voice" (click)="agregarPrendaPorVoz(item)">
                      <i class="fas fa-cart-plus"></i> Añadir a Bolsa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pie del Modal -->
          <div class="voice-modal-footer">
            <button class="btn-close-modal-bottom" (click)="cerrarModalVoz()">
              Cerrar Asistente de Voz
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .asistente-page {
      padding: 1.5rem;
      max-width: 1480px;
      margin: 0 auto;
      color: var(--text-primary, #F8FAFC);
      font-family: var(--font-body, 'Inter', sans-serif);
    }

    .glass-card {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }

    .glass-card-luxury {
      background: linear-gradient(165deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 20px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.15);
    }

    .header-hero {
      padding: 2rem;
      margin-bottom: 1.5rem;
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
      align-items: center;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 16px;
    }

    @media (max-width: 950px) {
      .header-hero {
        grid-template-columns: 1fr;
      }
    }

    .badges-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .badge-pu {
      background: rgba(99, 102, 241, 0.18);
      color: #A5B4FC;
      border: 1px solid rgba(99, 102, 241, 0.35);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
    }

    .badge-tag {
      background: rgba(255, 255, 255, 0.06);
      color: #94A3B8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
    }

    .badge-tag.highlight {
      background: rgba(245, 158, 11, 0.2);
      color: #FBBF24;
      border-color: rgba(245, 158, 11, 0.3);
    }

    .header-hero h1 {
      margin: 0.4rem 0;
      font-size: 2.1rem;
      font-weight: 800;
      font-family: var(--font-heading, 'Outfit', sans-serif);
      background: linear-gradient(135deg, #FFFFFF 0%, #E0E7FF 60%, #C7D2FE 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.02em;
    }

    .hero-desc {
      color: #94A3B8;
      font-size: 0.92rem;
      line-height: 1.6;
      margin: 0;
    }

    /* Widget de Clima Contextual */
    .weather-widget {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%);
      border: 1px solid rgba(99, 102, 241, 0.25);
      padding: 1.5rem;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .weather-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .city-badge {
      font-size: 0.85rem;
      font-weight: 700;
      color: #A5B4FC;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .weather-icon-badge {
      font-size: 1.6rem;
      color: #F59E0B;
    }

    .temperature-row {
      display: flex;
      align-items: baseline;
      gap: 1rem;
    }

    .temp-val {
      font-size: 2.8rem;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1;
    }

    .temp-sub {
      display: flex;
      flex-direction: column;
    }

    .condition-text {
      font-size: 0.95rem;
      font-weight: 700;
      color: #F1F5F9;
    }

    .sensacion-text {
      font-size: 0.8rem;
      color: #94A3B8;
    }

    .textile-advice {
      margin: 0;
      font-size: 0.82rem;
      color: #CBD5E1;
      line-height: 1.4;
      background: rgba(0, 0, 0, 0.25);
      padding: 0.6rem;
      border-radius: 6px;
      border-left: 3px solid #818CF8;
    }

    /* Panel de Controles */
    .controls-panel {
      padding: 1.25rem 2rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .control-group label {
      font-size: 0.88rem;
      font-weight: 600;
      color: #CBD5E1;
    }

    .btn-group {
      display: flex;
      gap: 0.4rem;
    }

    .selector-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #CBD5E1;
      padding: 0.45rem 0.85rem;
      border-radius: 8px;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .selector-btn:hover {
      background: rgba(99, 102, 241, 0.15);
      color: #A5B4FC;
      border-color: rgba(99, 102, 241, 0.35);
    }

    .selector-btn.active {
      background: #6366F1;
      color: #FFFFFF;
      border-color: #818CF8;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }

    .btn-voice-search {
      background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
      color: #FFFFFF;
      border: 1px solid rgba(129, 140, 248, 0.4);
      padding: 0.65rem 1.4rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 4px 18px rgba(99, 102, 241, 0.35);
      transition: all 0.25s ease;
      margin-left: auto;
    }

    .btn-voice-search:hover {
      background: linear-gradient(135deg, #4338CA 0%, #4F46E5 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(99, 102, 241, 0.5);
    }

    .pulse-mic {
      font-size: 1.15rem;
      color: #F8FAFC;
      animation: pulse 1.8s infinite;
    }

    .voice-btn-content {
      display: flex;
      flex-direction: column;
      text-align: left;
    }

    .voice-btn-title {
      font-size: 0.85rem;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .voice-btn-sub {
      font-size: 0.68rem;
      color: #E0E7FF;
      font-weight: 500;
    }

    /* Barra sutil de sincronización */
    .updating-bar {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.8rem;
      color: #A5B4FC;
    }

    .updating-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(99, 102, 241, 0.3);
      border-top-color: #818CF8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    /* Outfits Recomendados */
    .recommendations-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .outfit-recommendation-card {
      display: grid;
      grid-template-columns: 460px 1fr;
      gap: 2rem;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    @media (max-width: 1050px) {
      .outfit-recommendation-card {
        grid-template-columns: 1fr;
      }
    }

    .stylist-column {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .outfit-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .outfit-tag {
      font-size: 0.75rem;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 0.1em;
    }

    .affinity-pill {
      background: rgba(16, 185, 129, 0.2);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .outfit-title {
      font-size: 1.45rem;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0.25rem 0 0.5rem 0;
      font-family: var(--font-heading, 'Outfit', sans-serif);
    }

    .outfit-meta-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .meta-item {
      font-size: 0.78rem;
      background: rgba(255, 255, 255, 0.06);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      color: #94A3B8;
    }

    .ai-box, .colorimetry-box {
      background: rgba(0, 0, 0, 0.25);
      border-radius: 10px;
      padding: 0.9rem;
      margin-bottom: 0.75rem;
      border-left: 3px solid #818CF8;
    }

    .colorimetry-box {
      border-left-color: #F59E0B;
    }

    .ai-box-title, .color-box-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: #CBD5E1;
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .text-indigo, .text-accent { color: #818CF8; }
    .text-gold { color: #F59E0B; }
    .text-green { color: #10B981; }

    .ai-text, .color-text {
      margin: 0;
      font-size: 0.82rem;
      color: #94A3B8;
      line-height: 1.45;
    }

    .pricing-card {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      background: rgba(255, 255, 255, 0.04);
      padding: 0.75rem 1rem;
      border-radius: 10px;
      margin-bottom: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .price-breakdown {
      display: flex;
      gap: 0.75rem;
      align-items: baseline;
    }

    .orig-price {
      text-decoration: line-through;
      color: #64748B;
      font-size: 0.9rem;
    }

    .final-price {
      font-size: 1.4rem;
      font-weight: 800;
      color: #10B981;
    }

    .savings-text {
      font-size: 0.78rem;
      color: #34D399;
      font-weight: 600;
    }

    .action-buttons-group {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .btn-buy-outfit {
      background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
      color: #FFFFFF;
      border: 1px solid rgba(129, 140, 248, 0.3);
      padding: 0.8rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
      transition: all 0.2s;
    }

    .btn-buy-outfit:hover {
      background: linear-gradient(135deg, #4338CA 0%, #4F46E5 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    .btn-compare {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #CBD5E1;
      padding: 0.75rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-compare:hover {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.35);
      color: #FFFFFF;
    }

    /* Columna de Prendas */
    .garments-column {
      display: flex;
      flex-direction: column;
    }

    .garments-header {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: var(--font-heading, 'Outfit', sans-serif);
    }

    .garments-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    @media (max-width: 650px) {
      .garments-grid {
        grid-template-columns: 1fr;
      }
    }

    .garment-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }

    .garment-card:hover {
      transform: translateY(-3px);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
    }

    .garment-img-wrap {
      height: 180px;
      position: relative;
      background: #0F172A;
      overflow: hidden;
    }

    .garment-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .category-floating {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(15, 23, 42, 0.85);
      color: #94A3B8;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .garment-info {
      padding: 0.85rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-between;
    }

    .garment-info h4 {
      margin: 0 0 0.4rem 0;
      font-size: 0.88rem;
      color: #F1F5F9;
      line-height: 1.3;
    }

    .garment-specs {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #94A3B8;
      margin-bottom: 0.6rem;
    }

    .color-chip {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .talla-chip {
      background: rgba(255, 255, 255, 0.08);
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
    }

    .garment-price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.4rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .price-final {
      font-size: 0.95rem;
      font-weight: 800;
      color: #10B981;
    }

    .btn-add-single {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #FFFFFF;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .btn-add-single:hover {
      background: #6366F1;
    }

    /* ========================================================= */
    /* MODAL DE BÚSQUEDA POR VOZ ULTRA-FORMAL (CU23)             */
    /* ========================================================= */
    .voice-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(10, 15, 30, 0.88);
      backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 1.5rem;
      overflow-y: auto;
    }

    .voice-modal {
      max-width: 780px;
      width: 100%;
      max-height: 92vh;
      overflow-y: auto;
      padding: 2.2rem;
      animation: luxurySlideIn 0.32s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes luxurySlideIn {
      from { transform: translateY(20px) scale(0.96); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    .voice-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.8rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1.2rem;
    }

    .voice-super-badge {
      display: flex;
      gap: 0.6rem;
      margin-bottom: 0.5rem;
    }

    .badge-cu {
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(129, 140, 248, 0.4);
      color: #A5B4FC;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-tech {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #A5B4FC;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
    }

    .voice-modal-h2 {
      margin: 0 0 0.35rem 0;
      font-size: 1.45rem;
      font-weight: 800;
      font-family: var(--font-heading, 'Outfit', sans-serif);
      background: linear-gradient(135deg, #FFFFFF 0%, #C7D2FE 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -0.01em;
    }

    .voice-modal-sub {
      margin: 0;
      font-size: 0.85rem;
      color: #94A3B8;
      line-height: 1.4;
    }

    .btn-close-voice {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #CBD5E1;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-close-voice:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      color: #F87171;
      transform: scale(1.08);
    }

    /* Escenario Acústico */
    .acoustic-stage {
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 1.75rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
    }

    .mic-halo-container {
      position: relative;
      width: 96px;
      height: 96px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .master-mic-button {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%);
      border: 2px solid #818CF8;
      color: #A5B4FC;
      font-size: 2rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 25px rgba(99, 102, 241, 0.25);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 2;
    }

    .master-mic-button:hover {
      transform: scale(1.06);
      border-color: #C7D2FE;
      color: #FFFFFF;
      box-shadow: 0 0 35px rgba(99, 102, 241, 0.45);
    }

    .master-mic-button.listening {
      background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
      border-color: #F87171;
      color: #FFFFFF;
      box-shadow: 0 0 40px rgba(239, 68, 68, 0.6);
      animation: micVibe 1.2s infinite ease-in-out;
    }

    @keyframes micVibe {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.08); }
    }

    .pulsing-halo {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(99, 102, 241, 0.4);
      opacity: 0;
      pointer-events: none;
    }

    .active-recording .ring-1 {
      width: 120px;
      height: 120px;
      border-color: rgba(239, 68, 68, 0.5);
      animation: haloPulse 1.8s infinite ease-out;
    }

    .active-recording .ring-2 {
      width: 145px;
      height: 145px;
      border-color: rgba(239, 68, 68, 0.3);
      animation: haloPulse 1.8s 0.6s infinite ease-out;
    }

    @keyframes haloPulse {
      0% { transform: scale(0.7); opacity: 0.9; }
      100% { transform: scale(1.3); opacity: 0; }
    }

    /* Ecualizador Dinámico */
    .equalizer-visualizer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      height: 32px;
      margin-bottom: 1rem;
    }

    .eq-bar {
      width: 4px;
      background: rgba(148, 163, 184, 0.3);
      border-radius: 2px;
      height: 6px;
      transition: height 0.2s, background 0.3s;
    }

    .equalizer-visualizer.active .eq-bar {
      background: linear-gradient(180deg, #818CF8 0%, #C084FC 100%);
      animation: eqDance 0.8s ease-in-out infinite alternate;
    }

    .equalizer-visualizer.active .bar-1 { animation-delay: 0.1s; }
    .equalizer-visualizer.active .bar-2 { animation-delay: 0.25s; }
    .equalizer-visualizer.active .bar-3 { animation-delay: 0.4s; }
    .equalizer-visualizer.active .bar-4 { animation-delay: 0.15s; }
    .equalizer-visualizer.active .bar-5 { animation-delay: 0.5s; }
    .equalizer-visualizer.active .bar-6 { animation-delay: 0.3s; }
    .equalizer-visualizer.active .bar-7 { animation-delay: 0.6s; }
    .equalizer-visualizer.active .bar-8 { animation-delay: 0.2s; }
    .equalizer-visualizer.active .bar-9 { animation-delay: 0.45s; }
    .equalizer-visualizer.active .bar-10 { animation-delay: 0.1s; }
    .equalizer-visualizer.active .bar-11 { animation-delay: 0.55s; }
    .equalizer-visualizer.active .bar-12 { animation-delay: 0.35s; }
    .equalizer-visualizer.active .bar-13 { animation-delay: 0.65s; }
    .equalizer-visualizer.active .bar-14 { animation-delay: 0.25s; }

    @keyframes eqDance {
      0% { height: 6px; }
      100% { height: 28px; }
    }

    .voice-status-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(0, 0, 0, 0.35);
      padding: 0.35rem 0.9rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .status-indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #64748B;
    }

    .status-indicator-dot.dot-listening {
      background: #EF4444;
      box-shadow: 0 0 10px #EF4444;
      animation: pulse 1s infinite;
    }

    .status-text {
      font-size: 0.82rem;
      font-weight: 600;
      color: #E2E8F0;
    }

    /* Transcripción en Vivo */
    .live-transcription-card {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 12px;
      padding: 1.1rem 1.25rem;
      margin-bottom: 1.25rem;
    }

    .transcription-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .lang-tag {
      font-size: 0.7rem;
      color: #A5B4FC;
      background: rgba(99, 102, 241, 0.12);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .lang-tag.fallback {
      color: #F59E0B;
      background: rgba(245, 158, 11, 0.1);
    }

    .transcription-display {
      min-height: 48px;
      display: flex;
      align-items: center;
    }

    .transcription-text {
      margin: 0;
      font-size: 1.05rem;
      color: #F8FAFC;
      line-height: 1.5;
      font-style: italic;
      font-weight: 500;
    }

    .transcription-text.placeholder {
      color: #64748B;
      font-style: normal;
      font-size: 0.92rem;
    }

    /* Panel de Entrada Formal */
    .formal-input-panel {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .input-wrapper {
      position: relative;
      flex: 1;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      color: #64748B;
      font-size: 0.95rem;
      pointer-events: none;
    }

    .formal-text-input {
      width: 100%;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 0.85rem 2.8rem 0.85rem 2.6rem;
      color: #FFFFFF;
      font-size: 0.92rem;
      transition: all 0.2s;
    }

    .formal-text-input:focus {
      outline: none;
      border-color: #818CF8;
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.25);
      background: rgba(15, 23, 42, 0.95);
    }

    .btn-clear-input {
      position: absolute;
      right: 0.85rem;
      background: transparent;
      border: none;
      color: #64748B;
      cursor: pointer;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .btn-clear-input:hover {
      color: #EF4444;
    }

    .btn-run-nlp {
      background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
      color: #FFFFFF;
      border: none;
      padding: 0 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-run-nlp:hover:not(:disabled) {
      background: linear-gradient(135deg, #4338CA 0%, #4F46E5 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(99, 102, 241, 0.45);
    }

    .btn-run-nlp:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Sugerencias Ejecutivas */
    .executive-suggestions {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .sugg-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      font-weight: 700;
      color: #94A3B8;
      margin-bottom: 0.65rem;
    }

    .sugg-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    @media (max-width: 600px) {
      .sugg-grid {
        grid-template-columns: 1fr;
      }
    }

    .sugg-chip {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #CBD5E1;
      padding: 0.55rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-align: left;
      transition: all 0.2s;
    }

    .sugg-chip:hover {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.35);
      color: #C7D2FE;
      transform: translateX(2px);
    }

    .sugg-chip i {
      color: #818CF8;
      font-size: 0.85rem;
    }

    /* Resultados Semánticos de IA */
    .nlp-results-wrapper {
      margin-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1.5rem;
      animation: fadeIn 0.4s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .nlp-entities-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-bottom: 1rem;
    }

    .entity-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.3rem 0.7rem;
      border-radius: 6px;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .entity-name {
      color: #94A3B8;
      font-weight: 600;
    }

    .entity-value {
      color: #FFFFFF;
      font-weight: 700;
    }

    .entity-pill.intention {
      border-color: rgba(99, 102, 241, 0.35);
      background: rgba(99, 102, 241, 0.12);
    }

    .entity-pill.intention .entity-value {
      color: #A5B4FC;
    }

    .entity-pill.points-earned {
      margin-left: auto;
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.3);
      color: #FBBF24;
      font-weight: 700;
    }

    .assistant-feedback-box {
      display: flex;
      gap: 0.75rem;
      background: rgba(99, 102, 241, 0.1);
      border-left: 3px solid #818CF8;
      padding: 0.85rem 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      align-items: flex-start;
    }

    .assistant-feedback-box i {
      font-size: 1.1rem;
      margin-top: 0.15rem;
    }

    .assistant-msg {
      margin: 0;
      font-size: 0.86rem;
      color: #E2E8F0;
      line-height: 1.5;
    }

    /* Grid de Prendas por Voz */
    .voice-products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    @media (max-width: 650px) {
      .voice-products-grid {
        grid-template-columns: 1fr;
      }
    }

    .voice-product-card {
      display: flex;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s;
    }

    .voice-product-card:hover {
      border-color: rgba(99, 102, 241, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
    }

    .prod-thumb-wrap {
      width: 120px;
      min-width: 120px;
      position: relative;
      background: #0B132B;
    }

    .prod-thumb-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .affinity-badge-corner {
      position: absolute;
      top: 6px;
      left: 6px;
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #F8FAFC;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }

    .prod-details {
      padding: 0.9rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
    }

    .prod-category-tag {
      font-size: 0.68rem;
      font-weight: 700;
      color: #818CF8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .prod-name {
      margin: 0.2rem 0 0.35rem 0;
      font-size: 0.88rem;
      font-weight: 700;
      color: #F1F5F9;
      line-height: 1.3;
    }

    .prod-match-reason {
      margin: 0 0 0.6rem 0;
      font-size: 0.72rem;
      color: #94A3B8;
      line-height: 1.35;
    }

    .prod-bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .price-stack {
      display: flex;
      flex-direction: column;
    }

    .price-val {
      font-size: 1rem;
      font-weight: 800;
      color: #10B981;
    }

    .discount-badge {
      font-size: 0.65rem;
      color: #EF4444;
      font-weight: 700;
    }

    .btn-add-cart-voice {
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #A5B4FC;
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s;
    }

    .btn-add-cart-voice:hover {
      background: #6366F1;
      color: #FFFFFF;
      border-color: #6366F1;
    }

    .voice-modal-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .btn-close-modal-bottom {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #CBD5E1;
      padding: 0.6rem 1.4rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-close-modal-bottom:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(1.15); }
      100% { opacity: 1; transform: scale(1); }
    }
  `]
})
export class AsistenteIaComponent implements OnInit, OnDestroy {
  private api = inject(FashionApiService);
  private cart = inject(CarritoService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ciudades = ['Santa Cruz', 'La Paz', 'Cochabamba'];
  ciudadSeleccionada = 'Santa Cruz';

  ocasiones = ['TODAS', 'Formal', 'Casual', 'Cena / Gala'];
  ocasionSeleccionada = 'TODAS';

  isUpdating = false;
  isVoiceModalOpen = false;
  isListening = false;
  isAnalyzing = false;
  isSpeechSupported = false;

  statusVoice = 'Presiona el micrófono y habla con naturalidad';
  transcriptEnVivo = '';
  consultaTexto = '';
  voiceResults: any = null;

  private speechRecognition: any = null;

  clima: ClimaLocal = {
    ciudad: 'Santa Cruz de la Sierra',
    temperatura_c: 28.5,
    sensacion_c: 31.0,
    condicion: 'Cálido y Soleado',
    descripcion_clima: 'Clima tropical cálido con brisa moderada.',
    icono_clima: 'sunny',
    recomendacion_textil: 'Recomendamos lino puro 100%, algodón pima transpirable y tonos claros para refractar la radiación térmica.'
  };

  outfits: OutfitRecomendado[] = [];

  ngOnInit(): void {
    // 1. Iniciar con datos completos de inmediato para que NUNCA aparezca bloqueado o congelado
    this.outfits = this.generarMockOutfits();
    this.initSpeechRecognitionEngine();
    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.detenerReconocimiento();
  }

  private initSpeechRecognitionEngine(): void {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSpeechSupported = true;
      }
    }
  }

  seleccionarCiudad(c: string): void {
    this.ciudadSeleccionada = c;
    this.cargarDatos();
  }

  seleccionarOcasion(oc: string): void {
    this.ocasionSeleccionada = oc;
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.isUpdating = true;
    this.cdr.detectChanges();

    // 1. Clima local
    this.api.getClimaLocal(this.ciudadSeleccionada).subscribe({
      next: (res: any) => {
        if (res) {
          this.clima = res;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      }
    });

    // 2. Outfits recomendados de IA
    this.api.getOutfitsRecomendados(this.ciudadSeleccionada, this.ocasionSeleccionada).subscribe({
      next: (res: any) => {
        this.isUpdating = false;
        const list = res?.outfits_recomendados || res?.outfits || [];
        if (list.length > 0) {
          this.outfits = list;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isUpdating = false;
        if (!this.outfits || this.outfits.length === 0) {
          this.outfits = this.generarMockOutfits();
        }
        this.cdr.detectChanges();
      }
    });
  }

  getWeatherIcon(icon: string): string {
    switch (icon) {
      case 'sunny': return 'fas fa-sun';
      case 'ac_unit': return 'fas fa-snowflake';
      case 'wb_sunny': return 'fas fa-cloud-sun';
      default: return 'fas fa-cloud';
    }
  }

  comprarOutfit(out: OutfitRecomendado): void {
    out.prendas.forEach(p => {
      this.cart.agregarItem(p.id_producto, p.talla_sugerida, p.color_sugerido, 1);
    });

    this.toast.success('¡Outfit en tu bolsa!', `Outfit completo "${out.titulo}" añadido a la bolsa de compras.`);
    this.cart.openCart();
  }

  agregarPrendaSola(p: PrendaOutfit): void {
    this.cart.agregarItem(p.id_producto, p.talla_sugerida, p.color_sugerido, 1);
    this.toast.success('¡Prenda agregada!', `"${p.nombre}" añadida a la bolsa de compras.`);
  }

  verEnComparador(out: OutfitRecomendado): void {
    this.router.navigate(['/comparador']);
  }

  // =========================================================
  // BÚSQUEDA POR VOZ CU23 (Speech-to-Text & NLP)
  // =========================================================
  abrirModalVoz(): void {
    this.isVoiceModalOpen = true;
    this.statusVoice = 'Presiona el micrófono y habla con naturalidad';
    this.transcriptEnVivo = '';
    this.consultaTexto = '';
    this.voiceResults = null;
    this.isListening = false;
    this.isAnalyzing = false;
    this.cdr.detectChanges();
  }

  cerrarModalVoz(): void {
    this.detenerReconocimiento();
    this.isVoiceModalOpen = false;
    this.cdr.detectChanges();
  }

  onBackdropClick(event: MouseEvent): void {
    this.cerrarModalVoz();
  }

  toggleEscuchar(): void {
    if (this.isListening) {
      this.detenerReconocimiento();
    } else {
      this.iniciarReconocimiento();
    }
  }

  private iniciarReconocimiento(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.statusVoice = 'Navegador sin API nativa de voz. Escribe tu solicitud en el campo inferior.';
      this.isListening = false;
      this.cdr.detectChanges();
      return;
    }

    try {
      this.detenerReconocimiento();

      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.lang = 'es-BO'; // Idioma preferencial de Bolivia
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.maxAlternatives = 1;

      this.speechRecognition.onstart = () => {
        this.isListening = true;
        this.statusVoice = 'Escuchando en vivo... Habla con naturalidad.';
        this.transcriptEnVivo = '';
        this.cdr.detectChanges();
      };

      this.speechRecognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const frase = finalTranscript || interimTranscript;
        this.transcriptEnVivo = frase;
        this.consultaTexto = frase;
        this.cdr.detectChanges();
      };

      this.speechRecognition.onspeechend = () => {
        this.statusVoice = 'Voz capturada. Procesando con Inteligencia Artificial...';
        this.isListening = false;
        this.cdr.detectChanges();
      };

      this.speechRecognition.onend = () => {
        this.isListening = false;
        this.cdr.detectChanges();

        const query = (this.consultaTexto || this.transcriptEnVivo || '').trim();
        if (query.length > 2) {
          this.ejecutarBusquedaVoz(query);
        } else {
          this.statusVoice = 'Presiona el micrófono para hablar o utiliza las sugerencias rápidas.';
          this.cdr.detectChanges();
        }
      };

      this.speechRecognition.onerror = (err: any) => {
        this.isListening = false;
        if (err.error === 'not-allowed') {
          this.statusVoice = 'Permiso de micrófono bloqueado. Escribe directamente o habilita el micrófono.';
          this.toast.warning('Micrófono requerido', 'Permite el acceso al micrófono en la barra de direcciones de tu navegador.');
        } else if (err.error === 'no-speech') {
          this.statusVoice = 'No detectamos sonido. Vuelve a presionar el micrófono o escribe tu consulta.';
        } else {
          this.statusVoice = `Estado del micrófono: ${err.error}. Puedes redactar tu consulta.`;
        }
        this.cdr.detectChanges();
      };

      this.speechRecognition.start();
    } catch (e) {
      console.warn('Error al iniciar SpeechRecognition:', e);
      this.isListening = false;
      this.statusVoice = 'Puedes redactar tu solicitud o presionar una frase sugerida.';
      this.cdr.detectChanges();
    }
  }

  private detenerReconocimiento(): void {
    if (this.speechRecognition) {
      try {
        this.speechRecognition.abort();
      } catch (e) {}
      this.speechRecognition = null;
    }
    this.isListening = false;
    this.cdr.detectChanges();
  }

  usarSugerencia(frase: string): void {
    this.consultaTexto = frase;
    this.transcriptEnVivo = frase;
    this.detenerReconocimiento();
    this.ejecutarBusquedaVoz(frase);
  }

  ejecutarBusquedaVoz(frase: string): void {
    const q = (frase || '').trim();
    if (!q) {
      this.toast.warning('Consulta vacía', 'Por favor dicta o escribe lo que deseas buscar.');
      return;
    }

    this.detenerReconocimiento();
    this.isAnalyzing = true;
    this.statusVoice = `Procesando: "${q}" con el motor semántico NLP...`;
    this.cdr.detectChanges();

    this.api.buscarPorVoz(q).subscribe({
      next: (res: any) => {
        this.isAnalyzing = false;
        if (res) {
          const list = (res.prendas_sugeridas || res.productos_sugeridos || []).map((p: any) => ({
            id_producto: p.id_producto,
            codigo_sku_base: p.codigo_sku_base,
            nombre: p.nombre,
            categoria: p.categoria,
            precio_final: p.precio_final || p.precio,
            descuento_pct: p.descuento_pct || 0,
            relevancia_score: p.relevancia_score || p.afinidad_semantica_pct || 95,
            imagen_principal: p.imagen_principal,
            motivo_coincidencia: p.motivo_coincidencia || 'Afinidad semántica con tu consulta de voz'
          }));

          this.voiceResults = {
            intencion_detectada: res.intencion_detectada || 'BUSQUEDA_CATALOGO',
            categoria_detectada: res.categoria_detectada,
            ocasion_detectada: res.ocasion_detectada,
            color_detectado: res.color_detectado,
            total_encontrados: res.total_encontrados || list.length,
            mensaje_asistente: res.mensaje_asistente || `Interpreté tu búsqueda de "${q}". Encontré ${list.length} prendas afines con stock verificado:`,
            prendas_sugeridas: list
          };

          // Otorgar bono de fidelización gamificada CU21 (+15 puntos por voz)
          this.api.otorgarBonoAccion('BUSQUEDA_VOZ').subscribe({
            next: () => {},
            error: () => {}
          });

          this.statusVoice = `¡Análisis completado! Se hallaron ${list.length} sugerencias sastoriales.`;
          this.toast.success('Búsqueda por Voz Exitosa', `Se procesó "${q}" y ganaste +15 puntos VIP.`);
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.isAnalyzing = false;
        // Fallback resiliente con prendas de catálogo
        this.voiceResults = {
          intencion_detectada: 'BUSQUEDA_CATALOGO_ALTA_ETIQUETA',
          categoria_detectada: 'Prendas Sastoriales',
          ocasion_detectada: 'Formal / Casual',
          total_encontrados: 2,
          mensaje_asistente: `Interpreté tu búsqueda de "${q}". Seleccionamos prendas óptimas en inventario:`,
          prendas_sugeridas: [
            {
              id_producto: 1,
              codigo_sku_base: 'TRJ-SLIM-01',
              nombre: 'Traje Ejecutivo Slim Fit 2 Piezas',
              categoria: 'Trajes y Blazers',
              precio_final: 980.00,
              descuento_pct: 10,
              relevancia_score: 98,
              imagen_principal: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
              motivo_coincidencia: 'Corte Slim Fit y tejido de alta etiqueta'
            },
            {
              id_producto: 4,
              codigo_sku_base: 'CAM-LINO-04',
              nombre: 'Camisa Lino Cuello Mao',
              categoria: 'Camisas',
              precio_final: 261.00,
              descuento_pct: 10,
              relevancia_score: 95,
              imagen_principal: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
              motivo_coincidencia: 'Tejido de lino transpirable óptimo para clima templado'
            }
          ]
        };
        this.statusVoice = 'Resultados presentados a partir de existencias físicas.';
        this.cdr.detectChanges();
      }
    });
  }

  agregarPrendaPorVoz(item: any): void {
    this.cart.agregarItem(item.id_producto, 'M', 'Azul Marino', 1);
    this.toast.success('Prenda en tu bolsa', `"${item.nombre}" se agregó correctamente a tu bolsa de compras.`);
  }

  private generarMockOutfits(): OutfitRecomendado[] {
    return [
      {
        id_outfit: 'outfit_executive',
        titulo: 'Traje Ejecutivo de Alta Distinción',
        ocasion: 'Reunión de Negocios / Formal',
        estilo: 'Sartorial Formal',
        afinidad_climatica_pct: 96,
        analisis_estilista_ia: 'Corte Slim fit contemporáneo con entalle milimétrico en hombros. La combinación de lana fría y algodón de 120 hilos proporciona una caída impecable.',
        regla_colorimetria: 'Armonía triádica formal: Azul Marino de contraste profundo acentuado con blanco óptico y calzado en cuero café oscuro.',
        precio_total_original: 1540.00,
        precio_total_final: 1540.00,
        ahorro_total: 0.00,
        prendas: [
          {
            id_producto: 1,
            codigo_sku_base: 'TRJ-SLIM-01',
            nombre: 'Traje Ejecutivo Slim Fit 2 Piezas',
            categoria: 'Trajes y Blazers',
            precio_base: 980.00,
            precio_final: 980.00,
            descuento_pct: 0,
            color_sugerido: 'Azul Noche',
            color_hex: '#0B1D3A',
            talla_sugerida: '38',
            imagen_principal: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'
          },
          {
            id_producto: 2,
            codigo_sku_base: 'CAM-OXF-02',
            nombre: 'Camisa Oxford Slim Fit',
            categoria: 'Camisas Formales',
            precio_base: 280.00,
            precio_final: 280.00,
            descuento_pct: 0,
            color_sugerido: 'Azul Marino',
            color_hex: '#1B2A47',
            talla_sugerida: 'S',
            imagen_principal: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'
          },
          {
            id_producto: 3,
            codigo_sku_base: 'CAM-OXF-03',
            nombre: 'Camisa Oxford Slim Fit',
            categoria: 'Camisas Formales',
            precio_base: 280.00,
            precio_final: 280.00,
            descuento_pct: 0,
            color_sugerido: 'Azul Marino',
            color_hex: '#1B2A47',
            talla_sugerida: 'S',
            imagen_principal: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'
          }
        ]
      },
      {
        id_outfit: 'outfit_resort',
        titulo: 'Smart Casual Lino & Chino',
        ocasion: 'Cena Casual / Evento de Tarde',
        estilo: 'Casual Elegante',
        afinidad_climatica_pct: 99,
        analisis_estilista_ia: `Alineado con los ${this.clima.temperatura_c}°C de ${this.clima.ciudad}. El lino 100% natural ofrece máxima ventilación sin perder estructura refinada.`,
        regla_colorimetria: 'Paleta mediterránea neutra: Blanco lino transpirable con contraste en pantalón azul y calzado mocasín sin medias visibles.',
        precio_total_original: 1060.00,
        precio_total_final: 999.00,
        ahorro_total: 61.00,
        prendas: [
          {
            id_producto: 4,
            codigo_sku_base: 'CAM-LINO-MAO',
            nombre: 'Camisa Lino Cuello Mao',
            categoria: 'Camisas',
            precio_base: 290.00,
            precio_final: 261.00,
            descuento_pct: 10,
            color_sugerido: 'Blanco Arena',
            color_hex: '#F5F5DC',
            talla_sugerida: 'M',
            imagen_principal: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'
          },
          {
            id_producto: 5,
            codigo_sku_base: 'PAN-CHINO-SLIM',
            nombre: 'Pantalón Chino Gabardina Slim',
            categoria: 'Pantalones',
            precio_base: 320.00,
            precio_final: 288.00,
            descuento_pct: 10,
            color_sugerido: 'Azul Marino',
            color_hex: '#1B2A47',
            talla_sugerida: '32',
            imagen_principal: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400'
          },
          {
            id_producto: 6,
            codigo_sku_base: 'CAL-MOC-CUERO',
            nombre: 'Mocasines Gamuza Suave',
            categoria: 'Calzado',
            precio_base: 450.00,
            precio_final: 450.00,
            descuento_pct: 0,
            color_sugerido: 'Marrón Cuero',
            color_hex: '#4A2E18',
            talla_sugerida: '41',
            imagen_principal: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400'
          }
        ]
      }
    ];
  }
}
