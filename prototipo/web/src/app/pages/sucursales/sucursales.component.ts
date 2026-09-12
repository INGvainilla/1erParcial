import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Sucursal, Ciudad } from '../../core/models/fashion.models';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="view-header glass-panel">
        <div>
          <h2><i class="fas fa-building"></i> Sucursales Físicas y Ciudades (CU05)</h2>
          <p class="subtitle">Geolocalización GPS, Capacidad de Probadores y Cobertura Nacional</p>
        </div>
        <div class="header-actions" *ngIf="auth.isAdmin()">
          <button class="btn btn-primary" (click)="openModal()">
            <i class="fas fa-plus"></i> Nueva Sucursal (CU05)
          </button>
        </div>
      </div>

      <div class="branches-grid">
        <div *ngFor="let s of sucursales" class="branch-card glass-panel">
          <div class="branch-card-header">
            <div class="branch-code">#{{ s.id_sucursal }}</div>
            <span class="badge status-active" *ngIf="s.estado === 'OPERATIVA' || s.activa">
              <i class="fas fa-check-circle"></i> {{ s.estado || 'OPERATIVA' }}
            </span>
          </div>

          <h3>{{ s.nombre_sucursal }}</h3>
          <p class="city-name"><i class="fas fa-map-pin"></i> {{ s.nombre_ciudad || s.ciudad?.nombre_ciudad || 'Bolivia' }} ({{ s.departamento || 'BO' }})</p>

          <div class="branch-details">
            <div class="detail-row">
              <i class="fas fa-location-arrow"></i>
              <span>{{ s.direccion || s.direccion_fisica }}</span>
            </div>
            <div class="detail-row" *ngIf="s.telefono || s.telefono_contacto">
              <i class="fas fa-phone"></i>
              <span>{{ s.telefono || s.telefono_contacto }}</span>
            </div>
            <div class="detail-row">
              <i class="fas fa-door-closed"></i>
              <span><strong>{{ s.capacidad_probadores }}</strong> probadores inteligentes</span>
            </div>
            <div class="detail-row" *ngIf="s.horario_apertura && s.horario_cierre">
              <i class="fas fa-clock"></i>
              <span>{{ s.horario_apertura }} - {{ s.horario_cierre }}</span>
            </div>
          </div>

          <div class="gps-box" *ngIf="(s.latitud ?? s.latitud_gps) && (s.longitud ?? s.longitud_gps)">
            <div class="coords">
              <i class="fas fa-compass"></i>
              <code>{{ (s.latitud ?? s.latitud_gps) | number:'1.4-4' }}, {{ (s.longitud ?? s.longitud_gps) | number:'1.4-4' }}</code>
            </div>
            <a [href]="'https://www.google.com/maps?q=' + (s.latitud ?? s.latitud_gps) + ',' + (s.longitud ?? s.longitud_gps)" target="_blank" class="map-link">
              Ver Mapa <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- MODAL NUEVA SUCURSAL (CU05) -->
      <div *ngIf="showModal" class="modal-overlay">
        <div class="modal-card glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-store-alt"></i> Dar de Alta Sucursal Física (CU05)</h3>
            <button class="close-btn" (click)="showModal = false">&times;</button>
          </div>
          <form (ngSubmit)="submitSucursal()" class="modal-form">
            <div class="form-row">
              <div class="form-group col-half">
                <label>Ciudad de Cobertura:</label>
                <select [(ngModel)]="newSucursal.id_ciudad" name="ciudad" required class="form-control">
                  <option *ngFor="let c of ciudades" [ngValue]="c.id_ciudad">{{ c.nombre_ciudad }} ({{ c.codigo_departamento }})</option>
                </select>
              </div>
              <div class="form-group col-half">
                <label>Capacidad Probadores:</label>
                <input type="number" [(ngModel)]="newSucursal.capacidad_probadores" name="capacidad" min="1" required class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label>Nombre Comercial de la Sucursal:</label>
              <input type="text" [(ngModel)]="newSucursal.nombre_sucursal" name="nombre" required minlength="3" class="form-control" placeholder="Ej. Sucursal San Miguel" />
            </div>

            <div class="form-group">
              <label>Dirección Física Completa:</label>
              <input type="text" [(ngModel)]="newSucursal.direccion" name="direccion" required minlength="5" class="form-control" placeholder="Ej. Av. Montenegro #1234, Zona Sur" />
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Teléfono de Contacto:</label>
                <input type="text" [(ngModel)]="newSucursal.telefono" name="tel" class="form-control" placeholder="+591 2 2789123" />
              </div>
              <div class="form-group col-half">
                <label>Estado Operativo:</label>
                <select [(ngModel)]="newSucursal.estado" name="estado" class="form-control">
                  <option value="OPERATIVA">OPERATIVA</option>
                  <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                  <option value="CERRADA">CERRADA</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Latitud GPS:</label>
                <input type="number" step="0.000001" [(ngModel)]="newSucursal.latitud" name="lat" required class="form-control" placeholder="-16.54012" />
              </div>
              <div class="form-group col-half">
                <label>Longitud GPS:</label>
                <input type="number" step="0.000001" [(ngModel)]="newSucursal.longitud" name="lng" required class="form-control" placeholder="-68.08311" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label>Horario Apertura:</label>
                <input type="text" [(ngModel)]="newSucursal.horario_apertura" name="apertura" class="form-control" placeholder="09:00" />
              </div>
              <div class="form-group col-half">
                <label>Horario Cierre:</label>
                <input type="text" [(ngModel)]="newSucursal.horario_cierre" name="cierre" class="form-control" placeholder="21:00" />
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showModal = false">Cancelar</button>
              <button type="submit" [disabled]="submitting" class="btn btn-success">
                <i class="fas fa-check"></i> {{ submitting ? 'Guardando...' : 'Crear Sucursal' }}
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
    .branches-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;
    }
    .branch-card {
      border-radius: var(--radius-lg); padding: 1.5rem; background: rgba(17, 24, 39, 0.8);
      border: 1px solid var(--border-subtle); display: flex; flex-direction: column;
    }
    .branch-card-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;
    }
    .branch-code {
      font-family: var(--font-mono); font-size: 0.8rem; background: rgba(99, 102, 241, 0.15);
      color: #818cf8; padding: 0.2rem 0.6rem; border-radius: var(--radius-sm); font-weight: 600;
    }
    .city-name { color: #38bdf8; font-size: 0.85rem; margin-bottom: 1rem; }
    .branch-details { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1.25rem; }
    .detail-row { display: flex; align-items: center; gap: 0.6rem; }
    .gps-box {
      margin-top: auto; padding: 0.75rem; background: rgba(15, 23, 42, 0.7);
      border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center;
    }
    .coords { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem; }
    .map-link { color: #818cf8; font-size: 0.78rem; text-decoration: none; font-weight: 600; }
    .map-link:hover { text-decoration: underline; }
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
    }
    .modal-card { width: 100%; max-width: 540px; background: #111827; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 2rem; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-header h3 { font-size: 1.2rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem; }
    .close-btn { background: transparent; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
    .form-row { display: flex; gap: 1rem; }
    .col-half { flex: 1; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }
    .status-active { background: rgba(16, 185, 129, 0.15); color: #34d399; }
  `]
})
export class SucursalesComponent implements OnInit {
  sucursales: Sucursal[] = [];
  ciudades: Ciudad[] = [];
  showModal = false;
  submitting = false;

  newSucursal = {
    nombre_sucursal: '',
    direccion: '',
    telefono: '',
    capacidad_probadores: 4,
    latitud: -16.54012,
    longitud: -68.08311,
    id_ciudad: 1,
    horario_apertura: '09:00',
    horario_cierre: '21:00',
    estado: 'OPERATIVA'
  };

  constructor(
    private api: FashionApiService,
    public auth: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCiudades();
    this.loadSucursales();
  }

  loadCiudades(): void {
    this.api.getCiudades().subscribe({
      next: (data) => this.ciudades = data
    });
  }

  loadSucursales(): void {
    this.api.getSucursales().subscribe({
      next: (data) => {
        this.sucursales = data;
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Error', 'No se pudieron cargar las sucursales.')
    });
  }

  openModal(): void {
    this.showModal = true;
    if (this.ciudades.length > 0) this.newSucursal.id_ciudad = this.ciudades[0].id_ciudad;
  }

  submitSucursal(): void {
    this.submitting = true;
    const payload = {
      id_ciudad: Number(this.newSucursal.id_ciudad),
      nombre_sucursal: this.newSucursal.nombre_sucursal.trim(),
      direccion: this.newSucursal.direccion.trim(),
      telefono: this.newSucursal.telefono?.trim() || null,
      capacidad_probadores: Number(this.newSucursal.capacidad_probadores),
      latitud: Number(this.newSucursal.latitud),
      longitud: Number(this.newSucursal.longitud),
      horario_apertura: this.newSucursal.horario_apertura || '09:00',
      horario_cierre: this.newSucursal.horario_cierre || '21:00',
      estado: this.newSucursal.estado || 'OPERATIVA'
    };

    this.api.createSucursal(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.showModal = false;
        this.toast.success('Sucursal Creada (CU05)', `Sucursal ${res.nombre_sucursal} registrada exitosamente.`);
        this.loadSucursales();
      },
      error: (err) => {
        this.submitting = false;
        this.toast.error('Error', err.error?.detail || 'No se pudo crear la sucursal.');
      }
    });
  }
}
