from datetime import datetime, timezone, timedelta
import json
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.modules.p01_seguridad_acceso.auth.models import Usuario
from app.modules.p07_venta_digital_fidelizacion.ordenes.models import OrdenVenta
from app.modules.p06_reservas_presenciales.reservas.models import Reserva
from app.modules.p07_venta_digital_fidelizacion.gamificacion.models import (
    GamificacionPerfil,
    RecompensaCatalogo,
    CuponFidelizacion,
    BitacoraAuditoria,
    utc_now
)
from app.modules.p07_venta_digital_fidelizacion.gamificacion.schemas import (
    GamificacionPerfilResponse,
    InsigniaDTO,
    RecompensaDTO,
    CanjeResponse,
    CuponUsuarioDTO,
    ValidarCuponResponse
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

CATALOGO_RECOMPENSAS_SEED = [
    {
        "codigo": "DESC_50BS",
        "titulo": "Bono de 50 Bs.",
        "descripcion": "Descuento directo aplicable en el checkout digital o en caja POS.",
        "costo_puntos": 300,
        "descuento_monto": 50.00,
        "tipo_beneficio": "DESCUENTO_MONTO",
        "categoria": "Descuento",
        "icono": "local_offer"
    },
    {
        "codigo": "CUPON_25BS",
        "titulo": "Descuento de 25 Bs.",
        "descripcion": "Cupón de 25 Bs aplicable a cualquier compra en línea o tienda física.",
        "costo_puntos": 200,
        "descuento_monto": 25.00,
        "tipo_beneficio": "DESCUENTO_MONTO",
        "categoria": "Descuento",
        "icono": "local_offer"
    },
    {
        "codigo": "ENVIO_FREE",
        "titulo": "Envío Express Bonificado",
        "descripcion": "Cubre el 100% de la tarifa de delivery metropolitano en compras.",
        "costo_puntos": 150,
        "descuento_monto": 25.00,
        "tipo_beneficio": "ENVIO_GRATIS",
        "categoria": "Logística",
        "icono": "local_shipping"
    },
    {
        "codigo": "PROBADOR_EXPRESS",
        "titulo": "Pase Prioritario de Probador",
        "descripcion": "Atención preferencial sin espera en cualquier sucursal física.",
        "costo_puntos": 200,
        "descuento_monto": 0.00,
        "tipo_beneficio": "EXPERIENCIA",
        "categoria": "Experiencia",
        "icono": "airline_seat_recline_extra"
    },
    {
        "codigo": "ASESORIA_VIP",
        "titulo": "Asesoría de Imagen Personal",
        "descripcion": "Sesión personalizada de estilismo y colorimetría con un experto.",
        "costo_puntos": 500,
        "descuento_monto": 100.00,
        "tipo_beneficio": "EXPERIENCIA",
        "categoria": "Exclusivo",
        "icono": "stars"
    }
]


def seed_recompensas_si_vacio(db: Session) -> None:
    """Asegura que la tabla recompensas_catalogo contenga los registros institucionales."""
    try:
        count = db.query(RecompensaCatalogo).count()
        if count == 0:
            for r in CATALOGO_RECOMPENSAS_SEED:
                db.add(RecompensaCatalogo(
                    codigo=r["codigo"],
                    titulo=r["titulo"],
                    descripcion=r["descripcion"],
                    costo_puntos=r["costo_puntos"],
                    descuento_monto=r["descuento_monto"],
                    categoria=r["categoria"],
                    icono=r["icono"],
                    activo=True
                ))
            db.commit()
    except Exception:
        db.rollback()


def registrar_evento_auditoria(
    db: Session,
    id_usuario: Optional[int],
    accion: str,
    metadatos: Dict[str, Any] = None,
    ip_cliente: str = "127.0.0.1"
) -> None:
    """Registra un evento inmutable en la bitácora con huso horario boliviano (UTC-04:00)."""
    try:
        # Hora local Bolivia = UTC - 4 horas
        fecha_bolivia = utc_now() - timedelta(hours=4)
        asiento = BitacoraAuditoria(
            id_usuario=id_usuario,
            accion=accion,
            ip_cliente=ip_cliente,
            fecha_hora_local=fecha_bolivia,
            metadatos_json=json.dumps(metadatos or {})
        )
        db.add(asiento)
        db.commit()
    except Exception:
        db.rollback()


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
    seed_recompensas_si_vacio(db)
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
            tenant_id="fashionstore_scz",
            puntos_actuales=puntos_iniciales,
            puntos_historicos=puntos_iniciales,
            nivel=nivel,
            insignias_json=json.dumps(insignias_iniciales),
            beneficios_canjeados_json="[]"
        )
        db.add(perfil)
        db.commit()
        db.refresh(perfil)

        registrar_evento_auditoria(
            db,
            id_usuario,
            "CREACION_PERFIL_GAMIFICACION",
            {"puntos_iniciales": puntos_iniciales, "nivel": nivel}
        )
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
            registrar_evento_auditoria(
                db,
                id_usuario,
                "ASCENSO_NIVEL_GAMIFICACION",
                {"nuevo_nivel": nuevo_nivel, "puntos_historicos": perfil.puntos_historicos}
            )

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
        progreso_siguiente_nivel_pct=progreso_pct,
        puntos_siguiente_nivel=faltan,
        puntos_faltantes=faltan,
        siguiente_nivel=sig,
        descuento_nivel_pct=desc_pct,
        descuento_permanente_pct=desc_pct,
        compras_equivalente_ascenso_bs=float(faltan * 10.0),
        beneficios_nivel=beneficios,
        insignias=lista_insignias_dto,
        compras_contabilizadas=len(ordenes_pagadas)
    )


