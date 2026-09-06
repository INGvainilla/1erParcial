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
import { adminGuard, staffGuard, inventarioGuard, proveedoresGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Ruta por defecto: La tienda digital / catálogo es la entrada pública
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },
  
  // Canales Públicos / Clientes
  { path: 'catalogo', component: CatalogoComponent },
  { path: 'login', component: LoginComponent },

  // Panel Ejecutivo y Gestión RBAC (Exclusivo Administrador)
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [adminGuard] },
  { path: 'temporadas', component: TemporadasComponent, canActivate: [adminGuard] },

  // Operaciones de Staff y Sucursal
  { path: 'sucursales', component: SucursalesComponent, canActivate: [staffGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [staffGuard] },
  { path: 'proveedores', component: ProveedoresComponent, canActivate: [proveedoresGuard] },
  { path: 'inventario', component: InventarioComponent, canActivate: [inventarioGuard] },

  // Redirección ante rutas inexistentes
  { path: '**', redirectTo: 'catalogo' }
];
