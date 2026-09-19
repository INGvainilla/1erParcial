# -*- coding: utf-8 -*-
"""
Servicios de Negocio: Fidelización Gamificada (M16 - CU21)
"""
import json
import uuid
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.modules.auth.models import Usuario
from app.modules.ordenes.models import OrdenVenta
from app.modules.reservas.models import Reserva
from app.modules.gamificacion.models import GamificacionPerfil
from app.modules.gamificacion.schemas import (
    GamificacionPerfilResponse,
    InsigniaDTO,
    RecompensaDTO,
    CanjeResponse
)

CATALOGO_INSIGNIAS = [
    {
        "id": "primer_pedido",
        "nombre": "Primer Estilo",
        "descripcion": "Realizaste tu primera orden de compra formal en FashionStore.",
        "icono": "shopping_bag"
    },
    {
        "id": "vestidor_3d",
        "nombre": "Visionario 3D",
        "descripcion": "Experimentaste el vestidor virtual con Realidad Aumentada.",
        "icono": "view_in_ar"
    },
    {
        "id": "explorador_voz",
        "nombre": "Comando de Voz",
        "descripcion": "Utilizaste la búsqueda inteligente asistida por comandos de voz.",
        "icono": "mic"
    },
    {
        "id": "reserva_boutique",
        "nombre": "Cita en Tienda",
        "descripcion": "Agendaste una reserva presencial de prendas en una sucursal física.",
        "icono": "storefront"
    },
    {
        "id": "cliente_distinguido",
        "nombre": "Socio Plata+",
        "descripcion": "Superaste los 500 puntos y ascendiste a la categoría distinguida.",
        "icono": "workspace_premium"
    },
    {
        "id": "coleccionista_elite",
        "nombre": "Coleccionista VIP",
        "descripcion": "Acumulaste más de 1500 puntos de lealtad en tu guardarropa.",
        "icono": "military_tech"
    }
]

CATALOGO_RECOMPENSAS = [
    {
        "id": "rec_1",
        "codigo": "DESC_50BS",
        "titulo": "Bono de 50 Bs.",
        "descripcion": "Descuento directo aplicable en el checkout digital o en caja POS.",
        "costo_puntos": 300,
        "categoria": "Descuento",
        "icono": "local_offer"
    },
    {
        "id": "rec_2",
        "codigo": "ENVIO_FREE",
        "titulo": "Envío Express Bonificado",
        "descripcion": "Cubre el 100% de la tarifa de delivery metropolitano.",
        "costo_puntos": 150,
        "categoria": "Logística",
        "icono": "local_shipping"
    },
    {
        "id": "rec_3",
        "codigo": "PROBADOR_EXPRESS",
        "titulo": "Pase Prioritario de Probador",
        "descripcion": "Atención preferencial sin espera en cualquier sucursal física.",
        "costo_puntos": 200,
        "categoria": "Experiencia",
        "icono": "airline_seat_recline_extra"
    },
    {
        "id": "rec_4",
        "codigo": "ASESORIA_VIP",
        "titulo": "Asesoría de Imagen Personal",
        "descripcion": "Sesión personalizada de estilismo y colorimetría con un experto.",
        "costo_puntos": 500,
        "categoria": "Exclusivo",
        "icono": "stars"
    }
]


def determinar_nivel(puntos: int) -> tuple[str, float, int, str, float, List[str]]:
    """Calcula nivel, % progreso hacia el siguiente, puntos faltantes, siguiente nivel, % descuento y beneficios"""
    if puntos < 500:
        nivel = "BRONCE"
        pct = (puntos / 500.0) * 100.0
        faltan = 500 - puntos
        sig = "PLATA"
        desc = 0.0
        beneficios = ["Acumulación de 1 pt por cada 10 Bs.", "Acceso estándar al catálogo boutique", "Historial de compras y reservas"]
    elif puntos < 1500:
        nivel = "PLATA"
        pct = ((puntos - 500) / 1000.0) * 100.0
        faltan = 1500 - puntos
        sig = "ORO"
        desc = 5.0
        beneficios = ["5% de descuento en colecciones de temporada", "Envíos metropolitanos bonificados en compras > 300 Bs.", "Soporte boutique prioritario"]
    elif puntos < 3000:
        nivel = "ORO"
        pct = ((puntos - 1500) / 1500.0) * 100.0
        faltan = 3000 - puntos
        sig = "DIAMANTE"
        desc = 10.0
        beneficios = ["10% de descuento permanente", "Reserva anticipada exclusiva de nuevas colecciones", "Probadores VIP express sin turno"]
    else:
        nivel = "DIAMANTE"
        pct = 100.0
        faltan = 0
        sig = "RANGO MÁXIMO"
        desc = 15.0
        beneficios = ["15% de descuento exclusivo en todas las compras", "Personal Shopper dedicado", "Invitaciones a galas privadas de moda"]
    return nivel, min(100.0, max(0.0, pct)), faltan, sig, desc, beneficios


