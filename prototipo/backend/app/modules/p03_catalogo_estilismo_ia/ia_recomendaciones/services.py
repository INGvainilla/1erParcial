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

import urllib.request
import json
import time

COORDENADAS_CIUDADES_BOLIVIA: Dict[str, Dict[str, Any]] = {
    "Santa Cruz": {
        "ciudad": "Santa Cruz de la Sierra",
        "lat": -17.7833,
        "lon": -63.1821,
        "default_temp": 29.0,
        "default_sens": 31.0,
        "default_hum": 55,
        "default_viento": 18.0,
        "default_cond": "Cálido Tropical",
        "icono": "sunny"
    },
    "La Paz": {
        "ciudad": "La Paz",
        "lat": -16.5000,
        "lon": -68.1500,
        "default_temp": 15.0,
        "default_sens": 13.0,
        "default_hum": 25,
        "default_viento": 12.0,
        "default_cond": "Fresco Andino",
        "icono": "ac_unit"
    },
    "Cochabamba": {
        "ciudad": "Cochabamba",
        "lat": -17.3895,
        "lon": -66.1568,
        "default_temp": 24.0,
        "default_sens": 23.5,
        "default_hum": 20,
        "default_viento": 10.0,
        "default_cond": "Templado Primaveral",
        "icono": "wb_sunny"
    },
    "Sucre": {
        "ciudad": "Sucre",
        "lat": -19.0333,
        "lon": -65.2627,
        "default_temp": 23.0,
        "default_sens": 22.0,
        "default_hum": 22,
        "default_viento": 9.0,
        "default_cond": "Templado Colonial",
        "icono": "wb_sunny"
    },
    "Tarija": {
        "ciudad": "Tarija",
        "lat": -21.5355,
        "lon": -64.7296,
        "default_temp": 26.5,
        "default_sens": 27.0,
        "default_hum": 35,
        "default_viento": 11.0,
        "default_cond": "Cálido Valle",
        "icono": "sunny"
    }
}

# Cache en memoria para clima (duración: 10 minutos)
_CACHE_CLIMA: Dict[str, Dict[str, Any]] = {}