def listar_recompensas(puntos_usuario: int, db: Session = None) -> List[RecompensaDTO]:
    """Retorna recompensas disponibles desde base de datos o catálogo semilla."""
    resultado = []
    if db:
        seed_recompensas_si_vacio(db)
        recs_db = db.query(RecompensaCatalogo).filter(RecompensaCatalogo.activo == True).all()
        if recs_db:
            for r in recs_db:
                resultado.append(RecompensaDTO(
                    id=str(r.id_recompensa),
                    codigo=r.codigo,
                    titulo=r.titulo,
                    descripcion=r.descripcion or "",
                    costo_puntos=r.costo_puntos,
                    categoria=r.categoria,
                    icono=r.icono,
                    disponible=(puntos_usuario >= r.costo_puntos)
                ))
            return resultado

    # Fallback catálogo semilla
    for r in CATALOGO_RECOMPENSAS_SEED:
        resultado.append(RecompensaDTO(
            id=r["codigo"],
            codigo=r["codigo"],
            titulo=r["titulo"],
            descripcion=r["descripcion"],
            costo_puntos=r["costo_puntos"],
            categoria=r["categoria"],
            icono=r["icono"],
            disponible=(puntos_usuario >= r["costo_puntos"])
        ))
    return resultado


def canjear_recompensa_usuario(
    db: Session,
    id_usuario: int,
    codigo_recompensa: str,
    ip_cliente: str = "127.0.0.1"
) -> CanjeResponse:
    seed_recompensas_si_vacio(db)
    perfil = db.query(GamificacionPerfil).filter(GamificacionPerfil.id_usuario == id_usuario).first()
    if not perfil:
        obtener_o_crear_perfil(db, id_usuario)
        perfil = db.query(GamificacionPerfil).filter(GamificacionPerfil.id_usuario == id_usuario).first()

    # Buscar recompensa en DB o fallback
    rec_db = db.query(RecompensaCatalogo).filter(RecompensaCatalogo.codigo == codigo_recompensa).first()
    if rec_db:
        costo = rec_db.costo_puntos
        titulo = rec_db.titulo
        monto_desc = float(rec_db.descuento_monto or 0.0)
        tipo_ben = "ENVIO_GRATIS" if "ENVIO" in codigo_recompensa else "DESCUENTO_MONTO"
    else:
        seed_item = next((r for r in CATALOGO_RECOMPENSAS_SEED if r["codigo"] == codigo_recompensa), None)
        if not seed_item:
            return CanjeResponse(exito=False, mensaje="La recompensa solicitada no existe.", puntos_restantes=perfil.puntos_actuales)
        costo = seed_item["costo_puntos"]
        titulo = seed_item["titulo"]
        monto_desc = seed_item["descuento_monto"]
        tipo_ben = seed_item["tipo_beneficio"]

    if perfil.puntos_actuales < costo:
        return CanjeResponse(
            exito=False,
            mensaje=f"Puntos insuficientes. Requiere {costo} pts (tienes {perfil.puntos_actuales}).",
            puntos_restantes=perfil.puntos_actuales
        )

    # 1. Descontar puntos
    perfil.puntos_actuales -= costo

    # 2. Generar código alfanumérico único para el cupón
    codigo_cupon = f"FS-{codigo_recompensa}-{uuid.uuid4().hex[:6].upper()}"

    # 3. Persistir en cupones_fidelizacion con caducidad a 30 días
    nuevo_cupon = CuponFidelizacion(
        id_usuario=id_usuario,
        codigo_cupon=codigo_cupon,
        monto_descuento=monto_desc,
        tipo_beneficio=tipo_ben,
        utilizado=False,
        fecha_emision=utc_now(),
        fecha_expiracion=utc_now() + timedelta(days=30)
    )
    db.add(nuevo_cupon)

    # 4. Registrar en array JSON del perfil (compatibilidad)
    canjeados = json.loads(perfil.beneficios_canjeados_json or "[]")
    canjeados.append({
        "codigo_recompensa": codigo_recompensa,
        "cupon": codigo_cupon,
        "costo": costo,
        "descuento_monto": monto_desc
    })
    perfil.beneficios_canjeados_json = json.dumps(canjeados)

    db.commit()
    db.refresh(perfil)

    # 5. Bitácora de Auditoría
    registrar_evento_auditoria(
        db,
        id_usuario,
        "CANJE_RECOMPENSA_EXITOSO",
        {
            "codigo_recompensa": codigo_recompensa,
            "costo_puntos": costo,
            "codigo_cupon": codigo_cupon,
            "puntos_restantes": perfil.puntos_actuales
        },
        ip_cliente=ip_cliente
    )

    return CanjeResponse(
        exito=True,
        mensaje=f"¡Felicidades! Has canjeado '{titulo}'.",
        codigo_cupon=codigo_cupon,
        monto_descuento=monto_desc,
        puntos_restantes=perfil.puntos_actuales
    )