def obtener_o_crear_perfil(db: Session, id_usuario: int) -> GamificacionPerfilResponse:
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise ValueError("Usuario no encontrado")

    perfil = db.query(GamificacionPerfil).filter(GamificacionPerfil.id_usuario == id_usuario).first()

    # Contabilizar historial real de órdenes y reservas para sincronización justa
    ordenes_pagadas = db.query(OrdenVenta).filter(
        OrdenVenta.id_usuario == id_usuario,
        OrdenVenta.estado_pago == "PAGADO"
    ).all()
    total_gastado = sum(float(o.total or 0.0) for o in ordenes_pagadas)
    puntos_compras = int(total_gastado / 10.0)
    
    total_reservas = db.query(Reserva).filter(Reserva.id_usuario == id_usuario).count()
    puntos_reservas = total_reservas * 50

    if not perfil:
        puntos_iniciales = 100 + puntos_compras + puntos_reservas
        nivel, _, _, _, _, _ = determinar_nivel(puntos_iniciales)
        insignias_iniciales = []
        if len(ordenes_pagadas) > 0:
            insignias_iniciales.append("primer_pedido")
        if total_reservas > 0:
            insignias_iniciales.append("reserva_boutique")
        if puntos_iniciales >= 500:
            insignias_iniciales.append("cliente_distinguido")
        if puntos_iniciales >= 1500:
            insignias_iniciales.append("coleccionista_elite")

        perfil = GamificacionPerfil(
            id_usuario=id_usuario,
            puntos_actuales=puntos_iniciales,
            puntos_historicos=puntos_iniciales,
            nivel=nivel,
            insignias_json=json.dumps(insignias_iniciales),
            beneficios_canjeados_json="[]"
        )
        db.add(perfil)
        db.commit()
        db.refresh(perfil)
    else:
        # Auto-desbloqueo de insignias por actividad
        insignias_actuales = json.loads(perfil.insignias_json or "[]")
        cambios = False
        if len(ordenes_pagadas) > 0 and "primer_pedido" not in insignias_actuales:
            insignias_actuales.append("primer_pedido")
            cambios = True
        if total_reservas > 0 and "reserva_boutique" not in insignias_actuales:
            insignias_actuales.append("reserva_boutique")
            cambios = True
        if perfil.puntos_historicos >= 500 and "cliente_distinguido" not in insignias_actuales:
            insignias_actuales.append("cliente_distinguido")
            cambios = True
        if perfil.puntos_historicos >= 1500 and "coleccionista_elite" not in insignias_actuales:
            insignias_actuales.append("coleccionista_elite")
            cambios = True
        
        nuevo_nivel, _, _, _, _, _ = determinar_nivel(perfil.puntos_historicos)
        if perfil.nivel != nuevo_nivel:
            perfil.nivel = nuevo_nivel
            cambios = True

        if cambios:
            perfil.insignias_json = json.dumps(insignias_actuales)
            db.commit()
            db.refresh(perfil)

    nivel, progreso_pct, faltan, sig, desc_pct, beneficios = determinar_nivel(perfil.puntos_actuales)
    insignias_guardadas = set(json.loads(perfil.insignias_json or "[]"))

    lista_insignias_dto = []
    for ins in CATALOGO_INSIGNIAS:
        desbloqueada = ins["id"] in insignias_guardadas
        lista_insignias_dto.append(InsigniaDTO(
            id=ins["id"],
            nombre=ins["nombre"],
            descripcion=ins["descripcion"],
            icono=ins["icono"],
            desbloqueada=desbloqueada,
            fecha_desbloqueo="Desbloqueada" if desbloqueada else None
        ))

    return GamificacionPerfilResponse(
        id_perfil=perfil.id_perfil,
        id_usuario=perfil.id_usuario,
        nombre_cliente=usuario.nombre_completo,
        puntos_actuales=perfil.puntos_actuales,
        puntos_historicos=perfil.puntos_historicos,
        nivel=perfil.nivel,
        progreso_nivel_pct=progreso_pct,
        puntos_siguiente_nivel=faltan,
        siguiente_nivel=sig,
        descuento_nivel_pct=desc_pct,
        beneficios_nivel=beneficios,
        insignias=lista_insignias_dto,
        compras_contabilizadas=len(ordenes_pagadas)
    )


