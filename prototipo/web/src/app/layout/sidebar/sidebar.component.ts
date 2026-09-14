import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CarritoService } from '../../core/services/carrito.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Topbar Móvil / Tablet (visible únicamente en <= 1024px) -->
    <header class="mobile-topbar">
      <button class="mobile-hamburger-btn" (click)="toggleSidebar()" aria-label="Abrir menú de navegación">
        <i class="fas fa-bars"></i>
      </button>

      <a routerLink="/catalogo" class="mobile-brand-link">
        <i class="fas fa-crown"></i>
        <span>FashionStore</span>
      </a>

      <div class="mobile-top-actions">
        <button class="mobile-cart-btn" (click)="carritoService.openCart()" aria-label="Abrir bolsa de compras">
          <i class="fas fa-shopping-bag"></i>
          <span class="mobile-badge" *ngIf="carritoService.totalItems() > 0">
            {{ carritoService.totalItems() }}
          </span>
        </button>

        <a *ngIf="!auth.isAuthenticated()" routerLink="/login" class="mobile-user-btn" aria-label="Iniciar Sesión">
          <i class="fas fa-user-circle"></i>
        </a>

        <div *ngIf="auth.isAuthenticated()" class="mobile-user-avatar" (click)="toggleSidebar()" [title]="auth.currentUser()?.nombres">
          {{ (auth.currentUser()?.nombres || 'U').charAt(0).toUpperCase() }}
        </div>
      </div>
    </header>

    <!-- Backdrop de desenfoque cuando el menú móvil está abierto -->
    <div class="sidebar-backdrop" *ngIf="isMobileOpen" (click)="closeSidebar()"></div>

    <!-- Aside Navegación Principal (Fijo en Desktop, Cajón Deslizable en Móvil) -->
    <aside class="sidebar" [class.mobile-open]="isMobileOpen">
      <!-- Header del Drawer -->
      <div class="sidebar-header">
        <div class="brand-row">
          <div class="brand-info">
            <div class="brand-title">
              <i class="fas fa-crown"></i> FashionStore
            </div>
            <div class="brand-subtitle">E-Commerce Omnicanal (SI2)</div>
          </div>
          <button class="btn-close-drawer" (click)="closeSidebar()" title="Cerrar menú">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Navigation Links Segmentados por RBAC -->
      <nav class="sidebar-nav">
        <!-- CANAL PÚBLICO / TIENDA -->
        <div class="nav-section-title">Tienda Digital</div>

        <a routerLink="/catalogo" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <i class="fas fa-store"></i>
          <span>Catálogo de Ropa (CU10)</span>
        </a>

        <a routerLink="/reservas/crear" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <i class="fas fa-calendar-check"></i>
          <span>Reservar Prendas (CU11)</span>
        </a>

        <a *ngIf="auth.isAuthenticated()" routerLink="/reservas/ticket" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <i class="fas fa-qrcode"></i>
          <span>Mis Tickets QR (CU11)</span>
        </a>

        <a (click)="onOpenCart()" class="nav-item nav-cart-item" style="cursor: pointer;">
          <i class="fas fa-shopping-bag"></i>
          <span>Bolsa de Compras (CU13)</span>
          <span class="nav-cart-badge" *ngIf="carritoService.totalItems() > 0">
            {{ carritoService.totalItems() }}
          </span>
        </a>

        <a *ngIf="!auth.isAuthenticated()" routerLink="/login" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
          <i class="fas fa-user-circle"></i>
          <span>Iniciar Sesión / Registro</span>
        </a>

        <!-- MÓDULOS EXCLUSIVOS DE ADMINISTRADOR GENERAL -->
        <ng-container *ngIf="auth.isAdmin()">
          <div class="nav-section-title">Administración Central</div>

          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-chart-line"></i>
            <span>Panel de Control (Métricas)</span>
          </a>

          <a routerLink="/usuarios" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-users-cog"></i>
            <span>Gestión de Usuarios (CU04)</span>
          </a>

          <a routerLink="/sucursales" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-building"></i>
            <span>Sucursales y GPS (CU05)</span>
          </a>

          <a routerLink="/productos" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-tshirt"></i>
            <span>Catálogo y Prendas (CU06)</span>
          </a>

          <a routerLink="/temporadas" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-calendar-alt"></i>
            <span>Temporadas y Campañas (CU07)</span>
          </a>

          <a routerLink="/proveedores" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-truck-loading"></i>
            <span>Proveedores Textiles (CU08)</span>
          </a>

          <a routerLink="/inventario" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-boxes"></i>
            <span>Inventario Global y CPP (CU09)</span>
          </a>

          <a routerLink="/encargado/reservas" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-clipboard-list"></i>
            <span>Reservas del Día (CU12)</span>
          </a>

          <a routerLink="/encargado/escaner" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-qrcode"></i>
            <span>Escanear QR (CU12)</span>
          </a>

          <a routerLink="/pos" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-cash-register"></i>
            <span>Caja y Venta POS (CU15)</span>
          </a>

          <a routerLink="/admin/pagos-config" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-sliders-h"></i>
            <span>Medios de Cobro (CU17)</span>
          </a>

          <a routerLink="/logistica/dashboard" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-shipping-fast"></i>
            <span>Despacho y Delivery (CU18)</span>
          </a>
        </ng-container>

        <!-- MÓDULOS DE ENCARGADO DE SUCURSAL -->
        <ng-container *ngIf="auth.isManager()">
          <div class="nav-section-title">Operaciones de Tienda</div>

          <a routerLink="/pos" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-cash-register"></i>
            <span>Caja y Venta POS (CU15)</span>
          </a>

          <a routerLink="/encargado/reservas" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-clipboard-list"></i>
            <span>Reservas del Día (CU12)</span>
          </a>

          <a routerLink="/encargado/escaner" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-qrcode"></i>
            <span>Escanear QR (CU12)</span>
          </a>

          <a routerLink="/inventario" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-boxes"></i>
            <span>Stock de Sucursal (CU09)</span>
          </a>

          <a routerLink="/sucursales" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-building"></i>
            <span>Sucursales de la Red (CU05)</span>
          </a>

          <a routerLink="/productos" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-tshirt"></i>
            <span>Fichas de Prendas (CU06)</span>
          </a>
        </ng-container>

        <!-- MÓDULOS DE LOGÍSTICA -->
        <ng-container *ngIf="auth.isLogistics()">
          <div class="nav-section-title">Almacén y Abastecimiento</div>

          <a routerLink="/inventario" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-boxes"></i>
            <span>Entradas de Mercadería (CU09)</span>
          </a>

          <a routerLink="/proveedores" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-truck-loading"></i>
            <span>Proveedores Textiles (CU08)</span>
          </a>

          <a routerLink="/productos" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-tshirt"></i>
            <span>Consulta de Productos (CU06)</span>
          </a>

          <a routerLink="/logistica/dashboard" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-shipping-fast"></i>
            <span>Despacho y Delivery (CU18)</span>
          </a>
        </ng-container>

        <!-- MÓDULOS DE CAJERO -->
        <ng-container *ngIf="auth.isCashier()">
          <div class="nav-section-title">Punto de Venta (POS)</div>

          <a routerLink="/pos" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-cash-register"></i>
            <span>Terminal de Caja POS (CU15)</span>
          </a>

          <a routerLink="/catalogo" routerLinkActive="active" class="nav-item" (click)="onNavClick()">
            <i class="fas fa-search-dollar"></i>
            <span>Consulta de Precios y Stock</span>
          </a>
        </ng-container>

        <!-- ZONA DE CLIENTES -->
        <ng-container *ngIf="auth.isClient()">
          <div class="nav-section-title">Zona de Clientes</div>
          
          <div class="client-badge-box">
            <i class="fas fa-award"></i>
            <div>
              <strong>Cliente Registrado</strong>
              <div style="font-size: 0.7rem; color: #94a3b8;">Beneficios de fidelización activos</div>
            </div>
          </div>
        </ng-container>
      </nav>

      <!-- Footer con Sesión de Usuario -->
      <div class="sidebar-footer">
        <div *ngIf="auth.currentUser() as user" class="user-info-box">
          <div class="user-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="user-details">
            <span class="user-name">{{ user.nombres }}</span>
            <span class="user-role-badge" [ngClass]="getRoleBadgeClass(user.rol)">
              {{ user.rol }}
            </span>
          </div>
          <button class="logout-btn" (click)="onLogout()" title="Cerrar sesión">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>

        <div *ngIf="!auth.isAuthenticated()" class="guest-box">
          <span class="guest-text">Modo Invitado (Sin Autenticar)</span>
          <a routerLink="/login" class="btn-guest-login" (click)="onNavClick()">
            <i class="fas fa-key"></i> Acceder
          </a>
        </div>
      </div>
    </aside>

    <!-- Barra de Navegación Inferior Móvil (<= 768px para acceso rápido con el pulgar) -->
    <nav class="mobile-bottom-bar">
      <a routerLink="/catalogo" routerLinkActive="active" class="bottom-nav-item" (click)="closeSidebar()">
        <i class="fas fa-store"></i>
        <span>Catálogo</span>
      </a>

      <a routerLink="/reservas/crear" routerLinkActive="active" class="bottom-nav-item" (click)="closeSidebar()">
        <i class="fas fa-calendar-check"></i>
        <span>Reservar</span>
      </a>

      <button class="bottom-nav-item btn-bottom-cart" (click)="onOpenCart()" aria-label="Bolsa">
        <div class="bottom-cart-bubble">
          <i class="fas fa-shopping-bag"></i>
          <span class="bottom-badge" *ngIf="carritoService.totalItems() > 0">
            {{ carritoService.totalItems() }}
          </span>
        </div>
        <span>Bolsa</span>
      </button>

      <a *ngIf="auth.isAuthenticated()" routerLink="/reservas/ticket" routerLinkActive="active" class="bottom-nav-item" (click)="closeSidebar()">
        <i class="fas fa-qrcode"></i>
        <span>Tickets</span>
      </a>

      <a *ngIf="!auth.isAuthenticated()" routerLink="/login" routerLinkActive="active" class="bottom-nav-item" (click)="closeSidebar()">
        <i class="fas fa-user-circle"></i>
        <span>Acceso</span>
      </a>

      <button class="bottom-nav-item btn-bottom-menu" (click)="toggleSidebar()" [class.active]="isMobileOpen" aria-label="Menú completo">
        <i class="fas fa-bars"></i>
        <span>Menú</span>
      </button>
    </nav>
  `,
  styles: [`
    /* ==========================================================================
       SIDEBAR DESKTOP
       ========================================================================== */
    .sidebar {
      width: 270px;
      background: rgba(17, 24, 39, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 50;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
    }

    .sidebar-header {
      padding: 1.5rem 1.25rem 1rem;
      border-bottom: 1px solid var(--border-subtle);
    }

    .brand-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.5px;
    }

    .brand-title i {
      color: #818cf8;
    }

    .brand-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-close-drawer {
      display: none;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      width: 34px;
      height: 34px;
      border-radius: 8px;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-close-drawer:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border-color: rgba(239, 68, 68, 0.4);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      -webkit-overflow-scrolling: touch;
    }

    .nav-section-title {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      padding: 0.75rem 0.75rem 0.25rem;
      font-weight: 700;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      transition: var(--transition-fast);
    }

    .nav-item i {
      font-size: 1rem;
      width: 20px;
      text-align: center;
      color: var(--text-muted);
      transition: var(--transition-fast);
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
    }

    .nav-item:hover i {
      color: var(--accent-primary);
    }

    .nav-item.active {
      background: var(--accent-primary);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
    }

    .nav-item.active i {
      color: #ffffff;
    }

    .nav-cart-item {
      position: relative;
    }

    .nav-cart-badge {
      margin-left: auto;
      background: #ef4444;
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--border-subtle);
      background: rgba(15, 23, 42, 0.7);
    }

    .user-info-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--accent-gradient-subtle);
      border: 1px solid rgba(99, 102, 241, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #818cf8;
      font-size: 0.9rem;
    }

    .user-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role-badge {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
      margin-top: 0.15rem;
    }

    .role-admin { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .role-manager { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
    .role-cashier { background: rgba(245, 158, 11, 0.2); color: #fde68a; }
    .role-logistics { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; }
    .role-client { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }

    .logout-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0.4rem;
      border-radius: var(--radius-sm);
      transition: var(--transition-fast);
    }

    .logout-btn:hover {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.15);
    }

    .guest-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .guest-text {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .btn-guest-login {
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-sm);
      background: var(--accent-primary);
      color: white;
      text-decoration: none;
      font-size: 0.78rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .client-badge-box {
      margin: 0.5rem 0.5rem 0.75rem;
      padding: 0.75rem;
      border-radius: var(--radius-md);
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .client-badge-box i {
      font-size: 1.2rem;
      color: #34d399;
    }

    /* ==========================================================================
       MOBILE TOPBAR & DRAWER (<= 1024px)
       ========================================================================== */
    .mobile-topbar {
      display: none;
    }

    .sidebar-backdrop {
      display: none;
    }

    .mobile-bottom-bar {
      display: none;
    }

    @media (max-width: 1024px) {
      .mobile-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        padding: 0 1.25rem;
        background: rgba(15, 23, 42, 0.96);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--border-subtle);
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        box-sizing: border-box;
        z-index: 60;
      }

      .mobile-hamburger-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid var(--border-subtle);
        color: #ffffff;
        width: 38px;
        height: 38px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        cursor: pointer;
        transition: all 0.2s;
      }

      .mobile-hamburger-btn:hover {
        background: rgba(99, 102, 241, 0.2);
        color: #a5b4fc;
        border-color: #818cf8;
      }

      .mobile-brand-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #ffffff;
        text-decoration: none;
        font-weight: 800;
        font-size: 1.15rem;
        letter-spacing: -0.3px;
      }

      .mobile-brand-link i {
        color: #818cf8;
        font-size: 1.1rem;
      }

      .mobile-top-actions {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .mobile-cart-btn {
        position: relative;
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.35);
        color: #ffffff;
        width: 38px;
        height: 38px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        cursor: pointer;
      }

      .mobile-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ef4444;
        color: #ffffff;
        font-size: 0.68rem;
        font-weight: 800;
        min-width: 18px;
        height: 18px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border: 2px solid #0f172a;
      }

      .mobile-user-btn {
        color: #94a3b8;
        font-size: 1.4rem;
        display: flex;
        align-items: center;
        text-decoration: none;
      }

      .mobile-user-avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--accent-gradient);
        color: #ffffff;
        font-weight: 800;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
      }

      /* Sidebar Drawer Behavior */
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 290px;
        max-width: 85vw;
        height: 100vh;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: none;
      }

      .sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: 20px 0 50px rgba(0, 0, 0, 0.85);
      }

      .btn-close-drawer {
        display: flex;
      }

      .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(10, 15, 29, 0.7);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        z-index: 999;
        animation: fadeInBackdrop 0.2s ease-out;
      }

      @keyframes fadeInBackdrop {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    }

    /* ==========================================================================
       MOBILE BOTTOM QUICK BAR (<= 768px)
       ========================================================================== */
    @media (max-width: 768px) {
      .mobile-bottom-bar {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: rgba(15, 23, 42, 0.96);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        z-index: 70;
        justify-content: space-around;
        align-items: center;
        padding: 0 0.5rem;
        box-shadow: 0 -8px 25px rgba(0, 0, 0, 0.4);
      }

      .bottom-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.2rem;
        color: #94a3b8;
        text-decoration: none;
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.35rem 0.6rem;
        font-size: 0.7rem;
        font-weight: 500;
        transition: all 0.2s ease;
        position: relative;
      }

      .bottom-nav-item i {
        font-size: 1.1rem;
        transition: transform 0.2s ease, color 0.2s ease;
      }

      .bottom-nav-item:hover,
      .bottom-nav-item.active {
        color: #818cf8;
      }

      .bottom-nav-item.active i {
        transform: translateY(-2px);
        color: #a5b4fc;
      }

      .bottom-cart-bubble {
        position: relative;
      }

      .bottom-badge {
        position: absolute;
        top: -6px;
        right: -10px;
        background: #ef4444;
        color: #ffffff;
        font-size: 0.65rem;
        font-weight: 800;
        min-width: 16px;
        height: 16px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 3px;
        border: 2px solid #0f172a;
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  isMobileOpen = false;
  private routeSub?: Subscription;

  constructor(
    public auth: AuthService,
    public carritoService: CarritoService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cerrar automáticamente el drawer móvil al cambiar de ruta
    this.routeSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.closeSidebar();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  toggleSidebar(): void {
    this.isMobileOpen = !this.isMobileOpen;
  }

  closeSidebar(): void {
    this.isMobileOpen = false;
  }

  onNavClick(): void {
    if (window.innerWidth <= 1024) {
      this.closeSidebar();
    }
  }

  onOpenCart(): void {
    this.closeSidebar();
    this.carritoService.openCart();
  }

  onLogout(): void {
    this.closeSidebar();
    this.auth.logout();
    this.toast.info('Sesión Finalizada', 'Ha salido del sistema exitosamente.');
  }

  getRoleBadgeClass(rol: string): string {
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
