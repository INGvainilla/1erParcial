import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/p05_inventario_costos_analitica/dashboard/dashboard.component';
import { CatalogoComponent } from './pages/p03_catalogo_estilismo_ia/catalogo/catalogo.component';
import { LoginComponent } from './pages/p01_seguridad_acceso/login/login.component';
import { UsuariosComponent } from './pages/p01_seguridad_acceso/usuarios/usuarios.component';
import { SucursalesComponent } from './pages/p02_estructura_operativa/sucursales/sucursales.component';
import { ProductosComponent } from './pages/p03_catalogo_estilismo_ia/productos/productos.component';
import { TemporadasComponent } from './pages/p03_catalogo_estilismo_ia/temporadas/temporadas.component';
import { ProveedoresComponent } from './pages/p04_aprovisionamiento_proveedores/proveedores/proveedores.component';
import { InventarioComponent } from './pages/p05_inventario_costos_analitica/inventario/inventario.component';
import { ReservaCrear } from './pages/p06_reservas_presenciales/reservas/reserva-crear/reserva-crear';
import { ReservaTicket } from './pages/p06_reservas_presenciales/reservas/reserva-ticket/reserva-ticket';
import { EncargadoDashboardComponent } from './pages/p06_reservas_presenciales/encargado-dashboard/encargado-dashboard.component';
import { EscanerQrComponent } from './pages/p06_reservas_presenciales/escaner-qr/escaner-qr.component';
import { CheckoutComponent } from './pages/p07_venta_digital_fidelizacion/checkout/checkout.component';
import { CheckoutConfirmacionComponent } from './pages/p07_venta_digital_fidelizacion/checkout/checkout-confirmacion.component';
import { PosTerminalComponent } from './pages/p08_punto_venta_pos/pos/pos-terminal.component';
import { PagoOrdenComponent } from './pages/p09_procesamiento_pagos/pagos/pago-orden.component';
import { AdminPagosConfigComponent } from './pages/p09_procesamiento_pagos/admin-pagos/admin-pagos-config.component';
import { LogisticaDashboardComponent } from './pages/p10_logistica_delivery/logistica/logistica-dashboard.component';
import { TrackingComponent } from './pages/p10_logistica_delivery/tracking/tracking.component';
import { ComparadorComponent } from './pages/p03_catalogo_estilismo_ia/comparador/comparador.component';
import { RecompensasComponent } from './pages/p07_venta_digital_fidelizacion/recompensas/recompensas.component';
import { AsistenteIaComponent } from './pages/p03_catalogo_estilismo_ia/asistente-ia/asistente-ia.component';
import { adminGuard, dashboardGuard, staffGuard, inventarioGuard, proveedoresGuard, encargadoGuard, posGuard, logisticaGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto: La tienda digital / catálogo es la entrada pública
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  
  // Canales Públicos / Clientes (Ciclo 1, 2 y 3)
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reservas/crear', component: ReservaCrear },
  { path: 'reservas/ticket', component: ReservaTicket },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout/confirmacion/:id', component: CheckoutConfirmacionComponent },
  { path: 'pagos/:id', component: PagoOrdenComponent },
  { path: 'tracking/:id', component: TrackingComponent },

  // Ciclo 3: Diferenciadores Tecnológicos Web (CU20, CU21, CU22, CU23)
  { path: 'comparador', component: ComparadorComponent },
  { path: 'recompensas', component: RecompensasComponent },
  { path: 'asistente-ia', component: AsistenteIaComponent },

  // Panel Ejecutivo y Gestión RBAC (Exclusivo Administrador)
  { path: 'dashboard', component: DashboardComponent, canActivate: [dashboardGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
  { path: 'temporadas', component: TemporadasComponent, canActivate: [adminGuard] },
  { path: 'admin/pagos-config', component: AdminPagosConfigComponent, canActivate: [adminGuard] },

  // Operaciones de Staff y Sucursal
  { path: 'sucursales', component: SucursalesComponent, canActivate: [staffGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [staffGuard] },
  { path: 'proveedores', component: ProveedoresComponent, canActivate: [proveedoresGuard] },
  { path: 'inventario', component: InventarioComponent, canActivate: [inventarioGuard] },

  // CU12: Preparar y Atender Reservas Presenciales (Encargado de Sucursal)
  { path: 'encargado/reservas', component: EncargadoDashboardComponent, canActivate: [encargadoGuard] },
  { path: 'encargado/escaner', component: EscanerQrComponent, canActivate: [encargadoGuard] },

  // CU15: Terminal Punto de Venta en Caja (POS)
  { path: 'pos', component: PosTerminalComponent, canActivate: [posGuard] },

  // CU18: Gestión de Despacho y Logística de Delivery
  { path: 'logistica/dashboard', component: LogisticaDashboardComponent, canActivate: [logisticaGuard] },

  // Redirección ante rutas inexistentes
  { path: '**', redirectTo: 'catalogo' }
];
