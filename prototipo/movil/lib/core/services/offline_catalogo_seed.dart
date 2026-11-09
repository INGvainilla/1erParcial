// Seed estático offline para CU08 (Descarga y Consulta de Catálogo Offline)
import 'dart:convert';

class OfflineCatalogoSeed {
  static const String _categoriasJson = r'''[
  {
    "id_categoria": 1,
    "nombre_categoria": "Camisas Formales",
    "descripcion": "Camisas ejecutivas y de vestir en algodón peinado y lino"
  },
  {
    "id_categoria": 2,
    "nombre_categoria": "Pantalones Casuales",
    "descripcion": "Pantalones estilo chino, gabardina y corte clásico"
  },
  {
    "id_categoria": 3,
    "nombre_categoria": "Trajes y Blazers",
    "descripcion": "Sacos, chaquetas y trajes de dos piezas en lana fría"
  },
  {
    "id_categoria": 4,
    "nombre_categoria": "Calzado Ejecutivo",
    "descripcion": "Zapatos Oxford, Derby y mocasines de cuero legítimo"
  }
]''';

  static const String _sucursalesJson = r'''[
  {
    "id_sucursal": 1,
    "nombre_sucursal": "Sucursal Equipetrol",
    "direccion": "Av. San Martín #450, entre 3er y 4to anillo",
    "nombre_ciudad": "Santa Cruz"
  },
  {
    "id_sucursal": 2,
    "nombre_sucursal": "Sucursal Centro",
    "direccion": "Calle 21 de Mayo esq. Ayacucho",
    "nombre_ciudad": "Santa Cruz"
  },
  {
    "id_sucursal": 3,
    "nombre_sucursal": "Sucursal Calacoto",
    "direccion": "Av. Ballivián #1200, Calle 18",
    "nombre_ciudad": "Santa Cruz"
  },
  {
    "id_sucursal": 4,
    "nombre_sucursal": "Sucursal El Prado",
    "direccion": "Av. Ballivián #600, El Prado",
    "nombre_ciudad": "Santa Cruz"
  },
  {
    "id_sucursal": 5,
    "nombre_sucursal": "Sucursal San Miguel (Elegance)",
    "direccion": "Av. Montenegro #890, San Miguel",
    "nombre_ciudad": "Santa Cruz"
  },
  {
    "id_sucursal": 6,
    "nombre_sucursal": "Sucursal Mall Las Brisas (Elegance)",
    "direccion": "Centro Comercial Las Brisas, Nivel 2",
    "nombre_ciudad": "Santa Cruz"
  }
]''';

