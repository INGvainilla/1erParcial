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
  // CU04: Gestionar Usuarios y Roles (RBAC), Paso 1: Administrador consulta lista de personal
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // CU04: Gestionar Usuarios y Roles (RBAC), Paso 2: Registrar colaborador con rol jerárquico y sucursal
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

  // CU04: Gestionar Usuarios y Roles (RBAC), Paso 3: Modificar datos de perfil, rol o sucursal
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

  // CU04: Gestionar Usuarios y Roles (RBAC), Paso 4: Desbloqueo administrativo de cuenta bloqueada
  desbloquearUsuario(idUsuario: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${idUsuario}/desbloquear`, {}, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // CU04: Gestionar Usuarios y Roles (RBAC), Paso 5: Bloqueo preventivo o administrativo de cuenta
  bloquearUsuario(idUsuario: number, minutos: number = 30): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${idUsuario}/bloquear?minutos=${minutos}`, {}, {
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
  // CU05: Gestionar Ciudades y Sucursales, Paso 1: Consultar catálogo de ciudades operativas
  getCiudades(): Observable<Ciudad[]> {
    return this.http.get<Ciudad[]>(`${this.apiUrl}/ciudades`);
  }

  // CU05: Gestionar Ciudades y Sucursales, Paso 2: Listar sucursales físicas con datos GPS y probadores
  getSucursales(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(`${this.apiUrl}/sucursales`);
  }

  // CU05: Gestionar Ciudades y Sucursales, Paso 3: Registrar nueva sucursal física georreferenciada
  createSucursal(sucursal: any): Observable<Sucursal> {
    return this.http.post<Sucursal>(`${this.apiUrl}/sucursales`, sucursal, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // CU05: Gestionar Ciudades y Sucursales, Paso 4: Actualizar parámetros operativos y probadores de sucursal
  updateSucursal(idSucursal: number, data: any): Observable<Sucursal> {
    return this.http.put<Sucursal>(`${this.apiUrl}/sucursales/${idSucursal}`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU06: CATÁLOGO DE PRODUCTOS Y MODA
  // ==========================================
  // CU06: Gestionar Productos y Atributos de Moda, Paso 1: Consultar catálogo maestro de indumentaria
  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.apiUrl}/productos`);
  }

  // CU06: Gestionar Productos y Atributos de Moda, Paso 2: Obtener categorías taxonómicas de prendas
  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/productos/categorias`);
  }

  // CU06: Gestionar Productos y Atributos de Moda, Paso 3: Obtener marcas registradas de moda
  getMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(`${this.apiUrl}/productos/marcas`);
  }

  // CU06: Gestionar Productos y Atributos de Moda, Paso 4: Registrar ficha técnica, SKU, tallas y colores Hex
  createProducto(data: any): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/productos`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU07: TEMPORADAS Y COLECCIONES
  // ==========================================
  // CU07: Gestionar Temporadas y Colecciones, Paso 1: Consultar campañas y temporadas estacionales
  getTemporadas(): Observable<Temporada[]> {
    return this.http.get<Temporada[]>(`${this.apiUrl}/temporadas`);
  }

  // CU07: Gestionar Temporadas y Colecciones, Paso 2: Programar nueva temporada comercial con fechas de vigencia
  createTemporada(data: any): Observable<Temporada> {
    return this.http.post<Temporada>(`${this.apiUrl}/temporadas`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // CU07: Gestionar Temporadas y Colecciones, Paso 3: Modificar vigencia, estado o políticas de liquidación
  updateTemporada(idTemporada: number, data: any): Observable<Temporada> {
    return this.http.put<Temporada>(`${this.apiUrl}/temporadas/${idTemporada}`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU08: PROVEEDORES TEXTILES (NIT ÚNICO)
  // ==========================================
  // CU08: Gestionar Proveedores Textiles, Paso 1.1: consultarCatalogoProveedores()
  getProveedores(): Observable<Proveedor[]> {
    return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedores`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // CU08: Gestionar Proveedores Textiles, Paso 1.1: registrarProveedor(datosProv)
  createProveedor(data: any): Observable<Proveedor> {
    return this.http.post<Proveedor>(`${this.apiUrl}/proveedores`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // CU08: Gestionar Proveedores Textiles, Paso 1.4: actualizarRegistroProveedor(idProveedor, datosProv)
  updateProveedor(idProveedor: number, data: any): Observable<Proveedor> {
    return this.http.put<Proveedor>(`${this.apiUrl}/proveedores/${idProveedor}`, data, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU09: INVENTARIO MULTI-SUCURSAL Y CPP
  // ==========================================
  // CU09: Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP), Paso 1.2: obtenerExistenciasYCppActual(sucursal_id, SKU)
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

  // CU09: Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP), Paso 1.1: procesarEntradaMercaderia(sucursal_id, SKU, cant, costo_unit)
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

  // CU09: Gestionar Inventario Multi-Sucursal y Costos Ponderados (CPP), Paso 1.8: mostrar comprobante de kardex con nuevo CPP
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
  // CU10: Consultar Catálogo y Disponibilidad Omnicanal, Paso 1.1: consultarPrendas(criteriosFiltro)
  getCatalogo(filtros?: {
    id_categoria?: number;
    id_sucursal?: number;
    busqueda?: string;
    id_marca?: number;
    id_temporada?: number;
    talla?: string;
    color?: string;
    precio_min?: number;
    precio_max?: number;
  }): Observable<CatalogoItem[]> {
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
    if (filtros?.id_marca) {
      params = params.set('id_marca', filtros.id_marca.toString());
    }
    if (filtros?.id_temporada) {
      params = params.set('id_temporada', filtros.id_temporada.toString());
    }
    if (filtros?.talla) {
      params = params.set('talla', filtros.talla);
    }
    if (filtros?.color) {
      params = params.set('color', filtros.color);
    }
    if (filtros?.precio_min !== undefined && filtros?.precio_min !== null) {
      params = params.set('precio_min', filtros.precio_min.toString());
    }
    if (filtros?.precio_max !== undefined && filtros?.precio_max !== null) {
      params = params.set('precio_max', filtros.precio_max.toString());
    }
    return this.http.get<CatalogoItem[]>(`${this.apiUrl}/catalogo`, { params });
  }

  // ==========================================
  // DASHBOARD Y MÉTRICAS GLOBALES (CU01 - CU24)
  // ==========================================
  getDashboardMetricas(sucursalId?: number | null, rangoFecha?: string, rankingTipo?: string): Observable<any> {
    let params = new HttpParams();
    if (sucursalId) params = params.set('sucursal_id', sucursalId.toString());
    if (rangoFecha && rangoFecha !== 'TODO') params = params.set('rango_fecha', rangoFecha);
    if (rankingTipo && rankingTipo !== 'TODOS') params = params.set('ranking_tipo', rankingTipo);

    return this.http.get<any>(`${this.apiUrl}/dashboard/metricas`, {
      headers: this.auth.getAuthHeaders(),
      params
    });
  }

  // ==========================================
  // CU21: FIDELIZACIÓN GAMIFICADA (M16)
  // ==========================================
  getGamificacionPerfil(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/gamificacion/perfil`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getRecompensas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/gamificacion/recompensas`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  canjearRecompensa(codigoRecompensa: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/gamificacion/canjear`, {
      codigo_recompensa: codigoRecompensa
    }, {
      headers: this.auth.getAuthHeaders()
    });
  }

  otorgarBonoAccion(accion: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/gamificacion/bono-accion`, {
      accion: accion
    }, {
      headers: this.auth.getAuthHeaders()
    });
  }

  getMisCupones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/gamificacion/mis-cupones`, {
      headers: this.auth.getAuthHeaders()
    });
  }

  validarCupon(codigoCupon: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/gamificacion/validar-cupon`, {
      codigo_cupon: codigoCupon
    }, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // ==========================================
  // CU22 & CU23: ASISTENTE IA, CLIMA Y VOZ (M17)
  // ==========================================
  getClimaLocal(ciudad?: string): Observable<any> {
    let params = new HttpParams();
    if (ciudad) {
      params = params.set('ciudad', ciudad);
    }
    return this.http.get<any>(`${this.apiUrl}/recomendaciones/clima`, { params });
  }

  getOutfitsRecomendados(
    ciudad?: string,
    ocasion?: string,
    temporada?: string,
    estilo?: string,
    presupuesto?: string,
    promptIa?: string,
    filtroClima?: string
  ): Observable<any> {
    let params = new HttpParams();
    if (ciudad) params = params.set('ciudad', ciudad);
    if (ocasion) params = params.set('ocasion', ocasion);
    if (temporada && temporada !== 'TODAS') params = params.set('temporada', temporada);
    if (estilo && estilo !== 'TODOS') params = params.set('estilo', estilo);
    if (presupuesto && presupuesto !== 'TODOS') params = params.set('presupuesto', presupuesto);
    if (promptIa && promptIa.trim()) params = params.set('prompt_ia', promptIa.trim());
    if (filtroClima && filtroClima !== 'AUTO') params = params.set('filtro_clima', filtroClima);
    return this.http.get<any>(`${this.apiUrl}/recomendaciones/outfits`, { params });
  }

  buscarPorVoz(consultaVoz: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recomendaciones/busqueda-voz`, {
      consulta_voz: consultaVoz
    });
  }
}


