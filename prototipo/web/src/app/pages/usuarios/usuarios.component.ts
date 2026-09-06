import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FashionApiService } from '../../core/services/fashion-api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Usuario, Sucursal } from '../../core/models/fashion.models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <!-- Header -->
      <div class="view-header glass-panel">
        <div>
          <h2><i class="fas fa-users-cog"></i> Gestión de Usuarios y Roles (CU04)</h2>
          <p class="subtitle">Alta de Personal, Matriz RBAC, Asignación de Sucursal y Desbloqueo de Seguridad</p>
        </div>
        <div class="header-actions" *ngIf="auth.isAdmin()">
          <button class="btn btn-primary" (click)="openCreateModal()">
            <i class="fas fa-user-plus"></i> + Registrar Colaborador (CU04)
          </button>
          <button class="btn btn-secondary" (click)="loadUsuarios()" [disabled]="loading">
            <i class="fas fa-sync-alt" [class.fa-spin]="loading"></i> Actualizar
          </button>
        </div>
      </div>

      <!-- Alerta si no está autenticado -->
      <div *ngIf="!auth.isAuthenticated()" class="auth-required-card glass-panel">
        <div class="auth-icon-wrap">
          <i class="fas fa-shield-alt"></i>
        </div>
        <div class="auth-text-wrap">
          <h3>Módulo de Gestión Administrativa (CU04)</h3>
          <p>
            Este panel requiere una sesión activa con privilegios de <strong>ADMINISTRADOR</strong> para auditar accesos,
            consultar el personal y realizar desbloqueos de seguridad.
          </p>
        </div>
        <div class="auth-actions-wrap">
          <button class="btn btn-primary" (click)="quickLoginAdmin()" [disabled]="loading">
            <i class="fas fa-key" *ngIf="!loading"></i>
            <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
            Iniciar Sesión como Administrador (1 Clic)
          </button>
          <a routerLink="/login" class="btn-outline">
            <i class="fas fa-sign-in-alt"></i> Ir a Login Manual
          </a>
        </div>
      </div>

      <!-- Alerta si está autenticado pero con otro rol (no Admin) -->
      <div *ngIf="auth.isAuthenticated() && !auth.isAdmin()" class="auth-required-card warning glass-panel">
        <div class="auth-icon-wrap warning-icon">
          <i class="fas fa-user-lock"></i>
        </div>
        <div class="auth-text-wrap">
          <h3>Acceso Restringido por Matriz RBAC</h3>
          <p>
            Tu sesión actual (<strong>{{ auth.currentUser()?.email }}</strong>) tiene rol
            <strong>{{ auth.currentUser()?.rol }}</strong>. Solo el personal con rol <strong>ADMINISTRADOR</strong>
            puede gestionar usuarios y desbloquear cuentas.
          </p>
        </div>
        <div class="auth-actions-wrap">
          <button class="btn btn-primary" (click)="quickLoginAdmin()" [disabled]="loading">
            <i class="fas fa-user-shield" *ngIf="!loading"></i>
            <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
            Cambiar a Administrador (Alberto Delgado)
          </button>
        </div>
      </div>

      <!-- Contenido Principal: Solo para Administradores -->
      <ng-container *ngIf="auth.isAdmin()">
        <!-- Barra de Filtros -->
        <div class="filters-bar">
          <div class="role-chips">
            <button class="chip" [class.active]="filterRole === 'TODOS'" (click)="filterRole = 'TODOS'">
              Todos ({{ usuarios.length }})
            </button>
            <button class="chip" [class.active]="filterRole === 'ADMINISTRADOR'" (click)="filterRole = 'ADMINISTRADOR'">
              Administradores
            </button>
            <button class="chip" [class.active]="filterRole === 'ENCARGADO_SUCURSAL'" (click)="filterRole = 'ENCARGADO_SUCURSAL'">
              Encargados
            </button>
            <button class="chip" [class.active]="filterRole === 'CAJERO'" (click)="filterRole = 'CAJERO'">
              Cajeros
            </button>
            <button class="chip" [class.active]="filterRole === 'LOGISTICA'" (click)="filterRole = 'LOGISTICA'">
              Logística
            </button>
            <button class="chip" [class.active]="filterRole === 'CLIENTE'" (click)="filterRole = 'CLIENTE'">
              Clientes
            </button>
            <button class="chip locked-chip" [class.active]="filterRole === 'BLOQUEADOS'" (click)="filterRole = 'BLOQUEADOS'">
              ⚠️ Bloqueados (5 intentos)
            </button>
          </div>

          <div class="search-box">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Buscar por nombre o correo..."
              class="form-control"
            />
          </div>
        </div>

        <!-- Tabla de Usuarios -->
        <div class="table-card glass-panel">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario / Correo</th>
                  <th>Teléfono</th>
                  <th>Rol Asignado</th>
                  <th>Sucursal Asignada</th>
                  <th>Estado Cuenta</th>
                  <th>Intentos Fallidos</th>
                  <th>Bloqueado Hasta</th>
                  <th>Acciones (CU04)</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let u of filteredUsuarios">
                  <td>#{{ u.id_usuario }}</td>
                  <td>
                    <div class="user-cell">
                      <strong>{{ u.nombre_completo || u.email }}</strong>
                      <span class="email-sub">{{ u.email }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="phone-text" *ngIf="u.telefono">{{ u.telefono }}</span>
                    <span class="text-muted" *ngIf="!u.telefono">—</span>
                  </td>
                  <td>
                    <span class="badge badge-role" [ngClass]="getRoleClass(u.rol)">
                      {{ u.rol }}
                    </span>
                  </td>
                  <td>
                    <span *ngIf="u.sucursal_nombre" class="branch-pill">
                      📍 {{ u.sucursal_nombre }}
                    </span>
                    <span *ngIf="!u.sucursal_nombre" class="text-muted">
                      — Sin Asignar —
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(u.estado_cuenta)">
                      <i class="fas fa-lock" *ngIf="u.estado_cuenta === 'BLOQUEADO_POR_INTENTOS'"></i>
                      <i class="fas fa-check-circle" *ngIf="u.estado_cuenta === 'ACTIVO'"></i>
                      {{ u.estado_cuenta }}
                    </span>
                  </td>
                  <td>
                    <span class="attempt-counter" [class.danger]="u.intentos_fallidos >= 5">
                      {{ u.intentos_fallidos }} / 5
                    </span>
                  </td>
                  <td>
                    <span class="date-text" *ngIf="u.bloqueado_hasta">{{ u.bloqueado_hasta | date:'short' }}</span>
                    <span class="text-muted" *ngIf="!u.bloqueado_hasta">—</span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <!-- Botón Desbloquear (CU04) -->
                      <button
                        *ngIf="u.estado_cuenta === 'BLOQUEADO_POR_INTENTOS' || u.intentos_fallidos > 0"
                        class="btn btn-sm btn-warning"
                        (click)="desbloquear(u)"
                        title="Desbloquear inmediatamente y resetear intentos a 0">
                        <i class="fas fa-unlock"></i> Desbloquear
                      </button>

                      <!-- Botón Editar Datos y Rol -->
                      <button
                        class="btn btn-sm btn-outline-edit"
                        (click)="openEditModal(u)"
                        title="Editar rol, sucursal o datos del colaborador">
                        <i class="fas fa-user-edit"></i> Editar
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredUsuarios.length === 0 && !loading">
                  <td colspan="9" class="text-center py-4 text-muted">
                    No se encontraron usuarios que coincidan con los filtros.
                  </td>
                </tr>
                <tr *ngIf="loading">
                  <td colspan="9" class="text-center py-4 text-muted">
                    <i class="fas fa-spinner fa-spin"></i> Cargando usuarios del sistema...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- ==============================================
           MODAL CU04: ALTA DE PERSONAL / COLABORADOR
           ============================================== -->
      <div *ngIf="showCreateModal" class="modal-overlay">
        <div class="modal-card glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-user-plus"></i> Registrar Nuevo Colaborador (CU04)</h3>
            <button class="close-btn" (click)="showCreateModal = false">&times;</button>
          </div>
          <form (ngSubmit)="onCreateUser()" #createForm="ngForm" class="modal-body">
            <div class="form-group">
              <label><i class="fas fa-user"></i> Nombre Completo:</label>
              <input
                type="text"
                [(ngModel)]="newUser.nombre_completo"
                name="nombre_completo"
                required
                minlength="3"
                class="form-control"
                placeholder="Ej. Juan Pérez Ramos"
              />
            </div>

            <div class="form-group">
              <label><i class="fas fa-envelope"></i> Correo Electrónico Institucional:</label>
              <input
                type="email"
                [(ngModel)]="newUser.email"
                name="email"
                required
                class="form-control"
                placeholder="juan.perez@store.bo"
              />
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label><i class="fas fa-key"></i> Contraseña Inicial:</label>
                <input
                  type="password"
                  [(ngModel)]="newUser.password"
                  name="password"
                  required
                  minlength="8"
                  class="form-control"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div class="form-group col-half">
                <label><i class="fas fa-phone"></i> Teléfono Móvil:</label>
                <input
                  type="text"
                  [(ngModel)]="newUser.telefono"
                  name="telefono"
                  class="form-control"
                  placeholder="Ej. 70012345"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label><i class="fas fa-id-badge"></i> Rol RBAC:</label>
                <select [(ngModel)]="newUser.rol" name="rol" required class="form-control">
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Control Total)</option>
                  <option value="ENCARGADO_SUCURSAL">ENCARGADO_SUCURSAL (Tienda)</option>
                  <option value="CAJERO">CAJERO (Ventas y Cobros)</option>
                  <option value="LOGISTICA">LOGISTICA (Almacén y Lotes)</option>
                </select>
              </div>
              <div class="form-group col-half">
                <label><i class="fas fa-store"></i> Sucursal Física Asignada:</label>
                <select [(ngModel)]="newUser.id_sucursal" name="id_sucursal" class="form-control">
                  <option [ngValue]="null">— Ninguna / Sede Central —</option>
                  <option *ngFor="let s of sucursales" [ngValue]="s.id_sucursal">
                    📍 {{ s.nombre_sucursal }} ({{ s.nombre_ciudad || s.ciudad?.nombre_ciudad || 'Bolivia' }})
                  </option>
                </select>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showCreateModal = false">Cancelar</button>
              <button type="submit" [disabled]="loading || !createForm.valid" class="btn btn-primary">
                <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
                <i class="fas fa-save" *ngIf="!loading"></i> Registrar Colaborador
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ==============================================
           MODAL CU04: MODIFICAR USUARIO / ROLES
           ============================================== -->
      <div *ngIf="showEditModal && editingUser" class="modal-overlay">
        <div class="modal-card glass-panel">
          <div class="modal-header">
            <h3><i class="fas fa-user-edit"></i> Modificar Datos y Rol de Usuario (CU04)</h3>
            <button class="close-btn" (click)="showEditModal = false">&times;</button>
          </div>
          <form (ngSubmit)="onUpdateUser()" class="modal-body">
            <div class="form-group">
              <label><i class="fas fa-envelope"></i> Correo Electrónico (Inmutable):</label>
              <input type="text" [value]="editingUser.email" disabled class="form-control input-disabled" />
            </div>

            <div class="form-group">
              <label><i class="fas fa-user"></i> Nombre Completo:</label>
              <input
                type="text"
                [(ngModel)]="editFormData.nombre_completo"
                name="edit_nombre"
                required
                class="form-control"
              />
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label><i class="fas fa-phone"></i> Teléfono Móvil:</label>
                <input
                  type="text"
                  [(ngModel)]="editFormData.telefono"
                  name="edit_telefono"
                  class="form-control"
                />
              </div>
              <div class="form-group col-half">
                <label><i class="fas fa-shield-alt"></i> Estado de Cuenta:</label>
                <select [(ngModel)]="editFormData.estado_cuenta" name="edit_estado" class="form-control">
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                  <option value="BLOQUEADO_POR_INTENTOS">BLOQUEADO_POR_INTENTOS</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group col-half">
                <label><i class="fas fa-id-badge"></i> Rol RBAC:</label>
                <select [(ngModel)]="editFormData.rol" name="edit_rol" required class="form-control">
                  <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  <option value="ENCARGADO_SUCURSAL">ENCARGADO_SUCURSAL</option>
                  <option value="CAJERO">CAJERO</option>
                  <option value="LOGISTICA">LOGISTICA</option>
                  <option value="CLIENTE">CLIENTE</option>
                </select>
              </div>
              <div class="form-group col-half">
                <label><i class="fas fa-store"></i> Sucursal Física Asignada:</label>
                <select [(ngModel)]="editFormData.id_sucursal" name="edit_sucursal" class="form-control">
                  <option [ngValue]="null">— Ninguna / Sede Central —</option>
                  <option *ngFor="let s of sucursales" [ngValue]="s.id_sucursal">
                    📍 {{ s.nombre_sucursal }} ({{ s.nombre_ciudad || s.ciudad?.nombre_ciudad || 'Bolivia' }})
                  </option>
                </select>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="showEditModal = false">Cancelar</button>
              <button type="submit" [disabled]="loading" class="btn btn-primary">
                <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
                <i class="fas fa-check" *ngIf="!loading"></i> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem 2rem;
    }
    .view-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-radius: var(--radius-lg);
      margin-bottom: 1.5rem;
    }
    .view-header h2 {
      font-size: 1.4rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-top: 0.2rem;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* Tarjeta de Requerimiento de Autenticación */
    .auth-required-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 2rem;
      border-radius: var(--radius-lg);
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(99, 102, 241, 0.3);
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .auth-required-card.warning {
      border-color: rgba(245, 158, 11, 0.4);
      background: rgba(30, 41, 59, 0.8);
    }
    .auth-icon-wrap {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(99, 102, 241, 0.2);
      color: var(--accent-primary, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      flex-shrink: 0;
    }
    .warning-icon {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
    }
    .auth-text-wrap {
      flex: 1;
      min-width: 250px;
    }
    .auth-text-wrap h3 {
      color: var(--text-primary);
      margin-bottom: 0.4rem;
      font-size: 1.1rem;
    }
    .auth-text-wrap p {
      color: var(--text-secondary);
      font-size: 0.85rem;
      line-height: 1.4;
    }
    .auth-actions-wrap {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    /* Barra de Filtros */
    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .role-chips {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .chip {
      padding: 0.4rem 0.85rem;
      border-radius: 9999px;
      border: 1px solid var(--border-subtle);
      background: rgba(17, 24, 39, 0.6);
      color: var(--text-secondary);
      font-size: 0.8rem;
      cursor: pointer;
      transition: var(--transition-fast);
    }
    .chip:hover {
      border-color: rgba(99, 102, 241, 0.5);
      color: var(--text-primary);
    }
    .chip.active {
      background: var(--accent-primary, #6366f1);
      color: #ffffff;
      border-color: var(--accent-primary, #6366f1);
      font-weight: 600;
    }
    .locked-chip.active {
      background: #ef4444;
      border-color: #ef4444;
    }
    .search-box {
      min-width: 260px;
    }

    /* Tabla */
    .table-card {
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .data-table th {
      padding: 0.85rem 1rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-subtle);
    }
    .data-table td {
      padding: 0.85rem 1rem;
      font-size: 0.85rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }
    .user-cell {
      display: flex;
      flex-direction: column;
    }
    .email-sub {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .phone-text {
      font-family: var(--font-mono, monospace);
      color: #93c5fd;
      font-size: 0.8rem;
    }
    .branch-pill {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }
    .badge {
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .status-active { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .status-locked { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }
    .status-inactive { background: rgba(100, 116, 139, 0.2); color: #94a3b8; }

    .role-admin { background: rgba(239, 68, 68, 0.15); color: #fca5a5; }
    .role-manager { background: rgba(59, 130, 246, 0.15); color: #93c5fd; }
    .role-cashier { background: rgba(245, 158, 11, 0.15); color: #fde68a; }
    .role-logistics { background: rgba(168, 85, 247, 0.15); color: #d8b4fe; }
    .role-client { background: rgba(16, 185, 129, 0.15); color: #6ee7b7; }

    .attempt-counter {
      font-weight: 700;
      font-family: var(--font-mono);
      color: #94a3b8;
    }
    .attempt-counter.danger {
      color: #ef4444;
    }
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-sm {
      padding: 0.35rem 0.65rem;
      font-size: 0.78rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .btn-outline-edit {
      background: transparent;
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
    }
    .btn-outline-edit:hover {
      background: rgba(99, 102, 241, 0.2);
      color: #ffffff;
    }
    .btn-warning {
      background: #d97706;
      color: white;
      border: none;
    }
    .btn-warning:hover {
      background: #b45309;
    }

    /* Modales */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1.5rem;
    }
    .modal-card {
      width: 100%;
      max-width: 540px;
      border-radius: var(--radius-lg);
      background: #111827;
      border: 1px solid rgba(99, 102, 241, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      animation: modalFadeIn 0.25s ease-out;
      overflow: hidden;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .modal-header h3 {
      font-size: 1.15rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
    }
    .close-btn {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: var(--text-muted);
      cursor: pointer;
      line-height: 1;
    }
    .close-btn:hover {
      color: var(--text-primary);
    }
    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }
    .form-row {
      display: flex;
      gap: 1rem;
    }
    .col-half {
      flex: 1;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .input-disabled {
      background: rgba(15, 23, 42, 0.7) !important;
      color: var(--text-muted) !important;
      cursor: not-allowed;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }
  `]
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  sucursales: Sucursal[] = [];
  filterRole = 'TODOS';
  searchTerm = '';
  loading = false;

  // Modal Alta Colaborador (CU04)
  showCreateModal = false;
  newUser = {
    nombre_completo: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'CAJERO',
    id_sucursal: null as number | null
  };

  // Modal Modificar Usuario (CU04)
  showEditModal = false;
  editingUser: Usuario | null = null;
  editFormData = {
    nombre_completo: '',
    telefono: '',
    rol: 'CAJERO',
    id_sucursal: null as number | null,
    estado_cuenta: 'ACTIVO'
  };

  constructor(
    private api: FashionApiService,
    public auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    if (this.auth.isAdmin()) {
      this.loadUsuarios();
      this.loadSucursales();
    }
  }

  quickLoginAdmin(): void {
    this.loading = true;
    this.auth.login({
      email: 'alberto.delgado@store.bo',
      password: 'Admin123*',
      recordar_sesion: true
    }).subscribe({
      next: (res) => {
        this.toast.success('Sesión Iniciada', `Bienvenido Administrador: ${res.nombre_completo}`);
        this.loadUsuarios();
        this.loadSucursales();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error('Error de Inicio de Sesión', err.error?.detail || 'No se pudo iniciar sesión.');
      }
    });
  }

  loadSucursales(): void {
    this.api.getSucursales().subscribe({
      next: (data) => this.sucursales = data,
      error: (err) => console.error('Error cargando sucursales', err)
    });
  }

  loadUsuarios(): void {
    if (!this.auth.isAdmin()) {
      return;
    }
    this.loading = true;
    this.api.getUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.toast.error('Sesión Expirada', 'Su sesión ha expirado. Inicie sesión nuevamente.');
          this.auth.logout();
        } else if (err.status === 403) {
          this.toast.error('Acceso Denegado', 'Se requiere rol de Administrador.');
        } else {
          this.toast.error('Error del Servidor', 'No se pudieron cargar los usuarios: ' + (err.error?.detail || 'Error interno'));
        }
      }
    });
  }

  get filteredUsuarios(): Usuario[] {
    return this.usuarios.filter(u => {
      // Filtro de rol
      if (this.filterRole === 'BLOQUEADOS') {
        if (u.estado_cuenta !== 'BLOQUEADO_POR_INTENTOS' && u.intentos_fallidos < 5) return false;
      } else if (this.filterRole !== 'TODOS') {
        if (u.rol !== this.filterRole) return false;
      }

      // Filtro de texto
      if (this.searchTerm.trim()) {
        const query = this.searchTerm.toLowerCase();
        const fullName = (u.nombre_completo || u.email).toLowerCase();
        return fullName.includes(query) || u.email.toLowerCase().includes(query);
      }

      return true;
    });
  }

  openCreateModal(): void {
    this.loadSucursales();
    this.newUser = {
      nombre_completo: '',
      email: '',
      password: '',
      telefono: '',
      rol: 'CAJERO',
      id_sucursal: null
    };
    this.showCreateModal = true;
  }

  onCreateUser(): void {
    if (!this.newUser.nombre_completo || !this.newUser.email || !this.newUser.password) {
      this.toast.warning('Campos Incompletos', 'Complete todos los campos requeridos.');
      return;
    }
    if (this.newUser.password.length < 8) {
      this.toast.warning('Seguridad', 'La contraseña inicial debe tener al menos 8 caracteres.');
      return;
    }

    const sucId = (this.newUser.id_sucursal && Number(this.newUser.id_sucursal) > 0)
      ? Number(this.newUser.id_sucursal)
      : null;

    this.loading = true;
    this.api.crearUsuario({
      email: this.newUser.email.trim(),
      password: this.newUser.password,
      nombre_completo: this.newUser.nombre_completo.trim(),
      telefono: this.newUser.telefono?.trim() || undefined,
      rol: this.newUser.rol,
      id_sucursal: sucId
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.showCreateModal = false;
        this.toast.success('Colaborador Registrado (CU04)', `Usuario ${res.email} creado con rol ${res.rol}.`);
        this.loadUsuarios();
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.detail || 'No se pudo crear el usuario.';
        this.toast.error('Error al Registrar', msg);
      }
    });
  }

  openEditModal(u: Usuario): void {
    this.editingUser = u;
    this.editFormData = {
      nombre_completo: u.nombre_completo,
      telefono: u.telefono || '',
      rol: u.rol,
      id_sucursal: u.id_sucursal || null,
      estado_cuenta: u.estado_cuenta
    };
    this.showEditModal = true;
  }

  onUpdateUser(): void {
    if (!this.editingUser) return;

    this.loading = true;
    this.api.modificarUsuario(this.editingUser.id_usuario, {
      nombre_completo: this.editFormData.nombre_completo.trim(),
      telefono: this.editFormData.telefono?.trim() || undefined,
      rol: this.editFormData.rol,
      id_sucursal: this.editFormData.id_sucursal || null,
      estado_cuenta: this.editFormData.estado_cuenta
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.showEditModal = false;
        this.toast.success('Usuario Modificado (CU04)', `Datos actualizados para ${res.email}.`);
        this.loadUsuarios();
      },
      error: (err) => {
        this.loading = false;
        this.toast.error('Error al Modificar', err.error?.detail || 'No se pudieron guardar los cambios.');
      }
    });
  }

  desbloquear(u: Usuario): void {
    this.api.desbloquearUsuario(u.id_usuario).subscribe({
      next: (res) => {
        this.toast.success('Desbloqueo Exitoso (CU04)', `Usuario ${u.email} reactivado. Intentos fallidos restablecidos a 0.`);
        u.estado_cuenta = 'ACTIVO';
        u.intentos_fallidos = 0;
        u.bloqueado_hasta = null;
      },
      error: (err) => {
        this.toast.error('Error', err.error?.detail || 'No se pudo desbloquear la cuenta.');
      }
    });
  }

  getStatusClass(status: string): string {
    if (status === 'ACTIVO') return 'status-active';
    if (status === 'BLOQUEADO_POR_INTENTOS') return 'status-locked';
    return 'status-inactive';
  }

  getRoleClass(rol: string): string {
    switch (rol) {
      case 'ADMINISTRADOR': return 'role-admin';
      case 'ENCARGADO_SUCURSAL': return 'role-manager';
      case 'CAJERO': return 'role-cashier';
      case 'LOGISTICA': return 'role-logistics';
      case 'CLIENTE': return 'role-client';
      default: return '';
    }
  }
}