  static const String _prendasJson = r'''[
  {
    "id_producto": 7,
    "codigo_sku_base": "SHIRT-LINO-007",
    "nombre": "Camisa de Lino Cuello Mao Italiana",
    "descripcion": "Camisa veraniega fresca en 100% lino natural lavado con cuello oriental y botones madera",
    "precio_base": "310.00",
    "descuento_aplicable_pct": "0.00",
    "precio_final": "310.00",
    "id_categoria": 1,
    "nombre_categoria": "Camisas Formales",
    "id_marca": 1,
    "nombre_marca": "Oxford Heritage",
    "id_temporada": 1,
    "codigo_temporada": "SS-2026",
    "imagen_principal": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
    "modelo_3d_glb": "https://assets.fashionstore.bo/models/shirt_lino_mao.glb",
    "colores": [
      {
        "id_color": 16,
        "color_nombre": "Blanco Puro",
        "codigo_hex": "#FFFFFF",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 17,
        "color_nombre": "Verde Salvia",
        "codigo_hex": "#8A9A5B",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 18,
        "color_nombre": "Celeste Pastel",
        "codigo_hex": "#B0E0E6",
        "codigo_hex_secundario": null
      }
    ],
    "tallas": [
      {
        "id_talla": 24,
        "talla": "S",
        "precio": "294.50",
        "factor": 0.95,
        "medidas_cm": null
      },
      {
        "id_talla": 25,
        "talla": "M",
        "precio": "310.00",
        "factor": 1.0,
        "medidas_cm": null
      },
      {
        "id_talla": 26,
        "talla": "L",
        "precio": "325.50",
        "factor": 1.05,
        "medidas_cm": null
      },
      {
        "id_talla": 27,
        "talla": "XL",
        "precio": "341.00",
        "factor": 1.1,
        "medidas_cm": null
      }
    ],
    "stock_total_disponible": 951,
    "disponibilidad_sucursales": [
      {
        "id_sucursal": 1,
        "nombre_sucursal": "Sucursal Equipetrol",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Av. San Martín #450, entre 3er y 4to anillo",
        "latitud": "-17.76823000",
        "longitud": "-63.18342000",
        "stock_disponible": 231,
        "tallas_disponibles": [
          "L",
          "M",
          "S",
          "XL"
        ],
        "colores_disponibles": [
          "Blanco Puro",
          "Celeste Pastel",
          "Verde Salvia"
        ]
      },
      {
        "id_sucursal": 2,
        "nombre_sucursal": "Sucursal Centro",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Calle 21 de Mayo esq. Ayacucho",
        "latitud": "-17.78312000",
        "longitud": "-63.18210000",
        "stock_disponible": 240,
        "tallas_disponibles": [
          "L",
          "M",
          "S",
          "XL"
        ],
        "colores_disponibles": [
          "Blanco Puro",
          "Celeste Pastel",
          "Verde Salvia"
        ]
      },
      {
        "id_sucursal": 3,
        "nombre_sucursal": "Sucursal Calacoto",
        "nombre_ciudad": "La Paz",
        "direccion": "Av. Ballivián #1200, Calle 18",
        "latitud": "-16.53982000",
        "longitud": "-68.08921000",
        "stock_disponible": 240,
        "tallas_disponibles": [
          "L",
          "M",
          "S",
          "XL"
        ],
        "colores_disponibles": [
          "Blanco Puro",
          "Celeste Pastel",
          "Verde Salvia"
        ]
      },
      {
        "id_sucursal": 4,
        "nombre_sucursal": "Sucursal El Prado",
        "nombre_ciudad": "Cochabamba",
        "direccion": "Av. Ballivián #600, El Prado",
        "latitud": "-17.38921000",
        "longitud": "-66.15672000",
        "stock_disponible": 240,
        "tallas_disponibles": [
          "L",
          "M",
          "S",
          "XL"
        ],
        "colores_disponibles": [
          "Blanco Puro",
          "Celeste Pastel",
          "Verde Salvia"
        ]
      }
    ],
    "inventario_variantes": [
      {
        "id_inventario": 61,
        "id_sucursal": 1,
        "talla": "S",
        "color": "Blanco Puro",
        "stock_fisico": 13,
        "stock_reservado": 1,
        "stock_disponible": 12,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 62,
        "id_sucursal": 1,
        "talla": "S",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 63,
        "id_sucursal": 1,
        "talla": "S",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 64,
        "id_sucursal": 1,
        "talla": "M",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 65,
        "id_sucursal": 1,
        "talla": "M",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 66,
        "id_sucursal": 1,
        "talla": "M",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 67,
        "id_sucursal": 1,
        "talla": "L",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 68,
        "id_sucursal": 1,
        "talla": "L",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 69,
        "id_sucursal": 1,
        "talla": "L",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 70,
        "id_sucursal": 1,
        "talla": "XL",
        "color": "Blanco Puro",
        "stock_fisico": 19,
        "stock_reservado": 0,
        "stock_disponible": 19,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 71,
        "id_sucursal": 1,
        "talla": "XL",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 72,
        "id_sucursal": 1,
        "talla": "XL",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 131,
        "id_sucursal": 2,
        "talla": "S",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 132,
        "id_sucursal": 2,
        "talla": "S",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 133,
        "id_sucursal": 2,
        "talla": "S",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 134,
        "id_sucursal": 2,
        "talla": "M",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 135,
        "id_sucursal": 2,
        "talla": "M",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 136,
        "id_sucursal": 2,
        "talla": "M",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 137,
        "id_sucursal": 2,
        "talla": "L",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 138,
        "id_sucursal": 2,
        "talla": "L",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 139,
        "id_sucursal": 2,
        "talla": "L",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 140,
        "id_sucursal": 2,
        "talla": "XL",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 141,
        "id_sucursal": 2,
        "talla": "XL",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 142,
        "id_sucursal": 2,
        "talla": "XL",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 200,
        "id_sucursal": 3,
        "talla": "S",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 201,
        "id_sucursal": 3,
        "talla": "S",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 202,
        "id_sucursal": 3,
        "talla": "S",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 203,
        "id_sucursal": 3,
        "talla": "M",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 204,
        "id_sucursal": 3,
        "talla": "M",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 205,
        "id_sucursal": 3,
        "talla": "M",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 206,
        "id_sucursal": 3,
        "talla": "L",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 207,
        "id_sucursal": 3,
        "talla": "L",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 208,
        "id_sucursal": 3,
        "talla": "L",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 209,
        "id_sucursal": 3,
        "talla": "XL",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 210,
        "id_sucursal": 3,
        "talla": "XL",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 211,
        "id_sucursal": 3,
        "talla": "XL",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 269,
        "id_sucursal": 4,
        "talla": "S",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 270,
        "id_sucursal": 4,
        "talla": "S",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 271,
        "id_sucursal": 4,
        "talla": "S",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "112.50",
        "costo_promedio_ponderado": "112.50"
      },
      {
        "id_inventario": 272,
        "id_sucursal": 4,
        "talla": "M",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 273,
        "id_sucursal": 4,
        "talla": "M",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 274,
        "id_sucursal": 4,
        "talla": "M",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "125.00",
        "costo_promedio_ponderado": "125.00"
      },
      {
        "id_inventario": 275,
        "id_sucursal": 4,
        "talla": "L",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 276,
        "id_sucursal": 4,
        "talla": "L",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 277,
        "id_sucursal": 4,
        "talla": "L",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "137.50",
        "costo_promedio_ponderado": "137.50"
      },
      {
        "id_inventario": 278,
        "id_sucursal": 4,
        "talla": "XL",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 279,
        "id_sucursal": 4,
        "talla": "XL",
        "color": "Verde Salvia",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      },
      {
        "id_inventario": 280,
        "id_sucursal": 4,
        "talla": "XL",
        "color": "Celeste Pastel",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "150.00",
        "costo_promedio_ponderado": "150.00"
      }
    ],
    "cpp_promedio": "131.25"
  },
  {
    "id_producto": 6,
    "codigo_sku_base": "MOCA-LOAF-006",
    "nombre": "Mocasín Náutico Confort de Cuero",
    "descripcion": "Mocasín sin cordones de cuero gamuzado ultra flexible con plantilla ortopédica acolchada",
    "precio_base": "460.00",
    "descuento_aplicable_pct": "0.00",
    "precio_final": "460.00",
    "id_categoria": 4,
    "nombre_categoria": "Calzado Ejecutivo",
    "id_marca": 4,
    "nombre_marca": "Bocaccio Leather",
    "id_temporada": 1,
    "codigo_temporada": "SS-2026",
    "imagen_principal": "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80",
    "modelo_3d_glb": "https://assets.fashionstore.bo/models/mocasines.glb",
    "colores": [
      {
        "id_color": 14,
        "color_nombre": "Azul Marino",
        "codigo_hex": "#000080",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 15,
        "color_nombre": "Tabaco",
        "codigo_hex": "#6F4E37",
        "codigo_hex_secundario": null
      }
    ],
    "tallas": [
      {
        "id_talla": 20,
        "talla": "39",
        "precio": "437.00",
        "factor": 0.95,
        "medidas_cm": null
      },
      {
        "id_talla": 21,
        "talla": "40",
        "precio": "460.00",
        "factor": 1.0,
        "medidas_cm": null
      },
      {
        "id_talla": 22,
        "talla": "41",
        "precio": "483.00",
        "factor": 1.05,
        "medidas_cm": null
      },
      {
        "id_talla": 23,
        "talla": "42",
        "precio": "483.00",
        "factor": 1.1,
        "medidas_cm": null
      }
    ],
    "stock_total_disponible": 636,
    "disponibilidad_sucursales": [
      {
        "id_sucursal": 1,
        "nombre_sucursal": "Sucursal Equipetrol",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Av. San Martín #450, entre 3er y 4to anillo",
        "latitud": "-17.76823000",
        "longitud": "-63.18342000",
        "stock_disponible": 156,
        "tallas_disponibles": [
          "39",
          "40",
          "41",
          "42"
        ],
        "colores_disponibles": [
          "Azul Marino",
          "Tabaco"
        ]
      },
      {
        "id_sucursal": 2,
        "nombre_sucursal": "Sucursal Centro",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Calle 21 de Mayo esq. Ayacucho",
        "latitud": "-17.78312000",
        "longitud": "-63.18210000",
        "stock_disponible": 160,
        "tallas_disponibles": [
          "39",
          "40",
          "41",
          "42"
        ],
        "colores_disponibles": [
          "Azul Marino",
          "Tabaco"
        ]
      },
      {
        "id_sucursal": 3,
        "nombre_sucursal": "Sucursal Calacoto",
        "nombre_ciudad": "La Paz",
        "direccion": "Av. Ballivián #1200, Calle 18",
        "latitud": "-16.53982000",
        "longitud": "-68.08921000",
        "stock_disponible": 160,
        "tallas_disponibles": [
          "39",
          "40",
          "41",
          "42"
        ],
        "colores_disponibles": [
          "Azul Marino",
          "Tabaco"
        ]
      },
      {
        "id_sucursal": 4,
        "nombre_sucursal": "Sucursal El Prado",
        "nombre_ciudad": "Cochabamba",
        "direccion": "Av. Ballivián #600, El Prado",
        "latitud": "-17.38921000",
        "longitud": "-66.15672000",
        "stock_disponible": 160,
        "tallas_disponibles": [
          "39",
          "40",
          "41",
          "42"
        ],
        "colores_disponibles": [
          "Azul Marino",
          "Tabaco"
        ]
      }
    ],
    "inventario_variantes": [
      {
        "id_inventario": 53,
        "id_sucursal": 1,
        "talla": "39",
        "color": "Azul Marino",
        "stock_fisico": 19,
        "stock_reservado": 2,
        "stock_disponible": 17,
        "ultimo_costo_compra": "197.40",
        "costo_promedio_ponderado": "197.40"
      },
      {
        "id_inventario": 54,
        "id_sucursal": 1,
        "talla": "39",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "197.40",
        "costo_promedio_ponderado": "197.40"
      },
      {
        "id_inventario": 55,
        "id_sucursal": 1,
        "talla": "40",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "210.00",
        "costo_promedio_ponderado": "210.00"
      },
      {
        "id_inventario": 56,
        "id_sucursal": 1,
        "talla": "40",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "210.00",
        "costo_promedio_ponderado": "210.00"
      },
      {
        "id_inventario": 57,
        "id_sucursal": 1,
        "talla": "41",
        "color": "Azul Marino",
        "stock_fisico": 19,
        "stock_reservado": 0,
        "stock_disponible": 19,
        "ultimo_costo_compra": "222.60",
        "costo_promedio_ponderado": "222.60"
      },
      {
        "id_inventario": 58,
        "id_sucursal": 1,
        "talla": "41",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "222.60",
        "costo_promedio_ponderado": "222.60"
      },
      {
        "id_inventario": 59,
        "id_sucursal": 1,
        "talla": "42",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "226.80",
        "costo_promedio_ponderado": "226.80"
      },
      {
        "id_inventario": 60,
        "id_sucursal": 1,
        "talla": "42",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "226.80",
        "costo_promedio_ponderado": "226.80"
      },
      {
        "id_inventario": 123,
        "id_sucursal": 2,
        "talla": "39",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "197.40",
        "costo_promedio_ponderado": "197.40"
      },
      {
        "id_inventario": 124,
        "id_sucursal": 2,
        "talla": "39",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "197.40",
        "costo_promedio_ponderado": "197.40"
      },
      {
        "id_inventario": 125,
        "id_sucursal": 2,
        "talla": "40",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "210.00",
        "costo_promedio_ponderado": "210.00"
      },
      {
        "id_inventario": 126,
        "id_sucursal": 2,
        "talla": "40",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "210.00",
        "costo_promedio_ponderado": "210.00"
      },
      {
        "id_inventario": 127,
        "id_sucursal": 2,
        "talla": "41",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "222.60",
        "costo_promedio_ponderado": "222.60"
      },
      {
        "id_inventario": 128,
        "id_sucursal": 2,
        "talla": "41",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "222.60",
        "costo_promedio_ponderado": "222.60"
      },
      {
        "id_inventario": 129,
        "id_sucursal": 2,
        "talla": "42",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "226.80",
        "costo_promedio_ponderado": "226.80"
      },
      {
        "id_inventario": 130,
        "id_sucursal": 2,
        "talla": "42",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "226.80",
        "costo_promedio_ponderado": "226.80"
      },
      {
        "id_inventario": 192,
        "id_sucursal": 3,
        "talla": "39",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "197.40",
        "costo_promedio_ponderado": "197.40"
      },
      {
        "id_inventario": 193,
        "id_sucursal": 3,
        "talla": "39",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "197.40",
        "costo_promedio_ponderado": "197.40"
      },
      {
        "id_inventario": 194,
        "id_sucursal": 3,
        "talla": "40",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "210.00",
        "costo_promedio_ponderado": "210.00"
      },
      {
        "id_inventario": 195,
        "id_sucursal": 3,
        "talla": "40",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "210.00",
        "costo_promedio_ponderado": "210.00"
      },
      {
        "id_inventario": 196,
        "id_sucursal": 3,
        "talla": "41",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "222.60",
        "costo_promedio_ponderado": "222.60"
      },
      {
        "id_inventario": 197,
        "id_sucursal": 3,
        "talla": "41",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "222.60",
        "costo_promedio_ponderado": "222.60"
      },
      {
        "id_inventario": 198,
        "id_sucursal": 3,
        "talla": "42",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "226.80",
        "costo_promedio_ponderado": "226.80"
      },
      {
        "id_inventario": 199,
        "id_sucursal": 3,
        "talla": "42",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "226.80",
        "costo_promedio_ponderado": "226.80"
      },
      {
        "id_inventario": 261,
        "id_sucursal": 4,
        "talla": "39",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "197.40",
        "costo_promedio_ponderado": "197.40"
      },
      {
        "id_inventario": 262,
        "id_sucursal": 4,
        "talla": "39",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "197.40",
        "costo_promedio_ponderado": "197.40"
      },
      {
        "id_inventario": 263,
        "id_sucursal": 4,
        "talla": "40",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "210.00",
        "costo_promedio_ponderado": "210.00"
      },
      {
        "id_inventario": 264,
        "id_sucursal": 4,
        "talla": "40",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "210.00",
        "costo_promedio_ponderado": "210.00"
      },
      {
        "id_inventario": 265,
        "id_sucursal": 4,
        "talla": "41",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "222.60",
        "costo_promedio_ponderado": "222.60"
      },
      {
        "id_inventario": 266,
        "id_sucursal": 4,
        "talla": "41",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "222.60",
        "costo_promedio_ponderado": "222.60"
      },
      {
        "id_inventario": 267,
        "id_sucursal": 4,
        "talla": "42",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "226.80",
        "costo_promedio_ponderado": "226.80"
      },
      {
        "id_inventario": 268,
        "id_sucursal": 4,
        "talla": "42",
        "color": "Tabaco",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "226.80",
        "costo_promedio_ponderado": "226.80"
      }
    ],
    "cpp_promedio": "214.20"
  },
  {
    "id_producto": 5,
    "codigo_sku_base": "SUIT-SLIM-005",
    "nombre": "Traje Ejecutivo Slim Fit 2 Piezas",
    "descripcion": "Conjunto formal de saco y pantalón entallado en lana fría super 120s para ocasiones de gala y corporativas",
    "precio_base": "980.00",
    "descuento_aplicable_pct": "0.00",
    "precio_final": "980.00",
    "id_categoria": 3,
    "nombre_categoria": "Trajes y Blazers",
    "id_marca": 3,
    "nombre_marca": "Sartorial Milano",
    "id_temporada": 1,
    "codigo_temporada": "SS-2026",
    "imagen_principal": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80",
    "modelo_3d_glb": "https://assets.fashionstore.bo/models/suit_executive.glb",
    "colores": [
      {
        "id_color": 12,
        "color_nombre": "Azul Noche",
        "codigo_hex": "#191970",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 13,
        "color_nombre": "Gris Marengo",
        "codigo_hex": "#4A4E69",
        "codigo_hex_secundario": null
      }
    ],
    "tallas": [
      {
        "id_talla": 16,
        "talla": "38",
        "precio": "931.00",
        "factor": 0.95,
        "medidas_cm": null
      },
      {
        "id_talla": 17,
        "talla": "40",
        "precio": "980.00",
        "factor": 1.0,
        "medidas_cm": null
      },
      {
        "id_talla": 18,
        "talla": "42",
        "precio": "1029.00",
        "factor": 1.1,
        "medidas_cm": null
      },
      {
        "id_talla": 19,
        "talla": "44",
        "precio": "1078.00",
        "factor": 1.1,
        "medidas_cm": null
      }
    ],
    "stock_total_disponible": 640,
    "disponibilidad_sucursales": [
      {
        "id_sucursal": 1,
        "nombre_sucursal": "Sucursal Equipetrol",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Av. San Martín #450, entre 3er y 4to anillo",
        "latitud": "-17.76823000",
        "longitud": "-63.18342000",
        "stock_disponible": 160,
        "tallas_disponibles": [
          "38",
          "40",
          "42",
          "44"
        ],
        "colores_disponibles": [
          "Azul Noche",
          "Gris Marengo"
        ]
      },
      {
        "id_sucursal": 2,
        "nombre_sucursal": "Sucursal Centro",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Calle 21 de Mayo esq. Ayacucho",
        "latitud": "-17.78312000",
        "longitud": "-63.18210000",
        "stock_disponible": 160,
        "tallas_disponibles": [
          "38",
          "40",
          "42",
          "44"
        ],
        "colores_disponibles": [
          "Azul Noche",
          "Gris Marengo"
        ]
      },
      {
        "id_sucursal": 3,
        "nombre_sucursal": "Sucursal Calacoto",
        "nombre_ciudad": "La Paz",
        "direccion": "Av. Ballivián #1200, Calle 18",
        "latitud": "-16.53982000",
        "longitud": "-68.08921000",
        "stock_disponible": 160,
        "tallas_disponibles": [
          "38",
          "40",
          "42",
          "44"
        ],
        "colores_disponibles": [
          "Azul Noche",
          "Gris Marengo"
        ]
      },
      {
        "id_sucursal": 4,
        "nombre_sucursal": "Sucursal El Prado",
        "nombre_ciudad": "Cochabamba",
        "direccion": "Av. Ballivián #600, El Prado",
        "latitud": "-17.38921000",
        "longitud": "-66.15672000",
        "stock_disponible": 160,
        "tallas_disponibles": [
          "38",
          "40",
          "42",
          "44"
        ],
        "colores_disponibles": [
          "Azul Noche",
          "Gris Marengo"
        ]
      }
    ],
    "inventario_variantes": [
      {
        "id_inventario": 45,
        "id_sucursal": 1,
        "talla": "38",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "386.40",
        "costo_promedio_ponderado": "386.40"
      },
      {
        "id_inventario": 46,
        "id_sucursal": 1,
        "talla": "38",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "386.40",
        "costo_promedio_ponderado": "386.40"
      },
      {
        "id_inventario": 47,
        "id_sucursal": 1,
        "talla": "40",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "420.00",
        "costo_promedio_ponderado": "420.00"
      },
      {
        "id_inventario": 48,
        "id_sucursal": 1,
        "talla": "40",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "420.00",
        "costo_promedio_ponderado": "420.00"
      },
      {
        "id_inventario": 49,
        "id_sucursal": 1,
        "talla": "42",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "453.60",
        "costo_promedio_ponderado": "453.60"
      },
      {
        "id_inventario": 50,
        "id_sucursal": 1,
        "talla": "42",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "453.60",
        "costo_promedio_ponderado": "453.60"
      },
      {
        "id_inventario": 51,
        "id_sucursal": 1,
        "talla": "44",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "495.60",
        "costo_promedio_ponderado": "495.60"
      },
      {
        "id_inventario": 52,
        "id_sucursal": 1,
        "talla": "44",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "495.60",
        "costo_promedio_ponderado": "495.60"
      },
      {
        "id_inventario": 115,
        "id_sucursal": 2,
        "talla": "38",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "386.40",
        "costo_promedio_ponderado": "386.40"
      },
      {
        "id_inventario": 116,
        "id_sucursal": 2,
        "talla": "38",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "386.40",
        "costo_promedio_ponderado": "386.40"
      },
      {
        "id_inventario": 117,
        "id_sucursal": 2,
        "talla": "40",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "420.00",
        "costo_promedio_ponderado": "420.00"
      },
      {
        "id_inventario": 118,
        "id_sucursal": 2,
        "talla": "40",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "420.00",
        "costo_promedio_ponderado": "420.00"
      },
      {
        "id_inventario": 119,
        "id_sucursal": 2,
        "talla": "42",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "453.60",
        "costo_promedio_ponderado": "453.60"
      },
      {
        "id_inventario": 120,
        "id_sucursal": 2,
        "talla": "42",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "453.60",
        "costo_promedio_ponderado": "453.60"
      },
      {
        "id_inventario": 121,
        "id_sucursal": 2,
        "talla": "44",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "495.60",
        "costo_promedio_ponderado": "495.60"
      },
      {
        "id_inventario": 122,
        "id_sucursal": 2,
        "talla": "44",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "495.60",
        "costo_promedio_ponderado": "495.60"
      },
      {
        "id_inventario": 184,
        "id_sucursal": 3,
        "talla": "38",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "386.40",
        "costo_promedio_ponderado": "386.40"
      },
      {
        "id_inventario": 185,
        "id_sucursal": 3,
        "talla": "38",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "386.40",
        "costo_promedio_ponderado": "386.40"
      },
      {
        "id_inventario": 186,
        "id_sucursal": 3,
        "talla": "40",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "420.00",
        "costo_promedio_ponderado": "420.00"
      },
      {
        "id_inventario": 187,
        "id_sucursal": 3,
        "talla": "40",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "420.00",
        "costo_promedio_ponderado": "420.00"
      },
      {
        "id_inventario": 188,
        "id_sucursal": 3,
        "talla": "42",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "453.60",
        "costo_promedio_ponderado": "453.60"
      },
      {
        "id_inventario": 189,
        "id_sucursal": 3,
        "talla": "42",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "453.60",
        "costo_promedio_ponderado": "453.60"
      },
      {
        "id_inventario": 190,
        "id_sucursal": 3,
        "talla": "44",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "495.60",
        "costo_promedio_ponderado": "495.60"
      },
      {
        "id_inventario": 191,
        "id_sucursal": 3,
        "talla": "44",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "495.60",
        "costo_promedio_ponderado": "495.60"
      },
      {
        "id_inventario": 253,
        "id_sucursal": 4,
        "talla": "38",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "386.40",
        "costo_promedio_ponderado": "386.40"
      },
      {
        "id_inventario": 254,
        "id_sucursal": 4,
        "talla": "38",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "386.40",
        "costo_promedio_ponderado": "386.40"
      },
      {
        "id_inventario": 255,
        "id_sucursal": 4,
        "talla": "40",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "420.00",
        "costo_promedio_ponderado": "420.00"
      },
      {
        "id_inventario": 256,
        "id_sucursal": 4,
        "talla": "40",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "420.00",
        "costo_promedio_ponderado": "420.00"
      },
      {
        "id_inventario": 257,
        "id_sucursal": 4,
        "talla": "42",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "453.60",
        "costo_promedio_ponderado": "453.60"
      },
      {
        "id_inventario": 258,
        "id_sucursal": 4,
        "talla": "42",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "453.60",
        "costo_promedio_ponderado": "453.60"
      },
      {
        "id_inventario": 259,
        "id_sucursal": 4,
        "talla": "44",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "495.60",
        "costo_promedio_ponderado": "495.60"
      },
      {
        "id_inventario": 260,
        "id_sucursal": 4,
        "talla": "44",
        "color": "Gris Marengo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "495.60",
        "costo_promedio_ponderado": "495.60"
      }
    ],
    "cpp_promedio": "438.90"
  },
  {
    "id_producto": 4,
    "codigo_sku_base": "SHOE-OXFD-004",
    "nombre": "Zapato Oxford Cap-Toe Cuero Genuino",
    "descripcion": "Calzado formal artesanal en cuero vacuno plena flor con suela de cuero cosida Goodyear Welted",
    "precio_base": "540.00",
    "descuento_aplicable_pct": "25.00",
    "precio_final": "405.00",
    "id_categoria": 4,
    "nombre_categoria": "Calzado Ejecutivo",
    "id_marca": 4,
    "nombre_marca": "Bocaccio Leather",
    "id_temporada": 2,
    "codigo_temporada": "FW-2026",
    "imagen_principal": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80",
    "modelo_3d_glb": "https://assets.fashionstore.bo/models/oxford_shoes.glb",
    "colores": [
      {
        "id_color": 9,
        "color_nombre": "Negro Clásico",
        "codigo_hex": "#1A1A1A",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 10,
        "color_nombre": "Marrón Suizo",
        "codigo_hex": "#5C4033",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 11,
        "color_nombre": "Cognac",
        "codigo_hex": "#9E4714",
        "codigo_hex_secundario": null
      }
    ],
    "tallas": [
      {
        "id_talla": 12,
        "talla": "39",
        "precio": "384.75",
        "factor": 0.95,
        "medidas_cm": null
      },
      {
        "id_talla": 13,
        "talla": "40",
        "precio": "405.00",
        "factor": 1.0,
        "medidas_cm": null
      },
      {
        "id_talla": 14,
        "talla": "41",
        "precio": "425.25",
        "factor": 1.05,
        "medidas_cm": null
      },
      {
        "id_talla": 15,
        "talla": "42",
        "precio": "425.25",
        "factor": 1.1,
        "medidas_cm": null
      }
    ],
    "stock_total_disponible": 959,
    "disponibilidad_sucursales": [
      {
        "id_sucursal": 1,
        "nombre_sucursal": "Sucursal Equipetrol",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Av. San Martín #450, entre 3er y 4to anillo",
        "latitud": "-17.76823000",
        "longitud": "-63.18342000",
        "stock_disponible": 239,
        "tallas_disponibles": [
          "39",
          "40",
          "41",
          "42"
        ],
        "colores_disponibles": [
          "Cognac",
          "Marrón Suizo",
          "Negro Clásico"
        ]
      },
      {
        "id_sucursal": 2,
        "nombre_sucursal": "Sucursal Centro",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Calle 21 de Mayo esq. Ayacucho",
        "latitud": "-17.78312000",
        "longitud": "-63.18210000",
        "stock_disponible": 240,
        "tallas_disponibles": [
          "39",
          "40",
          "41",
          "42"
        ],
        "colores_disponibles": [
          "Cognac",
          "Marrón Suizo",
          "Negro Clásico"
        ]
      },
      {
        "id_sucursal": 3,
        "nombre_sucursal": "Sucursal Calacoto",
        "nombre_ciudad": "La Paz",
        "direccion": "Av. Ballivián #1200, Calle 18",
        "latitud": "-16.53982000",
        "longitud": "-68.08921000",
        "stock_disponible": 240,
        "tallas_disponibles": [
          "39",
          "40",
          "41",
          "42"
        ],
        "colores_disponibles": [
          "Cognac",
          "Marrón Suizo",
          "Negro Clásico"
        ]
      },
      {
        "id_sucursal": 4,
        "nombre_sucursal": "Sucursal El Prado",
        "nombre_ciudad": "Cochabamba",
        "direccion": "Av. Ballivián #600, El Prado",
        "latitud": "-17.38921000",
        "longitud": "-66.15672000",
        "stock_disponible": 240,
        "tallas_disponibles": [
          "39",
          "40",
          "41",
          "42"
        ],
        "colores_disponibles": [
          "Cognac",
          "Marrón Suizo",
          "Negro Clásico"
        ]
      }
    ],
    "inventario_variantes": [
      {
        "id_inventario": 33,
        "id_sucursal": 1,
        "talla": "39",
        "color": "Negro Clásico",
        "stock_fisico": 19,
        "stock_reservado": 0,
        "stock_disponible": 19,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 34,
        "id_sucursal": 1,
        "talla": "39",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 35,
        "id_sucursal": 1,
        "talla": "39",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 36,
        "id_sucursal": 1,
        "talla": "40",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 37,
        "id_sucursal": 1,
        "talla": "40",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 38,
        "id_sucursal": 1,
        "talla": "40",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 39,
        "id_sucursal": 1,
        "talla": "41",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 40,
        "id_sucursal": 1,
        "talla": "41",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 41,
        "id_sucursal": 1,
        "talla": "41",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 42,
        "id_sucursal": 1,
        "talla": "42",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 43,
        "id_sucursal": 1,
        "talla": "42",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 44,
        "id_sucursal": 1,
        "talla": "42",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 103,
        "id_sucursal": 2,
        "talla": "39",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 104,
        "id_sucursal": 2,
        "talla": "39",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 105,
        "id_sucursal": 2,
        "talla": "39",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 106,
        "id_sucursal": 2,
        "talla": "40",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 107,
        "id_sucursal": 2,
        "talla": "40",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 108,
        "id_sucursal": 2,
        "talla": "40",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 109,
        "id_sucursal": 2,
        "talla": "41",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 110,
        "id_sucursal": 2,
        "talla": "41",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 111,
        "id_sucursal": 2,
        "talla": "41",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 112,
        "id_sucursal": 2,
        "talla": "42",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 113,
        "id_sucursal": 2,
        "talla": "42",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 114,
        "id_sucursal": 2,
        "talla": "42",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 172,
        "id_sucursal": 3,
        "talla": "39",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 173,
        "id_sucursal": 3,
        "talla": "39",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 174,
        "id_sucursal": 3,
        "talla": "39",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 175,
        "id_sucursal": 3,
        "talla": "40",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 176,
        "id_sucursal": 3,
        "talla": "40",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 177,
        "id_sucursal": 3,
        "talla": "40",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 178,
        "id_sucursal": 3,
        "talla": "41",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 179,
        "id_sucursal": 3,
        "talla": "41",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 180,
        "id_sucursal": 3,
        "talla": "41",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 181,
        "id_sucursal": 3,
        "talla": "42",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 182,
        "id_sucursal": 3,
        "talla": "42",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 183,
        "id_sucursal": 3,
        "talla": "42",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 241,
        "id_sucursal": 4,
        "talla": "39",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 242,
        "id_sucursal": 4,
        "talla": "39",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 243,
        "id_sucursal": 4,
        "talla": "39",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "235.00",
        "costo_promedio_ponderado": "235.00"
      },
      {
        "id_inventario": 244,
        "id_sucursal": 4,
        "talla": "40",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 245,
        "id_sucursal": 4,
        "talla": "40",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 246,
        "id_sucursal": 4,
        "talla": "40",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "250.00",
        "costo_promedio_ponderado": "250.00"
      },
      {
        "id_inventario": 247,
        "id_sucursal": 4,
        "talla": "41",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 248,
        "id_sucursal": 4,
        "talla": "41",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 249,
        "id_sucursal": 4,
        "talla": "41",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "265.00",
        "costo_promedio_ponderado": "265.00"
      },
      {
        "id_inventario": 250,
        "id_sucursal": 4,
        "talla": "42",
        "color": "Negro Clásico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 251,
        "id_sucursal": 4,
        "talla": "42",
        "color": "Marrón Suizo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      },
      {
        "id_inventario": 252,
        "id_sucursal": 4,
        "talla": "42",
        "color": "Cognac",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "270.00",
        "costo_promedio_ponderado": "270.00"
      }
    ],
    "cpp_promedio": "255.00"
  },
  {
    "id_producto": 3,
    "codigo_sku_base": "BLAZ-LINO-003",
    "nombre": "Blazer de Lino Casual",
    "descripcion": "Chaqueta ligera desestructurada de lino italiano ideal para eventos formales y cócteles",
    "precio_base": "650.00",
    "descuento_aplicable_pct": "25.00",
    "precio_final": "487.50",
    "id_categoria": 3,
    "nombre_categoria": "Trajes y Blazers",
    "id_marca": 3,
    "nombre_marca": "Sartorial Milano",
    "id_temporada": 2,
    "codigo_temporada": "FW-2026",
    "imagen_principal": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
    "modelo_3d_glb": "https://assets.fashionstore.bo/models/blazer_lino_casual.glb",
    "colores": [
      {
        "id_color": 7,
        "color_nombre": "Azul Cobalto",
        "codigo_hex": "#0047AB",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 8,
        "color_nombre": "Gris Plomo",
        "codigo_hex": "#708090",
        "codigo_hex_secundario": null
      }
    ],
    "tallas": [
      {
        "id_talla": 9,
        "talla": "38",
        "precio": "463.13",
        "factor": 0.95,
        "medidas_cm": null
      },
      {
        "id_talla": 10,
        "talla": "40",
        "precio": "487.50",
        "factor": 1.0,
        "medidas_cm": null
      },
      {
        "id_talla": 11,
        "talla": "42",
        "precio": "511.88",
        "factor": 1.1,
        "medidas_cm": null
      }
    ],
    "stock_total_disponible": 467,
    "disponibilidad_sucursales": [
      {
        "id_sucursal": 4,
        "nombre_sucursal": "Sucursal El Prado",
        "nombre_ciudad": "Cochabamba",
        "direccion": "Av. Ballivián #600, El Prado",
        "latitud": "-17.38921000",
        "longitud": "-66.15672000",
        "stock_disponible": 107,
        "tallas_disponibles": [
          "38",
          "40",
          "42"
        ],
        "colores_disponibles": [
          "Azul Cobalto",
          "Gris Plomo"
        ]
      },
      {
        "id_sucursal": 1,
        "nombre_sucursal": "Sucursal Equipetrol",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Av. San Martín #450, entre 3er y 4to anillo",
        "latitud": "-17.76823000",
        "longitud": "-63.18342000",
        "stock_disponible": 120,
        "tallas_disponibles": [
          "38",
          "40",
          "42"
        ],
        "colores_disponibles": [
          "Azul Cobalto",
          "Gris Plomo"
        ]
      },
      {
        "id_sucursal": 2,
        "nombre_sucursal": "Sucursal Centro",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Calle 21 de Mayo esq. Ayacucho",
        "latitud": "-17.78312000",
        "longitud": "-63.18210000",
        "stock_disponible": 120,
        "tallas_disponibles": [
          "38",
          "40",
          "42"
        ],
        "colores_disponibles": [
          "Azul Cobalto",
          "Gris Plomo"
        ]
      },
      {
        "id_sucursal": 3,
        "nombre_sucursal": "Sucursal Calacoto",
        "nombre_ciudad": "La Paz",
        "direccion": "Av. Ballivián #1200, Calle 18",
        "latitud": "-16.53982000",
        "longitud": "-68.08921000",
        "stock_disponible": 120,
        "tallas_disponibles": [
          "38",
          "40",
          "42"
        ],
        "colores_disponibles": [
          "Azul Cobalto",
          "Gris Plomo"
        ]
      }
    ],
    "inventario_variantes": [
      {
        "id_inventario": 5,
        "id_sucursal": 4,
        "talla": "40",
        "color": "Gris Plomo",
        "stock_fisico": 8,
        "stock_reservado": 1,
        "stock_disponible": 7,
        "ultimo_costo_compra": "320.00",
        "costo_promedio_ponderado": "310.00"
      },
      {
        "id_inventario": 27,
        "id_sucursal": 1,
        "talla": "38",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "257.60",
        "costo_promedio_ponderado": "257.60"
      },
      {
        "id_inventario": 28,
        "id_sucursal": 1,
        "talla": "38",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "257.60",
        "costo_promedio_ponderado": "257.60"
      },
      {
        "id_inventario": 29,
        "id_sucursal": 1,
        "talla": "40",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "280.00",
        "costo_promedio_ponderado": "280.00"
      },
      {
        "id_inventario": 30,
        "id_sucursal": 1,
        "talla": "40",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "280.00",
        "costo_promedio_ponderado": "280.00"
      },
      {
        "id_inventario": 31,
        "id_sucursal": 1,
        "talla": "42",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "302.40",
        "costo_promedio_ponderado": "302.40"
      },
      {
        "id_inventario": 32,
        "id_sucursal": 1,
        "talla": "42",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "302.40",
        "costo_promedio_ponderado": "302.40"
      },
      {
        "id_inventario": 97,
        "id_sucursal": 2,
        "talla": "38",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "257.60",
        "costo_promedio_ponderado": "257.60"
      },
      {
        "id_inventario": 98,
        "id_sucursal": 2,
        "talla": "38",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "257.60",
        "costo_promedio_ponderado": "257.60"
      },
      {
        "id_inventario": 99,
        "id_sucursal": 2,
        "talla": "40",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "280.00",
        "costo_promedio_ponderado": "280.00"
      },
      {
        "id_inventario": 100,
        "id_sucursal": 2,
        "talla": "40",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "280.00",
        "costo_promedio_ponderado": "280.00"
      },
      {
        "id_inventario": 101,
        "id_sucursal": 2,
        "talla": "42",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "302.40",
        "costo_promedio_ponderado": "302.40"
      },
      {
        "id_inventario": 102,
        "id_sucursal": 2,
        "talla": "42",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "302.40",
        "costo_promedio_ponderado": "302.40"
      },
      {
        "id_inventario": 166,
        "id_sucursal": 3,
        "talla": "38",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "257.60",
        "costo_promedio_ponderado": "257.60"
      },
      {
        "id_inventario": 167,
        "id_sucursal": 3,
        "talla": "38",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "257.60",
        "costo_promedio_ponderado": "257.60"
      },
      {
        "id_inventario": 168,
        "id_sucursal": 3,
        "talla": "40",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "280.00",
        "costo_promedio_ponderado": "280.00"
      },
      {
        "id_inventario": 169,
        "id_sucursal": 3,
        "talla": "40",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "280.00",
        "costo_promedio_ponderado": "280.00"
      },
      {
        "id_inventario": 170,
        "id_sucursal": 3,
        "talla": "42",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "302.40",
        "costo_promedio_ponderado": "302.40"
      },
      {
        "id_inventario": 171,
        "id_sucursal": 3,
        "talla": "42",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "302.40",
        "costo_promedio_ponderado": "302.40"
      },
      {
        "id_inventario": 236,
        "id_sucursal": 4,
        "talla": "38",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "257.60",
        "costo_promedio_ponderado": "257.60"
      },
      {
        "id_inventario": 237,
        "id_sucursal": 4,
        "talla": "38",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "257.60",
        "costo_promedio_ponderado": "257.60"
      },
      {
        "id_inventario": 238,
        "id_sucursal": 4,
        "talla": "40",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "280.00",
        "costo_promedio_ponderado": "280.00"
      },
      {
        "id_inventario": 239,
        "id_sucursal": 4,
        "talla": "42",
        "color": "Azul Cobalto",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "302.40",
        "costo_promedio_ponderado": "302.40"
      },
      {
        "id_inventario": 240,
        "id_sucursal": 4,
        "talla": "42",
        "color": "Gris Plomo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "302.40",
        "costo_promedio_ponderado": "302.40"
      }
    ],
    "cpp_promedio": "281.25"
  },
  {
    "id_producto": 2,
    "codigo_sku_base": "PANT-CHINO-002",
    "nombre": "Pantalón Chino Gabardina",
    "descripcion": "Pantalón casual de gabardina elastizada con bolsillos traseros tipo ojal y pretina reforzada",
    "precio_base": "320.00",
    "descuento_aplicable_pct": "0.00",
    "precio_final": "320.00",
    "id_categoria": 2,
    "nombre_categoria": "Pantalones Casuales",
    "id_marca": 2,
    "nombre_marca": "Urban Tailor",
    "id_temporada": 1,
    "codigo_temporada": "SS-2026",
    "imagen_principal": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
    "modelo_3d_glb": "https://assets.fashionstore.bo/models/pant_chino_gab.glb",
    "colores": [
      {
        "id_color": 4,
        "color_nombre": "Beige Arena",
        "codigo_hex": "#F5F5DC",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 5,
        "color_nombre": "Azul Noche",
        "codigo_hex": "#191970",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 6,
        "color_nombre": "Verde Oliva",
        "codigo_hex": "#556B2F",
        "codigo_hex_secundario": null
      }
    ],
    "tallas": [
      {
        "id_talla": 5,
        "talla": "30",
        "precio": "304.00",
        "factor": 0.95,
        "medidas_cm": null
      },
      {
        "id_talla": 6,
        "talla": "32",
        "precio": "320.00",
        "factor": 1.0,
        "medidas_cm": null
      },
      {
        "id_talla": 7,
        "talla": "34",
        "precio": "336.00",
        "factor": 1.05,
        "medidas_cm": null
      },
      {
        "id_talla": 8,
        "talla": "36",
        "precio": "352.00",
        "factor": 1.1,
        "medidas_cm": null
      }
    ],
    "stock_total_disponible": 958,
    "disponibilidad_sucursales": [
      {
        "id_sucursal": 1,
        "nombre_sucursal": "Sucursal Equipetrol",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Av. San Martín #450, entre 3er y 4to anillo",
        "latitud": "-17.76823000",
        "longitud": "-63.18342000",
        "stock_disponible": 238,
        "tallas_disponibles": [
          "30",
          "32",
          "34",
          "36"
        ],
        "colores_disponibles": [
          "Azul Noche",
          "Beige Arena",
          "Verde Oliva"
        ]
      },
      {
        "id_sucursal": 2,
        "nombre_sucursal": "Sucursal Centro",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Calle 21 de Mayo esq. Ayacucho",
        "latitud": "-17.78312000",
        "longitud": "-63.18210000",
        "stock_disponible": 240,
        "tallas_disponibles": [
          "30",
          "32",
          "34",
          "36"
        ],
        "colores_disponibles": [
          "Azul Noche",
          "Beige Arena",
          "Verde Oliva"
        ]
      },
      {
        "id_sucursal": 3,
        "nombre_sucursal": "Sucursal Calacoto",
        "nombre_ciudad": "La Paz",
        "direccion": "Av. Ballivián #1200, Calle 18",
        "latitud": "-16.53982000",
        "longitud": "-68.08921000",
        "stock_disponible": 240,
        "tallas_disponibles": [
          "30",
          "32",
          "34",
          "36"
        ],
        "colores_disponibles": [
          "Azul Noche",
          "Beige Arena",
          "Verde Oliva"
        ]
      },
      {
        "id_sucursal": 4,
        "nombre_sucursal": "Sucursal El Prado",
        "nombre_ciudad": "Cochabamba",
        "direccion": "Av. Ballivián #600, El Prado",
        "latitud": "-17.38921000",
        "longitud": "-66.15672000",
        "stock_disponible": 240,
        "tallas_disponibles": [
          "30",
          "32",
          "34",
          "36"
        ],
        "colores_disponibles": [
          "Azul Noche",
          "Beige Arena",
          "Verde Oliva"
        ]
      }
    ],
    "inventario_variantes": [
      {
        "id_inventario": 3,
        "id_sucursal": 1,
        "talla": "32",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 2,
        "stock_disponible": 18,
        "ultimo_costo_compra": "140.00",
        "costo_promedio_ponderado": "135.00"
      },
      {
        "id_inventario": 16,
        "id_sucursal": 1,
        "talla": "30",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 17,
        "id_sucursal": 1,
        "talla": "30",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 18,
        "id_sucursal": 1,
        "talla": "30",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 19,
        "id_sucursal": 1,
        "talla": "32",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 20,
        "id_sucursal": 1,
        "talla": "32",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 21,
        "id_sucursal": 1,
        "talla": "34",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 22,
        "id_sucursal": 1,
        "talla": "34",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 23,
        "id_sucursal": 1,
        "talla": "34",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 24,
        "id_sucursal": 1,
        "talla": "36",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 25,
        "id_sucursal": 1,
        "talla": "36",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 26,
        "id_sucursal": 1,
        "talla": "36",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 85,
        "id_sucursal": 2,
        "talla": "30",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 86,
        "id_sucursal": 2,
        "talla": "30",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 87,
        "id_sucursal": 2,
        "talla": "30",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 88,
        "id_sucursal": 2,
        "talla": "32",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 89,
        "id_sucursal": 2,
        "talla": "32",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 90,
        "id_sucursal": 2,
        "talla": "32",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 91,
        "id_sucursal": 2,
        "talla": "34",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 92,
        "id_sucursal": 2,
        "talla": "34",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 93,
        "id_sucursal": 2,
        "talla": "34",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 94,
        "id_sucursal": 2,
        "talla": "36",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 95,
        "id_sucursal": 2,
        "talla": "36",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 96,
        "id_sucursal": 2,
        "talla": "36",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 154,
        "id_sucursal": 3,
        "talla": "30",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 155,
        "id_sucursal": 3,
        "talla": "30",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 156,
        "id_sucursal": 3,
        "talla": "30",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 157,
        "id_sucursal": 3,
        "talla": "32",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 158,
        "id_sucursal": 3,
        "talla": "32",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 159,
        "id_sucursal": 3,
        "talla": "32",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 160,
        "id_sucursal": 3,
        "talla": "34",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 161,
        "id_sucursal": 3,
        "talla": "34",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 162,
        "id_sucursal": 3,
        "talla": "34",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 163,
        "id_sucursal": 3,
        "talla": "36",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 164,
        "id_sucursal": 3,
        "talla": "36",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 165,
        "id_sucursal": 3,
        "talla": "36",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 224,
        "id_sucursal": 4,
        "talla": "30",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 225,
        "id_sucursal": 4,
        "talla": "30",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 226,
        "id_sucursal": 4,
        "talla": "30",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "119.60",
        "costo_promedio_ponderado": "119.60"
      },
      {
        "id_inventario": 227,
        "id_sucursal": 4,
        "talla": "32",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 228,
        "id_sucursal": 4,
        "talla": "32",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 229,
        "id_sucursal": 4,
        "talla": "32",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "130.00",
        "costo_promedio_ponderado": "130.00"
      },
      {
        "id_inventario": 230,
        "id_sucursal": 4,
        "talla": "34",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 231,
        "id_sucursal": 4,
        "talla": "34",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 232,
        "id_sucursal": 4,
        "talla": "34",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "140.40",
        "costo_promedio_ponderado": "140.40"
      },
      {
        "id_inventario": 233,
        "id_sucursal": 4,
        "talla": "36",
        "color": "Beige Arena",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 234,
        "id_sucursal": 4,
        "talla": "36",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      },
      {
        "id_inventario": 235,
        "id_sucursal": 4,
        "talla": "36",
        "color": "Verde Oliva",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "153.40",
        "costo_promedio_ponderado": "153.40"
      }
    ],
    "cpp_promedio": "135.95"
  },
  {
    "id_producto": 1,
    "codigo_sku_base": "SHIRT-SLIM-001",
    "nombre": "Camisa Oxford Slim Fit",
    "descripcion": "Camisa de corte entallado en 100% algodón egipcio, cuello italiano y botones nacarados",
    "precio_base": "280.00",
    "descuento_aplicable_pct": "0.00",
    "precio_final": "280.00",
    "id_categoria": 1,
    "nombre_categoria": "Camisas Formales",
    "id_marca": 1,
    "nombre_marca": "Oxford Heritage",
    "id_temporada": 1,
    "codigo_temporada": "SS-2026",
    "imagen_principal": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    "modelo_3d_glb": "https://assets.fashionstore.bo/models/shirt_oxford_slim.glb",
    "colores": [
      {
        "id_color": 1,
        "color_nombre": "Azul Marino",
        "codigo_hex": "#000080",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 2,
        "color_nombre": "Blanco Óptico",
        "codigo_hex": "#FFFFFF",
        "codigo_hex_secundario": null
      },
      {
        "id_color": 3,
        "color_nombre": "Celeste Cielo",
        "codigo_hex": "#87CEEB",
        "codigo_hex_secundario": null
      }
    ],
    "tallas": [
      {
        "id_talla": 1,
        "talla": "S",
        "precio": "266.00",
        "factor": 0.95,
        "medidas_cm": null
      },
      {
        "id_talla": 2,
        "talla": "M",
        "precio": "280.00",
        "factor": 1.0,
        "medidas_cm": null
      },
      {
        "id_talla": 3,
        "talla": "L",
        "precio": "294.00",
        "factor": 1.05,
        "medidas_cm": null
      },
      {
        "id_talla": 4,
        "talla": "XL",
        "precio": "308.00",
        "factor": 1.1,
        "medidas_cm": null
      }
    ],
    "stock_total_disponible": 1028,
    "disponibilidad_sucursales": [
      {
        "id_sucursal": 1,
        "nombre_sucursal": "Sucursal Equipetrol",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Av. San Martín #450, entre 3er y 4to anillo",
        "latitud": "-17.76823000",
        "longitud": "-63.18342000",
        "stock_disponible": 312,
        "tallas_disponibles": [
          "L",
          "M",
          "S",
          "XL"
        ],
        "colores_disponibles": [
          "Azul Marino",
          "Azul Noche",
          "Blanco Puro",
          "Blanco Óptico",
          "Celeste Cielo",
          "Negro"
        ]
      },
      {
        "id_sucursal": 3,
        "nombre_sucursal": "Sucursal Calacoto",
        "nombre_ciudad": "La Paz",
        "direccion": "Av. Ballivián #1200, Calle 18",
        "latitud": "-16.53982000",
        "longitud": "-68.08921000",
        "stock_disponible": 235,
        "tallas_disponibles": [
          "L",
          "M",
          "S",
          "XL"
        ],
        "colores_disponibles": [
          "Azul Marino",
          "Blanco Óptico",
          "Celeste Cielo"
        ]
      },
      {
        "id_sucursal": 2,
        "nombre_sucursal": "Sucursal Centro",
        "nombre_ciudad": "Santa Cruz de la Sierra",
        "direccion": "Calle 21 de Mayo esq. Ayacucho",
        "latitud": "-17.78312000",
        "longitud": "-63.18210000",
        "stock_disponible": 241,
        "tallas_disponibles": [
          "L",
          "M",
          "S",
          "XL"
        ],
        "colores_disponibles": [
          "Azul Marino",
          "Blanco Óptico",
          "Celeste Cielo"
        ]
      },
      {
        "id_sucursal": 4,
        "nombre_sucursal": "Sucursal El Prado",
        "nombre_ciudad": "Cochabamba",
        "direccion": "Av. Ballivián #600, El Prado",
        "latitud": "-17.38921000",
        "longitud": "-66.15672000",
        "stock_disponible": 240,
        "tallas_disponibles": [
          "L",
          "M",
          "S",
          "XL"
        ],
        "colores_disponibles": [
          "Azul Marino",
          "Blanco Óptico",
          "Celeste Cielo"
        ]
      }
    ],
    "inventario_variantes": [
      {
        "id_inventario": 1,
        "id_sucursal": 1,
        "talla": "M",
        "color": "Azul Marino",
        "stock_fisico": 42,
        "stock_reservado": 5,
        "stock_disponible": 37,
        "ultimo_costo_compra": "120.00",
        "costo_promedio_ponderado": "107.14"
      },
      {
        "id_inventario": 2,
        "id_sucursal": 1,
        "talla": "L",
        "color": "Blanco Óptico",
        "stock_fisico": 19,
        "stock_reservado": 0,
        "stock_disponible": 19,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 4,
        "id_sucursal": 3,
        "talla": "M",
        "color": "Azul Marino",
        "stock_fisico": 15,
        "stock_reservado": 0,
        "stock_disponible": 15,
        "ultimo_costo_compra": "115.00",
        "costo_promedio_ponderado": "115.00"
      },
      {
        "id_inventario": 6,
        "id_sucursal": 1,
        "talla": "S",
        "color": "Azul Marino",
        "stock_fisico": 19,
        "stock_reservado": 0,
        "stock_disponible": 19,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 7,
        "id_sucursal": 1,
        "talla": "S",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 8,
        "id_sucursal": 1,
        "talla": "S",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 9,
        "id_sucursal": 1,
        "talla": "M",
        "color": "Blanco Óptico",
        "stock_fisico": 19,
        "stock_reservado": 0,
        "stock_disponible": 19,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 10,
        "id_sucursal": 1,
        "talla": "M",
        "color": "Celeste Cielo",
        "stock_fisico": 19,
        "stock_reservado": 0,
        "stock_disponible": 19,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 11,
        "id_sucursal": 1,
        "talla": "L",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 12,
        "id_sucursal": 1,
        "talla": "L",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 13,
        "id_sucursal": 1,
        "talla": "XL",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 14,
        "id_sucursal": 1,
        "talla": "XL",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 15,
        "id_sucursal": 1,
        "talla": "XL",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 73,
        "id_sucursal": 2,
        "talla": "S",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 74,
        "id_sucursal": 2,
        "talla": "S",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 75,
        "id_sucursal": 2,
        "talla": "S",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 76,
        "id_sucursal": 2,
        "talla": "M",
        "color": "Azul Marino",
        "stock_fisico": 21,
        "stock_reservado": 0,
        "stock_disponible": 21,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 77,
        "id_sucursal": 2,
        "talla": "M",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 78,
        "id_sucursal": 2,
        "talla": "M",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 79,
        "id_sucursal": 2,
        "talla": "L",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 80,
        "id_sucursal": 2,
        "talla": "L",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 81,
        "id_sucursal": 2,
        "talla": "L",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 82,
        "id_sucursal": 2,
        "talla": "XL",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 83,
        "id_sucursal": 2,
        "talla": "XL",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 84,
        "id_sucursal": 2,
        "talla": "XL",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 143,
        "id_sucursal": 3,
        "talla": "S",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 144,
        "id_sucursal": 3,
        "talla": "S",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 145,
        "id_sucursal": 3,
        "talla": "S",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 146,
        "id_sucursal": 3,
        "talla": "M",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 147,
        "id_sucursal": 3,
        "talla": "M",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 148,
        "id_sucursal": 3,
        "talla": "L",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 149,
        "id_sucursal": 3,
        "talla": "L",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 150,
        "id_sucursal": 3,
        "talla": "L",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 151,
        "id_sucursal": 3,
        "talla": "XL",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 152,
        "id_sucursal": 3,
        "talla": "XL",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 153,
        "id_sucursal": 3,
        "talla": "XL",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 212,
        "id_sucursal": 4,
        "talla": "S",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 213,
        "id_sucursal": 4,
        "talla": "S",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 214,
        "id_sucursal": 4,
        "talla": "S",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "99.00",
        "costo_promedio_ponderado": "99.00"
      },
      {
        "id_inventario": 215,
        "id_sucursal": 4,
        "talla": "M",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 216,
        "id_sucursal": 4,
        "talla": "M",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 217,
        "id_sucursal": 4,
        "talla": "M",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 218,
        "id_sucursal": 4,
        "talla": "L",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 219,
        "id_sucursal": 4,
        "talla": "L",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 220,
        "id_sucursal": 4,
        "talla": "L",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "121.00",
        "costo_promedio_ponderado": "121.00"
      },
      {
        "id_inventario": 221,
        "id_sucursal": 4,
        "talla": "XL",
        "color": "Azul Marino",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 222,
        "id_sucursal": 4,
        "talla": "XL",
        "color": "Blanco Óptico",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 223,
        "id_sucursal": 4,
        "talla": "XL",
        "color": "Celeste Cielo",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "132.00",
        "costo_promedio_ponderado": "132.00"
      },
      {
        "id_inventario": 281,
        "id_sucursal": 1,
        "talla": "S",
        "color": "Blanco Puro",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "110.00",
        "costo_promedio_ponderado": "110.00"
      },
      {
        "id_inventario": 282,
        "id_sucursal": 1,
        "talla": "L",
        "color": "Azul Noche",
        "stock_fisico": 20,
        "stock_reservado": 0,
        "stock_disponible": 20,
        "ultimo_costo_compra": "95.00",
        "costo_promedio_ponderado": "95.00"
      },
      {
        "id_inventario": 283,
        "id_sucursal": 1,
        "talla": "M",
        "color": "Negro",
        "stock_fisico": 19,
        "stock_reservado": 0,
        "stock_disponible": 19,
        "ultimo_costo_compra": "126.00",
        "costo_promedio_ponderado": "126.00"
      }
    ],
    "cpp_promedio": "115.02"
  }
]''';

  static List<Map<String, dynamic>> get categorias =>
      List<Map<String, dynamic>>.from(jsonDecode(_categoriasJson));

  static List<Map<String, dynamic>> get sucursales =>
      List<Map<String, dynamic>>.from(jsonDecode(_sucursalesJson));

  static List<Map<String, dynamic>> get prendas =>
      List<Map<String, dynamic>>.from(jsonDecode(_prendasJson));
}
