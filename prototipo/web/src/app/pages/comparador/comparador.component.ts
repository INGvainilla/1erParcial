import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { CarritoService } from '../../core/services/carrito.service';
import { ToastService } from '../../core/services/toast.service';

interface PrendaSlot {
  id_producto: number;
  nombre: string;
  categoria: string;
  precio_base: number;
  precio_final: number;
  color_sugerido: string;
  color_hex: string;
  talla_sugerida: string;
  imagen_principal?: string;
  modelo_3d_glb?: string;
}

interface OutfitColumna {
  id: string;
  titulo: string;
  ocasion: string;
  estilo: string;
  afinidad_pct: number;
  analisis_estilo: string;
  prenda_superior: PrendaSlot;
  prenda_inferior: PrendaSlot;
  calzado_accesorio: PrendaSlot;
}

@Component({
  selector: 'app-comparador',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="comparador-page">
      <!-- Encabezado de la Pantalla -->
      <div class="header-hero glass-card">
        <div class="hero-content">
          <div class="badges-row">
            <span class="badge-pu"><i class="fas fa-layer-group"></i> CU20 — M09</span>
            <span class="badge-tag"><i class="fas fa-columns"></i> Comparador Lado a Lado</span>
            <span class="badge-tag highlight"><i class="fas fa-brain"></i> Inteligencia de Estilo</span>
          </div>
          <h1>Comparador Visual de Outfits Masculinos</h1>
          <p class="hero-desc">
            Contrasta simultáneamente hasta 3 combinaciones completas de alta sastrería masculina.
            Analiza el desglose de precios en Bolivianos (Bs.), evalúa la afinidad cromática y transfiere el conjunto ganador con un solo clic.
          </p>
        </div>

        <div class="filters-bar">
          <label class="filter-label"><i class="fas fa-filter"></i> Ocasión:</label>
          <div class="btn-group-pills">
            <button 
              *ngFor="let oc of ocasiones" 
              class="pill-btn" 
              [class.active]="ocasionActiva === oc"
              (click)="cambiarOcasion(oc)">
              {{ oc }}
            </button>
          </div>
          <button class="btn-refresh" (click)="cargarOutfits()" [disabled]="isUpdating" title="Recargar recomendaciones">
            <i class="fas fa-sync-alt" [class.fa-spin]="isUpdating"></i>
          </button>
        </div>
      </div>

      <!-- Indicador sutil de sincronización -->
      <div class="sync-indicator" *ngIf="isUpdating">
        <div class="sync-spinner"></div>
        <span>Sincronizando comparativas y existencias físicas de inventario...</span>
      </div>

      <!-- Cuadrícula de 3 Columnas Comparativas -->
      <div class="outfits-grid" *ngIf="outfits.length > 0">
        <div 
          *ngFor="let col of outfits; let i = index" 
          class="outfit-card glass-card"
          [class.cheapest-card]="esMasEconomico(col)"
          [class.winner-border]="i === outfitSeleccionadoIdx">
          
          <!-- Encabezado de la Columna -->
          <div class="outfit-header">
            <div class="header-top-row">
              <span class="outfit-number">OUTFIT 0{{ i + 1 }}</span>
              <span class="badge-cheapest" *ngIf="esMasEconomico(col)">
                <i class="fas fa-tag"></i> OPCIÓN MÁS ECONÓMICA
              </span>
            </div>
            <h2 class="outfit-title">{{ col.titulo }}</h2>
            <div class="outfit-meta">
              <span class="meta-tag"><i class="fas fa-calendar-day"></i> {{ col.ocasion }}</span>
              <span class="meta-tag affinity"><i class="fas fa-magic"></i> {{ col.afinidad_pct }}% Afinidad</span>
            </div>
            <p class="estilista-quote">
              <i class="fas fa-quote-left"></i> {{ col.analisis_estilo }}
            </p>
          </div>

          <!-- Slots de Prendas Ensambladas -->
          <div class="slots-container">
            <!-- Slot 1: Prenda Superior -->
            <div class="slot-item">
              <div class="slot-badge">Superior</div>
              <div class="slot-img-wrap">
                <img [src]="col.prenda_superior.imagen_principal || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'" [alt]="col.prenda_superior.nombre">
              </div>
              <div class="slot-info">
                <h4>{{ col.prenda_superior.nombre }}</h4>
                <div class="slot-specs">
                  <span class="color-indicator">
                    <span class="color-dot" [style.background-color]="col.prenda_superior.color_hex"></span>
                    {{ col.prenda_superior.color_sugerido }}
                  </span>
                  <span class="size-pill">Talla: {{ col.prenda_superior.talla_sugerida }}</span>
                </div>
                <div class="slot-price">Bs. {{ col.prenda_superior.precio_final | number:'1.2-2' }}</div>
              </div>
            </div>

            <!-- Slot 2: Prenda Inferior -->
            <div class="slot-item">
              <div class="slot-badge">Inferior</div>
              <div class="slot-img-wrap">
                <img [src]="col.prenda_inferior.imagen_principal || 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'" [alt]="col.prenda_inferior.nombre">
              </div>
              <div class="slot-info">
                <h4>{{ col.prenda_inferior.nombre }}</h4>
                <div class="slot-specs">
                  <span class="color-indicator">
                    <span class="color-dot" [style.background-color]="col.prenda_inferior.color_hex"></span>
                    {{ col.prenda_inferior.color_sugerido }}
                  </span>
                  <span class="size-pill">Talla: {{ col.prenda_inferior.talla_sugerida }}</span>
                </div>
                <div class="slot-price">Bs. {{ col.prenda_inferior.precio_final | number:'1.2-2' }}</div>
              </div>
            </div>

            <!-- Slot 3: Calzado o Accesorio -->
            <div class="slot-item">
              <div class="slot-badge">Calzado / Acc.</div>
              <div class="slot-img-wrap">
                <img [src]="col.calzado_accesorio.imagen_principal || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'" [alt]="col.calzado_accesorio.nombre">
              </div>
              <div class="slot-info">
                <h4>{{ col.calzado_accesorio.nombre }}</h4>
                <div class="slot-specs">
                  <span class="color-indicator">
                    <span class="color-dot" [style.background-color]="col.calzado_accesorio.color_hex"></span>
                    {{ col.calzado_accesorio.color_sugerido }}
                  </span>
                  <span class="size-pill">Talla: {{ col.calzado_accesorio.talla_sugerida }}</span>
                </div>
                <div class="slot-price">Bs. {{ col.calzado_accesorio.precio_final | number:'1.2-2' }}</div>
              </div>
            </div>
          </div>

          <!-- Resumen Económico del Conjunto -->
          <div class="outfit-pricing-summary">
            <div class="price-row">
              <span>Subtotal Individual:</span>
              <span class="subtotal-val">Bs. {{ calcularSubtotal(col) | number:'1.2-2' }}</span>
            </div>
            <div class="price-row" *ngIf="calcularAhorro(col) > 0">
              <span class="discount-label">Ahorro Promocional:</span>
              <span class="discount-val">- Bs. {{ calcularAhorro(col) | number:'1.2-2' }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Total Conjunto:</span>
              <span class="total-val">Bs. {{ calcularTotal(col) | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Acciones de Conversión Directa -->
          <div class="outfit-actions">
            <button class="btn-buy-full" (click)="comprarOutfitCompleto(col)">
              <i class="fas fa-shopping-bag"></i> Comprar Outfit Completo (3 Prendas)
            </button>
            <button class="btn-reserve-outfit" (click)="reservarOutfit(col)">
              <i class="fas fa-calendar-check"></i> Reservar Outfit en Sucursal Equipetrol
            </button>
          </div>
        </div>
      </div>

      <!-- Estado Vacío -->
      <div class="empty-state glass-card" *ngIf="!isUpdating && outfits.length === 0">
        <i class="fas fa-tshirt empty-icon"></i>
        <h3>No se encontraron combinaciones en este momento</h3>
        <p>Intenta cambiar el filtro de ocasión o recargar las recomendaciones del catálogo.</p>
        <button class="btn-buy-full" (click)="cargarOutfits()">Reintentar</button>
      </div>
    </div>
  `,
  styles: [`
    .comparador-page {
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

    .header-hero {
      padding: 2rem;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 16px;
    }

    .badges-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .badge-pu {
      background: rgba(16, 185, 129, 0.2);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
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
      background: rgba(99, 102, 241, 0.2);
      color: #818CF8;
      border-color: rgba(99, 102, 241, 0.4);
    }

    .header-hero h1 {
      margin: 0.5rem 0;
      font-size: 2.1rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      font-family: var(--font-heading, 'Outfit', sans-serif);
      background: linear-gradient(135deg, #FFFFFF 0%, #E0E7FF 60%, #C7D2FE 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-desc {
      color: #94A3B8;
      font-size: 0.95rem;
      line-height: 1.6;
      max-width: 900px;
      margin: 0;
    }

    .filters-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
    }

    .filter-label {
      font-size: 0.9rem;
      color: #CBD5E1;
      font-weight: 600;
    }

    .btn-group-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pill-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #CBD5E1;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .pill-btn:hover {
      background: rgba(99, 102, 241, 0.15);
      color: #A5B4FC;
      border-color: rgba(99, 102, 241, 0.35);
    }

    .pill-btn.active {
      background: #6366F1;
      color: #FFFFFF;
      border-color: #818CF8;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }

    .btn-refresh {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #E2E8F0;
      padding: 0.55rem 0.9rem;
      border-radius: 8px;
      cursor: pointer;
      margin-left: auto;
      transition: background 0.2s;
    }

    .btn-refresh:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }

    /* Cuadrícula Comparativa */
    .outfits-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 1100px) {
      .outfits-grid {
        grid-template-columns: 1fr;
      }
    }

    .outfit-card {
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
      position: relative;
    }

    .outfit-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.45);
      border-color: rgba(99, 102, 241, 0.4);
    }

    .cheapest-card {
      border: 2px solid #10B981;
      background: linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.9) 30%);
    }

    .winner-border {
      border-color: rgba(99, 102, 241, 0.55);
      box-shadow: 0 0 25px rgba(99, 102, 241, 0.25);
    }

    .outfit-header {
      margin-bottom: 1.25rem;
    }

    .header-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .outfit-number {
      font-size: 0.75rem;
      font-weight: 800;
      color: #64748B;
      letter-spacing: 0.1em;
    }

    .badge-cheapest {
      background: #10B981;
      color: #064E3B;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }

    .outfit-title {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0.25rem 0;
      color: #F8FAFC;
      font-family: var(--font-heading, 'Outfit', sans-serif);
    }

    .outfit-meta {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .meta-tag {
      font-size: 0.75rem;
      background: rgba(255, 255, 255, 0.06);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      color: #94A3B8;
    }

    .meta-tag.affinity {
      background: rgba(99, 102, 241, 0.15);
      color: #A5B4FC;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .estilista-quote {
      font-size: 0.82rem;
      color: #94A3B8;
      line-height: 1.4;
      font-style: italic;
      background: rgba(0, 0, 0, 0.2);
      padding: 0.6rem;
      border-radius: 6px;
      margin: 0;
    }

    /* Slots de Prendas */
    .slots-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      flex: 1;
    }

    .slot-item {
      display: flex;
      gap: 0.85rem;
      align-items: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 0.75rem;
      border-radius: 10px;
      position: relative;
    }

    .slot-badge {
      position: absolute;
      top: -6px;
      left: 10px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      background: #1E293B;
      color: #94A3B8;
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .slot-img-wrap {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      overflow: hidden;
      background: #0F172A;
      flex-shrink: 0;
    }

    .slot-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .slot-info {
      flex: 1;
      min-width: 0;
    }

    .slot-info h4 {
      font-size: 0.88rem;
      margin: 0 0 0.25rem 0;
      color: #F1F5F9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .slot-specs {
      display: flex;
      gap: 0.6rem;
      font-size: 0.75rem;
      color: #94A3B8;
      margin-bottom: 0.25rem;
    }

    .color-indicator {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      border: 1px solid rgba(255, 255, 255, 0.4);
    }

    .size-pill {
      background: rgba(255, 255, 255, 0.08);
      padding: 0.1rem 0.4rem;
      border-radius: 3px;
    }

    .slot-price {
      font-size: 0.9rem;
      font-weight: 700;
      color: #10B981;
    }

    /* Resumen de Precios */
    .outfit-pricing-summary {
      background: rgba(0, 0, 0, 0.3);
      padding: 1rem;
      border-radius: 10px;
      margin-bottom: 1.25rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.82rem;
      color: #94A3B8;
      margin-bottom: 0.4rem;
    }

    .discount-val {
      color: #34D399;
      font-weight: 600;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding-top: 0.6rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      margin-top: 0.4rem;
    }

    .total-label {
      font-size: 0.95rem;
      font-weight: 700;
      color: #FFFFFF;
    }

    .total-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #10B981;
    }

    /* Acciones */
    .outfit-actions {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .btn-buy-full {
      background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
      color: #FFFFFF;
      border: 1px solid rgba(129, 140, 248, 0.3);
      padding: 0.85rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
      transition: all 0.2s ease;
    }

    .btn-buy-full:hover {
      background: linear-gradient(135deg, #4338CA 0%, #4F46E5 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    .btn-reserve-outfit {
      background: rgba(255, 255, 255, 0.05);
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

    .btn-reserve-outfit:hover {
      background: rgba(99, 102, 241, 0.15);
      border-color: rgba(99, 102, 241, 0.35);
      color: #FFFFFF;
    }

    .loading-state, .empty-state {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(99, 102, 241, 0.2);
      border-top-color: #818CF8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-icon {
      font-size: 3rem;
      color: #475569;
    }

    .sync-indicator {
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

    .sync-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(99, 102, 241, 0.3);
      border-top-color: #818CF8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  `]
})
export class ComparadorComponent implements OnInit {
  private api = inject(FashionApiService);
  private cart = inject(CarritoService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ocasiones = ['TODAS', 'Formal', 'Casual', 'Cena / Gala'];
  ocasionActiva = 'TODAS';
  isUpdating = false;
  isLoading = false;
  outfits: OutfitColumna[] = [];
  outfitSeleccionadoIdx = 0;

  ngOnInit(): void {
    // 1. Carga inmediata de atuendos para garantizar visualización sin esperas ni bloqueos
    this.outfits = this.generarMockOutfits();
    this.cargarOutfits();
  }

  cambiarOcasion(ocasion: string): void {
    this.ocasionActiva = ocasion;
    this.cargarOutfits();
  }

  cargarOutfits(): void {
    this.isUpdating = true;
    this.cdr.detectChanges();

    this.api.getOutfitsRecomendados('Santa Cruz', this.ocasionActiva).subscribe({
      next: (res: any) => {
        this.isUpdating = false;
        const list = res?.outfits_recomendados || res?.outfits || [];
        if (list.length > 0) {
          this.outfits = list.map((o: any) => this.mapearAColumna(o));
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

  private mapearAColumna(o: any): OutfitColumna {
    const prendas = o.prendas || [];
    const sup = prendas[0] || this.crearPrendaFallback('Camisa Oxford Slim', 'Camisas', 280, 280, 'Blanco', '#FFFFFF', 'M');
    const inf = prendas[1] || this.crearPrendaFallback('Pantalón Chino Gabardina', 'Pantalones', 340, 323, 'Azul Marino', '#1B2A47', '32');
    const cal = prendas[2] || this.crearPrendaFallback('Mocasines Cuero Glaseado', 'Calzado', 590, 560, 'Marrón Cuero', '#4A2E18', '41');

    return {
      id: o.id_outfit || 'outfit_' + Math.random(),
      titulo: o.titulo || 'Atuendo Refinado',
      ocasion: o.ocasion || 'Smart Casual',
      estilo: o.estilo || 'Sartorial Contemporáneo',
      afinidad_pct: o.afinidad_climatica_pct || 94,
      analisis_estilo: o.analisis_estilista_ia || 'Corte estilizado que favorece la postura masculina y proyecta sobriedad ejecutiva.',
      prenda_superior: sup,
      prenda_inferior: inf,
      calzado_accesorio: cal
    };
  }

  private crearPrendaFallback(
    nombre: string, categoria: string, base: number, final: number,
    color: string, hex: string, talla: string
  ): PrendaSlot {
    return {
      id_producto: Math.floor(Math.random() * 100) + 1,
      nombre,
      categoria,
      precio_base: base,
      precio_final: final,
      color_sugerido: color,
      color_hex: hex,
      talla_sugerida: talla,
      imagen_principal: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'
    };
  }

  private generarMockOutfits(): OutfitColumna[] {
    return [
      {
        id: 'outfit_1',
        titulo: 'Traje Ejecutivo Sartorial',
        ocasion: 'Formal / Oficina',
        estilo: 'Sartorial Clásico',
        afinidad_pct: 95,
        analisis_estilo: 'Corte Slim fit contemporáneo con entalle milimétrico en hombros. Algodón de 120 hilos y caída impecable.',
        prenda_superior: {
          id_producto: 1,
          nombre: 'Blazer Slim Fit Lana Fría',
          categoria: 'Trajes y Blazers',
          precio_base: 850.00,
          precio_final: 765.00,
          color_sugerido: 'Azul Noche',
          color_hex: '#0B1D3A',
          talla_sugerida: '40',
          imagen_principal: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400'
        },
        prenda_inferior: {
          id_producto: 2,
          nombre: 'Pantalón de Vestir Lana Fría',
          categoria: 'Pantalones',
          precio_base: 420.00,
          precio_final: 399.00,
          color_sugerido: 'Azul Marino',
          color_hex: '#1B2A47',
          talla_sugerida: '32',
          imagen_principal: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'
        },
        calzado_accesorio: {
          id_producto: 3,
          nombre: 'Zapatos Oxford Cuero Genuino',
          categoria: 'Calzado',
          precio_base: 650.00,
          precio_final: 650.00,
          color_sugerido: 'Negro Carbón',
          color_hex: '#111827',
          talla_sugerida: '41',
          imagen_principal: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'
        }
      },
      {
        id: 'outfit_2',
        titulo: 'Smart Casual Lino & Chino',
        ocasion: 'Casual Urbano',
        estilo: 'Casual Refinado',
        afinidad_pct: 99,
        analisis_estilo: 'Lino 100% natural transpirable para clima templado. Contrastes neutros con acento en calzado mocasín sin medias.',
        prenda_superior: {
          id_producto: 4,
          nombre: 'Camisa Lino Cuello Mao',
          categoria: 'Camisas',
          precio_base: 290.00,
          precio_final: 261.00,
          color_sugerido: 'Blanco Arena',
          color_hex: '#F5F5DC',
          talla_sugerida: 'M',
          imagen_principal: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'
        },
        prenda_inferior: {
          id_producto: 5,
          nombre: 'Pantalón Chino Gabardina Slim',
          categoria: 'Pantalones',
          precio_base: 320.00,
          precio_final: 288.00,
          color_sugerido: 'Beige Claro',
          color_hex: '#E2D9C8',
          talla_sugerida: '32',
          imagen_principal: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400'
        },
        calzado_accesorio: {
          id_producto: 6,
          nombre: 'Mocasines Gamuza Suave',
          categoria: 'Calzado',
          precio_base: 450.00,
          precio_final: 450.00,
          color_sugerido: 'Marrón Cuero',
          color_hex: '#4A2E18',
          talla_sugerida: '41',
          imagen_principal: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400'
        }
      },
      {
        id: 'outfit_3',
        titulo: 'Distinción Cóctel & Noche',
        ocasion: 'Cena / Gala',
        estilo: 'Noche Contemporánea',
        afinidad_pct: 92,
        analisis_estilo: 'Camisa negra con micropuntos combinada con blazer estructurado y zapatos de brillo satinado.',
        prenda_superior: {
          id_producto: 7,
          nombre: 'Camisa Oxford Negra Slim',
          categoria: 'Camisas',
          precio_base: 310.00,
          precio_final: 294.50,
          color_sugerido: 'Negro Profundo',
          color_hex: '#000000',
          talla_sugerida: 'L',
          imagen_principal: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'
        },
        prenda_inferior: {
          id_producto: 8,
          nombre: 'Pantalón Chino Gris Grafito',
          categoria: 'Pantalones',
          precio_base: 340.00,
          precio_final: 340.00,
          color_sugerido: 'Gris Plomo',
          color_hex: '#4B5563',
          talla_sugerida: '34',
          imagen_principal: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400'
        },
        calzado_accesorio: {
          id_producto: 9,
          nombre: 'Derby Cuero Charolado',
          categoria: 'Calzado',
          precio_base: 580.00,
          precio_final: 522.00,
          color_sugerido: 'Negro Satinado',
          color_hex: '#1E293B',
          talla_sugerida: '42',
          imagen_principal: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400'
        }
      }
    ];
  }

  calcularSubtotal(col: OutfitColumna): number {
    return col.prenda_superior.precio_base + col.prenda_inferior.precio_base + col.calzado_accesorio.precio_base;
  }

  calcularTotal(col: OutfitColumna): number {
    return col.prenda_superior.precio_final + col.prenda_inferior.precio_final + col.calzado_accesorio.precio_final;
  }

  calcularAhorro(col: OutfitColumna): number {
    return this.calcularSubtotal(col) - this.calcularTotal(col);
  }

  esMasEconomico(col: OutfitColumna): boolean {
    if (!this.outfits || this.outfits.length === 0) return false;
    const precios = this.outfits.map(o => this.calcularTotal(o));
    const min = Math.min(...precios);
    return this.calcularTotal(col) === min;
  }

  comprarOutfitCompleto(col: OutfitColumna): void {
    const prendas = [col.prenda_superior, col.prenda_inferior, col.calzado_accesorio];
    prendas.forEach(p => {
      this.cart.agregarItem(p.id_producto, p.talla_sugerida, p.color_sugerido, 1);
    });

    this.toast.success('¡Outfit transferido!', `Outfit completo "${col.titulo}" transferido al carrito.`);
    this.cart.openCart();
  }

  reservarOutfit(col: OutfitColumna): void {
    const prendas = [col.prenda_superior, col.prenda_inferior, col.calzado_accesorio].filter(p => !!p);
    const items = prendas.map(p => ({
      id_producto: p.id_producto,
      nombre_producto: p.nombre,
      codigo_sku_base: `SKU-${p.id_producto}`,
      talla: p.talla_sugerida || 'M',
      color: p.color_sugerido || 'Azul Marino',
      cantidad: 1,
      imagen_principal: p.imagen_principal
    }));

    this.toast.info('Reserva de Outfit', `Transfiriendo las ${items.length} prendas de "${col.titulo}" a la reserva en Sucursal Equipetrol.`);
    this.router.navigate(['/reservas/crear'], {
      state: {
        items: items,
        outfit_nombre: col.titulo,
        sucursal_preferida: 'Equipetrol'
      },
      queryParams: {
        outfit_nombre: col.titulo,
        sucursal: 'Equipetrol'
      }
    });
  }
}
