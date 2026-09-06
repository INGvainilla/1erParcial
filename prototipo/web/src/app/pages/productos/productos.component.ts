import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Producto, Categoria, Marca } from '../../core/models/fashion.models';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="view-header glass-panel">
        <div>
          <h2><i class="fas fa-tshirt"></i> Catálogo y Atributos de Moda (CU06)</h2>
          <p class="subtitle">SKU, Colores con Código HEX, Tallas Internacionales y Compatibilidad con Modelos 3D / RA</p>
        </div>
        <div class="header-actions" *ngIf="auth.isAdmin()">
          <button class="btn btn-primary" (click)="openModal()">
            <i class="fas fa-plus"></i> Nuevo Producto (CU06)
          </button>
        </div>
      </div>

      <div class="table-card glass-panel">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>SKU Base</th>
                <th>Prenda / Categoría</th>
                <th>Marca</th>
                <th>Colores (HEX)</th>
                <th>Tallas</th>
                <th>Precio Base</th>
                <th>Modelo 3D</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of productos">
                <td><code class="sku-chip">{{ p.codigo_sku_base }}</code></td>
                <td>
                  <div class="p-cell">
                    <strong>{{ p.nombre }}</strong>
                    <span class="cat-text">{{ p.nombre_categoria || 'Categoría #' + p.id_categoria }}</span>
                  </div>
                </td>
                <td>{{ p.nombre_marca || 'Marca #' + p.id_marca }}</td>
                <td>
                  <div class="swatches-wrap">
                    <span
                      *ngFor="let col of p.colores"
                      class="color-dot"
                      [style.background-color]="col.codigo_hex"
                      [title]="col.color_nombre + ' (' + col.codigo_hex + ')'"
                    ></span>
                  </div>
                </td>
                <td>
                  <div class="tallas-wrap">
                    <span class="talla-chip" *ngFor="let t of p.tallas">{{ t.talla }}</span>
                  </div>
                </td>
                <td class="bold">Bs. {{ p.precio_base | number:'1.2-2' }}</td>
                <td>
                  <span *ngIf="p.modelo_3d_glb" class="badge-3d">
                    <i class="fas fa-cube"></i> 3D
                  </span>
                  <span *ngIf="!p.modelo_3d_glb" class="text-muted">—</span>
                </td>
                <td>
                  <span class="badge status-active">{{ p.estado }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL NUEVO PRODUCTO (CU06) -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-card wide glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-tag"></i> Registrar Producto con Atributos de Moda (CU06)</h3>
            <button class="close-btn" (click)="showModal = false">&times;</button>
          </div>
          <form (ngSubmit)="submitProducto()" class="modal-form">
            <div class="form-row">
              <div class="form-group col-half">
                <label>Código SKU Base Único:</label>
                <input type="text" [(ngModel)]="newProd.codigo_sku_base" name="sku" required class="form-control" placeholder="TRA-004-NAVY" />
              </div>
              <div class="form-group col-half">
                <label>Nombre Comercial:</label>
                <input type="text" [(ngModel)]="newProd.nombre" name="nombre" required class="form-control" placeholder="Traje Slim Fit Lana" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Categoría:</label>
                <select [(ngModel)]="newProd.id_categoria" name="cat" required class="form-control">
                  <option *ngFor="let c of categorias" [ngValue]="c.id_categoria">{{ c.nombre_categoria }}</option>
                </select>
              </div>
              <div class="form-group col-half">
                <label>Marca:</label>
                <select [(ngModel)]="newProd.id_marca" name="marca" required class="form-control">
                  <option *ngFor="let m of marcas" [ngValue]="m.id_marca">{{ m.nombre_marca }}</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Precio Base (Bs.):</label>
                <input type="number" step="0.01" [(ngModel)]="newProd.precio_base" name="precio" required min="1" class="form-control" />
              </div>
              <div class="form-group col-half">
                <label>Modelo 3D (.glb Vestidor Virtual):</label>
                <input type="text" [(ngModel)]="newProd.modelo_3d_glb" name="model3d" class="form-control" placeholder="assets/models3d/traje.glb" />
              </div>
            </div>

            <div class="form-group">
              <label>Descripción Corta:</label>
              <textarea [(ngModel)]="newProd.descripcion" name="desc" rows="2" class="form-control" placeholder="Descripción de materiales y corte..."></textarea>
            </div>

            <!-- Variantes de Colores HEX -->
            <div class="form-group">
              <label><i class="fas fa-palette"></i> Colores HEX (Nombre : #HEX separados por coma):</label>
              <input type="text" [(ngModel)]="rawColores" name="colores" class="form-control" placeholder="Azul Marino:#0F1E36, Gris Carbón:#2C3E50" />
            </div>

            <!-- Tallas -->
            <div class="form-group">
              <label><i class="fas fa-ruler"></i> Tallas (Separadas por coma):</label>
              <input type="text" [(ngModel)]="rawTallas" name="tallas" class="form-control" placeholder="38R, 40R, 42R, 44R" />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
              <button type="submit" [disabled]="submitting" class="btn btn-success">
                <i class="fas fa-check"></i> {{ submitting ? 'Guardando...' : 'Crear Producto' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem 2rem; }
    .view-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1.5rem 2rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;
    }
    .view-header h2 { font-size: 1.4rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
    .subtitle { color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.2rem; }
    .table-card { border-radius: var(--radius-lg); padding: 1rem; background: rgba(17, 24, 39, 0.8); border: 1px solid var(--border-subtle); }
    .table-responsive { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: 0.85rem 1rem; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border-subtle); }
    .data-table td { padding: 0.85rem 1rem; font-size: 0.85rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: var(--text-primary); }
    .sku-chip { font-family: var(--font-mono); background: rgba(15, 23, 42, 0.8); padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); color: #38bdf8; font-size: 0.75rem; }
    .p-cell { display: flex; flex-direction: column; }
    .cat-text { font-size: 0.75rem; color: var(--text-muted); }
    .swatches-wrap { display: flex; gap: 0.3rem; }
    .color-dot { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); display: inline-block; }
    .tallas-wrap { display: flex; gap: 0.25rem; flex-wrap: wrap; }
    .talla-chip { background: rgba(255, 255, 255, 0.06); padding: 0.1rem 0.4rem; border-radius: var(--radius-sm); font-size: 0.72rem; }
    .bold { font-weight: 700; color: #f8fafc; }
    .badge-3d { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 0.15rem 0.45rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; }
    .status-active { background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 600; }
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-card.wide { width: 100%; max-width: 650px; background: #111827; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h3 { font-size: 1.2rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
    .close-btn { background: transparent; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
    .form-row { display: flex; gap: 1rem; }
    .col-half { flex: 1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
  `]
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  showModal = false;
  submitting = false;

  rawColores = 'Azul Marino:#0F1E36, Gris Carbón:#2C3E50';
  rawTallas = '38R, 40R, 42R';

  newProd = {
    codigo_sku_base: '',
    nombre: '',
    descripcion: '',
    precio_base: 950.00,
    modelo_3d_glb: 'assets/models3d/traje.glb',
    id_categoria: 1,
    id_marca: 1
  };

  constructor(
    private api: FashionApiService,
    private toast: ToastService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadMarcas();
    this.loadProductos();
  }

  loadCategorias(): void {
    this.api.getCategorias().subscribe(data => this.categorias = data);
  }

  loadMarcas(): void {
    this.api.getMarcas().subscribe(data => this.marcas = data);
  }

  loadProductos(): void {
    this.api.getProductos().subscribe({
      next: (data) => this.productos = data,
      error: () => this.toast.error('Error', 'No se pudieron cargar los productos.')
    });
  }

  openModal(): void {
    this.showModal = true;
    if (this.categorias.length > 0) this.newProd.id_categoria = this.categorias[0].id_categoria;
    if (this.marcas.length > 0) this.newProd.id_marca = this.marcas[0].id_marca;
  }

  submitProducto(): void {
    this.submitting = true;

    const parsedColores = this.rawColores.split(',').map(c => {
      const parts = c.split(':');
      return {
        color_nombre: parts[0]?.trim() || 'Negro',
        codigo_hex: parts[1]?.trim() || '#000000'
      };
    });

    const parsedTallas = this.rawTallas.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const payload = {
      ...this.newProd,
      colores: parsedColores,
      tallas: parsedTallas
    };

    this.api.createProducto(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.showModal = false;
        this.toast.success('Producto Registrado (CU06)', `${res.nombre} (SKU: ${res.codigo_sku_base}) creado.`);
        this.loadProductos();
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error('Error', err.error?.detail || 'No se pudo crear el producto.');
      }
    });
  }
}