def listar_recompensas(puntos_usuario: int) -> List[RecompensaDTO]:
    resultado = []
    for r in CATALOGO_RECOMPENSAS:
        resultado.append(RecompensaDTO(
            id=r["id"],
            codigo=r["codigo"],
            titulo=r["titulo"],
            descripcion=r["descripcion"],
            costo_puntos=r["costo_puntos"],
            categoria=r["categoria"],
            icono=r["icono"],
            disponible=(puntos_usuario >= r["costo_puntos"])
        ))
    return resultado


def canjear_recompensa_usuario(db: Session, id_usuario: int, codigo_recompensa: str) -> CanjeResponse:
    perfil = db.query(GamificacionPerfil).filter(GamificacionPerfil.id_usuario == id_usuario).first()
    if not perfil:
        obtener_o_crear_perfil(db, id_usuario)
        perfil = db.query(GamificacionPerfil).filter(GamificacionPerfil.id_usuario == id_usuario).first()

    recompensa = next((r for r in CATALOGO_RECOMPENSAS if r["codigo"] == codigo_recompensa), None)
    if not recompensa:
        return CanjeResponse(exito=False, mensaje="La recompensa solicitada no existe.", puntos_restantes=perfil.puntos_actuales)

    if perfil.puntos_actuales < recompensa["costo_puntos"]:
        return CanjeResponse(
            exito=False,
            mensaje=f"Puntos insuficientes. Requiere {recompensa['costo_puntos']} pts (tienes {perfil.puntos_actuales}).",
            puntos_restantes=perfil.puntos_actuales
        )

    # Descontar puntos
    perfil.puntos_actuales -= recompensa["costo_puntos"]
    canjeados = json.loads(perfil.beneficios_canjeados_json or "[]")
    codigo_cupon = f"FS-{recompensa['codigo']}-{uuid.uuid4().hex[:6].upper()}"
    canjeados.append({
        "codigo_recompensa": codigo_recompensa,
        "cupon": codigo_cupon,
        "costo": recompensa["costo_puntos"]
    })
    perfil.beneficios_canjeados_json = json.dumps(canjeados)
    db.commit()
    db.refresh(perfil)

    return CanjeResponse(
        exito=True,
        mensaje=f"¡Felicidades! Has canjeado '{recompensa['titulo']}'.",
        codigo_cupon=codigo_cupon,
        puntos_restantes=perfil.puntos_actuales
    )


def otorgar_bono_accion(db: Session, id_usuario: int, accion: str) -> Dict[str, Any]:
    perfil = db.query(GamificacionPerfil).filter(GamificacionPerfil.id_usuario == id_usuario).first()
    if not perfil:
        obtener_o_crear_perfil(db, id_usuario)
        perfil = db.query(GamificacionPerfil).filter(GamificacionPerfil.id_usuario == id_usuario).first()

    puntos_bono = 0
    mensaje = ""
    insignia_a_desbloquear = None

    if accion == "PROBAR_RA":
        puntos_bono = 25
        mensaje = "¡Bono de 25 Puntos por probar prenda en el Vestidor Virtual con RA!"
        insignia_a_desbloquear = "vestidor_3d"
    elif accion == "BUSQUEDA_VOZ":
        puntos_bono = 15
        mensaje = "¡Bono de 15 Puntos por utilizar Búsqueda por Voz!"
        insignia_a_desbloquear = "explorador_voz"
    elif accion == "COMPARTIR_LOOK":
        puntos_bono = 20
        mensaje = "¡Bono de 20 Puntos por compartir tu Outfit!"
    else:
        puntos_bono = 10
        mensaje = "¡Bono de actividad registrado!"

    perfil.puntos_actuales += puntos_bono
    perfil.puntos_historicos += puntos_bono

    if insignia_a_desbloquear:
        insignias = json.loads(perfil.insignias_json or "[]")
        if insignia_a_desbloquear not in insignias:
            insignias.append(insignia_a_desbloquear)
            perfil.insignias_json = json.dumps(insignias)

    nuevo_nivel, _, _, _, _, _ = determinar_nivel(perfil.puntos_historicos)
    perfil.nivel = nuevo_nivel

    db.commit()
    db.refresh(perfil)

    return {
        "exito": True,
        "puntos_otorgados": puntos_bono,
        "mensaje": mensaje,
        "puntos_actuales": perfil.puntos_actuales,
        "nivel": perfil.nivel
    }
