# -*- coding: utf-8 -*-
"""
Servicios de IA: Recomendaciones Contextuales y Búsqueda Semántica por Voz (M17 - CU22, CU23)
"""
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.modules.p03_catalogo_estilismo_ia.productos.models import Producto, Categoria, Marca, ProductoColor, ProductoTalla
from app.modules.p03_catalogo_estilismo_ia.ia_recomendaciones.schemas import (
    ClimaLocalDTO,
    PrendaOutfitDTO,
    OutfitRecomendadoDTO,
    RecomendacionesContextualesResponse,
    PrendaResultadoBusquedaDTO,
    BusquedaVozResponse
)

DATOS_CLIMA_CIUDADES: Dict[str, Dict[str, Any]] = {
    "Santa Cruz": {
        "ciudad": "Santa Cruz de la Sierra",
        "temperatura_c": 28.5,
        "sensacion_c": 31.0,
        "condicion": "Cálido y Soleado",
        "descripcion_clima": "Clima tropical cálido con brisa moderada.",
        "icono_clima": "sunny",
        "recomendacion_textil": "Recomendamos lino puro 100%, algodón pima transpirable y tonos claros para refractar la radiación térmica."
    },
    "La Paz": {
        "ciudad": "La Paz",
        "temperatura_c": 13.5,
        "sensacion_c": 11.0,
        "condicion": "Fresco Andino",
        "descripcion_clima": "Ambiente de altura fresco con vientos secos.",
        "icono_clima": "ac_unit",
        "recomendacion_textil": "Recomendamos blazers estructurados, paños de lana fría, trajes ejecutivos completos y calzado formal cerrado."
    },
    "Cochabamba": {
        "ciudad": "Cochabamba",
        "temperatura_c": 22.0,
        "sensacion_c": 22.0,
        "condicion": "Templado Primaveral",
        "descripcion_clima": "Clima primaveral idóneo para contrastes smart casual.",
        "icono_clima": "wb_sunny",
        "recomendacion_textil": "Prendas semi-estructuradas, pantalones chino de gabardina suave y camisas de corte clásico remangables."
    }
}


def resolver_clima(ciudad_nombre: Optional[str] = None) -> ClimaLocalDTO:
    if not ciudad_nombre:
        info = DATOS_CLIMA_CIUDADES["Santa Cruz"]
    else:
        # Match parcial
        c_lower = ciudad_nombre.lower()
        if "paz" in c_lower:
            info = DATOS_CLIMA_CIUDADES["La Paz"]
        elif "cocha" in c_lower:
            info = DATOS_CLIMA_CIUDADES["Cochabamba"]
        else:
            info = DATOS_CLIMA_CIUDADES["Santa Cruz"]

    return ClimaLocalDTO(
        ciudad=info["ciudad"],
        temperatura_c=info["temperatura_c"],
        sensacion_c=info["sensacion_c"],
        condicion=info["condicion"],
        descripcion_clima=info["descripcion_clima"],
        icono_clima=info["icono_clima"],
        recomendacion_textil=info["recomendacion_textil"]
    )


def _calcular_descuento(temporada) -> float:
    if temporada and getattr(temporada, 'estado', None) == "LIQUIDACION":
        desc = getattr(temporada, 'descuento_liquidacion', 0.0)
        return float(desc) if desc else 0.0
    return 0.0


