import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Temporada } from '../../core/models/fashion.models';

@Component({
  selector: 'app-temporadas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="view-header glass-panel">
        <div>
          <h2><i class="fas fa-calendar-alt"></i> Temporadas y Colecciones (CU07)</h2>
          <p class="subtitle">Campañas Estacionales (Primavera/Verano SS - Otoño/Invierno FW) y Políticas de Descuento</p>
        </div>
        <div class="header-actions" *ngIf="auth.isAdmin()">
          <button class="btn btn-primary" (click)="showModal = true">
            <i class="fas fa-plus"></i> Nueva Temporada (CU07)
          </button>
        </div>
      </div>

      <div class="seasons-grid">
        <div *ngFor="let t of temporadas" class="season-card glass-panel">
          <div class="season-header">
            <span class="type-tag" [class.ss]="t.tipo_temporada === 'SS'" [class.fw]="t.tipo_temporada === 'FW'">
              {{ t.tipo_temporada || 'TEMPORADA' }}
            </span>
            <span class="badge status-active" *ngIf="t.estado === 'VIGENTE' || t.activa">
              {{ t.estado || 'VIGENTE' }}
            </span>
          </div>

          <h3>{{ t.nombre_temporada || t.nombre_coleccion }}</h3>
          <span class="code-text">{{ t.codigo_campana || t.codigo_temporada }}</span>

          <div class="date-range">
            <i class="fas fa-calendar"></i>
            <span>{{ t.fecha_inicio | date:'mediumDate' }} — {{ t.fecha_fin | date:'mediumDate' }}</span>
          </div>

          <div class="discount-box">
            <span class="disc-label">Descuento de Liquidación:</span>
            <span class="disc-value">{{ t.descuento_liquidacion ?? t.descuento_liquidacion_pct }}% OFF</span>
          </div>
        </div>
      </div>

      <!-- MODAL NUEVA TEMPORADA -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-card glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-plus-circle"></i> Registrar Temporada (CU07)</h3>
            <button class="close-btn" (click)="showModal = false">&times;</button>
          </div>
          <form (ngSubmit)="submitTemporada()" class="modal-form">
            <div class="form-row">
              <div class="form-group col-half">
                <label>Código Temporada:</label>
                <input type="text" [(ngModel)]="newTemp.codigo_temporada" name="cod" required class="form-control" placeholder="SS-2027" />
              </div>
              <div class="form-group col-half">
                <label>Tipo:</label>
                <select [(ngModel)]="newTemp.tipo_temporada" name="tipo" class="form-control">
                  <option value="SS">Primavera/Verano (SS)</option>
                  <option value="FW">Otoño/Invierno (FW)</option>
                  <option value="SPECIAL">Cápsula Especial</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Nombre de la Colección:</label>
              <input type="text" [(ngModel)]="newTemp.nombre_coleccion" name="nom" required class="form-control" placeholder="Colección Riviera Verano 2027" />
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Fecha de Inicio:</label>
                <input type="date" [(ngModel)]="newTemp.fecha_inicio" name="fi" required class="form-control" />
              </div>
              <div class="form-group col-half">
                <label>Fecha de Fin:</label>
                <input type="date" [(ngModel)]="newTemp.fecha_fin" name="ff" required class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label>Descuento de Liquidación (%):</label>
              <input type="number" [(ngModel)]="newTemp.descuento_liquidacion_pct" name="desc" min="0" max="90" class="form-control" />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
              <button type="submit" [disabled]="submitting" class="btn btn-success">
                <i class="fas fa-check"></i> {{ submitting ? 'Guardando...' : 'Crear Temporada' }}
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
    .seasons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .season-card { border-radius: var(--radius-lg); padding: 1.5rem; background: rgba(17, 24, 39, 0.8); border: 1px solid var(--border-subtle); }
    .season-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .type-tag { padding: 0.2rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.8rem; font-weight: 700; font-family: var(--font-mono); }
    .type-tag.ss { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
    .type-tag.fw { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
    .code-text { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.75rem; }
    .date-range { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem; }
    .discount-box {
      display: flex; justify-content: space-between; align-items: center; padding: 0.75rem;
      background: rgba(15, 23, 42, 0.7); border-radius: var(--radius-md);
    }
    .disc-label { font-size: 0.8rem; color: var(--text-muted); }
    .disc-value { font-size: 1rem; font-weight: 800; color: #f43f5e; }
    .status-active { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-card { width: 100%; max-width: 520px; background: #111827; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h3 { font-size: 1.2rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
    .close-btn { background: transparent; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
    .form-row { display: flex; gap: 1rem; }
    .col-half { flex: 1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
  `]
})
export class TemporadasComponent implements OnInit {
  temporadas: Temporada[] = [];
  showModal = false;
  submitting = false;

  newTemp = {
    codigo_temporada: '',
    nombre_coleccion: '',
    tipo_temporada: 'SS',
    fecha_inicio: '2026-09-01',
    fecha_fin: '2027-02-28',
    descuento_liquidacion_pct: 15
  };

  constructor(
    private api: FashionApiService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadTemporadas();
  }

  loadTemporadas(): void {
    this.api.getTemporadas().subscribe({
      next: (data) => this.temporadas = data,
      error: () => this.toast.error('Error', 'No se pudieron cargar las temporadas.')
    });
  }

  submitTemporada(): void {
    this.submitting = true;
    const payload = {
      codigo_campana: this.newTemp.codigo_temporada.trim(),
      nombre_temporada: this.newTemp.nombre_coleccion.trim(),
      fecha_inicio: this.newTemp.fecha_inicio,
      fecha_fin: this.newTemp.fecha_fin,
      descuento_liquidacion: Number(this.newTemp.descuento_liquidacion_pct) || 0,
      estado: 'VIGENTE'
    };
    this.api.createTemporada(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.showModal = false;
        this.toast.success('Temporada Creada (CU07)', `${res.nombre_temporada || res.nombre_coleccion} registrada.`);
        this.loadTemporadas();
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error('Error', err.error?.detail || 'No se pudo crear la temporada.');
      }
    });
  }
}
