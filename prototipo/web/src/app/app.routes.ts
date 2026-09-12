import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { LoginComponent } from './pages/login/login.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { SucursalesComponent } from './pages/sucursales/sucursales.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { TemporadasComponent } from './pages/temporadas/temporadas.component';
import { ProveedoresComponent } from './pages/proveedores/proveedores.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { ReservaCrear } from './pages/reservas/reserva-crear/reserva-crear';
import { ReservaTicket } from './pages/reservas/reserva-ticket/reserva-ticket';
import { EncargadoDashboardComponent } from './pages/encargado-dashboard/encargado-dashboard.component';
import { EscanerQrComponent } from './pages/escaner-qr/escaner-qr.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CheckoutConfirmacionComponent } from './pages/checkout/checkout-confirmacion.component';
import { PosTerminalComponent } from './pages/pos/pos-terminal.component';
import { PagoOrdenComponent } from './pages/pagos/pago-orden.component';
import { AdminPagosConfigComponent } from './pages/admin-pagos/admin-pagos-config.component';
import { LogisticaDashboardComponent } from './pages/logistica/logistica-dashboard.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { adminGuard, staffGuard, inventarioGuard, proveedoresGuard, encargadoGuard, posGuard, logisticaGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto: La tienda digital / catálogo es la entrada pública
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  
  // Canales Públicos / Clientes
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reservas/crear', component: ReservaCrear },
  { path: 'reservas/ticket', component: ReservaTicket },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout/confirmacion/:id', component: CheckoutConfirmacionComponent },
  { path: 'pagos/:id', component: PagoOrdenComponent },
  { path: 'tracking/:id', component: TrackingComponent },

  // Panel Ejecutivo y Gestión RBAC (Exclusivo Administrador)
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
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