def obtener_mis_cupones(db: Session, id_usuario: int) -> List[CuponUsuarioDTO]:
    """Retorna todos los cupones emitidos para el usuario."""
    ahora = utc_now()
    cupones = db.query(CuponFidelizacion).filter(
        CuponFidelizacion.id_usuario == id_usuario
    ).order_by(CuponFidelizacion.id_cupon.desc()).all()

    resultado = []
    for c in cupones:
        delta = (c.fecha_expiracion - ahora).days if c.fecha_expiracion else 0
        dias_restantes = max(0, delta)
        resultado.append(CuponUsuarioDTO(
            id_cupon=c.id_cupon,
            codigo_cupon=c.codigo_cupon,
            monto_descuento=float(c.monto_descuento or 0.0),
            tipo_beneficio=c.tipo_beneficio or "DESCUENTO_MONTO",
            utilizado=bool(c.utilizado),
            fecha_emision=c.fecha_emision.strftime("%d/%m/%Y") if c.fecha_emision else "",
            fecha_expiracion=c.fecha_expiracion.strftime("%d/%m/%Y") if c.fecha_expiracion else "",
            dias_restantes=dias_restantes
        ))
    return resultado


def validar_cupon_descuento(
    db: Session,
    codigo_cupon: str,
    id_usuario: Optional[int] = None
) -> ValidarCuponResponse:
    """Valida si un cupón alfanumérico es válido, no ha sido usado ni ha expirado."""
    codigo_limpio = codigo_cupon.strip().upper()
    cupon = db.query(CuponFidelizacion).filter(
        CuponFidelizacion.codigo_cupon == codigo_limpio
    ).first()

    if not cupon:
        return ValidarCuponResponse(
            valido=False,
            mensaje=f"El cupón '{codigo_cupon}' no existe en FashionStore.",
            monto_descuento=0.0
        )

    if cupon.utilizado:
        return ValidarCuponResponse(
            valido=False,
            mensaje="Este cupón ya fue utilizado en una compra anterior.",
            codigo_cupon=codigo_limpio,
            monto_descuento=0.0
        )

    ahora = utc_now()
    if cupon.fecha_expiracion and cupon.fecha_expiracion < ahora:
        return ValidarCuponResponse(
            valido=False,
            mensaje="Este cupón ha caducado.",
            codigo_cupon=codigo_limpio,
            monto_descuento=0.0
        )

    if id_usuario and cupon.id_usuario != id_usuario:
        return ValidarCuponResponse(
            valido=False,
            mensaje="Este cupón de lealtad fue emitido para otra cuenta de usuario.",
            codigo_cupon=codigo_limpio,
            monto_descuento=0.0
        )

    return ValidarCuponResponse(
        valido=True,
        mensaje="¡Cupón válido! Descuento aplicado a tu pedido.",
        codigo_cupon=cupon.codigo_cupon,
        monto_descuento=float(cupon.monto_descuento or 0.0),
        tipo_beneficio=cupon.tipo_beneficio or "DESCUENTO_MONTO"
    )