def generar_outfits_contextuales(
    db: Session,
    ciudad_nombre: Optional[str] = None,
    ocasion: Optional[str] = "TODAS"
) -> RecomendacionesContextualesResponse:
    clima = resolver_clima(ciudad_nombre)
    productos = db.query(Producto).filter(Producto.estado == "PUBLICADO").all()

    # Mapeo rápido de productos por SKU / nombre
    def buscar_producto(termino: str) -> Optional[Producto]:
        for p in productos:
            if termino.lower() in p.nombre.lower() or termino.lower() in p.codigo_sku_base.lower():
                return p
        return productos[0] if productos else None

    # Encontrar prendas representativas
    p_camisa_lino = buscar_producto("lino mao") or buscar_producto("camisa")
    p_camisa_oxford = buscar_producto("oxford slim") or buscar_producto("camisa")
    p_blazer = buscar_producto("blazer") or buscar_producto("traje")
    p_traje = buscar_producto("suit") or buscar_producto("traje") or p_blazer
    p_pantalon_chino = buscar_producto("chino") or buscar_producto("pant")
    p_zapatos_oxford = buscar_producto("oxford") or buscar_producto("shoes")
    p_mocasines = buscar_producto("mocasines") or buscar_producto("mocas")
    p_polo = buscar_producto("polo") or p_camisa_lino

    outfits = []

    # Helper para convertir Producto a PrendaOutfitDTO
    def to_prenda_dto(prod: Producto, color_def: str, hex_def: str, talla_def: str) -> PrendaOutfitDTO:
        p_base = float(prod.precio_base)
        desc = _calcular_descuento(prod.temporada)
        p_final = round(p_base * (1.0 - (desc / 100.0)), 2)
        
        # Intentar obtener color real si existe
        c_nombre = color_def
        c_hex = hex_def
        if prod.colores:
            c_nombre = prod.colores[0].color_nombre
            c_hex = prod.colores[0].codigo_hex

        t_nombre = talla_def
        if prod.tallas:
            t_nombre = prod.tallas[0].talla

        return PrendaOutfitDTO(
            id_producto=prod.id_producto,
            codigo_sku_base=prod.codigo_sku_base,
            nombre=prod.nombre,
            categoria=prod.categoria.nombre_categoria if prod.categoria else "Prenda",
            precio_base=p_base,
            precio_final=p_final,
            descuento_pct=desc,
            imagen_principal=prod.imagen_principal,
            color_sugerido=c_nombre,
            color_hex=c_hex,
            talla_sugerida=t_nombre,
            modelo_3d_glb=prod.modelo_3d_glb
        )

    # 1. Outfit: Business Executive / Formal
    if p_traje and p_camisa_oxford and p_zapatos_oxford:
        prendas_1 = [
            to_prenda_dto(p_traje, "Azul Noche", "#0B1D3A", "40"),
            to_prenda_dto(p_camisa_oxford, "Blanco Puro", "#FFFFFF", "M"),
            to_prenda_dto(p_zapatos_oxford, "Marrón Coñac", "#5C2C16", "41")
        ]
        total_orig_1 = sum(p.precio_base for p in prendas_1)
        total_fin_1 = sum(p.precio_final for p in prendas_1)
        afinidad_1 = 96 if clima.temperatura_c < 24 else 88

        outfits.append(OutfitRecomendadoDTO(
            id_outfit="outfit_executive",
            titulo="Traje Ejecutivo de Alta Distinción",
            ocasion="Reunión de Negocios / Formal",
            estilo="Sartorial Formal",
            afinidad_climatica_pct=afinidad_1,
            analisis_estilista_ia="Corte Slim fit contemporáneo con entalle milimétrico en hombros. La combinación de lana fría y algodón de 120 hilos proporciona una caída impecable.",
            regla_colorimetria="Armonía triádica formal: Azul Marino de contraste profundo acentuado con blanco óptico y calzado en cuero café oscuro.",
            prendas=prendas_1,
            precio_total_original=round(total_orig_1, 2),
            precio_total_final=round(total_fin_1, 2),
            ahorro_total=round(total_orig_1 - total_fin_1, 2)
        ))

    # 2. Outfit: Smart Casual Tropical / Clima Templado
    if p_camisa_lino and p_pantalon_chino and p_mocasines:
        prendas_2 = [
            to_prenda_dto(p_camisa_lino, "Blanco / Arena", "#F5F5DC", "M"),
            to_prenda_dto(p_pantalon_chino, "Azul Marino", "#1B2A47", "32"),
            to_prenda_dto(p_mocasines, "Marrón Cuero", "#4A2E18", "41")
        ]
        total_orig_2 = sum(p.precio_base for p in prendas_2)
        total_fin_2 = sum(p.precio_final for p in prendas_2)
        afinidad_2 = 99 if clima.temperatura_c >= 22 else 90

        outfits.append(OutfitRecomendadoDTO(
            id_outfit="outfit_resort",
            titulo="Smart Casual Lino & Chino",
            ocasion="Cena Casual / Evento de Tarde",
            estilo="Casual Elegante",
            afinidad_climatica_pct=afinidad_2,
            analisis_estilista_ia=f"Alineado con los {clima.temperatura_c}°C de {clima.ciudad}. El lino 100% natural ofrece máxima ventilación sin perder estructura refinada.",
            regla_colorimetria="Paleta mediterránea neutra: Blanco lino transpirable con contraste en pantalón azul y calzado mocasín sin medias visibles.",
            prendas=prendas_2,
            precio_total_original=round(total_orig_2, 2),
            precio_total_final=round(total_fin_2, 2),
            ahorro_total=round(total_orig_2 - total_fin_2, 2)
        ))

    # 3. Outfit: Modern Gentleman (Blazer + Chino + Mocasines)
    if p_blazer and p_polo and p_pantalon_chino:
        prendas_3 = [
            to_prenda_dto(p_blazer, "Azul Índigo", "#1A365D", "40"),
            to_prenda_dto(p_polo, "Gris Perla", "#D1D5DB", "L"),
            to_prenda_dto(p_pantalon_chino, "Beige Claro", "#E2D9C8", "32")
        ]
        total_orig_3 = sum(p.precio_base for p in prendas_3)
        total_fin_3 = sum(p.precio_final for p in prendas_3)

        outfits.append(OutfitRecomendadoDTO(
            id_outfit="outfit_blazer_modern",
            titulo="Blazer Urbano Versátil",
            ocasion="Coctel / Salida de Fin de Semana",
            estilo="Modern Gentleman",
            afinidad_climatica_pct=94,
            analisis_estilista_ia="Desestructuración sutil en el blazer para una silueta relajada pero sumamente pulcra en cualquier entorno social.",
            regla_colorimetria="Contraste de valor: Blazer azul profundo sobre base clara arena y neutro perla.",
            prendas=prendas_3,
            precio_total_original=round(total_orig_3, 2),
            precio_total_final=round(total_fin_3, 2),
            ahorro_total=round(total_orig_3 - total_fin_3, 2)
        ))

    # Filtrar por ocasión si se solicita
    if ocasion and ocasion != "TODAS":
        filtrados = [o for o in outfits if ocasion.lower() in o.ocasion.lower() or ocasion.lower() in o.titulo.lower()]
        if filtrados:
            outfits = filtrados

    return RecomendacionesContextualesResponse(
        ciudad=clima.ciudad,
        clima=clima,
        ocasion_seleccionada=ocasion or "TODAS",
        total_outfits=len(outfits),
        outfits_recomendados=outfits
    )