def resolver_clima(ciudad_nombre: Optional[str] = None) -> ClimaLocalDTO:
    """
    Obtiene la telemetría climática en tiempo real mediante Open-Meteo Satelital
    con fallback robusto a cálculo meteorológico estacional.
    """
    target_key = "Santa Cruz"
    if ciudad_nombre:
        c_lower = ciudad_nombre.lower().strip()
        if "paz" in c_lower:
            target_key = "La Paz"
        elif "cocha" in c_lower:
            target_key = "Cochabamba"
        elif "sucre" in c_lower:
            target_key = "Sucre"
        elif "tarija" in c_lower:
            target_key = "Tarija"

    info_base = COORDENADAS_CIUDADES_BOLIVIA[target_key]
    ahora = time.time()

    # Revisar cache
    cached = _CACHE_CLIMA.get(target_key)
    if cached and (ahora - cached["timestamp"] < 600):
        return cached["dto"]

    # Intentar llamada a Open-Meteo en vivo
    try:
        lat = info_base["lat"]
        lon = info_base["lon"]
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,"
            f"apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "FashionStore-AI-Meteo/2.0"})
        with urllib.request.urlopen(req, timeout=1.8) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            current = data.get("current", {})

            temp_val = round(float(current.get("temperature_2m", info_base["default_temp"])), 1)
            sens_val = round(float(current.get("apparent_temperature", temp_val)), 1)
            hum_val = int(current.get("relative_humidity_2m", info_base["default_hum"]))
            viento_val = round(float(current.get("wind_speed_10m", info_base["default_viento"])), 1)
            code = int(current.get("weather_code", 0))

            # Mapeo de código WMO a condición visual
            if code == 0:
                cond_str = "Despejado y Soleado"
                icon_str = "sunny"
            elif code in [1, 2, 3]:
                cond_str = "Parcialmente Nublado"
                icon_str = "wb_sunny"
            elif code in [45, 48]:
                cond_str = "Neblina Matinal"
                icon_str = "cloud"
            elif code in [51, 53, 55, 61, 63, 65, 80, 81]:
                cond_str = "Lluvia Ligera / Chubascos"
                icon_str = "umbrella"
            elif code in [71, 73, 75, 85]:
                cond_str = "Frío Intenso de Altura"
                icon_str = "ac_unit"
            else:
                cond_str = "Cielo Variable"
                icon_str = "wb_sunny"

            # Recomendación textil inteligente adaptada a la temperatura real
            if temp_val >= 27.0:
                rec_textil = (
                    f"Con {temp_val}°C en {info_base['ciudad']}, priorizamos lino natural 100%, "
                    f"algodón Pima liviano y tonos claros para máxima reflectancia solar y transpirabilidad."
                )
            elif temp_val < 18.0:
                rec_textil = (
                    f"Con {temp_val}°C en {info_base['ciudad']}, se recomiendan tejidos estructurados, "
                    f"blazers de lana fría, trajes completos con chaleco y calzado formal cerrado."
                )
            else:
                rec_textil = (
                    f"Con {temp_val}°C en {info_base['ciudad']}, el equilibrio ideal es Smart Casual: "
                    f"pantalón chino, camisa clásica remangable y blazer desestructurado opcional."
                )

            dto = ClimaLocalDTO(
                ciudad=info_base["ciudad"],
                temperatura_c=temp_val,
                sensacion_c=sens_val,
                condicion=cond_str,
                descripcion_clima=f"Telemetría en tiempo real: {temp_val}°C, humedad {hum_val}%, viento {viento_val} km/h.",
                icono_clima=icon_str,
                recomendacion_textil=rec_textil,
                humedad_pct=hum_val,
                viento_kmh=viento_val,
                fuente_meteo="Open-Meteo Satelital en Vivo",
                es_tiempo_real=True
            )
            _CACHE_CLIMA[target_key] = {"dto": dto, "timestamp": ahora}
            return dto

    except Exception:
        # Fallback a datos estructurados
        temp_val = info_base["default_temp"]
        sens_val = info_base["default_sens"]
        rec_textil = (
            f"Recomendamos prendas transpirables de corte sartorial y tejidos naturales "
            f"adaptados a los {temp_val}°C promedio de {info_base['ciudad']}."
        )
        dto = ClimaLocalDTO(
            ciudad=info_base["ciudad"],
            temperatura_c=temp_val,
            sensacion_c=sens_val,
            condicion=info_base["default_cond"],
            descripcion_clima=f"Condiciones estándar para {info_base['ciudad']}.",
            icono_clima=info_base["icono"],
            recomendacion_textil=rec_textil,
            humedad_pct=info_base["default_hum"],
            viento_kmh=info_base["default_viento"],
            fuente_meteo="Estimación Dinámica Estacional",
            es_tiempo_real=False
        )
        return dto


def _calcular_descuento(temporada) -> float:
    if temporada and getattr(temporada, 'estado', None) == "LIQUIDACION":
        desc = getattr(temporada, 'descuento_liquidacion', 0.0)
        return float(desc) if desc else 0.0
    return 0.0


