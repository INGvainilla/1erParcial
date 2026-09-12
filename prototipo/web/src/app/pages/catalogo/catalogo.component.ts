import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { ToastService } from '../../core/services/toast.service';
import { CarritoService } from '../../core/services/carrito.service';
import { CatalogoItem, Sucursal, Categoria, StockSucursalItem } from '../../core/models/fashion.models';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header del Catálogo -->
      <div class="catalog-header glass-panel">
        <div class="header-left">
          <h2><i class="fas fa-store"></i> Catálogo Digital Omnicanal</h2>
          <p class="subtitle">Colección Masculina Premium con Vestidores Virtuales y Realidad Aumentada (CU10 / CU06)</p>
        </div>

        <!-- Selector de Sucursal Omnicanal (CU10) y Carrito (CU13) -->
        <div class="header-right-box">
          <div class="branch-selector-box">
            <label for="branch-select"><i class="fas fa-map-marker-alt"></i> Verificar Stock en Sucursal Física:</label>
            <select id="branch-select" [(ngModel)]="selectedSucursalId" (change)="loadCatalogo()" class="form-control select-branch">
              <option [ngValue]="null">🌐 Todas las Sucursales (Stock Red Total)</option>
              <option *ngFor="let s of sucursales" [ngValue]="s.id_sucursal">
                📍 {{ s.nombre_sucursal }} ({{ s.nombre_ciudad || s.ciudad?.nombre_ciudad || 'Bolivia' }})
              </option>
            </select>
          </div>

          <button class="btn-catalog-cart" (click)="carritoService.openCart()" title="Ver Bolsa de Compras">
            <i class="fas fa-shopping-bag"></i>
            <span>Bolsa</span>
            <span class="cart-badge-pill" *ngIf="carritoService.totalItems() > 0">
              {{ carritoService.totalItems() }}
            </span>
          </button>
        </div>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="filters-bar">
        <div class="category-pills">
          <button
            class="pill-btn"
            [class.active]="selectedCategoriaId === null"
            (click)="setCategoria(null)">
            Todos
          </button>
          <button
            *ngFor="let cat of categorias"
            class="pill-btn"
            [class.active]="selectedCategoriaId === cat.id_categoria"
            (click)="setCategoria(cat.id_categoria)">
            {{ cat.nombre_categoria }}
          </button>
        </div>

        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
            placeholder="Buscar por prenda, SKU o marca..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Grid de Productos -->
      <div *ngIf="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
        <p>Cargando catálogo omnicanal...</p>
      </div>

      <div *ngIf="!loading && productos.length === 0" class="empty-state glass-panel">
        <i class="fas fa-box-open fa-3x"></i>
        <h3>No se encontraron prendas</h3>
        <p>Pruebe cambiando los filtros de categoría o la sucursal seleccionada.</p>
      </div>

      <div *ngIf="!loading && productos.length > 0" class="products-grid">
        <div *ngFor="let item of productos" class="product-card glass-panel">
          <!-- Card Badge (3D/AR y Categoría) -->
          <div class="card-badges">
            <span *ngIf="item.modelo_3d_glb" class="badge-3d" title="Compatible con Vestidor Virtual 3D y RA">
              <i class="fas fa-vr-cardboard"></i> 3D / RA
            </span>
            <span class="badge-category">{{ item.nombre_categoria || 'Prenda' }}</span>
          </div>

          <!-- Imagen / Mockup Ilustrativo -->
          <div class="product-image-container">
            <img
              *ngIf="getProductImage(item)"
              [src]="getProductImage(item)"
              [alt]="item.nombre"
              class="product-img"
              (error)="item.imagen_principal = ''"
            />
            <div *ngIf="!getProductImage(item)" class="cloth-icon-wrap">
              <i [class]="getCategoryIcon(item.nombre_categoria || '')"></i>
            </div>
            <span class="sku-tag">SKU: {{ item.codigo_sku_base }}</span>
          </div>

          <!-- Información del Producto -->
          <div class="product-info">
            <span class="brand-name">{{ item.nombre_marca || 'FashionStore' }}</span>
            <h3 class="product-title">{{ item.nombre }}</h3>
            <p class="product-desc">{{ item.descripcion || 'Confección de alta sastrería con acabados reforzados.' }}</p>

            <!-- Paleta de Colores HEX Interactivo -->
            <div class="color-swatches" *ngIf="item.colores?.length">
              <span class="swatch-label">Color: <strong>{{ getColor(item) }}</strong></span>
              <div class="swatches-row">
                <span
                  *ngFor="let col of item.colores"
                  class="color-dot"
                  [class.active-dot]="getColor(item) === col.color_nombre"
                  [style.background-color]="col.codigo_hex"
                  (click)="setColor(item, col.color_nombre)"
                  [title]="col.color_nombre + ' (' + col.codigo_hex + ')'"
                ></span>
              </div>
            </div>

            <!-- Tallas Disponibles Interactivas -->
            <div class="sizes-row" *ngIf="item.tallas?.length">
              <span class="swatch-label">Talla: <strong>{{ getTalla(item) }}</strong></span>
              <div class="chips-row">
                <span
                  class="size-chip"
                  *ngFor="let t of item.tallas"
                  [class.active-chip]="getTalla(item) === t.talla"
                  (click)="setTalla(item, t.talla)"
                >
                  {{ t.talla }}
                </span>
              </div>
            </div>

            <div class="card-divider"></div>

            <!-- Precio y Disponibilidad de Stock -->
            <div class="price-availability-row">
              <div class="price-box">
                <span class="currency">Bs.</span>
                <span class="amount">{{ item.precio_final | number:'1.2-2' }}</span>
                <span class="original-price" *ngIf="item.descuento_aplicable_pct > 0">
                  Bs. {{ item.precio_base | number:'1.2-2' }}
                </span>
              </div>

              <!-- Indicador de Stock por Sucursal (CU10) -->
              <div class="stock-indicator" *ngIf="selectedSucursalId !== null">
                <ng-container *ngIf="getBranchStock(item) as bStock">
                  <span *ngIf="bStock.stock_disponible > 0" class="stock-badge in-stock">
                    <i class="fas fa-check-circle"></i> {{ bStock.stock_disponible }} unid. en sucursal
                  </span>
                  <span *ngIf="bStock.stock_disponible <= 0" class="stock-badge out-of-stock">
                    <i class="fas fa-times-circle"></i> Agotado en sucursal
                  </span>
                </ng-container>
                <span *ngIf="!getBranchStock(item)" class="stock-badge out-of-stock">
                  <i class="fas fa-times-circle"></i> Sin stock en sucursal
                </span>
              </div>

              <div class="stock-indicator" *ngIf="selectedSucursalId === null">
                <span class="stock-badge total-stock">
                  <i class="fas fa-warehouse"></i> {{ item.stock_total_disponible }} unid. red total
                </span>
              </div>
            </div>

            <!-- Botón Añadir al Carrito (CU13) -->
            <button
              class="btn-add-cart-action"
              (click)="agregarAlCarrito(item)"
              [disabled]="(selectedSucursalId !== null && (getBranchStock(item)?.stock_disponible || 0) <= 0) || (selectedSucursalId === null && item.stock_total_disponible <= 0)"
            >
              <i class="fas fa-cart-plus"></i>
              <span>Añadir a la Bolsa</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Botón Flotante Carrito (CU13) -->
      <button class="btn-floating-bag" (click)="carritoService.openCart()" title="Ver Bolsa de Compras">
        <i class="fas fa-shopping-bag"></i>
        <span class="floating-bag-badge" *ngIf="carritoService.totalItems() > 0">
          {{ carritoService.totalItems() }}
        </span>
      </button>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem 2rem;
    }
    .catalog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.75rem 2rem;
      border-radius: var(--radius-lg);
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .header-left h2 {
      font-size: 1.5rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.88rem;
      margin-top: 0.25rem;
    }
    .branch-selector-box {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-width: 320px;
    }
    .branch-selector-box label {
      font-size: 0.8rem;
      color: #93c5fd;
      font-weight: 600;
    }
    .select-branch {
      background: #1e293b;
      border-color: rgba(99, 102, 241, 0.4);
      color: #f8fafc;
      font-weight: 500;
    }
    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.75rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .category-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .pill-btn {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      border: 1px solid var(--border-subtle);
      background: rgba(17, 24, 39, 0.6);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .pill-btn:hover {
      background: rgba(30, 41, 59, 0.9);
      color: var(--text-primary);
    }
    .pill-btn.active {
      background: var(--accent-primary);
      color: #ffffff;
      border-color: var(--accent-primary);
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
    }
    .search-box {
      position: relative;
      min-width: 300px;
    }
    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .search-input {
      width: 100%;
      padding: 0.6rem 1rem 0.6rem 2.4rem;
      border-radius: 9999px;
      background: rgba(17, 24, 39, 0.8);
      border: 1px solid var(--border-subtle);
      color: var(--text-primary);
      font-size: 0.9rem;
      outline: none;
      transition: var(--transition-fast);
    }
    .search-input:focus {
      border-color: var(--border-focus);
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 1.5rem;
    }
    .product-card {
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      background: rgba(17, 24, 39, 0.75);
      border: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      position: relative;
      transition: var(--transition-smooth);
    }
    .product-card:hover {
      transform: translateY(-4px);
      border-color: rgba(99, 102, 241, 0.4);
      box-shadow: var(--shadow-glow);
    }
    .card-badges {
      position: absolute;
      top: 1rem;
      left: 1rem;
      right: 1rem;
      display: flex;
      justify-content: space-between;
      z-index: 2;
    }
    .badge-3d {
      background: linear-gradient(135deg, #ec4899, #8b5cf6);
      color: #ffffff;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      box-shadow: 0 2px 6px rgba(236, 72, 153, 0.3);
    }
    .badge-category {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .product-image-container {
      height: 160px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.6) 80%);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    .product-card:hover .product-img {
      transform: scale(1.05);
    }
    .cloth-icon-wrap i {
      font-size: 4rem;
      color: rgba(255, 255, 255, 0.85);
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4));
    }
    .sku-tag {
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
      font-size: 0.7rem;
      color: var(--text-muted);
      background: rgba(0, 0, 0, 0.5);
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
    }
    .brand-name {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #818cf8;
      font-weight: 600;
      display: block;
      margin-bottom: 0.2rem;
    }
    .product-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.4rem;
    }
    .product-desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.4;
      margin-bottom: 0.85rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .color-swatches {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.6rem;
    }
    .swatch-label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .swatches-row {
      display: flex;
      gap: 0.35rem;
    }
    .color-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.4);
      display: inline-block;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .sizes-row {
      display: flex;
      gap: 0.35rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;
    }
    .size-chip {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-subtle);
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-sm);
      font-size: 0.72rem;
      font-family: var(--font-mono);
      color: var(--text-secondary);
    }
    .card-divider {
      height: 1px;
      background: var(--border-subtle);
      margin: 0.75rem 0;
    }
    .price-availability-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    .price-box {
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
    }
    .price-box .currency {
      font-size: 0.8rem;
      font-weight: 600;
      color: #94a3b8;
    }
    .price-box .amount {
      font-size: 1.25rem;
      font-weight: 800;
      color: #f8fafc;
    }
    .original-price {
      font-size: 0.75rem;
      color: #94a3b8;
      text-decoration: line-through;
      margin-left: 0.3rem;
    }
    .stock-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.55rem;
      border-radius: var(--radius-sm);
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .stock-badge.in-stock {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .stock-badge.out-of-stock {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .stock-badge.total-stock {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .loading-state, .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }
    /* CU13: Carrito & Interacciones */
    .header-right-box {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .btn-catalog-cart {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.65rem 1.15rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.3));
      border: 1px solid rgba(129, 140, 248, 0.4);
      border-radius: 10px;
      color: #ffffff;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-catalog-cart:hover {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }
    .cart-badge-pill {
      background: #ef4444;
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
    }
    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.3rem;
    }
    .size-chip {
      cursor: pointer;
      transition: all 0.2s;
    }
    .size-chip:hover {
      border-color: #818cf8;
      color: #ffffff;
    }
    .size-chip.active-chip {
      background: #4f46e5;
      color: #ffffff;
      border-color: #818cf8;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
    }
    .color-dot {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .color-dot:hover {
      transform: scale(1.2);
    }
    .color-dot.active-dot {
      transform: scale(1.25);
      box-shadow: 0 0 0 2px #0f172a, 0 0 0 4px #818cf8;
    }
    .btn-add-cart-action {
      width: 100%;
      margin-top: 0.85rem;
      padding: 0.65rem 1rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.25));
      border: 1px solid rgba(129, 140, 248, 0.35);
      border-radius: 8px;
      color: #c7d2fe;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-add-cart-action:hover:not([disabled]) {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
      transform: translateY(-1px);
    }
    .btn-add-cart-action[disabled] {
      opacity: 0.4;
      cursor: not-allowed;
      border-color: rgba(255, 255, 255, 0.05);
    }
    .btn-floating-bag {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #8b5cf6);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 1.35rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 25px rgba(79, 70, 229, 0.5);
      cursor: pointer;
      z-index: 1000;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .btn-floating-bag:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 30px rgba(79, 70, 229, 0.7);
    }
    .floating-bag-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #ef4444;
      border: 2px solid #0f172a;
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CatalogoComponent implements OnInit {
  carritoService = inject(CarritoService);

  productos: CatalogoItem[] = [];
  categorias: Categoria[] = [];
  sucursales: Sucursal[] = [];

  selectedCategoriaId: number | null = null;
  selectedSucursalId: number | null = null;
  searchQuery = '';
  loading = false;
  private searchTimer: any;

  selectedColorMap: { [id: number]: string } = {};
  selectedTallaMap: { [id: number]: string } = {};

  getColor(item: CatalogoItem): string {
    if (this.selectedColorMap[item.id_producto]) {
      return this.selectedColorMap[item.id_producto];
    }
    return item.colores && item.colores.length > 0 ? item.colores[0].color_nombre : 'Único';
  }

  setColor(item: CatalogoItem, color: string): void {
    this.selectedColorMap[item.id_producto] = color;
  }

  getTalla(item: CatalogoItem): string {
    if (this.selectedTallaMap[item.id_producto]) {
      return this.selectedTallaMap[item.id_producto];
    }
    return item.tallas && item.tallas.length > 0 ? item.tallas[0].talla : 'M';
  }

  setTalla(item: CatalogoItem, talla: string): void {
    this.selectedTallaMap[item.id_producto] = talla;
  }

  agregarAlCarrito(item: CatalogoItem): void {
    const talla = this.getTalla(item);
    const color = this.getColor(item);
    this.carritoService.agregarItem(item.id_producto, talla, color, 1);
  }

  constructor(
    private api: FashionApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  onSearchInput(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.loadCatalogo();
    }, 300);
  }

  ngOnInit(): void {
    this.loadCategorias();
    this.loadSucursales();
    this.loadCatalogo();
  }

  loadCategorias(): void {
    this.api.getCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (e) => console.error('Error cargando categorias', e)
    });
  }

  loadSucursales(): void {
    this.api.getSucursales().subscribe({
      next: (data) => this.sucursales = data,
      error: (e) => console.error('Error cargando sucursales', e)
    });
  }

  loadCatalogo(): void {
    this.loading = true;
    this.api.getCatalogo({
      id_categoria: this.selectedCategoriaId || undefined,
      id_sucursal: this.selectedSucursalId || undefined,
      busqueda: this.searchQuery.trim() || undefined
    }).subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.toast.error('Error de Catálogo', 'No se pudieron consultar los productos.');
      }
    });
  }

  getBranchStock(item: CatalogoItem): StockSucursalItem | undefined {
    if (!this.selectedSucursalId || !item.disponibilidad_sucursales) return undefined;
    return item.disponibilidad_sucursales.find(s => s.id_sucursal === this.selectedSucursalId);
  }

  setCategoria(catId: number | null): void {
    this.selectedCategoriaId = catId;
    this.loadCatalogo();
  }

  getCategoryIcon(cat: string): string {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('traje') || lower.includes('formal') || lower.includes('blazer')) return 'fas fa-user-tie';
    if (lower.includes('camisa')) return 'fas fa-shirt';
    if (lower.includes('pantalon') || lower.includes('pantalón')) return 'fas fa-socks';
    if (lower.includes('calzado') || lower.includes('zapato')) return 'fas fa-shoe-prints';
    return 'fas fa-vest';
  }

  getProductImage(item: CatalogoItem): string {
    if (!item.imagen_principal) return '';
    if (item.imagen_principal.includes('assets.fashionstore.bo')) {
      const cat = (item.nombre_categoria || '').toLowerCase();
      if (cat.includes('camisa') || cat.includes('polo')) {
        return 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80';
      } else if (cat.includes('pantalon') || cat.includes('chino')) {
        return 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80';
      } else if (cat.includes('traje') || cat.includes('blazer') || cat.includes('saco')) {
        return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80';
      } else if (cat.includes('calzado') || cat.includes('zapato')) {
        return 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80';
      }
      return 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80';
    }
    return item.imagen_principal;
  }
}
