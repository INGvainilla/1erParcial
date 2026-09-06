import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container" *ngIf="auth.isAdmin()">
      <!-- Banner de Bienvenida -->
      <div class="welcome-banner glass-panel">
        <div class="banner-text">
          <div class="course-pill">
            <i class="fas fa-university"></i> Sistemas de Información II (SI2) — 2-2026
          </div>
          <h2>FashionStore — Plataforma E-Commerce Omnicanal</h2>
          <p class="desc">
            Primer Parcial (Ciclo 1: Fundamentos y Módulos Base). Metodología PUDS, Arquitectura en 3 Capas,
            Persistencia en PostgreSQL, Backend FastAPI y Frontend Angular.
          </p>
          <div class="authors-badge">
            <span><i class="fas fa-user-graduate"></i> Alberto Delgado</span>
            <span><i class="fas fa-user-graduate"></i> Andy Mujica</span>
            <span><i class="fas fa-chalkboard-teacher"></i> Docente: MSc. Ing. Angélica Garzón Cuéllar</span>
          </div>
        </div>

        <div class="system-status-box">
          <div class="status-indicator">
            <span class="ping-dot"></span>
            <strong>Backend FastAPI: ONLINE</strong>
          </div>
          <div class="status-meta">
            <span><i class="fas fa-database"></i> PostgreSQL: <code>fashionstore_db</code></span>
            <span><i class="fas fa-code-branch"></i> Versión API: <code>v1.0.0</code></span>
          </div>
          <div class="quick-links">
            <a href="/docs" target="_blank" class="status-link">
              <i class="fas fa-book"></i> Swagger Docs
            </a>
            <a href="/health" target="_blank" class="status-link">
              <i class="fas fa-heartbeat"></i> Health API
            </a>
          </div>
        </div>
      </div>

      <!-- Métricas / KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card glass-panel" routerLink="/catalogo">
          <div class="kpi-icon cat"><i class="fas fa-tshirt"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Prendas en Catálogo</span>
            <span class="kpi-value">{{ totalProductos }}</span>
            <span class="kpi-sub">CU06 / CU10 Omnicanal</span>
          </div>
        </div>

        <div class="kpi-card glass-panel" routerLink="/sucursales">
          <div class="kpi-icon branch"><i class="fas fa-store"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Sucursales Físicas</span>
            <span class="kpi-value">{{ totalSucursales }}</span>
            <span class="kpi-sub">CU05 Geolocalización GPS</span>
          </div>
        </div>

        <div class="kpi-card glass-panel" routerLink="/inventario">
          <div class="kpi-icon inv"><i class="fas fa-boxes"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Stock Total en Red</span>
            <span class="kpi-value">{{ totalStock }}</span>
            <span class="kpi-sub">CU09 Valuación CPP</span>
          </div>
        </div>

        <div class="kpi-card glass-panel" routerLink="/usuarios">
          <div class="kpi-icon usr"><i class="fas fa-user-shield"></i></div>
          <div class="kpi-content">
            <span class="kpi-title">Usuarios Registrados</span>
            <span class="kpi-value">{{ totalUsuarios }}</span>
            <span class="kpi-sub">CU01/CU04 Control RBAC</span>
          </div>
        </div>
      </div>

      <!-- Guía Rápida de Casos de Uso del Ciclo 1 -->
      <div class="usecases-section glass-panel">
        <h3><i class="fas fa-tasks"></i> Casos de Uso Implementados y Evaluados (Ciclo 1)</h3>
        <div class="usecase-grid">
          <div class="cu-box" routerLink="/login">
            <span class="cu-tag">CU01</span>
            <h4>Autenticar Usuario (RBAC)</h4>
            <p>Control de 5 intentos fallidos con bloqueo preventivo de 30 minutos y bitácora de accesos.</p>
          </div>
          <div class="cu-box" routerLink="/login">
            <span class="cu-tag">CU02</span>
            <h4>Registrar Cliente</h4>
            <p>Auto-registro de clientes en línea con cifrado seguro Bcrypt y asignación de rol.</p>
          </div>
          <div class="cu-box" routerLink="/login">
            <span class="cu-tag">CU03</span>
            <h4>Recuperar Contraseña (OTP)</h4>
            <p>Emisión y verificación de token OTP de 6 dígitos con vigencia estricta de 15 minutos.</p>
          </div>
          <div class="cu-box" routerLink="/usuarios">
            <span class="cu-tag">CU04</span>
            <h4>Gestionar Usuarios y Roles</h4>
            <p>Desbloqueo administrativo de cuentas bloqueadas y cambio dinámico de roles RBAC.</p>
          </div>
          <div class="cu-box" routerLink="/sucursales">
            <span class="cu-tag">CU05</span>
            <h4>Sucursales Físicas y GPS</h4>
            <p>Alta de tiendas, capacidad de probadores inteligentes y mapeo satelital GPS.</p>
          </div>
          <div class="cu-box" routerLink="/productos">
            <span class="cu-tag">CU06</span>
            <h4>Catálogo y Atributos de Moda</h4>
            <p>Variantes de color HEX real, tallas numéricas/alfanuméricas y soporte para modelo 3D.</p>
          </div>
          <div class="cu-box" routerLink="/temporadas">
            <span class="cu-tag">CU07</span>
            <h4>Temporadas y Colecciones</h4>
            <p>Campañas estacionales Primavera/Verano y Otoño/Invierno con políticas de liquidación.</p>
          </div>
          <div class="cu-box" routerLink="/proveedores">
            <span class="cu-tag">CU08</span>
            <h4>Proveedores Textiles</h4>
            <p>Directorio de proveedores con garantía de unicidad estricta de NIT tributario.</p>
          </div>
          <div class="cu-box" routerLink="/inventario">
            <span class="cu-tag">CU09</span>
            <h4>Inventario Multi-Sucursal y CPP</h4>
            <p>Recálculo matemático en vivo de Costo Promedio Ponderado y asientos inmutables de Kardex.</p>
          </div>
          <div class="cu-box" routerLink="/catalogo">
            <span class="cu-tag">CU10</span>
            <h4>Consulta Catálogo Omnicanal</h4>
            <p>Verificación de stock físico por sucursal seleccionada para evitar desabastecimiento.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de Restricción para Invitados o Clientes -->
    <div class="page-container" *ngIf="!auth.isAdmin()">
      <div class="auth-required-card glass-panel">
        <div class="auth-icon-wrap">
          <i class="fas fa-user-shield"></i>
        </div>
        <div class="auth-text-wrap">
          <h3>Panel de Control Ejecutivo (Exclusivo Administrador)</h3>
          <p>
            El cuadro de mando, auditoría de usuarios y métricas de infraestructura están reservados exclusivamente para el rol <strong>ADMINISTRADOR</strong>.
          </p>
        </div>
        <div class="auth-actions-wrap">
          <a routerLink="/catalogo" class="btn btn-primary">
            <i class="fas fa-store"></i> Ir al Catálogo de Prendas
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem 2rem; }
    .welcome-banner {
      padding: 2rem; border-radius: var(--radius-lg); margin-bottom: 1.5rem;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.5rem;
    }
    .banner-text { flex: 1; min-width: 320px; }
    .course-pill {
      display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem;
      border-radius: 9999px; background: rgba(99, 102, 241, 0.15); color: #818cf8;
      font-size: 0.8rem; font-weight: 600; margin-bottom: 0.75rem;
    }
    .banner-text h2 { font-size: 1.6rem; color: #ffffff; margin-bottom: 0.5rem; }
    .desc { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem; max-width: 650px; }
    .authors-badge { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.8rem; color: #94a3b8; }
    .authors-badge span { display: flex; align-items: center; gap: 0.35rem; }
    .system-status-box {
      background: rgba(15, 23, 42, 0.8); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md); padding: 1.25rem; min-width: 260px;
    }
    .status-indicator { display: flex; align-items: center; gap: 0.5rem; color: #34d399; font-size: 0.9rem; margin-bottom: 0.75rem; }
    .ping-dot { width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
    .status-meta { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem; }
    .status-meta code { color: #38bdf8; font-family: var(--font-mono); }
    .quick-links { display: flex; gap: 0.5rem; }
    .status-link {
      padding: 0.35rem 0.65rem; border-radius: var(--radius-sm); background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc; text-decoration: none; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.35rem;
    }
    .status-link:hover { background: rgba(99, 102, 241, 0.35); }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem; }
    .kpi-card {
      border-radius: var(--radius-lg); padding: 1.25rem; display: flex; align-items: center; gap: 1rem;
      cursor: pointer; transition: var(--transition-smooth); background: rgba(17, 24, 39, 0.75); border: 1px solid var(--border-subtle);
    }
    .kpi-card:hover { transform: translateY(-3px); border-color: rgba(99, 102, 241, 0.4); box-shadow: var(--shadow-glow); }
    .kpi-icon {
      width: 50px; height: 50px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;
    }
    .kpi-icon.cat { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
    .kpi-icon.branch { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .kpi-icon.inv { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .kpi-icon.usr { background: rgba(236, 72, 153, 0.2); color: #f472b6; }
    .kpi-content { display: flex; flex-direction: column; }
    .kpi-title { font-size: 0.8rem; color: var(--text-muted); }
    .kpi-value { font-size: 1.6rem; font-weight: 800; color: #f8fafc; }
    .kpi-sub { font-size: 0.72rem; color: #818cf8; }
    .usecases-section { border-radius: var(--radius-lg); padding: 1.5rem; background: rgba(17, 24, 39, 0.8); border: 1px solid var(--border-subtle); }
    .usecases-section h3 { font-size: 1.2rem; color: var(--text-primary); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
    .usecase-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .cu-box {
      background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md); padding: 1rem; cursor: pointer; transition: var(--transition-fast);
    }
    .cu-box:hover { background: rgba(30, 41, 59, 0.8); border-color: rgba(99, 102, 241, 0.4); transform: translateY(-2px); }
    .cu-tag {
      font-size: 0.7rem; font-weight: 700; font-family: var(--font-mono);
      background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 0.15rem 0.45rem; border-radius: var(--radius-sm);
    }
    .cu-box h4 { font-size: 0.95rem; color: var(--text-primary); margin: 0.4rem 0 0.25rem; }
    .cu-box p { font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; }

    /* Tarjeta de Restricción */
    .auth-required-card {
      display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
      padding: 2.5rem; border-radius: var(--radius-lg); background: rgba(30, 41, 59, 0.75);
      border: 1px solid rgba(99, 102, 241, 0.3); margin-top: 1rem; flex-wrap: wrap;
    }
    .auth-icon-wrap {
      width: 60px; height: 60px; border-radius: 50%; background: rgba(99, 102, 241, 0.2);
      color: #818cf8; display: flex; align-items: center; justify-content: center; font-size: 2rem;
    }
    .auth-text-wrap { flex: 1; min-width: 260px; }
    .auth-text-wrap h3 { font-size: 1.3rem; color: #ffffff; margin-bottom: 0.4rem; }
    .auth-text-wrap p { color: #94a3b8; font-size: 0.9rem; line-height: 1.4; margin: 0; }
    .auth-actions-wrap { display: flex; gap: 0.75rem; }
  `]
})
export class DashboardComponent implements OnInit {
  totalProductos = 0;
  totalSucursales = 0;
  totalStock = 0;
  totalUsuarios = 0;

  constructor(
    private api: FashionApiService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      this.api.getProductos().subscribe(data => this.totalProductos = data.length);
      this.api.getSucursales().subscribe(data => this.totalSucursales = data.length);
      this.api.getInventario().subscribe(data => {
        this.totalStock = data.reduce((acc, curr) => acc + curr.stock_fisico, 0);
      });
      this.api.getUsuarios().subscribe({
        next: (data) => this.totalUsuarios = data.length,
        error: () => this.totalUsuarios = 6
      });
    }
  }
}