def generar_outfits_contextuales(
    db: Session,
    ciudad_nombre: Optional[str] = None,
    ocasion: Optional[str] = "TODAS",
    temporada: Optional[str] = "TODAS",
    estilo: Optional[str] = "TODOS",
    presupuesto: Optional[str] = "TODOS",
    prompt_ia: Optional[str] = None,
    filtro_clima: Optional[str] = "AUTO"
) -> RecomendacionesContextualesResponse:
    clima = resolver_clima(ciudad_nombre)

    # Si el usuario selecciona un filtro de rango térmico explícito
    if filtro_clima and filtro_clima.upper() != "AUTO":
        fc = filtro_clima.upper()
        if "CALIDO" in fc or "CÁLIDO" in fc or ">26" in fc:
            clima.temperatura_c = 31.0
            clima.sensacion_c = 32.5
            clima.condicion = "Cálido Tropical (>26°C)"
            clima.icono_clima = "sunny"
            clima.recomendacion_textil = "Rango cálido: lino puro 100%, algodón pima transpirable, camisas remangables y tonos claros refractarios."
        elif "TEMPLADO" in fc or "19" in fc or "25" in fc:
            clima.temperatura_c = 22.0
            clima.sensacion_c = 21.5
            clima.condicion = "Templado Valle (19°C - 25°C)"
            clima.icono_clima = "wb_sunny"
            clima.recomendacion_textil = "Rango templado: combinaciones versátiles Smart Casual con pantalones chino, polos y blazers desestructurados."
        elif "FRIO" in fc or "FRÍO" in fc or "<18" in fc or "ANDINO" in fc:
            clima.temperatura_c = 13.0
            clima.sensacion_c = 11.5
            clima.condicion = "Frío Andino (<18°C)"
            clima.icono_clima = "ac_unit"
            clima.recomendacion_textil = "Rango frío: blazers estructurados, prendas de lana fría, trajes ejecutivos con chaleco y calzado cerrado."
        elif "LLUVIA" in fc or "LLUVIOSO" in fc:
            clima.temperatura_c = 18.5
            clima.sensacion_c = 17.5
            clima.condicion = "Lluvioso / Húmedo"
            clima.icono_clima = "umbrella"
            clima.recomendacion_textil = "Rango húmedo: calzado de cuero tratado, prendas de alta densidad y capas intermedias resistentes a la humedad."

    productos = db.query(Producto).filter(Producto.estado == "PUBLICADO").all()

    def buscar_producto(termino: str) -> Optional[Producto]:
        for p in productos:
            if termino.lower() in p.nombre.lower() or termino.lower() in p.codigo_sku_base.lower():
                return p
        return productos[0] if productos else None

    # Prenda base
    p_camisa_lino = buscar_producto("lino mao") or buscar_producto("camisa")
    p_camisa_oxford = buscar_producto("oxford slim") or buscar_producto("camisa")
    p_blazer = buscar_producto("blazer") or buscar_producto("traje")
    p_traje = buscar_producto("suit") or buscar_producto("traje") or p_blazer
    p_pantalon_chino = buscar_producto("chino") or buscar_producto("pant")
    p_zapatos_oxford = buscar_producto("oxford") or buscar_producto("shoes")
    p_mocasines = buscar_producto("mocasines") or buscar_producto("mocas")
    p_polo = buscar_producto("polo") or p_camisa_lino

    outfits = []

    def to_prenda_dto(prod: Producto, color_def: str, hex_def: str, talla_def: str) -> PrendaOutfitDTO:
        p_base = float(prod.precio_base)
        desc = _calcular_descuento(prod.temporada)
        p_final = round(p_base * (1.0 - (desc / 100.0)), 2)
        
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
        afinidad_1 = 98 if clima.temperatura_c < 22 else 88

        outfits.append(OutfitRecomendadoDTO(
            id_outfit="outfit_executive",
            titulo="Traje Ejecutivo de Alta Distinción",
            ocasion="Formal",
            estilo="Sartorial Formal",
            afinidad_climatica_pct=afinidad_1,
            analisis_estilista_ia=f"Corte Slim fit contemporáneo calibrado para los {clima.temperatura_c}°C de {clima.ciudad}. Proporciona presencia jerárquica con entalle milimétrico en hombros y tejido de lana fría.",
            regla_colorimetria="Armonía triádica formal: Azul Marino de contraste profundo acentuado con blanco óptico y calzado en cuero café oscuro.",
            prendas=prendas_1,
            precio_total_original=round(total_orig_1, 2),
            precio_total_final=round(total_fin_1, 2),
            ahorro_total=round(total_orig_1 - total_fin_1, 2)
        ))

    # 2. Outfit: Smart Casual Tropical / Lino & Chino
    if p_camisa_lino and p_pantalon_chino and p_mocasines:
        prendas_2 = [
            to_prenda_dto(p_camisa_lino, "Blanco / Arena", "#F5F5DC", "M"),
            to_prenda_dto(p_pantalon_chino, "Azul Marino", "#1B2A47", "32"),
            to_prenda_dto(p_mocasines, "Marrón Cuero", "#4A2E18", "41")
        ]
        total_orig_2 = sum(p.precio_base for p in prendas_2)
        total_fin_2 = sum(p.precio_final for p in prendas_2)
        afinidad_2 = 99 if clima.temperatura_c >= 22 else 91

        outfits.append(OutfitRecomendadoDTO(
            id_outfit="outfit_resort",
            titulo="Smart Casual Lino & Chino",
            ocasion="Casual",
            estilo="Smart Casual",
            afinidad_climatica_pct=afinidad_2,
            analisis_estilista_ia=f"Optimizado para clima {clima.condicion.lower()} ({clima.temperatura_c}°C). El lino 100% natural maximiza la ventilación corporal manteniendo un porte pulcro y sofisticado.",
            regla_colorimetria="Paleta mediterránea neutra: Blanco lino transpirable con contraste en pantalón azul y calzado mocasín en cuero natural.",
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
        afinidad_3 = 96 if (18 <= clima.temperatura_c <= 26) else 90

        outfits.append(OutfitRecomendadoDTO(
            id_outfit="outfit_blazer_modern",
            titulo="Blazer Urbano Versátil",
            ocasion="Cena / Gala",
            estilo="Old Money Elegance",
            afinidad_climatica_pct=afinidad_3,
            analisis_estilista_ia=f"Construcción semidesestructurada ideal para transiciones térmicas en {clima.ciudad}. El blazer protege de la brisa mientras el polo de pima conserva frescura interior.",
            regla_colorimetria="Contraste de valor tonal: Saco azul profundo sobre base clara arena y neutro perla para una imagen limpia y cosmopolita.",
            prendas=prendas_3,
            precio_total_original=round(total_orig_3, 2),
            precio_total_final=round(total_fin_3, 2),
            ahorro_total=round(total_orig_3 - total_fin_3, 2)
        ))

    # 4. Outfit: Casual Urbano Minimalista
    if p_polo and p_pantalon_chino and p_mocasines:
        prendas_4 = [
            to_prenda_dto(p_polo, "Azul Marino", "#1B2A47", "M"),
            to_prenda_dto(p_pantalon_chino, "Beige Arena", "#E2D9C8", "32"),
            to_prenda_dto(p_mocasines, "Marrón Cuero", "#4A2E18", "41")
        ]
        total_orig_4 = sum(p.precio_base for p in prendas_4)
        total_fin_4 = sum(p.precio_final for p in prendas_4)
        afinidad_4 = 95 if clima.temperatura_c >= 20 else 89

        outfits.append(OutfitRecomendadoDTO(
            id_outfit="outfit_casual_urban",
            titulo="Casual Urbano Minimalista",
            ocasion="Casual",
            estilo="Casual Urbano",
            afinidad_climatica_pct=afinidad_4,
            analisis_estilista_ia=f"Comodidad sin esfuerzo pensada para la jornada actual ({clima.temperatura_c}°C). Ideal para fines de semana, reuniones informales o salidas al atardecer.",
            regla_colorimetria="Bicolor atemporal: Azul marino profundo y beige tostado que realza tonos de piel cálidos y neutros.",
            prendas=prendas_4,
            precio_total_original=round(total_orig_4, 2),
            precio_total_final=round(total_fin_4, 2),
            ahorro_total=round(total_orig_4 - total_fin_4, 2)
        ))

    # FILTROS DINÁMICOS DEL ASISTENTE IA

    # 1. Filtro por Ocasión
    if ocasion and ocasion.upper() != "TODAS":
        oc_clean = ocasion.lower()
        filtrados_oc = [
            o for o in outfits
            if oc_clean in o.ocasion.lower() or oc_clean in o.titulo.lower() or oc_clean in o.estilo.lower()
        ]
        if filtrados_oc:
            outfits = filtrados_oc

    # 2. Filtro por Estilo
    if estilo and estilo.upper() != "TODOS":
        est_clean = estilo.lower()
        filtrados_est = [o for o in outfits if est_clean in o.estilo.lower()]
        if filtrados_est:
            outfits = filtrados_est

    # 3. Filtro por Presupuesto
    if presupuesto and presupuesto.upper() != "TODOS":
        if "< 500" in presupuesto or "accesible" in presupuesto.lower():
            outfits_pres = [o for o in outfits if o.precio_total_final <= 600]
        elif "500 - 1200" in presupuesto or "500" in presupuesto:
            outfits_pres = [o for o in outfits if 500 <= o.precio_total_final <= 1250]
        elif "> 1200" in presupuesto or "lujo" in presupuesto.lower():
            outfits_pres = [o for o in outfits if o.precio_total_final >= 1000]
        else:
            outfits_pres = outfits
        if outfits_pres:
            outfits = outfits_pres

    # 4. Filtro semántico por Prompt de IA (si el usuario escribió algo libre)
    if prompt_ia and prompt_ia.strip():
        p_clean = prompt_ia.lower()
        for o in outfits:
            bonus = 0
            if any(w in p_clean for w in ["boda", "gala", "matrimonio", "ejecutivo", "negocio"]) and "formal" in o.ocasion.lower():
                bonus += 5
            if any(w in p_clean for w in ["calor", "playa", "fresco", "verano"]) and ("lino" in o.titulo.lower() or "casual" in o.ocasion.lower()):
                bonus += 5
            if any(w in p_clean for w in ["cena", "noche", "elegante", "blazer"]) and ("blazer" in o.titulo.lower() or "gala" in o.ocasion.lower()):
                bonus += 5
            o.afinidad_climatica_pct = min(100, o.afinidad_climatica_pct + bonus)

    # Ordenar por afinidad higrotérmica y estilística descendente
    outfits.sort(key=lambda x: x.afinidad_climatica_pct, reverse=True)

    # Redacción de Razonamiento del Asistente IA
    if filtro_clima and filtro_clima.upper() != "AUTO":
        origen_clima = f"Filtro Térmico Aplicado: {clima.condicion} ({clima.temperatura_c}°C simulada)"
    else:
        origen_clima = f"Telemetría Satelital en Vivo para {clima.ciudad}: {clima.temperatura_c}°C (Sensación: {clima.sensacion_c}°C, Humedad: {clima.humedad_pct or 45}%, {clima.condicion.lower()})"

    razonamiento = (
        f"{origen_clima}. El motor de Inteligencia Artificial evaluó el balance higrotérmico y tus preferencias "
        f"({ocasion if ocasion != 'TODAS' else 'Cualquier ocasión'}, Estilo: {estilo or 'Versátil'}) "
        f"para generar combinaciones con máxima afinidad textil, armonía cromática y existencias reales en catálogo."
    )

    return RecomendacionesContextualesResponse(
        ciudad=clima.ciudad,
        clima=clima,
        ocasion_seleccionada=ocasion or "TODAS",
        temporada_seleccionada=temporada or "TODAS",
        estilo_seleccionado=estilo or "TODOS",
        presupuesto_seleccionado=presupuesto or "TODOS",
        filtro_clima_seleccionado=filtro_clima or "AUTO",
        prompt_ia=prompt_ia,
        razonamiento_ia=razonamiento,
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