def marcar_cupon_utilizado(db: Session, codigo_cupon: str) -> bool:
    """Marca un cupón como utilizado tras completar el pago."""
    codigo_limpio = codigo_cupon.strip().upper()
    cupon = db.query(CuponFidelizacion).filter(
        CuponFidelizacion.codigo_cupon == codigo_limpio
    ).first()
    if cupon:
        cupon.utilizado = True
        db.commit()
        return True
    return False


def otorgar_puntos_por_compra(
    db: Session,
    id_usuario: int,
    monto_total: float,
    canal: str = "ONLINE"
) -> Dict[str, Any]:
    """
    Acumulación automática: 1 punto por cada 10 Bolivianos netos facturados (CU21 - M16).
    Invocado tras confirmación de pago digital (CU14) o venta en caja POS (CU15).
    """
    if not id_usuario or monto_total <= 0:
        return {"exito": False, "puntos_otorgados": 0}

    perfil = db.query(GamificacionPerfil).filter(GamificacionPerfil.id_usuario == id_usuario).first()
    if not perfil:
        obtener_o_crear_perfil(db, id_usuario)
        perfil = db.query(GamificacionPerfil).filter(GamificacionPerfil.id_usuario == id_usuario).first()

    puntos_ganados = int(monto_total / 10.0)
    if puntos_ganados <= 0:
        return {"exito": True, "puntos_otorgados": 0, "puntos_actuales": perfil.puntos_actuales}

    perfil.puntos_actuales += puntos_ganados
    perfil.puntos_historicos += puntos_ganados

    # Auto-desbloqueo de insignia primer_pedido
    insignias = json.loads(perfil.insignias_json or "[]")
    if "primer_pedido" not in insignias:
        insignias.append("primer_pedido")

    if perfil.puntos_historicos >= 500 and "cliente_distinguido" not in insignias:
        insignias.append("cliente_distinguido")
    if perfil.puntos_historicos >= 1500 and "coleccionista_elite" not in insignias:
        insignias.append("coleccionista_elite")

    perfil.insignias_json = json.dumps(insignias)

    nuevo_nivel, _, _, _, _, _ = determinar_nivel(perfil.puntos_historicos)
    nivel_anterior = perfil.nivel
    perfil.nivel = nuevo_nivel

    db.commit()
    db.refresh(perfil)

    # Registrar en auditoría
    registrar_evento_auditoria(
        db,
        id_usuario,
        "PUNTOS_POR_COMPRA",
        {
            "monto_total_bs": monto_total,
            "puntos_ganados": puntos_ganados,
            "canal": canal,
            "puntos_actuales": perfil.puntos_actuales,
            "nivel_anterior": nivel_anterior,
            "nuevo_nivel": nuevo_nivel
        }
    )

    return {
        "exito": True,
        "puntos_otorgados": puntos_ganados,
        "puntos_actuales": perfil.puntos_actuales,
        "nivel": perfil.nivel,
        "ascenso": (nuevo_nivel != nivel_anterior)
    }


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

    registrar_evento_auditoria(
        db,
        id_usuario,
        f"BONO_ACCION_{accion}",
        {"puntos_bono": puntos_bono, "puntos_actuales": perfil.puntos_actuales}
    )

    return {
        "exito": True,
        "puntos_otorgados": puntos_bono,
        "mensaje": mensaje,
        "puntos_actuales": perfil.puntos_actuales,
        "nivel": perfil.nivel
    }

