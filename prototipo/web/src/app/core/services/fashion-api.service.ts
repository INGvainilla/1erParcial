import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import {
  Usuario, Sucursal, Ciudad, Producto, Categoria, Marca,
  Temporada, Proveedor, InventarioItem, KardexItem, CatalogoItem
} from '../models/fashion.models';
import { API_BASE_URL } from '../constants/api.constants';

@Injectable({
  providedIn: 'root'
})
export class FashionApiService {
  private apiUrl = API_BASE_URL;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // ==========================================
  // CU04: GESTIÓN DE USUARIOS Y ROLES (RBAC)
  // ==========================================
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  crearUsuario(data: {
    email: string;
    password: string;
    nombre_completo: string;
    telefono?: string;
    rol: string;
    id_sucursal?: number | null;
  }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  modificarUsuario(idUsuario: number, data: {
    nombre_completo?: string;
    telefono?: string;
    rol?: string;
    id_sucursal?: number | null;
    estado_cuenta?: string;
  }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/usuarios/${idUsuario}`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  desbloquearUsuario(idUsuario: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${idUsuario}/desbloquear`, {}, {
      headers: this.auth.getAuthHeaders()
    });
  }

  cambiarRolUsuario(idUsuario: number, nuevoRol: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${idUsuario}`, { rol: nuevoRol }, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU05: GESTIÓN DE SUCURSALES Y CIUDADES (GPS)
  // ==========================================
  getCiudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${this.apiUrl}/ciudades`);
  }

  getSucursales(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(`${this.apiUrl}/sucursales`);
  }

  createSucursal(sucursal: any): Observable<Sucursal> {
    return this.http.post<Sucursal>(`${this.apiUrl}/sucursales`, sucursal, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU06: CATÁLOGO DE PRODUCTOS Y MODA
  // ==========================================
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/productos/categorias`);
  }

  getMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.apiUrl}/productos/marcas`);
  }

  createProducto(data: any): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU07: TEMPORADAS Y COLECCIONES
  // ==========================================
  getTemporadas(): Observable<Temporada[]> {
    return this.http.get<Temporada[]>(`${this.apiUrl}/temporadas`);
  }

  createTemporada(data: any): Observable<Temporada> {
    return this.http.post<Temporada>(`${this.apiUrl}/temporadas`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU08: PROVEEDORES TEXTILES (NIT ÚNICO)
  // ==========================================
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedores`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  createProveedor(data: any): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.apiUrl}/proveedores`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU09: INVENTARIO MULTI-SUCURSAL Y CPP
  // ==========================================
  getInventario(idSucursal?: number): Observable<InventarioItem[]> {
    let params = new HttpParams();
    if (idSucursal) {
      params = params.set('id_sucursal', idSucursal.toString());
    }
    return this.http.get<InventarioItem[]>(`${this.apiUrl}/inventario/stock`, {
      params,
      headers: this.auth.getAuthHeaders()
    });
  }

  registrarEntradaCompra(data: {
    id_sucursal: number;
    id_producto: number;
    talla: string;
    color: string;
    cantidad_recibida: number;
    costo_unitario_compra: number;
    numero_factura?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/inventario/entradas`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getKardex(idInventario: number): Observable<KardexItem[]> {
    const params = new HttpParams().set('id_inventario', idInventario.toString());
    return this.http.get<KardexItem[]>(`${this.apiUrl}/inventario/kardex`, {
      params,
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU10: CONSULTA OMNICANAL Y DISPONIBILIDAD
  // ==========================================
  getCatalogo(filtros?: { id_categoria?: number; id_sucursal?: number; busqueda?: string }): Observable<CatalogoItem[]> {
    let params = new HttpParams();
    if (filtros?.id_categoria) {
      params = params.set('id_categoria', filtros.id_categoria.toString());
    }
    if (filtros?.id_sucursal) {
      params = params.set('id_sucursal', filtros.id_sucursal.toString());
    }
    if (filtros?.busqueda) {
      params = params.set('busqueda', filtros.busqueda);
    }
    return this.http.get<CatalogoItem[]>(`${this.apiUrl}/catalogo`, { params });
  }
}
