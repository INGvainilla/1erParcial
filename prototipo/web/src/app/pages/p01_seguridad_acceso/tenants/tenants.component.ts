import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantService } from '../../../core/services/tenant.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Empresa, PlanSuscripcion, SuscripcionEmpresa } from '../../../core/models/fashion.models';

@Component({
  selector: 'app-tenants',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tenants-container">
      <!-- HEADER CON RESUMEN DEL ECOSISTEMA MULTITENANT -->
      <div class="header-card">
        <div class="header-left">
          <div class="badge-saas">
            <i class="fas fa-cubes"></i> Arquitectura SaaS Multitenant
          </div>
          <h1>Gobernanza Multitenant & Suscripciones (CU01 - CU03)</h1>
          <p class="subtitle">
            Administración centralizada de empresas arrendatarias (Tenants), asignación de esquemas lógicos, planes de suscripción y soporte Offline-First.
          </p>
        </div>
        <div class="header-actions">
          <button *ngIf="auth.isSuperAdmin()" class="btn-primary" (click)="abrirModalNuevaEmpresa()">
            <i class="fas fa-plus-circle"></i> Registrar Nueva Empresa
          </button>
          <button *ngIf="auth.isSuperAdmin()" class="btn-secondary" (click)="abrirModalNuevoPlan()">
            <i class="fas fa-layer-group"></i> Crear Plan de Suscripción
          </button>
        </div>
      </div>

      <!-- BANNER DE SUSCRIPCIÓN ACTIVA DE LA EMPRESA ACTUAL -->
      <div *ngIf="suscripcionActiva" class="subscription-banner">
        <div class="sub-icon">
          <i class="fas fa-gem"></i>
        </div>
        <div class="sub-info">
          <div class="sub-title-row">
            <h3>Suscripción Actual: <span class="highlight">{{ suscripcionActiva.plan?.nombre || 'Plan Profesional' }}</span></h3>
            <span class="status-badge" [ngClass]="suscripcionActiva.estado === 'ACTIVA' ? 'badge-active' : 'badge-warn'">
              {{ suscripcionActiva.estado }}
            </span>
          </div>
          <p class="sub-desc">
            Vigente desde el {{ suscripcionActiva.fecha_inicio | date:'dd/MM/yyyy' }} hasta {{ suscripcionActiva.fecha_vencimiento | date:'dd/MM/yyyy' }}.
            Capacidad: hasta <strong>{{ suscripcionActiva.plan?.max_sucursales }} sucursales</strong> y <strong>{{ suscripcionActiva.plan?.max_usuarios }} usuarios staff</strong>.
          </p>
          <div class="sub-perks">
            <span class="perk-tag" *ngIf="suscripcionActiva.plan?.soporta_offline">
              <i class="fas fa-wifi-slash"></i> Offline-First Local
            </span>
            <span class="perk-tag" *ngIf="suscripcionActiva.plan?.permite_reportes_ia">
              <i class="fas fa-brain"></i> Reportes Generativos IA
            </span>
            <span class="perk-tag" *ngIf="suscripcionActiva.plan?.permite_ml_dashboard">
              <i class="fas fa-chart-pie"></i> Dashboards Machine Learning
            </span>
          </div>
        </div>
        <div class="sub-price">
          <div class="price-val">Bs. {{ suscripcionActiva.plan?.precio_mensual }}</div>
          <span class="price-cycle">/ mes facturado</span>
        </div>
      </div>

      <!-- TABS DE NAVEGACIÓN -->
      <div class="tabs-nav">
        <button class="tab-btn" [class.active]="tabActiva === 'empresas'" (click)="tabActiva = 'empresas'">
          <i class="fas fa-building"></i> Empresas Arrendatarias ({{ empresas.length }})
        </button>
        <button class="tab-btn" [class.active]="tabActiva === 'planes'" (click)="tabActiva = 'planes'">
          <i class="fas fa-tags"></i> Planes de Suscripción ({{ planes.length }})
        </button>
      </div>

      <!-- TAB 1: EMPRESAS (TENANTS - CU01) -->
      <div *ngIf="tabActiva === 'empresas'" class="tab-content">
        <div class="grid-cards">
          <div *ngFor="let emp of empresas" class="tenant-card">
            <div class="card-top">
              <div class="tenant-avatar">
                <i class="fas fa-store"></i>
              </div>
              <div class="tenant-meta">
                <h4>{{ emp.nombre_comercial }}</h4>
                <span class="slug-tag">slug: {{ emp.dominio_slug }}</span>
              </div>
              <span class="tenant-status" [ngClass]="emp.estado === 'ACTIVA' ? 'active' : 'inactive'">
                {{ emp.estado }}
              </span>
            </div>

            <div class="tenant-details">
              <div class="detail-row">
                <span class="label"><i class="fas fa-id-card"></i> NIT:</span>
                <span class="value">{{ emp.nit }}</span>
              </div>
              <div class="detail-row">
                <span class="label"><i class="fas fa-signature"></i> Razón Social:</span>
                <span class="value">{{ emp.razon_social }}</span>
              </div>
              <div class="detail-row">
                <span class="label"><i class="fas fa-envelope"></i> Contacto:</span>
                <span class="value">{{ emp.email_contacto }}</span>
              </div>
              <div class="detail-row" *ngIf="emp.telefono">
                <span class="label"><i class="fas fa-phone"></i> Teléfono:</span>
                <span class="value">{{ emp.telefono }}</span>
              </div>
              <div class="detail-row" *ngIf="emp.presupuesto_disponible">
                <span class="label"><i class="fas fa-wallet"></i> Presupuesto:</span>
                <span class="value font-mono">Bs. {{ emp.presupuesto_disponible | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="card-footer-actions">
              <button class="btn-card-action" (click)="verSuscripcionEmpresa(emp)">
                <i class="fas fa-gem"></i> Suscripción
              </button>
              <button class="btn-card-action" (click)="editarEmpresa(emp)">
                <i class="fas fa-edit"></i> Modificar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: PLANES DE SUSCRIPCIÓN (CU02) -->
      <div *ngIf="tabActiva === 'planes'" class="tab-content">
        <div class="plans-grid">
          <div *ngFor="let plan of planes" class="plan-card" [class.pro]="plan.codigo === 'PLAN_PRO'">
            <div class="plan-header">
              <span class="plan-code">{{ plan.codigo }}</span>
              <h3>{{ plan.nombre }}</h3>
              <div class="plan-price-box">
                <span class="currency">Bs.</span>
                <span class="amount">{{ plan.precio_mensual }}</span>
                <span class="period">/ mes</span>
              </div>
              <p class="plan-description">{{ plan.descripcion || 'Paquete integral para gestión de moda y retail multicanal.' }}</p>
            </div>

            <ul class="plan-features">
              <li>
                <i class="fas fa-check-circle text-green"></i>
                Hasta <strong>{{ plan.max_sucursales }} sucursales</strong> físicas y almacenes
              </li>
              <li>
                <i class="fas fa-check-circle text-green"></i>
                Hasta <strong>{{ plan.max_usuarios }} usuarios</strong> staff con control RBAC
              </li>
              <li>
                <i class="fas fa-check-circle" [ngClass]="plan.soporta_offline ? 'text-green' : 'text-gray'"></i>
                Operación Offline-First en SQLite local
              </li>
              <li>
                <i class="fas fa-check-circle" [ngClass]="plan.permite_reportes_ia ? 'text-green' : 'text-gray'"></i>
                Reportes generativos e Inteligencia Artificial
              </li>
              <li>
                <i class="fas fa-check-circle" [ngClass]="plan.permite_ml_dashboard ? 'text-green' : 'text-gray'"></i>
                Dashboards analíticos de Machine Learning
              </li>
            </ul>

            <div class="plan-footer">
              <button class="btn-contract-plan" (click)="seleccionarPlanParaContratar(plan)">
                <i class="fas fa-arrow-circle-up"></i> Asignar a Empresa (CU03)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: REGISTRAR / EDITAR EMPRESA -->
      <div *ngIf="mostrarModalEmpresa" class="modal-overlay" (click)="cerrarModalEmpresa()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ modoEdicionEmpresa ? 'Modificar Empresa' : 'Registrar Nueva Empresa (Tenant)' }}</h3>
            <button class="btn-close" (click)="cerrarModalEmpresa()"><i class="fas fa-times"></i></button>
          </div>
          <form (ngSubmit)="guardarEmpresa()" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>NIT / Identificación Fiscal *</label>
                <input type="text" [(ngModel)]="formEmpresa.nit" name="nit" required placeholder="Ej. 1029384756" class="form-input">
              </div>
              <div class="form-group">
                <label>Razón Social *</label>
                <input type="text" [(ngModel)]="formEmpresa.razon_social" name="razon_social" required placeholder="Ej. Moda Boliviana S.R.L." class="form-input">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Nombre Comercial *</label>
                <input type="text" [(ngModel)]="formEmpresa.nombre_comercial" name="nombre_comercial" required placeholder="Ej. FashionStore Santa Cruz" class="form-input">
              </div>
              <div class="form-group">
                <label>Slug de Dominio *</label>
                <input type="text" [(ngModel)]="formEmpresa.dominio_slug" name="dominio_slug" required placeholder="Ej. fashionstore-scz" class="form-input">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Email de Contacto *</label>
                <input type="email" [(ngModel)]="formEmpresa.email_contacto" name="email_contacto" required placeholder="contacto@empresa.bo" class="form-input">
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input type="text" [(ngModel)]="formEmpresa.telefono" name="telefono" placeholder="+591 3 3445566" class="form-input">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Dirección Matriz</label>
                <input type="text" [(ngModel)]="formEmpresa.direccion" name="direccion" placeholder="Av. Equipetrol #400" class="form-input">
              </div>
              <div class="form-group">
                <label>Presupuesto Disponible (Bs.)</label>
                <input type="number" [(ngModel)]="formEmpresa.presupuesto_disponible" name="presupuesto_disponible" min="0" step="100" class="form-input">
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="cerrarModalEmpresa()">Cancelar</button>
              <button type="submit" class="btn-submit">
                <i class="fas fa-save"></i> Guardar Empresa
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL: ASIGNAR SUSCRIPCIÓN -->
      <div *ngIf="mostrarModalSuscripcion" class="modal-overlay" (click)="cerrarModalSuscripcion()">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Contratar / Renovar Suscripción (CU03)</h3>
            <button class="btn-close" (click)="cerrarModalSuscripcion()"><i class="fas fa-times"></i></button>
          </div>
          <form (ngSubmit)="guardarSuscripcion()" class="modal-form">
            <div class="form-group">
              <label>Empresa Seleccionada</label>
              <select [(ngModel)]="formSuscripcion.id_empresa" name="id_empresa" required class="form-input">
                <option *ngFor="let e of empresas" [value]="e.id_empresa">
                  {{ e.nombre_comercial }} (NIT: {{ e.nit }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Plan de Suscripción</label>
              <select [(ngModel)]="formSuscripcion.id_plan" name="id_plan" required class="form-input">
                <option *ngFor="let p of planes" [value]="p.id_plan">
                  {{ p.nombre }} - Bs. {{ p.precio_mensual }}/mes ({{ p.max_sucursales }} sucursales, {{ p.max_usuarios }} usuarios)
                </option>
              </select>
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" [(ngModel)]="formSuscripcion.auto_renovar" name="auto_renovar">
                Renovación automática mensual programada
              </label>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="cerrarModalSuscripcion()">Cancelar</button>
              <button type="submit" class="btn-submit">
                <i class="fas fa-check-circle"></i> Confirmar Contratación
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tenants-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      color: #f1f5f9;
    }

    .header-card {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }

    .badge-saas {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    h1 {
      font-size: 1.85rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0;
      max-width: 700px;
    }

    .header-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 10px 18px;
      border-radius: 10px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .subscription-banner {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.8));
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      padding: 1.5rem 2rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .sub-icon {
      font-size: 2.5rem;
      color: #34d399;
    }
    .sub-info {
      flex: 1;
    }
    .sub-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 4px;
    }
    .sub-title-row h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #ffffff;
    }
    .highlight {
      color: #34d399;
    }
    .status-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .badge-active {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid #10b981;
    }
    .sub-desc {
      color: #cbd5e1;
      font-size: 0.9rem;
      margin: 0 0 8px 0;
    }
    .sub-perks {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .perk-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.78rem;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .sub-price {
      text-align: right;
    }
    .price-val {
      font-size: 1.6rem;
      font-weight: 800;
      color: #34d399;
    }
    .price-cycle {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .tabs-nav {
      display: flex;
      gap: 12px;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
    }
    .tab-btn {
      background: none;
      border: none;
      color: #94a3b8;
      padding: 10px 18px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .tab-btn.active {
      color: #ffffff;
      background: rgba(99, 102, 241, 0.2);
      border-bottom: 2px solid #6366f1;
    }

    .grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }

    .tenant-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .tenant-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      border-color: rgba(99, 102, 241, 0.3);
    }
    .card-top {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .tenant-avatar {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    .tenant-meta {
      flex: 1;
    }
    .tenant-meta h4 {
      margin: 0 0 2px 0;
      font-size: 1.1rem;
      color: #ffffff;
    }
    .slug-tag {
      font-size: 0.78rem;
      color: #64748b;
      font-family: monospace;
    }
    .tenant-status {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .tenant-status.active {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .tenant-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(15, 23, 42, 0.4);
      padding: 12px;
      border-radius: 10px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
    }
    .detail-row .label {
      color: #94a3b8;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .detail-row .value {
      color: #f1f5f9;
      font-weight: 500;
    }
    .font-mono {
      font-family: monospace;
    }

    .card-footer-actions {
      display: flex;
      gap: 10px;
    }
    .btn-card-action {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      padding: 8px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .btn-card-action:hover {
      background: rgba(99, 102, 241, 0.2);
      border-color: #6366f1;
      color: #ffffff;
    }

    /* PLANES GRID */
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }
    .plan-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .plan-card.pro {
      border: 2px solid #6366f1;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(49, 46, 129, 0.25));
      box-shadow: 0 12px 30px rgba(99, 102, 241, 0.2);
    }
    .plan-code {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
      color: #818cf8;
    }
    .plan-header h3 {
      font-size: 1.5rem;
      margin: 6px 0 12px 0;
      color: #ffffff;
    }
    .plan-price-box {
      margin-bottom: 12px;
    }
    .plan-price-box .currency {
      font-size: 1.1rem;
      color: #94a3b8;
    }
    .plan-price-box .amount {
      font-size: 2.2rem;
      font-weight: 800;
      color: #ffffff;
      margin: 0 4px;
    }
    .plan-price-box .period {
      color: #94a3b8;
      font-size: 0.9rem;
    }
    .plan-description {
      color: #94a3b8;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 1.5rem;
    }
    .plan-features {
      list-style: none;
      padding: 0;
      margin: 0 0 2rem 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .plan-features li {
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #cbd5e1;
    }
    .text-green { color: #34d399; }
    .text-gray { color: #475569; }

    .btn-contract-plan {
      width: 100%;
      background: #6366f1;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-contract-plan:hover {
      background: #4f46e5;
    }

    /* MODALES */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }
    .modal-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 16px;
      width: 90%;
      max-width: 650px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .modal-header h3 {
      margin: 0;
      color: #ffffff;
      font-size: 1.3rem;
    }
    .btn-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.2rem;
      cursor: pointer;
    }
    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .form-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 1rem;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #cbd5e1;
    }
    .form-input {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 10px 14px;
      color: #ffffff;
      font-size: 0.9rem;
    }
    .form-input:focus {
      outline: none;
      border-color: #6366f1;
    }
    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 1.5rem;
    }
    .btn-cancel {
      background: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-submit {
      background: #6366f1;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class TenantsComponent implements OnInit {
  auth = inject(AuthService);
  private tenantService = inject(TenantService);
  private toast = inject(ToastService);

  tabActiva: 'empresas' | 'planes' = 'empresas';

  empresas: Empresa[] = [];
  planes: PlanSuscripcion[] = [];
  suscripcionActiva: SuscripcionEmpresa | null = null;

  mostrarModalEmpresa = false;
  modoEdicionEmpresa = false;
  formEmpresa: Partial<Empresa> = {};

  mostrarModalSuscripcion = false;
  formSuscripcion = {
    id_empresa: 1,
    id_plan: 1,
    auto_renovar: true
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar empresas
    this.tenantService.listarEmpresas().subscribe({
      next: (data) => {
        this.empresas = data;
        if (this.empresas.length > 0 && !this.auth.isSuperAdmin()) {
          this.consultarSuscripcion(this.empresas[0].id_empresa);
        }
      },
      error: (err) => console.error('Error cargando empresas:', err)
    });

    // Cargar planes
    this.tenantService.listarPlanes().subscribe({
      next: (data) => this.planes = data,
      error: (err) => console.error('Error cargando planes:', err)
    });

    // Consultar suscripción activa del tenant actual si existe
    const tenantId = this.auth.getEmpresaId();
    if (tenantId) {
      this.consultarSuscripcion(tenantId);
    }
  }

  consultarSuscripcion(idEmpresa: number): void {
    this.tenantService.obtenerSuscripcionActiva(idEmpresa).subscribe({
      next: (sub) => this.suscripcionActiva = sub,
      error: () => this.suscripcionActiva = null
    });
  }

  abrirModalNuevaEmpresa(): void {
    this.modoEdicionEmpresa = false;
    this.formEmpresa = {
      presupuesto_disponible: 50000.00
    };
    this.mostrarModalEmpresa = true;
  }

  editarEmpresa(emp: Empresa): void {
    this.modoEdicionEmpresa = true;
    this.formEmpresa = { ...emp };
    this.mostrarModalEmpresa = true;
  }

  cerrarModalEmpresa(): void {
    this.mostrarModalEmpresa = false;
  }

  guardarEmpresa(): void {
    if (this.modoEdicionEmpresa && this.formEmpresa.id_empresa) {
      this.tenantService.actualizarEmpresa(this.formEmpresa.id_empresa, this.formEmpresa).subscribe({
        next: () => {
          this.toast.success('Empresa Actualizada', 'Los datos fueron modificados correctamente.');
          this.cerrarModalEmpresa();
          this.cargarDatos();
        },
        error: (err) => this.toast.error('Error al actualizar', err?.error?.detail || 'No se pudo actualizar la empresa')
      });
    } else {
      this.tenantService.crearEmpresa(this.formEmpresa).subscribe({
        next: () => {
          this.toast.success('Empresa Registrada', 'El nuevo tenant fue dado de alta con éxito.');
          this.cerrarModalEmpresa();
          this.cargarDatos();
        },
        error: (err) => this.toast.error('Error al registrar', err?.error?.detail || 'No se pudo registrar la empresa')
      });
    }
  }

  abrirModalNuevoPlan(): void {
    this.toast.info('Gestión de Planes', 'Consulte la consola o use la API para sembrar planes personalizados.');
  }

  verSuscripcionEmpresa(emp: Empresa): void {
    this.consultarSuscripcion(emp.id_empresa);
    this.toast.info('Suscripción', `Consultando suscripción de ${emp.nombre_comercial}`);
  }

  seleccionarPlanParaContratar(plan: PlanSuscripcion): void {
    this.formSuscripcion.id_plan = plan.id_plan;
    if (this.empresas.length > 0) {
      this.formSuscripcion.id_empresa = this.empresas[0].id_empresa;
    }
    this.mostrarModalSuscripcion = true;
  }

  cerrarModalSuscripcion(): void {
    this.mostrarModalSuscripcion = false;
  }

  guardarSuscripcion(): void {
    this.tenantService.contratarSuscripcion(this.formSuscripcion).subscribe({
      next: (res) => {
        this.toast.success('Suscripción Contratada', 'El plan fue asignado a la empresa correctamente.');
        this.cerrarModalSuscripcion();
        this.consultarSuscripcion(res.id_empresa);
      },
      error: (err) => this.toast.error('Error de Suscripción', err?.error?.detail || 'Error al contratar suscripción')
    });
  }
}