def procesar_busqueda_voz_semantica(db: Session, consulta_voz: str) -> BusquedaVozResponse:
    texto = consulta_voz.lower().strip()
    productos = db.query(Producto).filter(Producto.estado == "PUBLICADO").all()

    # Detección de intenciones
    intencion = "Búsqueda general de moda masculina"
    ocasion = None
    categoria = None

    if any(w in texto for w in ["formal", "boda", "gala", "elegante", "oficina", "trabajo", "graduacion"]):
        ocasion = "Formal / Ceremonia"
        intencion = "Indumentaria formal y ejecutiva para eventos de gala o negocios"
    elif any(w in texto for w in ["calor", "playa", "fresco", "verano", "tropical"]):
        ocasion = "Clima Cálido / Verano"
        intencion = "Prendas de lino y algodón fresco transpirable"
    elif any(w in texto for w in ["casual", "salida", "amigos", "diario", "fin de semana"]):
        ocasion = "Casual / Diario"
        intencion = "Look relajado y contemporáneo"

    # Detección de prenda
    if "traje" in texto or "terno" in texto:
        categoria = "Trajes y Ternas"
    elif "blazer" in texto or "saco" in texto:
        categoria = "Blazers"
    elif "camisa" in texto:
        categoria = "Camisas"
    elif "polo" in texto:
        categoria = "Polos"
    elif "pantalon" in texto or "chino" in texto:
        categoria = "Pantalones"
    elif "zapato" in texto or "calzado" in texto or "mocas" in texto:
        categoria = "Calzado"

    # Ponderación semántica de productos
    resultados: List[PrendaResultadoBusquedaDTO] = []
    palabras_consulta = set(re.findall(r'\w+', texto))

    for p in productos:
        score = 0
        motivos = []
        p_nombre_lower = p.nombre.lower()
        p_desc_lower = (p.descripcion or "").lower()
        p_cat_lower = (p.categoria.nombre_categoria if p.categoria else "").lower()

        # Coincidencia directa de palabras
        for w in palabras_consulta:
            if len(w) <= 2:
                continue
            if w in p_nombre_lower:
                score += 35
                motivos.append(f"Coincidencia en nombre ('{w}')")
            elif w in p_desc_lower:
                score += 20
                motivos.append(f"Mención en descripción ('{w}')")
            elif w in p_cat_lower:
                score += 25
                motivos.append(f"Categoría ('{p_cat_lower}')")

        # Reglas contextuales
        if "calor" in texto or "fresco" in texto or "lino" in texto:
            if "lino" in p_nombre_lower or "pima" in p_nombre_lower:
                score += 40
                motivos.append("Fibra textil fresca óptima para calor")

        if "formal" in texto or "boda" in texto or "elegante" in texto:
            if "traje" in p_nombre_lower or "blazer" in p_nombre_lower or "oxford" in p_nombre_lower:
                score += 40
                motivos.append("Estilo formal de alta etiqueta")

        # Color en texto
        for col in p.colores:
            if col.color_nombre.lower() in texto:
                score += 30
                motivos.append(f"Color disponible ({col.color_nombre})")

        if score > 0:
            p_base = float(p.precio_base)
            desc = _calcular_descuento(p.temporada)
            p_final = round(p_base * (1.0 - (desc / 100.0)), 2)
            colores_list = [c.color_nombre for c in p.colores] if p.colores else ["Único"]

            resultados.append(PrendaResultadoBusquedaDTO(
                id_producto=p.id_producto,
                codigo_sku_base=p.codigo_sku_base,
                nombre=p.nombre,
                categoria=p.categoria.nombre_categoria if p.categoria else "Prenda",
                precio_final=p_final,
                descuento_pct=desc,
                imagen_principal=p.imagen_principal,
                modelo_3d_glb=p.modelo_3d_glb,
                colores_disponibles=colores_list,
                relevancia_score=score,
                motivo_coincidencia=", ".join(motivos[:2]) if motivos else "Afinidad semántica general"
            ))

    # Ordenar por score descendente
    resultados.sort(key=lambda x: x.relevancia_score, reverse=True)

    # Si no hubo coincidencia por palabras clave exactas, sugerir las mejores prendas del catálogo
    if not resultados and productos:
        for p in productos[:4]:
            p_base = float(p.precio_base)
            desc = _calcular_descuento(p.temporada)
            resultados.append(PrendaResultadoBusquedaDTO(
                id_producto=p.id_producto,
                codigo_sku_base=p.codigo_sku_base,
                nombre=p.nombre,
                categoria=p.categoria.nombre_categoria if p.categoria else "Prenda",
                precio_final=round(p_base * (1.0 - (desc / 100.0)), 2),
                descuento_pct=desc,
                imagen_principal=p.imagen_principal,
                modelo_3d_glb=p.modelo_3d_glb,
                colores_disponibles=[c.color_nombre for c in p.colores] if p.colores else ["Estándar"],
                relevancia_score=50,
                motivo_coincidencia="Sugerencia destacada del catálogo"
            ))

    return BusquedaVozResponse(
        consulta_original=consulta_voz,
        intencion_detectada=intencion,
        ocasion_detectada=ocasion,
        categoria_detectada=categoria,
        total_encontrados=len(resultados),
        prendas_sugeridas=resultados
    )
