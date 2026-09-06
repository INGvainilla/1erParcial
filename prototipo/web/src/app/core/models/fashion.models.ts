export interface Usuario {
  id_usuario: number;
  email: string;
  nombre_completo: string;
  nombres?: string;
  apellidos?: string;
  telefono?: string | null;
  rol: string; // 'ADMINISTRADOR' | 'ENCARGADO_SUCURSAL' | 'CAJERO' | 'LOGISTICA' | 'CLIENTE' | 'PROVEEDOR'
  estado_cuenta: string; // 'ACTIVO' | 'INACTIVO' | 'BLOQUEADO_POR_INTENTOS'
  intentos_fallidos: number;
  bloqueado_hasta?: string | null;
  id_sucursal?: number | null;
  sucursal_nombre?: string | null;
  creado_en?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  id_usuario: number;
  nombres: string;
  apellidos?: string;
  nombre_completo?: string;
  email: string;
  rol: string;
  id_sucursal?: number | null;
}

export interface Ciudad {
  id_ciudad: number;
  nombre_ciudad: string;
  departamento?: string;
  codigo_departamento?: string;
}

export interface Sucursal {
  id_sucursal: number;
  codigo_sucursal?: string;
  id_ciudad: number;
  nombre_sucursal: string;
  direccion: string;
  direccion_fisica?: string;
  telefono?: string;
  telefono_contacto?: string;
  capacidad_probadores: number;
  horario_apertura?: string;
  horario_cierre?: string;
  latitud: number;
  longitud: number;
  latitud_gps?: number | null;
  longitud_gps?: number | null;
  estado: string;
  activa?: boolean;
  nombre_ciudad?: string;
  departamento?: string;
  ciudad?: Ciudad | null;
}

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion?: string | null;
}

export interface Marca {
  id_marca: number;
  nombre_marca: string;
}

export interface ColorVariante {
  id_color: number;
  color_nombre: string;
  codigo_hex: string;
}

export interface TallaVariante {
  id_talla: number;
  talla: string;
}

export interface Producto {
  id_producto: number;
  codigo_sku_base: string;
  nombre: string;
  descripcion?: string | null;
  precio_base: number;
  id_categoria: number;
  nombre_categoria?: string | null;
  id_marca: number;
  nombre_marca?: string | null;
  id_temporada?: number | null;
  codigo_temporada?: string | null;
  imagen_principal?: string | null;
  modelo_3d_glb?: string | null;
  estado: string;
  colores: ColorVariante[];
  tallas: TallaVariante[];
}

export interface Temporada {
  id_temporada: number;
  codigo_campana: string;
  codigo_temporada?: string;
  nombre_temporada: string;
  nombre_coleccion?: string;
  tipo_temporada?: string;
  fecha_inicio: string;
  fecha_fin: string;
  descuento_liquidacion: number;
  descuento_liquidacion_pct?: number;
  estado: string;
  activa?: boolean;
  cantidad_productos_asociados?: number;
}

export interface Proveedor {
  id_proveedor: number;
  nit_identificacion: string;
  razon_social: string;
  contacto_nombre?: string;
  telefono?: string;
  telefono_contacto?: string;
  email?: string;
  email_contacto?: string;
  terminos_pago: string;
  plazo_credito_dias?: number;
  estado: string;
  activo?: boolean;
}

export interface InventarioItem {
  id_inventario: number;
  id_sucursal: number;
  nombre_sucursal?: string | null;
  id_producto: number;
  codigo_sku_base?: string | null;
  nombre_producto?: string | null;
  talla: string;
  color: string;
  stock_fisico: number;
  stock_reservado: number;
  stock_disponible: number;
  stock_minimo: number;
  ultimo_costo_compra: number;
  costo_promedio_ponderado: number;
  actualizado_en?: string | null;
}

export interface KardexItem {
  id_movimiento: number;
  id_inventario: number;
  tipo_movimiento: string;
  cantidad: number;
  costo_unitario_movimiento: number;
  saldo_cantidad_resultante: number;
  saldo_cpp_resultante: number;
  referencia_documento?: string | null;
  fecha_hora: string;
}

export interface StockSucursalItem {
  id_sucursal: number;
  nombre_sucursal: string;
  nombre_ciudad: string;
  direccion: string;
  latitud: number;
  longitud: number;
  stock_disponible: number;
  tallas_disponibles: string[];
  colores_disponibles: string[];
}

export interface CatalogoItem {
  id_producto: number;
  codigo_sku_base: string;
  nombre: string;
  descripcion?: string | null;
  precio_base: number;
  descuento_aplicable_pct: number;
  precio_final: number;
  id_categoria: number;
  nombre_categoria?: string | null;
  id_marca: number;
  nombre_marca?: string | null;
  id_temporada?: number | null;
  codigo_temporada?: string | null;
  imagen_principal?: string | null;
  modelo_3d_glb?: string | null;
  colores: ColorVariante[];
  tallas: TallaVariante[];
  stock_total_disponible: number;
  disponibilidad_sucursales: StockSucursalItem[];
}
