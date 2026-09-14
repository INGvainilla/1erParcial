import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { ToastService } from '../../core/services/toast.service';
import { CarritoService } from '../../core/services/carrito.service';
import { AuthService } from '../../core/services/auth.service';
import { CatalogoItem, Sucursal, Categoria, Marca, Temporada, StockSucursalItem, InventarioVarianteItem } from '../../core/models/fashion.models';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
            <i class="fas fa-th-large"></i> Todos
          </button>
          <button
            *ngFor="let cat of categorias"
            class="pill-btn"
            [class.active]="selectedCategoriaId === cat.id_categoria"
            (click)="setCategoria(cat.id_categoria)">
            <i [class]="getCategoryIcon(cat.nombre_categoria)"></i> {{ cat.nombre_categoria }}
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

      <!-- Filtros Avanzados Dinámicos (CU06 Marca, CU07 Temporada, CU10 Tallas) -->
      <div class="subfilters-bar glass-panel">
        <div class="filter-group">
          <label><i class="fas fa-tag"></i> Marca:</label>
          <select [(ngModel)]="selectedMarcaId" (change)="loadCatalogo()" class="filter-select">
            <option [ngValue]="null">Todas las Marcas</option>
            <option *ngFor="let m of marcas" [ngValue]="m.id_marca">{{ m.nombre_marca }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label><i class="fas fa-calendar-alt"></i> Colección:</label>
          <select [(ngModel)]="selectedTemporadaId" (change)="loadCatalogo()" class="filter-select">
            <option [ngValue]="null">Todas las Colecciones</option>
            <option *ngFor="let temp of temporadas" [ngValue]="temp.id_temporada">
              {{ temp.nombre_temporada }} ({{ temp.codigo_campana || temp.codigo_temporada }})
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label><i class="fas fa-ruler-combined"></i> Talla:</label>
          <select [(ngModel)]="selectedTallaFiltro" (change)="loadCatalogo()" class="filter-select">
            <option [ngValue]="null">Cualquier Talla</option>
            <option *ngFor="let t of tallasDisponibles" [ngValue]="t">{{ t }}</option>
          </select>
        </div>

        <div class="filter-actions">
          <button class="btn-clear-filters" (click)="limpiarFiltros()" *ngIf="hayFiltrosActivos()">
            <i class="fas fa-undo"></i> Limpiar Filtros
          </button>
          <span class="results-count">
            {{ productos.length }} {{ productos.length === 1 ? 'prenda encontrada' : 'prendas encontradas' }}
          </span>
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
              <span class="swatch-label">Color: <strong>{{ item.selectedColor || (item.colores[0]?.color_nombre) }}</strong></span>
              <div class="swatches-row">
                <button
                  type="button"
                  *ngFor="let col of item.colores"
                  class="color-dot"
                  [class.active-dot]="(item.selectedColor || item.colores[0]?.color_nombre) === col.color_nombre"
                  [style.background-color]="col.codigo_hex"
                  (click)="$event.stopPropagation(); setColor(item, col.color_nombre)"
                  [title]="col.color_nombre + ' (' + col.codigo_hex + ')'"
                ></button>
              </div>
            </div>

            <!-- Tallas Disponibles Interactivas con diferenciación de Costo y Precio por Talla -->
            <div class="sizes-row" *ngIf="item.tallas?.length">
              <span class="swatch-label">Talla: <strong>{{ item.selectedTalla || (item.tallas[0]?.talla) }}</strong></span>
              <div class="chips-row">
                <button
                  type="button"
                  class="size-chip"
                  *ngFor="let t of item.tallas"
                  [class.active-chip]="(item.selectedTalla || item.tallas[0]?.talla) === t.talla"
                  (click)="$event.stopPropagation(); setTalla(item, t.talla)"
                >
                  {{ t.talla }}
                </button>
              </div>
            </div>

            <div class="card-divider"></div>

            <!-- Precio y Disponibilidad de Stock Diferenciado por Talla -->
            <div class="price-availability-row">
              <div class="price-box">
                <span class="currency">Bs.</span>
                <span class="amount">{{ getPrecioFinal(item) | number:'1.2-2' }}</span>
                <span class="original-price" *ngIf="item.descuento_aplicable_pct > 0">
                  Bs. {{ getPrecioBaseTalla(item) | number:'1.2-2' }}
                </span>
                <span class="size-tag-badge" *ngIf="item.selectedTalla">
                  Talla {{ item.selectedTalla }}
                </span>
              </div>

              <!-- Indicador de Stock por Sucursal / Red Total reactivo a la variante (CU10 & CU09) -->
              <div class="stock-indicator">
                <ng-container *ngIf="getStockVariante(item) > 0">
                  <span class="stock-badge in-stock" [title]="'Stock disponible: ' + (item.selectedColor || item.colores[0]?.color_nombre) + ' - Talla ' + (item.selectedTalla || item.tallas[0]?.talla)">
                    <i class="fas fa-check-circle"></i>
                    {{ getStockVariante(item) }} unid. ({{ item.selectedColor || item.colores[0]?.color_nombre }} - {{ item.selectedTalla || item.tallas[0]?.talla }})
                    <span class="badge-loc" *ngIf="selectedSucursalId">tienda</span>
                    <span class="badge-loc" *ngIf="!selectedSucursalId">red total</span>
                  </span>
                </ng-container>

                <ng-container *ngIf="getStockVariante(item) <= 0">
                  <span class="stock-badge out-of-stock" [title]="'Sin existencias en ' + (item.selectedColor || item.colores[0]?.color_nombre) + ' - Talla ' + (item.selectedTalla || item.tallas[0]?.talla)">
                    <i class="fas fa-times-circle"></i> Agotado en {{ item.selectedColor || item.colores[0]?.color_nombre }} - {{ item.selectedTalla || item.tallas[0]?.talla }}
                  </span>
                </ng-container>

                <!-- CU09: CPP (Costo Promedio Ponderado) por Talla visible para Staff / Admin -->
                <span *ngIf="auth.isStaff() && getCppVariante(item) > 0" class="stock-badge cpp-badge" title="Costo Promedio Ponderado para Talla {{ item.selectedTalla }} (CU09 Inventario)">
                  <i class="fas fa-coins"></i> CPP (Talla {{ item.selectedTalla }}): Bs. {{ getCppVariante(item) | number:'1.2-2' }}
                </span>
              </div>
            </div>

            <!-- Selector de Cantidad y Acciones de Compra / Reserva -->
            <div class="card-bottom-actions">
              <div class="card-qty-row">
                <span class="qty-label">Cantidad:</span>
                <div class="card-qty-controls">
                  <button
                    type="button"
                    class="card-qty-btn"
                    (click)="$event.stopPropagation(); decrementarCantidad(item)"
                    [disabled]="(item.selectedCantidad || 1) <= 1"
                    title="Disminuir cantidad"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="card-qty-val">{{ item.selectedCantidad || 1 }}</span>
                  <button
                    type="button"
                    class="card-qty-btn"
                    (click)="$event.stopPropagation(); incrementarCantidad(item)"
                    [disabled]="(item.selectedCantidad || 1) >= getStockVariante(item)"
                    title="Aumentar cantidad"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <div class="card-buttons-row">
                <!-- Botón Añadir al Carrito (CU13) -->
                <button
                  type="button"
                  class="btn-add-cart-action"
                  (click)="$event.stopPropagation(); agregarAlCarrito(item)"
                  [disabled]="getStockVariante(item) <= 0"
                  title="Añadir a la Bolsa de Compras (CU13)"
                >
                  <i class="fas fa-cart-plus"></i>
                  <span>Añadir a Bolsa</span>
                </button>

                <!-- Botón Reservar para Probar en Tienda (CU11) -->
                <button
                  type="button"
                  class="btn-reserve-action"
                  (click)="$event.stopPropagation(); reservarParaProbar(item)"
                  [disabled]="getStockVariante(item) <= 0"
                  title="Reservar prenda y probador en sucursal con ticket QR (CU11)"
                >
                  <i class="fas fa-calendar-check"></i>
                  <span>Reservar en Tienda</span>
                </button>
              </div>

            </div>
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
      gap: 0.5rem;
      align-items: center;
    }
    .color-dot {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.4);
      display: inline-block;
      cursor: pointer;
      padding: 0;
      margin: 0;
      outline: none;
      box-shadow: 0 2px 5px rgba(0,0,0,0.4);
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s, border-color 0.2s;
    }
    .color-dot:hover {
      transform: scale(1.2);
      border-color: #ffffff;
    }
    .color-dot.active-dot {
      transform: scale(1.25);
      box-shadow: 0 0 0 2px #0f172a, 0 0 0 4px #818cf8;
      border-color: #ffffff;
    }
    .sizes-row {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      margin-bottom: 0.75rem;
    }
    .chips-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.2rem;
    }
    .size-chip {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      font-family: var(--font-mono, monospace);
      color: #e2e8f0;
      cursor: pointer;
      outline: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .size-chip:hover {
      background: rgba(99, 102, 241, 0.25);
      border-color: #818cf8;
      color: #ffffff;
      transform: translateY(-1px);
    }
    .size-chip.active-chip {
      background: #4f46e5;
      color: #ffffff;
      border-color: #a5b4fc;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.6);
      font-weight: 700;
    }
    .size-tag-badge {
      font-size: 0.7rem;
      font-weight: 600;
      color: #a5b4fc;
      background: rgba(99, 102, 241, 0.18);
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      margin-left: 0.4rem;
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
    .stock-badge.cpp-badge {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.35);
      font-size: 0.72rem;
    }
    .badge-loc {
      font-size: 0.65rem;
      opacity: 0.85;
      text-transform: uppercase;
      margin-left: 0.25rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.1rem 0.3rem;
      border-radius: 4px;
    }
    .subfilters-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1.25rem;
      margin-bottom: 1.5rem;
      border-radius: var(--radius-md);
      flex-wrap: wrap;
      background: rgba(17, 24, 39, 0.55);
      border: 1px solid var(--border-subtle);
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .filter-group label {
      font-size: 0.82rem;
      color: var(--text-secondary);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .filter-select {
      background: #1e293b;
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #f8fafc;
      border-radius: var(--radius-sm);
      padding: 0.4rem 0.75rem;
      font-size: 0.82rem;
      outline: none;
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .filter-select:focus {
      border-color: var(--accent-primary);
    }
    .filter-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .btn-clear-filters {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #f87171;
      border-radius: var(--radius-sm);
      padding: 0.4rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: var(--transition-fast);
    }
    .btn-clear-filters:hover {
      background: rgba(239, 68, 68, 0.3);
      color: #fff;
    }
    .results-count {
      font-size: 0.82rem;
      color: #94a3b8;
      font-weight: 500;
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
    .card-bottom-actions {
      margin-top: 0.85rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .card-qty-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.3rem 0.6rem;
      background: rgba(15, 23, 42, 0.45);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .qty-label {
      font-size: 0.78rem;
      color: var(--text-secondary, #94a3b8);
      font-weight: 600;
    }
    .card-qty-controls {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .card-qty-btn {
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #f8fafc;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      cursor: pointer;
      outline: none;
      transition: all 0.2s;
      padding: 0;
    }
    .card-qty-btn i {
      pointer-events: none;
    }
    .card-qty-btn:hover:not([disabled]) {
      background: #4f46e5;
      color: #ffffff;
      border-color: #818cf8;
      transform: scale(1.08);
    }
    .card-qty-btn[disabled] {
      opacity: 0.3;
      cursor: not-allowed;
      pointer-events: none;
    }
    .card-qty-val {
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 700;
      min-width: 28px;
      text-align: center;
    }
    .card-buttons-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .btn-add-cart-action {
      margin-top: 0;
      padding: 0.6rem 0.65rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.25));
      border: 1px solid rgba(129, 140, 248, 0.35);
      border-radius: 8px;
      color: #c7d2fe;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
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
    .btn-reserve-action {
      padding: 0.6rem 0.65rem;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(5, 150, 105, 0.25));
      border: 1px solid rgba(52, 211, 153, 0.4);
      border-radius: 8px;
      color: #6ee7b7;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: all 0.2s;
    }
    .btn-reserve-action:hover:not([disabled]) {
      background: linear-gradient(135deg, #059669, #10b981);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
      transform: translateY(-1px);
    }
    .btn-reserve-action[disabled] {
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

    /* ==========================================================================
       RESPONSIVE ADAPTATIONS (<= 1024px, <= 768px, <= 480px)
       ========================================================================== */
    @media (max-width: 1024px) {
      .page-container {
        padding: 1.25rem 1rem;
      }
      .catalog-header {
        padding: 1.25rem;
      }
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.25rem;
      }
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem 0.75rem;
      }
      .catalog-header {
        flex-direction: column;
        align-items: stretch;
        padding: 1rem;
        gap: 1rem;
      }
      .header-right-box {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
        gap: 0.75rem;
      }
      .branch-selector-box {
        min-width: unset;
        width: 100%;
      }
      .btn-catalog-cart {
        display: none;
      }
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .category-pills {
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: 0.4rem;
        -webkit-overflow-scrolling: touch;
      }
      .pill-btn {
        white-space: nowrap;
        flex-shrink: 0;
      }
      .search-box {
        min-width: unset;
        width: 100%;
      }
      .subfilters-bar {
        padding: 0.75rem;
        gap: 0.75rem;
        flex-direction: column;
        align-items: stretch;
      }
      .filter-group {
        flex-direction: column;
        align-items: stretch;
        gap: 0.25rem;
        width: 100%;
      }
      .filter-select {
        width: 100%;
      }
      .filter-actions {
        margin-left: 0;
        width: 100%;
        justify-content: space-between;
      }
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }
      .product-card {
        padding: 0.85rem;
      }
      .product-image-container {
        height: 140px;
      }
      .cloth-icon-wrap i {
        font-size: 2.8rem;
      }
      .product-title {
        font-size: 0.92rem;
      }
      .product-desc {
        display: none;
      }
      .card-buttons-row {
        grid-template-columns: 1fr;
        gap: 0.4rem;
      }
      .btn-add-cart-action, .btn-reserve-action {
        padding: 0.5rem;
        font-size: 0.75rem;
      }
      .btn-floating-bag {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .products-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.6rem;
      }
      .product-card {
        padding: 0.75rem;
      }
      .product-image-container {
        height: 120px;
      }
      .price-box .amount {
        font-size: 1.05rem;
      }
      .badge-3d {
        font-size: 0.65rem;
        padding: 0.15rem 0.4rem;
      }
    }
  `]
})
export class CatalogoComponent implements OnInit {
  carritoService = inject(CarritoService);
  auth = inject(AuthService);
  router = inject(Router);

  productos: CatalogoItem[] = [];
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  temporadas: Temporada[] = [];
  sucursales: Sucursal[] = [];

  selectedCategoriaId: number | null = null;
  selectedMarcaId: number | null = null;
  selectedTemporadaId: number | null = null;
  selectedTallaFiltro: string | null = null;
  selectedSucursalId: number | null = null;
  searchQuery = '';
  loading = false;
  private searchTimer: any;

  tallasDisponibles: string[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44'];

  selectedColorMap: { [id: number]: string } = {};
  selectedTallaMap: { [id: number]: string } = {};
  selectedCantidadMap: { [id: number]: number } = {};

  constructor(
    private api: FashionApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadMarcas();
    this.loadTemporadas();
    this.loadSucursales();
    this.loadCatalogo();
  }

  loadCategorias(): void {
    this.api.getCategorias().subscribe({
      next: (data) => this.categorias = data,
      error: (e) => console.error('Error cargando categorias', e)
    });
  }

  loadMarcas(): void {
    this.api.getMarcas().subscribe({
      next: (data) => this.marcas = data,
      error: (e) => console.error('Error cargando marcas', e)
    });
  }

  loadTemporadas(): void {
    this.api.getTemporadas().subscribe({
      next: (data) => this.temporadas = data,
      error: (e) => console.error('Error cargando temporadas', e)
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
      busqueda: this.searchQuery.trim() || undefined,
      id_marca: this.selectedMarcaId || undefined,
      id_temporada: this.selectedTemporadaId || undefined,
      talla: this.selectedTallaFiltro || undefined
    }).subscribe({
      next: (data) => {
        this.productos = data;
        // Inicializar selecciones reactivas por producto
        for (const p of this.productos) {
          p.selectedColor = (p.colores && p.colores.length > 0) ? p.colores[0].color_nombre : 'Único';
          p.selectedTalla = (p.tallas && p.tallas.length > 0) ? p.tallas[0].talla : 'M';
          p.selectedCantidad = 1;
        }
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

  hayFiltrosActivos(): boolean {
    return this.selectedCategoriaId !== null ||
           this.selectedMarcaId !== null ||
           this.selectedTemporadaId !== null ||
           this.selectedTallaFiltro !== null ||
           this.searchQuery.trim().length > 0;
  }

  limpiarFiltros(): void {
    this.selectedCategoriaId = null;
    this.selectedMarcaId = null;
    this.selectedTemporadaId = null;
    this.selectedTallaFiltro = null;
    this.searchQuery = '';
    this.loadCatalogo();
  }

  setCategoria(catId: number | null): void {
    this.selectedCategoriaId = catId;
    this.loadCatalogo();
  }

  onSearchInput(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.loadCatalogo();
    }, 300);
  }

  getCantidad(item: CatalogoItem): number {
    return item.selectedCantidad || 1;
  }

  incrementarCantidad(item: CatalogoItem): void {
    const maxStock = this.getStockVariante(item);
    const actual = item.selectedCantidad || 1;
    if (actual < maxStock) {
      item.selectedCantidad = actual + 1;
      this.cdr.detectChanges();
    } else {
      this.toast.warning('Límite de Stock', `Solo hay ${maxStock} unidades disponibles en ${item.selectedColor} / Talla ${item.selectedTalla}.`);
    }
  }

  decrementarCantidad(item: CatalogoItem): void {
    const actual = item.selectedCantidad || 1;
    if (actual > 1) {
      item.selectedCantidad = actual - 1;
      this.cdr.detectChanges();
    }
  }

  getColor(item: CatalogoItem): string {
    return item.selectedColor || (item.colores && item.colores.length > 0 ? item.colores[0].color_nombre : 'Único');
  }

  setColor(item: CatalogoItem, color: string): void {
    item.selectedColor = color;
    this.ajustarCantidadSiExcede(item);
    this.cdr.detectChanges();
  }

  getTalla(item: CatalogoItem): string {
    return item.selectedTalla || (item.tallas && item.tallas.length > 0 ? item.tallas[0].talla : 'M');
  }

  setTalla(item: CatalogoItem, talla: string): void {
    item.selectedTalla = talla;
    this.ajustarCantidadSiExcede(item);
    this.cdr.detectChanges();
  }

  private ajustarCantidadSiExcede(item: CatalogoItem): void {
    const maxStock = this.getStockVariante(item);
    const actual = item.selectedCantidad || 1;
    if (maxStock <= 0) {
      item.selectedCantidad = 1;
    } else if (actual > maxStock) {
      item.selectedCantidad = maxStock;
    }
  }

  // ==========================================
  // COSTO Y PRECIO SEGÚN LA TALLA
  // ==========================================
  getPrecioFinal(item: CatalogoItem): number {
    const factor = this.getFactorTalla(item.selectedTalla || '');
    const precioBase = Number(item.precio_base) * factor;
    const desc = Number(item.descuento_aplicable_pct) || 0;
    return Math.round(precioBase * (1 - desc / 100) * 100) / 100;
  }

  getPrecioBaseTalla(item: CatalogoItem): number {
    const factor = this.getFactorTalla(item.selectedTalla || '');
    return Math.round(Number(item.precio_base) * factor * 100) / 100;
  }

  getFactorTalla(talla: string): number {
    const t = (talla || '').trim().toUpperCase();
    const factores: { [k: string]: number } = {
      'S': 0.95, 'M': 1.00, 'L': 1.05, 'XL': 1.10, 'XXL': 1.15,
      '30': 0.95, '32': 1.00, '34': 1.05, '36': 1.10,
      '38': 0.95, '40': 1.00, '42': 1.05, '44': 1.10,
      '39': 0.95, '41': 1.05
    };
    return factores[t] !== undefined ? factores[t] : 1.00;
  }

  // ==========================================
  // CU09 & CU10: STOCK Y CPP REACTIVO POR VARIANTE
  // ==========================================
  getStockVariante(item: CatalogoItem): number {
    const t = (item.selectedTalla || (item.tallas && item.tallas.length > 0 ? item.tallas[0].talla : '')).trim().toUpperCase();
    const c = (item.selectedColor || (item.colores && item.colores.length > 0 ? item.colores[0].color_nombre : '')).trim().toLowerCase();

    if (!item.inventario_variantes || item.inventario_variantes.length === 0) {
      return item.stock_total_disponible || 0;
    }

    if (this.selectedSucursalId) {
      const v = item.inventario_variantes.find(iv =>
        iv.id_sucursal === this.selectedSucursalId &&
        iv.talla.trim().toUpperCase() === t &&
        iv.color.trim().toLowerCase() === c
      );
      return v ? v.stock_disponible : 0;
    } else {
      return item.inventario_variantes
        .filter(iv => iv.talla.trim().toUpperCase() === t && iv.color.trim().toLowerCase() === c)
        .reduce((acc, curr) => acc + curr.stock_disponible, 0);
    }
  }

  getCppVariante(item: CatalogoItem): number {
    const t = (item.selectedTalla || (item.tallas && item.tallas.length > 0 ? item.tallas[0].talla : '')).trim().toUpperCase();
    const c = (item.selectedColor || (item.colores && item.colores.length > 0 ? item.colores[0].color_nombre : '')).trim().toLowerCase();

    if (!item.inventario_variantes || item.inventario_variantes.length === 0) {
      return item.cpp_promedio || 0;
    }

    if (this.selectedSucursalId) {
      const v = item.inventario_variantes.find(iv =>
        iv.id_sucursal === this.selectedSucursalId &&
        iv.talla.trim().toUpperCase() === t &&
        iv.color.trim().toLowerCase() === c
      );
      return v ? Number(v.costo_promedio_ponderado) : (Number(item.cpp_promedio) || 0);
    } else {
      const matches = item.inventario_variantes.filter(iv =>
        iv.talla.trim().toUpperCase() === t &&
        iv.color.trim().toLowerCase() === c
      );
      if (matches.length > 0) {
        const sum = matches.reduce((acc, curr) => acc + Number(curr.costo_promedio_ponderado), 0);
        return Math.round((sum / matches.length) * 100) / 100;
      }
      return Number(item.cpp_promedio) || 0;
    }
  }

  getBranchStock(item: CatalogoItem): StockSucursalItem | undefined {
    if (!this.selectedSucursalId || !item.disponibilidad_sucursales) return undefined;
    return item.disponibilidad_sucursales.find(s => s.id_sucursal === this.selectedSucursalId);
  }

  agregarAlCarrito(item: CatalogoItem): void {
    const talla = item.selectedTalla || (item.tallas && item.tallas.length > 0 ? item.tallas[0].talla : 'M');
    const color = item.selectedColor || (item.colores && item.colores.length > 0 ? item.colores[0].color_nombre : 'Único');
    const cant = item.selectedCantidad || 1;
    const stockDisp = this.getStockVariante(item);

    if (stockDisp <= 0) {
      this.toast.error('Prenda Agotada', `No hay existencias de ${item.nombre} en ${color} / ${talla}.`);
      return;
    }

    this.carritoService.agregarItem(item.id_producto, talla, color, cant);
  }

  reservarParaProbar(item: CatalogoItem): void {
    const talla = item.selectedTalla || (item.tallas && item.tallas.length > 0 ? item.tallas[0].talla : 'M');
    const color = item.selectedColor || (item.colores && item.colores.length > 0 ? item.colores[0].color_nombre : 'Único');
    const cant = item.selectedCantidad || 1;
    const stockDisp = this.getStockVariante(item);

    if (stockDisp <= 0) {
      this.toast.error('Prenda Agotada', `No hay existencias para reservar ${item.nombre} en ${color} / ${talla}.`);
      return;
    }

    this.router.navigate(['/reservas/crear'], {
      state: {
        id_sucursal: this.selectedSucursalId,
        items: [{
          id_producto: item.id_producto,
          nombre_producto: item.nombre,
          codigo_sku_base: item.codigo_sku_base,
          talla: talla,
          color: color,
          cantidad: cant,
          imagen_principal: this.getProductImage(item)
        }]
      }
    });
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


